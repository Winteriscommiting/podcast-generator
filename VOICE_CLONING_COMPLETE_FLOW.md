# 🎤 Complete Voice Cloning Flow - User Guide

## What You Can Do Now

Your podcast generator now has **full voice cloning integration**:
1. Upload voice samples → Train them
2. Select trained voices when creating podcasts
3. Automatically convert podcast audio to your cloned voice

---

## How It Works (For Users Online)

### Step 1: Upload & Train a Voice

1. **Go to Voice Cloning tab** in the dashboard
2. **Click "Upload Voice Sample"**
3. **Upload an audio file** (MP3, WAV, OGG, M4A - max 50MB)
   - Ideally 10-60 seconds of clear speech
4. **Fill in details:**
   - Voice name (e.g., "My Voice")
   - Description, gender, language, accent (optional)
   - HF Repo (optional - for advanced users with pre-trained models)
5. **Click Upload**

**What happens:**
- File is stored in MongoDB GridFS
- Python service receives the audio
- Training starts (or marks ready if in mock mode)
- Status changes: `uploaded` → `processing` → `ready`

**Wait time:** 
- Mock mode: instant
- Real training: 5-30 minutes depending on model

### Step 2: Create Podcast with Custom Voice

1. **Go to Podcasts tab**
2. **Click "Create Podcast"**
3. **Fill in podcast details:**
   - Select a document
   - Choose content source (Full Document or Summary)
   - Enter title & description
   - Select voice provider (Google TTS, Azure, etc.)
   - Select base voice
4. **NEW: Select "Clone with Custom Voice"**
   - Choose one of your trained voices from the dropdown
   - Or leave as "None" to use original voice
5. **Click "Create Podcast"**

**What happens:**
- Podcast generates with the base voice (Google TTS, Azure, etc.)
- Audio is saved to database
- **Automatically:** Background conversion starts
- Your trained voice is applied to the audio
- `conversionStatus` updates: `none` → `processing` → `completed`

### Step 3: Listen & Download

**In the Podcasts tab, you'll see:**
- Original audio (plays immediately after generation)
- Converted audio (plays when conversion completes)

**Status indicators:**
- ✅ Original: `processingStatus: completed`
- 🎙️ Converted: `conversionStatus: completed`

**Play options:**
- Click Play → plays converted version if available
- Otherwise plays original
- Download button saves converted audio if available

---

## Technical Flow

```
User uploads voice sample (MP3/WAV)
    ↓
Backend stores in MongoDB GridFS
    ↓
POST /api/custom-voices/upload
    ↓
Python service /train endpoint
    ↓
Process audio + prepare model
    ↓
Status → ready in DB
    
---

User creates podcast
    ↓
Select custom voice from dropdown
    ↓
POST /api/podcasts { customVoiceId: "..." }
    ↓
Generate base audio (Google TTS/Azure)
    ↓
Save original audio → DB
    ↓
Background: convertPodcastVoice()
    ↓
Read original audio file
    ↓
POST to Python /convert { audio, model_id, hf_repo? }
    ↓
Python applies trained voice
    ↓
Save converted audio
    ↓
Update podcast.convertedAudioUrl
    ↓
User sees/plays converted version
```

---

## Database Schema Updates

### Podcast Model (New Fields)

```javascript
customVoice: ObjectId (ref: CustomVoice)
convertedAudioUrl: String  // Path to converted audio
conversionStatus: enum ['none', 'pending', 'processing', 'completed', 'failed']
```

### CustomVoice Model (Existing)

```javascript
status: enum ['uploaded', 'processing', 'ready', 'failed']
hfRepo: String         // Hugging Face repo (optional)
hfRevision: String     // HF model revision (optional)
rvcBackend: String     // 'xtts', 'freevc', 'rvc', 'knn-vc'
trainingMode: String   // 'zero-shot', 'fine-tune', etc.
```

---

## API Endpoints Used

