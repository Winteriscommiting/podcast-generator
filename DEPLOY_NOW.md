# 🚀 DEPLOY NOW - Complete Production Deployment Guide

## 🎯 Quick Start (Choose Your Platform)

### ⚡ Railway (Fastest - 5 Minutes)
### 🎨 Render (Free Tier Available)  
### ☁️ Google Cloud Run (Scalable)

---

## ⚡ RAILWAY DEPLOYMENT (RECOMMENDED)

Railway is perfect because it supports **both Node.js AND Python** in one deployment!

### Step 1: Prepare Repository

✅ Already done! Your repo has:
- `Procfile` - Tells Railway how to start services
- `railway.toml` - Railway configuration
- `package.json` - With engines specified
- `requirements.txt` - Python dependencies

### Step 2: Sign Up & Deploy

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select**: `winteriscommiting/podcast-generator`
5. Railway automatically detects Node.js + Python! ✨

### Step 3: Add Environment Variables

In Railway dashboard, click **Variables** and add:

```env
# MongoDB (REQUIRED)
MONGODB_URI=mongodb+srv://your_username:password@cluster.mongodb.net/podcast-db

# JWT Secret (REQUIRED)
JWT_SECRET=your_super_secret_jwt_key_change_this

# Google OAuth (REQUIRED for login)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret
GOOGLE_CALLBACK_URL=https://podcast-generator-production.up.railway.app/auth/google/callback

# Google Cloud (Optional - for Document AI)
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"your-project",...}
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# RVC Configuration
RVC_SERVICE_URL=http://localhost:5000
RVC_MOCK_MODE=true
RVC_TRAINING_TIMEOUT=1800000

# Node Environment
NODE_ENV=production
PORT=3000
```

### Step 4: Update Google OAuth

1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client
3. **Authorized redirect URIs**, add:
   ```
   https://your-app.railway.app/auth/google/callback
   ```
4. Save

### Step 5: Deploy!

Railway will automatically:
- ✅ Build your app
- ✅ Install dependencies (Node.js + Python)
- ✅ Start both services (Node.js + RVC)
- ✅ Provide HTTPS domain
- ✅ Auto-redeploy on Git push

**Your app URL**: `https://podcast-generator-production.up.railway.app`

### Step 6: Test Voice Upload

1. Visit your Railway URL
2. Login with Google
3. Go to "Voice Cloning" tab
4. Upload a voice file
5. Watch status change: Uploaded → Processing → Ready

---

## 🎨 RENDER DEPLOYMENT

Render has a generous free tier!

### Step 1: Create Web Service

1. **Go to**: https://render.com
2. **New** → **Web Service**
3. **Connect GitHub** repository: `winteriscommiting/podcast-generator`

### Step 2: Configure Service

**Basic Settings**:
- **Name**: `podcast-generator`
- **Region**: Choose closest to users
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Environment**: `Node`
- **Build Command**: `npm install && pip install -r requirements.txt`
- **Start Command**: `python rvc_service.py & node server.js`

**Advanced Settings**:
- **Auto-Deploy**: Yes
- **Health Check Path**: `/health`

### Step 3: Environment Variables

Click **Environment** and add the same variables as Railway above.

### Step 4: Deploy

Click **Create Web Service** and Render will:
- ✅ Clone your repo
- ✅ Install dependencies
- ✅ Deploy to HTTPS URL

**Your app URL**: `https://podcast-generator.onrender.com`

---

## ☁️ GOOGLE CLOUD RUN DEPLOYMENT

For maximum scalability!

### Step 1: Install Google Cloud SDK

```powershell
# Download from: https://cloud.google.com/sdk/docs/install

# Or using Chocolatey
choco install gcloudsdk

# Verify
gcloud --version
```

### Step 2: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Multi-stage build for Node.js + Python
FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Install FFmpeg (for audio processing)
RUN apt-get install -y ffmpeg

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install dependencies
RUN npm install --production
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create RVC directories
RUN mkdir -p rvc/models rvc/weights rvc/logs rvc/temp

# Expose ports
EXPOSE 8080 5000

# Start both services
CMD python rvc_service.py & node server.js
```

### Step 3: Deploy to Cloud Run

```powershell
# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Build and deploy
gcloud run deploy podcast-generator \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,RVC_MOCK_MODE=true" \
  --set-secrets="MONGODB_URI=mongodb-uri:latest,JWT_SECRET=jwt-secret:latest"
```

---

## 🔧 TROUBLESHOOTING

### Audio Upload Not Working

**Check these**:

1. **Open Browser Console** (F12):
   - Look for errors
   - Check: "🎤 Starting voice upload..."
   - Check: "Selected file: ..."

2. **Check Network Tab**:
   - Look for `/api/custom-voices/upload` request
   - Check status code (should be 200)
   - Check response

3. **Common Issues**:
   
   **Issue**: "No file selected"
   - **Fix**: Click the drop zone OR drag file onto it
   - **Fix**: Make sure file is audio format (MP3, WAV, OGG, M4A)

   **Issue**: "401 Unauthorized"
   - **Fix**: Make sure you're logged in
   - **Fix**: Token might be expired - logout and login again

   **Issue**: "File size exceeds 50MB"
   - **Fix**: Compress your audio file
   - **Fix**: Use shorter audio clip

   **Issue**: "Invalid file type"
   - **Fix**: Convert to MP3 or WAV format

### RVC Service Not Starting

**Check**:

```powershell
# Check if service is running
curl http://localhost:5000/health

