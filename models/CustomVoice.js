const mongoose = require('mongoose');

const customVoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  // Audio file stored in GridFS
  audioFileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'uploads.files',
    required: true
  },
  audioFileName: {
    type: String,
    required: true
  },
  audioFileSize: {
    type: Number,
    required: true
  },
  // Audio metadata
  duration: {
    type: Number, // Duration in seconds
    required: true
  },
  format: {
    type: String,
    enum: ['mp3', 'wav', 'ogg', 'm4a'],
    required: true
  },
  sampleRate: {
    type: Number,
    default: 44100
  },
  // Voice processing status
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'ready', 'failed'],
    default: 'uploaded'
  },
  processingError: {
    type: String
  },
  // Voice clone metadata (for future AI service integration)
  voiceModelId: {
    type: String, // ID from external service (ElevenLabs, Play.ht, etc.)
  },
  voiceProvider: {
    type: String,
    enum: ['elevenlabs', 'playht', 'rvc', 'custom', null],
    default: 'rvc'
  },
  modelPath: {
    type: String, // Path to trained RVC model file
  },
  // Hugging Face integration
  hfRepo: {
    type: String, // e.g., username/rvc-voice-model
  },
  hfRevision: {
    type: String, // optional commit/tag
  },
  rvcBackend: {
    type: String,
    enum: ['rvc', 'freevc', 'xtts', 'knn-vc', null],
    default: 'rvc'
  },
  trainingProvider: {
    type: String,
    enum: ['local-rvc', 'huggingface', 'none'],
    default: 'local-rvc'
  },
  trainingMode: {
    type: String,
    enum: ['trained', 'zero-shot', 'mock'],
    default: 'trained'
  },
  // Voice characteristics
  gender: {
    type: String,
    enum: ['male', 'female', 'neutral', 'unknown'],
    default: 'unknown'
  },
  language: {
    type: String,
    default: 'en-US'
  },
  accent: {
    type: String
  },
  // Usage statistics
  timesUsed: {
    type: Number,
    default: 0
  },
  lastUsedAt: {
    type: Date
  },
  // Metadata
  isDefault: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
customVoiceSchema.index({ user: 1, createdAt: -1 });
customVoiceSchema.index({ status: 1 });
customVoiceSchema.index({ user: 1, name: 1 });

// Virtual for audio URL
customVoiceSchema.virtual('audioUrl').get(function() {
  return `/api/custom-voices/${this._id}/audio`;
});

// Ensure virtuals are included in JSON
customVoiceSchema.set('toJSON', { virtuals: true });
customVoiceSchema.set('toObject', { virtuals: true });

// Pre-remove hook to clean up audio file from GridFS
customVoiceSchema.pre('remove', async function(next) {
  try {
    const mongoose = require('mongoose');
    const conn = mongoose.connection;
    const GridFSBucket = mongoose.mongo.GridFSBucket;
    const bucket = new GridFSBucket(conn.db, { bucketName: 'uploads' });
    
    // Delete the audio file from GridFS
    await bucket.delete(this.audioFileId);
    console.log(`🗑️  Deleted audio file ${this.audioFileId} for voice ${this.name}`);
  } catch (error) {
    console.error('Error deleting audio file:', error);
  }
  next();
});

// Instance methods
customVoiceSchema.methods.incrementUsage = async function() {
  this.timesUsed += 1;
  this.lastUsedAt = new Date();
  await this.save();
};

customVoiceSchema.methods.updateStatus = async function(status, error = null) {
  this.status = status;
  if (error) {
    this.processingError = error;
  }
  await this.save();
};

// Static methods
customVoiceSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

customVoiceSchema.statics.findReadyVoices = function(userId) {
  return this.find({ user: userId, status: 'ready' }).sort({ createdAt: -1 });
};

customVoiceSchema.statics.getDefaultVoice = function(userId) {
  return this.findOne({ user: userId, isDefault: true, status: 'ready' });
};

const CustomVoice = mongoose.model('CustomVoice', customVoiceSchema);

module.exports = CustomVoice;
