# 🎤 RVC Voice Cloning Setup Guide

## What is RVC?

**RVC (Retrieval-based Voice Conversion)** is an AI-powered voice cloning technology that allows you to:
- Train custom voice models from audio samples
- Convert any text-to-speech audio to sound like your voice
- Generate podcasts with your own voice

## Architecture Overview

```text
[Browser] → [Node.js API] → [Python RVC]
     ├─ [MongoDB]
     └─ [Models (.pth)]
```

## Setup Steps

### 1. Install Python

RVC requires **Python 3.9, 3.10, or 3.11** (NOT 3.12+)

**Windows:**
```powershell
# Download Python 3.11 from python.org
# Check version
python --version
```

**Mac/Linux:**
```bash
# Using pyenv (recommended)
pyenv install 3.11.7
pyenv local 3.11.7
```

### 2. Create Python Virtual Environment

```powershell
# Windows
cd d:\Pod-app-zai
python -m venv venv
.\venv\Scripts\Activate.ps1

# Mac/Linux
cd /path/to/Pod-app-zai
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies

```powershell
# Activate virtual environment first
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

**Manual Installation (if requirements.txt fails):**
```powershell
# Core Flask
pip install Flask==3.0.0 Flask-CORS==4.0.0

# RVC Dependencies
pip install torch==2.1.0 torchaudio==2.1.0
pip install fairseq==0.12.2
pip install pyworld==0.3.4
pip install librosa==0.10.1
pip install numpy==1.24.3
pip install scipy==1.11.4
pip install soundfile==0.12.1
pip install praat-parselmouth==0.4.3
pip install torchcrepe==0.0.21
pip install faiss-cpu==1.7.4
pip install pydub==0.25.1
```

### 4. Install FFmpeg (Required for Audio Processing)

**Windows:**
```powershell
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
# Add to PATH
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

Verify installation:
```powershell
ffmpeg -version
```

### 5. Clone RVC Repository (Optional - For Full Features)

```powershell
# Create RVC directory
mkdir rvc
cd rvc

# Clone RVC-Project
git clone https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI.git rvc-python

# Download pre-trained models (optional)
cd rvc-python
python download_models.py
```

### 6. Install Node.js Dependencies

```powershell
# Install form-data for RVC communication
npm install form-data axios
```

### 7. Configure Environment Variables

Add to your `.env` file:

```env
# RVC Service Configuration
RVC_SERVICE_URL=http://localhost:5000
RVC_TRAINING_TIMEOUT=1800000
RVC_CONVERSION_TIMEOUT=300000
```

## Running the Application

### Start Python RVC Service (Terminal 1)

```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start RVC service
python rvc_service.py
```

You should see:
```
🎤 Starting RVC Voice Cloning Service...
   RVC Available: True/False
   Models Directory: d:\Pod-app-zai\rvc\weights
   Loaded Models: 0
   Server running on http://localhost:5000
```

### Start Node.js Server (Terminal 2)

```powershell
# Start Node.js server
node server.js
```

You should see:
```
🚀 Server running on port 3000
🔗 http://localhost:3000
📊 MongoDB Atlas connected successfully
```

## How Voice Cloning Works

### 1. Upload Voice Sample

- User uploads audio file (MP3, WAV, OGG, M4A)
- Minimum 10 seconds recommended
- Clear speech, no background noise
- Node.js stores file in MongoDB GridFS

### 2. RVC Model Training (Automatic)

- Node.js triggers Python RVC service
- RVC processes audio:
  - **Preprocessing**: Splits audio into chunks
  - **Feature Extraction**: Analyzes voice characteristics using Hubert model
  - **Model Training**: Trains custom RVC model (10-30 minutes)
  - **Export**: Saves `.pth` model file
- Status updates: `uploaded` → `processing` → `ready`

### 3. Voice Conversion

- When generating podcast:
  - Generate base TTS audio (Google/Azure)
  - Send to RVC service with model ID
  - RVC converts audio to cloned voice
  - Return converted audio to user

## Testing Voice Cloning

### Test Python Service

```powershell
# Check health
curl http://localhost:5000/health

# Expected response:
# {
#   "status": "healthy",
#   "rvc_available": true,
#   "models_loaded": 0
# }
```

### Test Voice Upload

```javascript
// In browser console (http://localhost:3000/dashboard.html)
const formData = new FormData();
formData.append('voiceAudio', audioFile); // Get from <input type="file">
formData.append('name', 'My Voice');
formData.append('description', 'Test voice clone');

const response = await fetch('/api/custom-voices/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data);
```

### Monitor Training Progress

```javascript
// Check voice status
const response = await fetch('/api/custom-voices');
const data = await response.json();

data.voices.forEach(voice => {
  console.log(`${voice.name}: ${voice.status}`);
});
```

## Troubleshooting

### Issue: Python not found

**Solution:**
```powershell
# Check Python installation
python --version

# If not found, reinstall Python
# Make sure to check "Add to PATH" during installation
```

### Issue: RVC dependencies fail to install

**Solution:**
```powershell
# Install Visual C++ Build Tools (Windows)
# Download from: https://visualstudio.microsoft.com/downloads/

# Or install RVC in mock mode (development only)
# Edit rvc_service.py, change RVC_AVAILABLE = False
```

### Issue: FFmpeg not found

**Solution:**
```powershell
# Windows: Install FFmpeg
choco install ffmpeg

# Verify
ffmpeg -version
```

### Issue: Training takes too long

**Expected behavior:**
- Training typically takes 10-30 minutes
- Depends on audio length and computer speed
- Status will update to "ready" when complete

**Check logs:**
```powershell
# Python service logs
# Look for training progress messages
```

### Issue: Out of memory during training

**Solution:**
```powershell
# Reduce batch size in rvc_service.py
# Or use shorter audio samples
# Or close other applications
```

## Mock Mode (Development Without RVC)

If you can't install RVC dependencies, the service runs in **mock mode**:

- Accepts voice uploads
- Simulates training (2 second delay)
- Creates dummy model files
- No actual voice conversion

**To enable mock mode:**
```python
# In rvc_service.py
RVC_AVAILABLE = False  # Force mock mode
```

**Indicators of mock mode:**
```json
{
  "success": true,
  "mock": true,
  "message": "Mock training completed"
}
```

## Production Deployment

### Railway/Heroku

```yaml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "python rvc_service.py & node server.js"

[env]
PYTHON_VERSION = "3.11"
```

### Docker

```dockerfile
FROM python:3.11-slim

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install Node.js
RUN apt-get install -y nodejs npm

# Copy app
COPY . /app
WORKDIR /app

# Install Node dependencies
RUN npm install

# Start both services
CMD python rvc_service.py & node server.js
```

## Best Practices

### Audio Quality

- **Sample Rate**: 44.1 kHz or higher
- **Duration**: 10-60 seconds (more = better)
- **Content**: Clear speech, varied tones
- **Format**: WAV or high-quality MP3
- **Environment**: Quiet, no echo

### Training

- **First training**: May take 20-30 minutes
- **Subsequent**: Faster with GPU
- **GPU**: Recommended for production
- **CPU**: Works but slower

### Storage

- **Models**: Each voice = ~100-500 MB
- **Cleanup**: Delete unused models regularly
- **Backup**: Keep original audio samples

## Next Steps

1. ✅ Install Python and dependencies
2. ✅ Start RVC service
3. ✅ Upload voice sample
4. ✅ Wait for training (check status)
5. ✅ Generate podcast with cloned voice
6. ✅ Test voice quality

## Support

- RVC Project: https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI
- RVC Documentation: https://docs.rvc-project.com
- Issues: Create issue in this repository