# Should return:
# {
#   "status": "healthy",
#   "rvc_available": false,
#   "models_loaded": 0
# }
```

**If not running**:

```powershell
# Restart manually
cd d:\Pod-app-zai
.\venv\Scripts\Activate.ps1
python rvc_service.py
```

### MongoDB Connection Issues

**Check connection string**:

```env
# Correct format:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Make sure:
# ✅ Username is correct
# ✅ Password is URL-encoded (no special characters)
# ✅ Cluster name is correct
# ✅ Database name is specified
```

### Google OAuth Not Working

**Update callback URL**:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit OAuth 2.0 Client
3. Add production URL:
   ```
   https://your-production-url.com/auth/google/callback
   ```
4. Save and wait 5-10 minutes

---

## 🧪 TESTING PRODUCTION DEPLOYMENT

### Test Checklist

1. **Homepage Loads**
   - [ ] Visit production URL
   - [ ] Homepage displays correctly
   - [ ] No console errors

2. **Authentication**
   - [ ] Click "Sign in with Google"
   - [ ] OAuth redirects correctly
   - [ ] Lands on dashboard after login

3. **Document Upload**
   - [ ] Upload a text/PDF file
   - [ ] File processes successfully
   - [ ] No errors in console

4. **Voice Cloning**
   - [ ] Open Voice Cloning tab
   - [ ] Click "Upload New Voice"
   - [ ] Select/drag audio file
   - [ ] Fill in voice name
   - [ ] Click "Upload Voice"
   - [ ] Success message appears
   - [ ] Voice appears in list with "Processing" status
   - [ ] Status changes to "Ready" (in mock mode: ~2 seconds)

5. **Podcast Generation**
   - [ ] Select a document
   - [ ] Choose voice settings
   - [ ] Generate podcast
   - [ ] Audio plays correctly

---

## 📊 MONITORING

### Railway Monitoring

- **Logs**: Railway Dashboard → Deployments → View Logs
- **Metrics**: CPU, Memory, Network usage visible
- **Alerts**: Set up in Settings → Notifications

### Render Monitoring

- **Logs**: Service Dashboard → Logs tab
- **Metrics**: Dashboard shows response times, requests
- **Health Checks**: Auto-restart if health check fails

### Google Cloud Monitoring

```powershell
# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# Check metrics
gcloud run services describe podcast-generator --region us-central1
```

---

## 💰 COST ESTIMATES

### Railway

- **Free Tier**: $5 of usage/month
- **Hobby Plan**: $5/month (500 hours)
- **Pro Plan**: $20/month (unlimited)
- **Estimate**: ~$5-10/month for low traffic

### Render

- **Free Tier**: Free (with limits)
  - 750 hours/month
  - Sleeps after 15min inactivity
  - 512MB RAM
- **Starter**: $7/month
- **Estimate**: Free for testing, $7/month for production

### Google Cloud Run

- **Free Tier**:
  - 2 million requests/month
  - 360,000 GB-seconds
  - 180,000 vCPU-seconds
- **Beyond Free Tier**: ~$0.40 per million requests
- **Estimate**: Free for low/medium traffic

---

## ✅ DEPLOYMENT SUCCESS CHECKLIST

- [ ] Choose platform (Railway/Render/Cloud Run)
- [ ] Sign up for platform
- [ ] Connect GitHub repository
- [ ] Add environment variables
- [ ] Update Google OAuth redirect URL
- [ ] Deploy application
- [ ] Test homepage
- [ ] Test authentication
- [ ] Test voice upload
- [ ] Test podcast generation
- [ ] Monitor logs for errors
- [ ] Set up custom domain (optional)

---

## 🚀 NEXT STEPS AFTER DEPLOYMENT

1. **Custom Domain** (Optional):
   - Railway: Settings → Domains → Add custom domain
   - Render: Settings → Custom Domain
   - Add DNS records as instructed

2. **SSL Certificate**:
   - Automatic on Railway, Render, Cloud Run
   - Free HTTPS included!

3. **Monitoring**:
   - Set up error alerts
   - Monitor usage/costs
   - Check logs regularly

4. **Backups**:
   - MongoDB Atlas: Auto-backups enabled
   - Code: Already on GitHub
   - Environment variables: Save securely

5. **Performance**:
   - Monitor response times
   - Optimize if needed
   - Scale up if traffic increases

---

## 🆘 NEED HELP?

### Common Questions

**Q: Which platform should I choose?**
**A**: Railway for easiest setup, Render for free tier, Cloud Run for scale.

**Q: How long does deployment take?**
**A**: Railway: 5-10 minutes, Render: 10-15 minutes, Cloud Run: 15-20 minutes.

**Q: Can I use the free tier?**
**A**: Yes! Render has a generous free tier. Railway gives $5/month free credit.

**Q: Do I need a credit card?**
**A**: Railway: No, Render: No, Cloud Run: Yes (but won't charge within free tier).

**Q: Can users upload voices in production?**
**A**: Yes! The mock mode simulates training (~2 seconds). For real RVC training, install full dependencies.

---

## 🎉 YOU'RE READY TO DEPLOY!

Choose your platform and follow the steps above. Your podcast generator with voice cloning will be live in minutes!

**Recommended**: Start with Railway for the easiest deployment experience.

---

**Questions?** Check the logs and troubleshooting section above!

**Success?** Your app is now online and accessible worldwide! 🌍✨
