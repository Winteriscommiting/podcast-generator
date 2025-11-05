// Load environment variables first
require('dotenv').config();

// Setup Google credentials from environment variable (for Railway/cloud deployment)
const { setupGoogleCredentials } = require('./config/credentials');
setupGoogleCredentials();

// Suppress Google Cloud SDK deprecation warnings (library-level warnings we can't fix)
const originalWarn = console.warn;
console.warn = function(...args) {
  const message = args.join(' ');
  if (!message.includes('deprecated') && !message.includes('fromStream') && !message.includes('fromJSON')) {
    originalWarn.apply(console, args);
  }
};

process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (!warning.message || !warning.message.includes('deprecated')) {
    console.warn(warning.message);
  }
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/document');
const summaryRoutes = require('./routes/summaries');
const podcastRoutes = require('./routes/podcasts');
const voicesRoutes = require('./routes/voices');
const customVoicesRoutes = require('./routes/customVoices');
const errorHandler = require('./utils/errorHandler');
const { initializeDocumentAI } = require('./services/googleDocumentAI');
const { initializeVertexAI } = require('./services/vertexAI');

const app = express();
const PORT = process.env.PORT || 3000;
const RVC_SERVICE_URL = process.env.RVC_SERVICE_URL || 'http://127.0.0.1:5000';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve uploads directory for audio files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/podcast-generator';

    // In production, require MONGODB_URI to avoid hanging on localhost
    if ((process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod') && !process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI is not set in production. Skipping DB connection and starting server without database.');
      return;
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // fail fast if unreachable
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err?.message || err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('Database connection failed (non-fatal):', error?.message || error);
    // Do not exit; allow the web server to start so health checks respond
  }
};

// Connect to database
connectDB();

// Initialize Google Cloud services (optional, non-blocking)
console.log('\nInitializing Google Cloud services...');
try { initializeDocumentAI(); } catch (e) { console.warn('Document AI init failed:', e?.message || e); }
try { initializeVertexAI(); } catch (e) { console.warn('Vertex AI init failed:', e?.message || e); }

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/podcasts', podcastRoutes);
app.use('/api/voices', voicesRoutes);
app.use('/api/custom-voices', customVoicesRoutes);

// Serve main pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/debug-oauth', (req, res) => {
  res.sendFile(path.join(__dirname, 'debug-oauth.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Proxy to Python HF service health (useful on hosted environments)
app.get('/api/hf/health', async (req, res) => {
  try {
    const axios = require('axios');
    const response = await axios.get(`${RVC_SERVICE_URL}/health`, { timeout: 5000 });
    res.status(200).json({
      ok: true,
      rvc_service_url: RVC_SERVICE_URL,
      health: response.data,
    });
  } catch (err) {
    console.error('HF service health proxy failed:', err?.message || err);
    res.status(502).json({ ok: false, error: 'Python HF service not reachable', rvc_service_url: RVC_SERVICE_URL });
  }
});

// Proxy for training progress
app.get('/api/hf/training-progress/:voiceId', async (req, res) => {
  try {
    const axios = require('axios');
    const { voiceId } = req.params;
    const response = await axios.get(`${RVC_SERVICE_URL}/training-progress/${voiceId}`, { timeout: 5000 });
    res.status(200).json(response.data);
  } catch (err) {
    console.error('Training progress proxy failed:', err?.message || err);
    res.status(502).json({ success: false, error: 'Failed to fetch progress' });
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
});