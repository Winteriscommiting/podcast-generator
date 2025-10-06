const express = require('express');
const Document = require('../models/Document');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const extractText = require('../services/textExtraction');
const cloudStorage = require('../services/cloudStorage');

const router = express.Router();

// Configure multer for file uploads (store in memory for GCS upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
    }
  },
});

// @desc    Upload and process document
// @route   POST /api/documents/upload
// @access  Private
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const file = req.file;
    const originalName = file.originalname;
    const fileType = path.extname(originalName).substring(1).toLowerCase();
    const fileSize = file.size;
    const title = path.basename(originalName, path.extname(originalName));

    // Extract text from file FIRST
    const extractedText = await extractText(file, fileType);
    
    // Calculate word count properly
    const words = extractedText.trim().split(/\s+/);
    const wordCount = extractedText.trim() ? words.filter(word => word.length > 0).length : 0;
    
    console.log('Upload Debug:');
    console.log('- File:', originalName);
    console.log('- Type:', fileType);
    console.log('- Size:', fileSize, 'bytes');
    console.log('- Extracted text length:', extractedText.length);
    console.log('- Text preview:', extractedText.substring(0, 100).replace(/\n/g, '\\n').replace(/\s/g, '·'));
    console.log('- Word count:', wordCount);
    
    // Validate that document has actual content
    if (wordCount === 0) {
      console.log('❌ Upload rejected: File contains no readable text');
      return res.status(400).json({ 
        success: false, 
        message: `The uploaded file "${originalName}" appears to be empty or contains only whitespace. Please upload a file with actual text content. Extracted ${extractedText.length} characters but found 0 words.` 
      });
    }
    
    // Minimum word count requirement
    if (wordCount < 10) {
      console.log('⚠️  Upload warning: Very short document');
      return res.status(400).json({ 
        success: false, 
        message: `The uploaded file "${originalName}" is too short (${wordCount} words). Please upload a document with at least 10 words for meaningful processing.` 
      });
    }

    console.log('✅ Upload validation passed');

    // Upload file to Google Cloud Storage (if enabled)
    let filePath, fileUrl, gcsPath, storageType;
    
    if (process.env.USE_CLOUD_STORAGE === 'true') {
      try {
        console.log('☁️  Uploading document to Google Cloud Storage...');
        gcsPath = cloudStorage.generateFilePath(req.user.id, originalName, 'document');
        fileUrl = await cloudStorage.uploadFile(
          file.buffer,
          gcsPath,
          'documents',
          { 
            contentType: file.mimetype,
            metadata: {
              originalName: originalName,
              userId: req.user.id,
              uploadDate: new Date().toISOString()
            }
          }
        );
        filePath = gcsPath;
        storageType = 'gcs';
        console.log(`✅ Document uploaded to GCS: ${gcsPath}`);
      } catch (error) {
        console.error('❌ GCS upload failed, using local storage:', error.message);
        filePath = req.file.path;
        fileUrl = `/uploads/${req.file.filename}`;
        gcsPath = null;
        storageType = 'local';
      }
    } else {
      // Local storage - save file to uploads directory
      console.log('ℹ️  Using local storage for document');
      filePath = req.file.path;
      fileUrl = `/uploads/${req.file.filename}`;
      gcsPath = null;
      storageType = 'local';
    }

    // Create document with all required fields
    const document = await Document.create({
      user: req.user.id,
      title,
      originalName,
      fileType,
      fileSize,
      filePath,
      fileUrl,
      gcsPath,
      storageType,
      extractedText,
      wordCount,
      processingStatus: 'completed',
    });

    res.status(201).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error(error);
    
    // If document was created, update status to failed
    if (req.file) {
      try {
        const document = await Document.findOne({
          user: req.user.id,
          originalName: req.file.originalname,
        });
        if (document) {
          document.processingStatus = 'failed';
          await document.save();
        }
      } catch (updateError) {
        console.error('Error updating document status:', updateError);
      }
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all documents for a user
// @route   GET /api/documents
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    // Make sure user owns the document
    if (document.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this document' });
    }
    
    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    // Make sure user owns the document
    if (document.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this document' });
    }
    
    // Delete associated summaries and podcasts (cascade delete)
    const Summary = require('../models/Summary');
    const Podcast = require('../models/Podcast');
    
    await Summary.deleteMany({ document: req.params.id });
    await Podcast.deleteMany({ document: req.params.id });
    
    await document.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;