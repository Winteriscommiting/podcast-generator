# 🚀 DEPLOYMENT STEPS - FOLLOW THIS EXACTLY!

## 📋 Current Status Check

Before we start, let's verify what you have:

- [ ] Node.js installed
- [ ] Google Cloud SDK installed (`gcloud --version`)
- [ ] Google Cloud account with billing enabled
- [ ] `google-credentials.json` file exists in your project
- [ ] Local app working on localhost:3000

---

## 🎯 STEP-BY-STEP DEPLOYMENT PROCESS

### ✅ STEP 1: Set Up MongoDB Atlas (15 minutes)

#### 1.1 Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google or email
3. Verify your email

#### 1.2 Create Free Cluster
1. Click **"Build a Database"**
2. Choose **"M0 FREE"** (shared cluster)
3. **Provider**: Google Cloud
4. **Region**: Iowa (us-central1)
5. **Cluster Name**: Leave as default or use `podcast-cluster`
6. Click **"Create"** (takes 3-5 minutes)

#### 1.3 Create Database User
1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. **Username**: `podcastadmin`
4. **Password**: Click "Autogenerate Secure Password" and **SAVE THIS PASSWORD!**
5. **Database User Privileges**: "Read and write to any database"
6. Click **"Add User"**

#### 1.4 Whitelist IP Address
1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. Confirms 0.0.0.0/0
5. Click **"Confirm"**

#### 1.5 Get Connection String
1. Click **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. **Driver**: Node.js
5. **Copy** the connection string (looks like this):
   ```
   mongodb+srv://podcastadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace** `<password>` with your actual password
7. **Add** database name: Change `/?retryWrites` to `/podcast-generator?retryWrites`

**Final format:**
```
mongodb+srv://podcastadmin:YOUR_ACTUAL_PASSWORD@cluster0.xxxxx.mongodb.net/podcast-generator?retryWrites=true&w=majority
```

#### 1.6 Update Your .env File

Open `d:\Pod-app-zai\.env` and update:

```properties
# Comment out local MongoDB
# MONGODB_URI=mongodb://localhost:27017/podcast-generator

# Add your Atlas connection string
MONGODB_URI=mongodb+srv://podcastadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/podcast-generator?retryWrites=true&w=majority
```

#### 1.7 Test Connection

```powershell
npm run test:atlas
```

**Expected output:**
```
✓ Connected to MongoDB Atlas successfully!
✓ Database Information
✓ All Tests Passed!
```

**If it fails:**
- Check password has no special characters that need URL encoding
- Verify IP whitelist is 0.0.0.0/0
- Wait a few minutes for Atlas cluster to fully start

#### 1.8 Migrate Your Data

```powershell
npm run migrate:atlas
```

**This will:**
- Copy all users from local → Atlas
- Copy all documents from local → Atlas
- Copy all summaries from local → Atlas
- Copy all podcasts from local → Atlas

**✅ STEP 1 COMPLETE!** Your database is now in the cloud!

---

### ✅ STEP 2: Set Up Google Cloud Storage (20 minutes)

#### 2.1 Verify Google Cloud SDK

```powershell
gcloud --version
```

**If not installed:**
1. Download from: https://cloud.google.com/sdk/docs/install
2. Run installer
3. Restart PowerShell
4. Run: `gcloud init`

#### 2.2 Login to Google Cloud

```powershell
gcloud auth login
```

This opens browser for authentication.

#### 2.3 Set Your Project

```powershell
gcloud config set project podcast-generator-474105
```

#### 2.4 Enable Cloud Storage API

```powershell
gcloud services enable storage-api.googleapis.com
```

Wait ~30 seconds for API to activate.

#### 2.5 Create Storage Buckets

**Create documents bucket:**
```powershell
gcloud storage buckets create gs://podcast-documents-474105 --project=podcast-generator-474105 --location=us-central1 --uniform-bucket-level-access
```

**Create audio bucket:**
```powershell
gcloud storage buckets create gs://podcast-audio-474105 --project=podcast-generator-474105 --location=us-central1 --uniform-bucket-level-access
```

**If bucket name is taken**, add a unique suffix:
```powershell
# Use your name or random number
gcloud storage buckets create gs://podcast-documents-474105-yourname --location=us-central1
gcloud storage buckets create gs://podcast-audio-474105-yourname --location=us-central1

