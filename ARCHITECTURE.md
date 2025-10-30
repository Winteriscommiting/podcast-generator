# 🏗️ System Architecture - Podcast Generator

## Complete Application Flow

```text
                    ┌──────────┐
                    │  START   │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  VISIT   │
                    │   APP    │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │   HAS    │
                    │ ACCOUNT? │◄────────────┐
                    └────┬─────┘             │
                    YES  │  NO               │
                    ┌────▼─────┐      ┌──────┴──────┐
                    │  LOGIN   │      │   SIGNUP    │
                    │  GOOGLE  │      │   (GOOGLE   │
                    │  OAUTH   │      │    OAUTH)   │
                    └────┬─────┘      └──────┬──────┘
                         │                   │
                         │            ┌──────▼──────┐
                         │            │   PROVIDE   │
                         │            │    USER     │
                         │            │    INFO     │
                         │            └──────┬──────┘
                         │                   │
                    ┌────▼───────────────────▼─────┐
                    │      DASHBOARD HOME          │
                    └────┬─────────────────────┬───┘
                         │                     │
                ┌────────▼──────┐         ┌───▼──────────┐
                │    UPLOAD     │         │    VOICE     │
                │   DOCUMENT    │         │   CLONING    │
                └────────┬──────┘         └───┬──────────┘
                         │                    │
                ┌────────▼──────┐         ┌───▼──────────┐
                │  EXTRACT TEXT │         │    UPLOAD    │
                │  (GOOGLE DOC  │         │    VOICE     │
                │      AI)      │         │   SAMPLE     │
                └────────┬──────┘         └───┬──────────┘
                         │                    │
                ┌────────▼──────┐         ┌───▼──────────┐
                │   GENERATE    │         │    TRAIN     │
                │   SUMMARY     │         │  RVC MODEL   │
                │  (VERTEX AI)  │         │  (10-30 MIN) │
                └────────┬──────┘         └───┬──────────┘
                         │                    │
                ┌────────▼──────┐         ┌───▼──────────┐
                │    CREATE     │         │    MODEL     │
                │   PODCAST     │         │    READY     │
                └────────┬──────┘         └───┬──────────┘
                         │                    │
                    ┌────▼─────┐              │
                    │  SELECT  │              │
                    │   VOICE  │              │
                    │  & TTS   │              │
                    └────┬─────┘              │
                         │                    │
                    ┌────▼─────┐              │
                    │ GENERATE │              │
                    │  AUDIO   │              │
                    │ (GOOGLE  │              │
                    │   TTS)   │              │
                    └────┬─────┘              │
                         │                    │
                    ┌────▼─────┐              │
                    │   WANT   │              │
                    │  CUSTOM  │◄─────────────┘
                    │  VOICE?  │
                    └────┬─────┘
                    YES  │  NO
                         │  │
              ┌──────────┘  └──────────┐
              │                        │
        ┌─────▼──────┐           ┌─────▼──────┐
        │  CONVERT   │           │    PLAY    │
        │   VOICE    │           │   AUDIO    │
        │  (RVC)     │           └─────┬──────┘
        └─────┬──────┘                 │
              │                        │
        ┌─────▼──────┐           ┌─────▼──────┐
        │  CONVERTED │           │  DOWNLOAD  │
        │   AUDIO    │           │  PODCAST   │
        └─────┬──────┘           └─────┬──────┘
              │                        │
              └────────┬───────────────┘
                       │
                  ┌────▼─────┐
                  │  MANAGE  │
                  │ LIBRARY  │
                  └────┬─────┘
                       │
                  ┌────▼─────┐
                  │  LOGOUT  │
                  └────┬─────┘
                       │
                  ┌────▼─────┐
                  │   END    │
                  └──────────┘
```

## 🔄 Data Flow

### 1️⃣ Document Upload & Processing
```text
[User] → [Upload PDF/DOCX] → [Node.js] → [MongoDB Atlas]
                                ↓
                         [Google Doc AI]
                                ↓
                         [Extract Text]
```

### 2️⃣ AI Summarization
```text
[Document Text] → [Node.js] → [Vertex AI]
                                   ↓
                            [AI Summary]
                                   ↓
                            [MongoDB Atlas]
```

### 3️⃣ Podcast Generation
```text
[Summary] → [Node.js] → [Google TTS] → [Audio File]
                             ↓              ↓
                      [Local Storage]  [MongoDB URL]
```