### Voice Upload & Training
- `POST /api/custom-voices/upload` - Upload voice sample
- `GET /api/custom-voices` - List user's voices
- `PUT /api/custom-voices/:id/hf` - Link HF model
- `POST /api/custom-voices/:id/convert` - Test voice conversion

### Podcast Generation with Voice
- `POST /api/podcasts` - Create podcast (now accepts `customVoiceId`)
- `GET /api/podcasts` - List podcasts (includes `conversionStatus`)

### Python Service
- `POST /train` - Train/prepare voice model
- `POST /convert` - Convert audio with trained voice
- `GET /health` - Service health (mode, xtts_available, etc.)

---

## Testing Online

### Prerequisites
- Railway deployment with:
  - `RVC_SERVICE_URL=http://127.0.0.1:5000`
  - `HF_SERVICE_URL=http://127.0.0.1:5000`
  - `NIXPACKS_PYTHON_VERSION=3.11` (for XTTS)
  - Python deps installed (requirements-huggingface.txt, requirements-xtts.txt)

### Test Sequence

1. **Verify Python service is running:**
   - https://podcast-generator-production-5c18.up.railway.app/api/hf/health
   - Should return: `status: healthy`, `mode: huggingface`

2. **Upload a voice:**
   - Dashboard → Voice Cloning → Upload Voice Sample
   - Wait for status → ready

3. **Create podcast with custom voice:**
   - Dashboard → Podcasts → Create Podcast
   - Select document, fill details
   - Choose custom voice from dropdown
   - Click Create

4. **Monitor conversion:**
   - Watch podcast card
   - `processingStatus: completed` (original audio ready)
   - `conversionStatus: processing` → `completed` (converted audio ready)

5. **Play both versions:**
   - Original: plays base TTS voice
   - Converted: plays your cloned voice

---

## Troubleshooting

### Voice stays in "processing"
- Check Python service logs
- Verify `/train` endpoint is reachable
- May be in mock mode (instant ready but no real training)

### Conversion fails
- Check Python service can read original audio file
- Verify RVC_SERVICE_URL is correct
- Check `/convert` endpoint logs
- Ensure custom voice status is "ready"

### Converted audio sounds wrong
- Voice sample may be too short (need 10-60s)
- Background noise in sample
- Try linking a HF repo with a pre-trained model
- Check backend setting (xtts vs freevc vs rvc)

### Service not reachable online
- Verify Railway environment variables set
- Check deployment logs for Python startup
- Ensure both `python3 rvc_service_hf.py` and `node server.js` are running
- Test `/api/hf/health` endpoint

---

## Advanced: Using HF Pre-trained Models

Instead of training from scratch, link a Hugging Face model:

1. **Edit your custom voice**
2. **Set HF Repo:** `owner/model-name`
3. **Set Revision:** `main` or specific commit
4. **Choose Backend:** 
   - `xtts` - Zero-shot text-to-speech (requires Coqui TTS)
   - `freevc` - Voice conversion (requires infer.py in repo)
   - `rvc` - RVC voice conversion (requires infer.py)
5. **Click "Link Hugging Face Model"**
6. **Status → ready immediately**

Now when you convert, it uses the HF model instead of local training.

---

## What's Next

Optional enhancements you can add:

1. **Voice preview in podcast modal** - Test voice before generating
2. **Batch conversion** - Convert multiple podcasts at once
3. **Voice analytics** - Track usage, popularity
4. **Auto-select best voice** - AI suggests voice based on content
5. **Voice mixing** - Blend multiple voices
6. **Real-time progress** - WebSocket updates during conversion

---

## Summary

✅ **Upload voice** → Python trains → DB stores as ready
✅ **Create podcast** → Select custom voice → Background conversion
✅ **Play/download** → Converted audio with your cloned voice
✅ **Works online** → Railway deployment ready
✅ **HF integration** → Use pre-trained models from Hugging Face

**Everything works end-to-end for anyone who visits your website!**