# Then update .env with new bucket names
```

#### 2.6 Set Bucket Permissions

Get your service account email from `google-credentials.json`:

```powershell
# Read the service account email
$credentials = Get-Content google-credentials.json | ConvertFrom-Json
$serviceAccount = $credentials.client_email
Write-Host "Service Account: $serviceAccount"
```

**Grant permissions:**
```powershell
gcloud storage buckets add-iam-policy-binding gs://podcast-documents-474105 --member="serviceAccount:$serviceAccount" --role="roles/storage.objectAdmin"

gcloud storage buckets add-iam-policy-binding gs://podcast-audio-474105 --member="serviceAccount:$serviceAccount" --role="roles/storage.objectAdmin"
```

#### 2.7 Update .env for Cloud Storage

Ensure these are in your `.env`:

```properties
# Google Cloud Storage Configuration
GCS_PROJECT_ID=podcast-generator-474105
GCS_DOCUMENTS_BUCKET=podcast-documents-474105
GCS_AUDIO_BUCKET=podcast-audio-474105
GCS_LOCATION=us-central1
GCS_SIGNED_URL_EXPIRATION=3600
USE_CLOUD_STORAGE=true
```

#### 2.8 Test Cloud Storage

```powershell
npm run test:gcs
```

**Expected output:**
```
✓ Bucket access successful
✓ File uploaded successfully
✓ Signed URL generated
✓ File downloaded successfully
✓ All Tests Passed!
```

**If it fails:**
- Verify buckets exist: `gcloud storage buckets list`
- Check service account has permissions
- Ensure Storage API is enabled

#### 2.9 Migrate Your Files (Optional - if you have existing files)

```powershell
npm run migrate:gcs
```

**This will:**
- Upload all documents from `uploads/documents/` → GCS
- Upload all audio from `uploads/audio/` → GCS
- Update database records with GCS URLs
- Create local backup

**✅ STEP 2 COMPLETE!** Your files are now in cloud storage!

---

### ✅ STEP 3: Deploy to Google Cloud Run (30 minutes)

#### 3.1 Enable Required APIs

```powershell
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

Wait ~1 minute for APIs to activate.

#### 3.2 Create Secrets in Secret Manager

**MongoDB URI:**
```powershell
# Replace with YOUR actual Atlas connection string
$MONGODB_URI = "mongodb+srv://podcastadmin:PASSWORD@cluster0.xxxxx.mongodb.net/podcast-generator?retryWrites=true&w=majority"
echo $MONGODB_URI | gcloud secrets create mongodb-uri --data-file=-
```

**JWT Secret:**
```powershell
# Generate or use existing from .env
$JWT_SECRET = "your-super-secret-jwt-key-at-least-32-characters-long-change-this"
echo $JWT_SECRET | gcloud secrets create jwt-secret --data-file=-
```

**Session Secret:**
```powershell
$SESSION_SECRET = "your-session-secret-key-at-least-32-characters-change-this"
echo $SESSION_SECRET | gcloud secrets create session-secret --data-file=-
```

**Google Credentials:**
```powershell
gcloud secrets create google-credentials --data-file=google-credentials.json
```

**Google OAuth (from your .env file):**
```powershell
# Get from your .env file
$GOOGLE_CLIENT_ID = "your-google-client-id-from-env"
$GOOGLE_CLIENT_SECRET = "your-google-client-secret-from-env"

echo $GOOGLE_CLIENT_ID | gcloud secrets create google-client-id --data-file=-
echo $GOOGLE_CLIENT_SECRET | gcloud secrets create google-client-secret --data-file=-
```