### 4️⃣ Voice Cloning (Optional)
```text
[Audio Sample] → [Node.js] → [Python RVC]
                                  ↓
                          [Train Model (10-30 min)]
                                  ↓
                          [.pth Model File]
                                  ↓
                          [Convert TTS → Clone]
```

## 🎯 Module Breakdown

### Frontend (Dashboard)
- **Technology**: Vanilla JavaScript, HTML5, CSS3
- **Features**:
  - Google OAuth authentication
  - Document upload interface
  - Summary display & editing
  - Podcast player with controls
  - Voice cloning management
  - Profile & notifications

### Backend (Node.js API)
- **Technology**: Express.js, Mongoose
- **Features**:
  - RESTful API endpoints
  - User authentication (Passport.js)
  - File upload handling (Multer)
  - Database operations
  - AI service integration
  - Voice service proxy

### Storage Layer
- **MongoDB Atlas (Cloud)**:
  - User accounts & profiles
  - Document metadata
  - AI-generated summaries
  - Podcast metadata & URLs
  - Custom voice configurations
  
- **Local Storage**:
  - Uploaded documents (uploads/documents/)
  - Generated audio files (uploads/audio/)
  - Temporary processing files

### AI Services (Google Cloud)
- **Document AI**:
  - OCR for PDFs
  - Text extraction from DOCX
  - Format preservation
  
- **Vertex AI**:
  - Content summarization
  - Natural language processing
  - Customizable prompts
  
- **Text-to-Speech**:
  - Multiple voice options (Neural2)
  - Language support
  - MP3 audio generation

### Voice Cloning (Python RVC)
- **Technology**: Flask, PyTorch, Transformers
- **Features**:
  - Audio preprocessing
  - Voice model training
  - Voice conversion
  - Model management
  - Mock mode for development

## 🔐 Security & Authentication

```text
[User] → [Google OAuth] → [JWT Token] → [Protected Routes]
                                              ↓
                                    [User-Specific Resources]
```

- Google OAuth 2.0 for authentication
- JWT tokens for session management
- User-based resource isolation
- Secure credential storage (Secret Manager for production)

## 🌍 Deployment Options

### Current (Local Development)
```text
[Your Computer]
 ├─ Node.js Server (localhost:3000)
 ├─ Python RVC Service (localhost:5000)
 ├─ MongoDB Atlas (Cloud)
 └─ Google Cloud AI (Cloud)
```

### Production (Cloud)
```text
[Cloud Run / App Engine]
 ├─ Node.js Container
 ├─ Python RVC Service (Optional)
 ├─ MongoDB Atlas
 ├─ Google Cloud Storage
 └─ Google Cloud AI Services
```

## 📊 Key Workflows

### Complete Podcast Creation Flow
```text
1. Upload Document
   └→ Store in MongoDB + Local Storage

2. Extract Text (Google Doc AI)
   └→ Parse PDF/DOCX content

3. Generate Summary (Vertex AI)
   └→ AI-powered summarization
   └→ Save to MongoDB

4. Create Podcast (Google TTS)
   └→ Convert text to speech
   └→ Save MP3 file
   └→ Store URL in MongoDB

5. (Optional) Clone Voice (Python RVC)
   └→ Train custom voice model
   └→ Convert podcast to cloned voice
   └→ Save converted audio
```

## 🔧 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML/CSS/JS | User interface |
| **Backend** | Node.js + Express | API server |
| **Database** | MongoDB Atlas | Data persistence |
| **Storage** | Local + GCS | File storage |
| **AI** | Google Cloud AI | Text processing & TTS |
| **Voice** | Python + PyTorch | Voice cloning |
| **Auth** | Google OAuth | User authentication |

## 💡 Design Principles

1. **Separation of Concerns**: Clear boundaries between modules
2. **Microservices Ready**: Voice cloning isolated as separate service
3. **Cloud-First**: Database and AI in cloud, ready for full deployment
4. **Scalable**: MongoDB Atlas and Google Cloud scale automatically
5. **Secure**: OAuth authentication, user isolation, secure storage
6. **Flexible**: Support multiple TTS providers and voice options

## 🚀 Future Enhancements

- WebSocket for real-time progress updates
- CDN integration for faster audio delivery
- Batch processing for multiple documents
- Advanced voice customization options
- Multi-language support
- Collaborative features

---

**Last Updated**: October 30, 2025
**Version**: 1.0.0
