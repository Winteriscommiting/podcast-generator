# Document Upload Troubleshooting Guide

## Understanding the "Empty File" Error

If you see this error:
```
The uploaded file appears to be empty or contains only whitespace.
```

This means the file you uploaded has no readable text content.

---

## Common Causes

### 1. **Empty PDF Files**
- PDF created but no text added
- Scanned images without OCR
- PDF with only blank pages

**Solution:** 
- Use a PDF with actual text content
- If it's a scanned document, you need OCR (use Google Document AI - see GOOGLE_DOCUMENT_AI_SETUP.md)

### 2. **Empty Word Documents**
- DOCX file created but contains only formatting
- Only whitespace/newlines
- Only images without text

**Solution:**
- Add actual text content to the document
- Copy/paste some text paragraphs

### 3. **Empty Text Files**
- TXT file with only spaces/newlines
- File size > 0 but no words

**Solution:**
- Add at least 10 words of text content

---

## Minimum Requirements

The system now validates uploaded documents:

| Validation | Requirement | Error if Failed |
|------------|-------------|-----------------|
| Word Count | ≥ 1 word | "contains only whitespace" |
| Minimum Words | ≥ 10 words | "too short (X words)" |
| File Size | > 0 bytes | "Please upload a file" |

---

## How to Test Successfully

### **Option 1: Create a Simple Text File**

1. Create a new file `test-document.txt`
2. Add this content:
   ```
   This is a test document for the podcast generator application.
   It contains multiple sentences to test the text extraction functionality.
   The summarization feature will work better with longer documents.
   You can add as much content as you want for testing purposes.
   ```
3. Upload this file

### **Option 2: Use a Sample PDF**

1. Create a PDF with text content (not just images)
2. Ensure it has at least 10 words
3. Upload the PDF

### **Option 3: Use a Word Document**

1. Create a DOCX file with text
2. Add at least 2-3 paragraphs
3. Save and upload

---

## Debug Information

When you upload a file, check the server console for debug information:

```
Upload Debug:
- File: document-name.pdf
- Type: pdf
- Size: 12345 bytes
- Extracted text length: 500
- Text preview: This·is·the·beginning·of·the·document...
- Word count: 85
✅ Upload validation passed
```

If you see:
```
- Word count: 0
❌ Upload rejected: File contains no readable text
```

This means the text extraction found no words in your file.

---

## Better Text Extraction

If you're having issues with PDFs (especially scanned ones), consider setting up **Google Document AI**:

1. Follow the guide in `GOOGLE_DOCUMENT_AI_SETUP.md`
2. Google Document AI provides better OCR for:
   - Scanned PDFs
   - Image-based PDFs
   - Complex layouts
   - Handwritten text

---

## Sample Test Documents

### **Quick Test (Copy & Paste)**

Create a file with this content:

**Short Test (minimum):**
```
The quick brown fox jumps over the lazy dog today.
```

**Medium Test (recommended):**
```
Artificial Intelligence is transforming the way we live and work.
Machine learning algorithms can process vast amounts of data
and identify patterns that humans might miss. This technology
is being applied in healthcare, finance, transportation, and
many other industries. As AI continues to evolve, it will
create new opportunities and challenges for society.
```

**Long Test (ideal for summarization):**
Add multiple paragraphs about any topic. The more content, the better the summary will be.

---

## Still Having Issues?

1. **Check file encoding:** Ensure text files are UTF-8 encoded
2. **Try different file formats:** If PDF fails, try DOCX or TXT
3. **Check file permissions:** Make sure the file isn't locked or corrupted
4. **File size:** Very large files (>10MB) will be rejected
5. **Console logs:** Check both browser console (F12) and server terminal for errors

---

## Success Indicators

You'll know upload succeeded when you see:

**In Browser:**
- ✅ "Document uploaded successfully" toast message
- Document appears in the documents list
- Word count is displayed

**In Server Console:**
```
✅ Extracted 1234 characters from PDF using pdf-parse
✅ Upload validation passed
```

---

## Next Steps After Successful Upload

Once document is uploaded:
1. **View** - Click "View" to see the extracted text
2. **Summarize** - Click "Summarize" to generate a summary
3. **Create Podcast** - Click "Create Podcast" to generate audio

All features work best with documents that have at least 100+ words!