#### 3.3 Verify Secrets Created

```powershell
gcloud secrets list
```

Should show:
- mongodb-uri
- jwt-secret
- session-secret
- google-credentials
- google-client-id
- google-client-secret

#### 3.4 Deploy to Cloud Run

**Option A: Deploy from source (easier):**

```powershell
gcloud run deploy podcast-generator `
  --source . `
  --region us-central1 `
  --platform managed `
  --allow-unauthenticated `
  --port 8080 `
  --memory 1Gi `
  --timeout 300 `
  --set-env-vars "NODE_ENV=production,USE_CLOUD_STORAGE=true,USE_GOOGLE_TTS=true,PORT=8080,GCS_PROJECT_ID=podcast-generator-474105,GCS_DOCUMENTS_BUCKET=podcast-documents-474105,GCS_AUDIO_BUCKET=podcast-audio-474105,GCS_LOCATION=us-central1,GOOGLE_CLOUD_PROJECT_ID=podcast-generator-474105,VERTEX_AI_PROJECT_ID=podcast-generator-474105,VERTEX_AI_LOCATION=us-central1"
```

**When prompted:**
- Service name: `podcast-generator` (or press Enter)
- Enable Artifact Registry: `Y`
- Continue: `Y`

**This will take 5-10 minutes** as it:
1. Builds Docker image
2. Pushes to registry
3. Deploys to Cloud Run
4. Provisions infrastructure

**Expected output:**
```
Building using Dockerfile...
✓ Creating Container Repository
✓ Uploading sources
✓ Building image
✓ Pushing image
✓ Deploying service
Service [podcast-generator] revision [podcast-generator-00001] has been deployed
Service URL: https://podcast-generator-xxxxx-uc.a.run.app
```

**Copy this URL!** This is your live application!

#### 3.5 Add Secrets to Cloud Run Service

The deployment above doesn't include secrets yet. Let's add them:

```powershell
gcloud run services update podcast-generator `
  --region us-central1 `
  --update-secrets MONGODB_URI=mongodb-uri:latest,JWT_SECRET=jwt-secret:latest,SESSION_SECRET=session-secret:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest `
  --set-env-vars GOOGLE_APPLICATION_CREDENTIALS=/secrets/google-credentials/latest
```

**Then mount the credentials file:**
```powershell
gcloud run services update podcast-generator `
  --region us-central1 `
  --update-secrets /secrets/google-credentials=google-credentials:latest
```

#### 3.6 Update Google OAuth Redirect URI

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://podcast-generator-xxxxx-uc.a.run.app/api/auth/google/callback
   ```
   (Replace with YOUR actual Cloud Run URL)
4. Click **Save**

#### 3.7 Test Your Deployment

Visit your Cloud Run URL: `https://podcast-generator-xxxxx-uc.a.run.app`

**Test checklist:**
- [ ] Homepage loads
- [ ] Can login with Google
- [ ] Can upload document
- [ ] Can generate summary
- [ ] Can create podcast
- [ ] Audio plays correctly
- [ ] Download works

**✅ STEP 3 COMPLETE!** Your app is live on the internet!

---

## 🎊 YOU'RE DONE!

Your podcast generator is now:
- ✅ **Live on the internet**: Accessible from anywhere
- ✅ **Cloud database**: MongoDB Atlas
- ✅ **Cloud storage**: Google Cloud Storage
- ✅ **Auto-scaling**: Handles 0 to unlimited users
- ✅ **Secure**: HTTPS, secrets managed
- ✅ **Cost-effective**: Pay only for usage

---

## 🔧 Common Issues & Solutions

### Issue: "gcloud: command not found"
**Solution:**
```powershell
# Install Google Cloud SDK
# Download from: https://cloud.google.com/sdk/docs/install
# Then restart PowerShell and run:
gcloud init
```

### Issue: "Bucket already exists"
**Solution:**
```powershell
# Use unique bucket names
gcloud storage buckets create gs://podcast-documents-474105-yourname --location=us-central1
# Update .env with new bucket name
```

### Issue: "Permission denied" on bucket
**Solution:**
```powershell
# Grant permissions again
$serviceAccount = (Get-Content google-credentials.json | ConvertFrom-Json).client_email
gcloud storage buckets add-iam-policy-binding gs://podcast-documents-474105 --member="serviceAccount:$serviceAccount" --role="roles/storage.objectAdmin"
```

### Issue: Cloud Run deployment fails
**Solution:**
```powershell
# Check logs
gcloud run services logs read podcast-generator --region us-central1 --limit 50

# Common fixes:
# 1. Ensure all secrets exist: gcloud secrets list
# 2. Check Dockerfile syntax
# 3. Verify billing is enabled
# 4. Try deploying again
```

### Issue: App deploys but crashes
**Solution:**
```powershell
# View logs
gcloud run services logs read podcast-generator --region us-central1

# Usually caused by:
# 1. Missing environment variables
# 2. Incorrect MongoDB connection string
# 3. Missing secrets
# 4. Port mismatch (must use PORT env var or 8080)
```

### Issue: MongoDB connection fails
**Solution:**
- Verify connection string is correct in Secret Manager
- Check Atlas IP whitelist includes 0.0.0.0/0
- Ensure database user exists
- Test locally first: `npm run test:atlas`

---

## 📊 View Your Deployment

### View in Cloud Console
- **Cloud Run**: https://console.cloud.google.com/run
- **Secrets**: https://console.cloud.google.com/security/secret-manager
- **Storage**: https://console.cloud.google.com/storage
- **Logs**: https://console.cloud.google.com/logs

### View Logs in Terminal
```powershell
# Recent logs
gcloud run services logs read podcast-generator --region us-central1 --limit 50

# Follow logs (live)
gcloud run services logs tail podcast-generator --region us-central1
```

### View Service Details
```powershell
gcloud run services describe podcast-generator --region us-central1
```

---

## 💰 Monitor Costs

1. Go to: https://console.cloud.google.com/billing
2. Set up budget alerts
3. Review costs weekly

**Expected costs:**
- Month 1-3: $0 (free tier)
- After free tier: $0-10/month (low traffic)

---

## 🚀 Next Steps

1. **Custom Domain** (optional):
   ```powershell
   gcloud run domain-mappings create --service podcast-generator --domain yourdomain.com --region us-central1
   ```

2. **Set up CI/CD** (optional):
   - Push code to GitHub
   - Set up Cloud Build trigger
   - Auto-deploy on git push

3. **Monitoring** (recommended):
   - Set up uptime checks
   - Configure error alerts
   - Enable logging

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] MongoDB Atlas cluster created
- [ ] MongoDB Atlas user created
- [ ] MongoDB Atlas IP whitelisted
- [ ] Connection string obtained
- [ ] .env updated with Atlas URI
- [ ] Atlas connection tested
- [ ] Data migrated to Atlas
- [ ] GCS buckets created
- [ ] GCS permissions set
- [ ] GCS tested
- [ ] Files migrated to GCS

### Deployment
- [ ] Google Cloud SDK installed
- [ ] Logged in to gcloud
- [ ] Project set
- [ ] APIs enabled (Run, Build, Secrets, Storage)
- [ ] Secrets created
- [ ] App deployed to Cloud Run
- [ ] Secrets added to service
- [ ] OAuth redirect URI updated

### Post-Deployment
- [ ] App URL accessible
- [ ] Can log in
- [ ] Can upload document
- [ ] Can create podcast
- [ ] Audio works
- [ ] Logs look healthy
- [ ] Costs monitored

---

**🎉 Congratulations! Your app is live!**

**Your URL**: Check deployment output or run:
```powershell
gcloud run services describe podcast-generator --region us-central1 --format "value(status.url)"
```

**Need help?** Check the logs first:
```powershell
gcloud run services logs read podcast-generator --region us-central1 --limit 100
```
