# 🚀 Complete Google Cloud Platform Deployment Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Google Cloud Storage Setup](#google-cloud-storage-setup)
4. [Data Migration](#data-migration)
5. [Google Cloud Project Setup](#google-cloud-project-setup)
6. [Secret Manager Configuration](#secret-manager-configuration)
7. [Deployment Options](#deployment-options)
8. [Post-Deployment Steps](#post-deployment-steps)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before deploying, ensure you have:

- ✅ Google Cloud account with billing enabled
- ✅ MongoDB Atlas account (free tier works)
- ✅ Google Cloud SDK (`gcloud`) installed
- ✅ Docker installed (for Cloud Run)
- ✅ Node.js 18+ installed locally
- ✅ Your `google-credentials.json` file
- ✅ All local features tested and working

### Install Google Cloud SDK

**Windows:**
```powershell
# Download from: https://cloud.google.com/sdk/docs/install
# Run the installer and follow prompts
```

**Verify installation:**
```powershell
gcloud --version
gcloud auth login
gcloud config set project podcast-generator-474105
```

---

## 1️⃣ MongoDB Atlas Setup

### Step 1: Create Atlas Cluster

Follow the detailed guide in `MONGODB_ATLAS_SETUP_GUIDE.md`

**Quick checklist:**
1. ✅ Create M0 Free cluster in us-central1
2. ✅ Create database user with password
3. ✅ Whitelist IP: 0.0.0.0/0 (for development)
4. ✅ Get connection string
5. ✅ Update `.env` with Atlas URI

### Step 2: Test Connection

```powershell
# Update .env first with your Atlas connection string
node test-atlas-connection.js
```

**Expected output:**
```
✓ Connected to MongoDB Atlas successfully!
✓ Database Information
  Database Name: podcast-generator
  Collections: 0 (or existing count)
✓ All Tests Passed!
```

### Step 3: Migrate Data

```powershell
npm run migrate:atlas
```

This will copy all data from local MongoDB to Atlas.

---

## 2️⃣ Google Cloud Storage Setup

### Step 1: Create Buckets

Follow the detailed guide in `GOOGLE_CLOUD_STORAGE_SETUP.md`

**Using gcloud CLI:**

```powershell
# Create documents bucket
gcloud storage buckets create gs://podcast-documents-474105 `
  --project=podcast-generator-474105 `
  --location=us-central1 `
  --uniform-bucket-level-access

# Create audio bucket
gcloud storage buckets create gs://podcast-audio-474105 `
  --project=podcast-generator-474105 `
  --location=us-central1 `
  --uniform-bucket-level-access
```

### Step 2: Set Permissions

```powershell
# Get your service account email
$SERVICE_ACCOUNT = (Get-Content google-credentials.json | ConvertFrom-Json).client_email

# Grant Storage Admin role
gcloud storage buckets add-iam-policy-binding gs://podcast-documents-474105 `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/storage.objectAdmin"

gcloud storage buckets add-iam-policy-binding gs://podcast-audio-474105 `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/storage.objectAdmin"
```

### Step 3: Test Storage

```powershell
npm run test:gcs
```

### Step 4: Migrate Files

```powershell
npm run migrate:gcs
```

This uploads all local files to Google Cloud Storage.

---

## 3️⃣ Data Migration Summary

### Migration Checklist

- [ ] Local MongoDB data → MongoDB Atlas
- [ ] Local `uploads/documents/` → GCS documents bucket
- [ ] Local `uploads/audio/` → GCS audio bucket
- [ ] Database records updated with GCS paths
- [ ] Signed URLs generated and tested
- [ ] Backup of local files created

### Verify Migration

```powershell
# Check Atlas has data
node test-atlas-connection.js

# Check GCS has files
gcloud storage ls gs://podcast-documents-474105/ --recursive
gcloud storage ls gs://podcast-audio-474105/ --recursive
```

---

## 4️⃣ Google Cloud Project Setup

### Step 1: Enable Required APIs

```powershell
gcloud services enable `
  run.googleapis.com `
  cloudbuild.googleapis.com `
  containerregistry.googleapis.com `
  secretmanager.googleapis.com `
  storage-api.googleapis.com `
  documentai.googleapis.com `
  aiplatform.googleapis.com `
  texttospeech.googleapis.com
```

### Step 2: Create Service Account (if not exists)

```powershell
# Create service account
gcloud iam service-accounts create podcast-app `
  --display-name="Podcast Generator Application"

# Grant necessary roles
$PROJECT_ID = "podcast-generator-474105"
$SA_EMAIL = "podcast-app@$PROJECT_ID.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$SA_EMAIL" `
  --role="roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$SA_EMAIL" `
  --role="roles/documentai.apiUser"

gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$SA_EMAIL" `
  --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$SA_EMAIL" `
  --role="roles/cloudtts.user"
```

---

## 5️⃣ Secret Manager Configuration

Store sensitive data in Google Secret Manager (more secure than environment variables).

### Step 1: Create Secrets

```powershell
# MongoDB Atlas connection string
$MONGODB_URI = "your-mongodb-atlas-connection-string"
echo $MONGODB_URI | gcloud secrets create mongodb-uri --data-file=-

# JWT Secret
$JWT_SECRET = "your-super-secret-jwt-key-at-least-32-characters-long"
echo $JWT_SECRET | gcloud secrets create jwt-secret --data-file=-

# Session Secret
$SESSION_SECRET = "your-session-secret-key-at-least-32-characters-long"
echo $SESSION_SECRET | gcloud secrets create session-secret --data-file=-

# Google Credentials (entire JSON file)
gcloud secrets create google-credentials --data-file=google-credentials.json

# Google OAuth Client ID
$GOOGLE_CLIENT_ID = "your-google-oauth-client-id"
echo $GOOGLE_CLIENT_ID | gcloud secrets create google-client-id --data-file=-

# Google OAuth Client Secret
$GOOGLE_CLIENT_SECRET = "your-google-oauth-client-secret"
echo $GOOGLE_CLIENT_SECRET | gcloud secrets create google-client-secret --data-file=-
```

### Step 2: Grant Access to Service Account

```powershell
$SA_EMAIL = "podcast-app@podcast-generator-474105.iam.gserviceaccount.com"

gcloud secrets add-iam-policy-binding mongodb-uri `
  --member="serviceAccount:$SA_EMAIL" `
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding jwt-secret `
  --member="serviceAccount:$SA_EMAIL" `
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding session-secret `
  --member="serviceAccount:$SA_EMAIL" `
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding google-credentials `
  --member="serviceAccount:$SA_EMAIL" `
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding google-client-id `
  --member="serviceAccount:$SA_EMAIL" `
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding google-client-secret `
  --member="serviceAccount:$SA_EMAIL" `
  --role="roles/secretmanager.secretAccessor"
```

### Step 3: Update Secrets (when needed)

```powershell
# To update a secret:
echo "new-value" | gcloud secrets versions add mongodb-uri --data-file=-
```

---

## 6️⃣ Deployment Options

### 🔷 Option A: Deploy to Cloud Run (Recommended)

**Why Cloud Run?**
- Auto-scaling (0 to many instances)
- Pay only for actual usage
- HTTPS included
- Easy rollbacks

**Deploy Command:**

```powershell
gcloud run deploy podcast-generator `
  --source . `
  --region us-central1 `
  --platform managed `
  --allow-unauthenticated `
  --port 8080 `
  --memory 1Gi `
  --cpu 1 `
  --timeout 300 `
  --max-instances 10 `
  --min-instances 0 `
  --set-env-vars "NODE_ENV=production,USE_CLOUD_STORAGE=true,USE_GOOGLE_TTS=true,GCS_PROJECT_ID=podcast-generator-474105,GCS_DOCUMENTS_BUCKET=podcast-documents-474105,GCS_AUDIO_BUCKET=podcast-audio-474105" `
  --set-secrets "MONGODB_URI=mongodb-uri:latest,JWT_SECRET=jwt-secret:latest,SESSION_SECRET=session-secret:latest,GOOGLE_APPLICATION_CREDENTIALS=google-credentials:latest"
```

**Or use npm script:**
```powershell
npm run deploy:run
```

**Expected output:**
```
Deploying from source...
✓ Building image
✓ Pushing image
✓ Deploying service
Service URL: https://podcast-generator-xxxxx-uc.a.run.app
```

### 🔷 Option B: Deploy to App Engine

**Deploy Command:**

```powershell
gcloud app deploy app.yaml --quiet
```

**Or use npm script:**
```powershell
npm run deploy:appengine
```

**Note:** You'll need to add secrets to App Engine environment:

```powershell
# Edit app.yaml and add under env_variables:
# Or use Secret Manager integration
```

### 🔷 Option C: CI/CD with Cloud Build

**Set up automated deployment on git push:**

```powershell
# Submit build manually
gcloud builds submit --config cloudbuild.yaml

# Or use npm script
npm run deploy:build
```

**Set up trigger for automatic deployment:**

1. Go to Cloud Build Triggers: https://console.cloud.google.com/cloud-build/triggers
2. Click **"Create Trigger"**
3. Connect your GitHub/Bitbucket repository
4. Set branch pattern: `^main$` or `^master$`
5. Build configuration: `cloudbuild.yaml`
6. Click **"Create"**

Now every push to main/master will automatically deploy!

---

## 7️⃣ Post-Deployment Steps

### Step 1: Test Deployment

Visit your deployed URL and test:

- [ ] Homepage loads
- [ ] Google OAuth login works
- [ ] Document upload works
- [ ] Summary generation works
- [ ] Podcast creation works
- [ ] Audio plays correctly
- [ ] Download works

### Step 2: Configure OAuth Redirect

Update Google Cloud Console OAuth settings:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Add **Authorized redirect URIs**:
   ```
   https://your-app-url.run.app/api/auth/google/callback
   ```
4. Click **Save**

### Step 3: Update CORS (if needed)

If frontend is on different domain:

```powershell
# Update CORS for GCS buckets
# Create cors.json file first, then:
gcloud storage buckets update gs://podcast-documents-474105 --cors-file=cors.json
gcloud storage buckets update gs://podcast-audio-474105 --cors-file=cors.json
```

### Step 4: Set Up Custom Domain (Optional)

```powershell
# Map custom domain to Cloud Run
gcloud run domain-mappings create `
  --service podcast-generator `
  --domain yourdomain.com `
  --region us-central1
```

Follow instructions to update DNS records.

---

## 8️⃣ Monitoring & Maintenance

### View Logs

**Cloud Run:**
```powershell
gcloud run services logs read podcast-generator --region us-central1
```

**Or in console:**
https://console.cloud.google.com/logs

### Monitor Performance

**Cloud Run metrics:**
https://console.cloud.google.com/run/detail/us-central1/podcast-generator/metrics

**Key metrics to watch:**
- Request count
- Request latency
- Error rate
- Memory usage
- CPU utilization

### Set Up Alerts

1. Go to Monitoring: https://console.cloud.google.com/monitoring
2. Create alert policies for:
   - Error rate > 5%
   - Response time > 2 seconds
   - Memory usage > 80%

### Cost Monitoring

1. Go to Billing: https://console.cloud.google.com/billing
2. Set up budget alerts
3. Review cost breakdown regularly

**Estimated monthly costs:**
- Cloud Run: $0-10 (low traffic)
- Cloud Storage: $0-2 (5GB free tier)
- Document AI: $0-5 (first 1000 pages free)
- Vertex AI: $0-5 (depends on usage)
- MongoDB Atlas: $0 (M0 free tier)
- **Total: $0-25/month** for low traffic

---

## 9️⃣ Troubleshooting

### Issue: Deployment Fails

**Check build logs:**
```powershell
gcloud builds list
gcloud builds log BUILD_ID
```

**Common fixes:**
- Ensure all required APIs are enabled
- Check Dockerfile syntax
- Verify package.json has all dependencies

### Issue: Service Starts But Crashes

**Check service logs:**
```powershell
gcloud run services logs read podcast-generator --limit 50
```

**Common causes:**
- Missing environment variables
- Incorrect MongoDB connection string
- Missing secrets
- Port mismatch (must use port 8080 or PORT env var)

### Issue: Cannot Connect to MongoDB

**Check:**
- MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Connection string in Secret Manager is correct
- Database user exists and has permissions

**Test connection:**
```powershell
# SSH into Cloud Run container (if possible) or test locally with production secrets
```

### Issue: Audio Not Playing

**Check:**
- GCS buckets are accessible
- Signed URLs are being generated
- CORS is configured if accessing from different domain
- Audio files were migrated successfully

### Issue: Google OAuth Not Working

**Check:**
- Redirect URI matches exactly in OAuth settings
- Client ID and Secret are in Secret Manager
- Session secret is set
- HTTPS is used (not HTTP)

---

## 🎉 Deployment Checklist

### Pre-Deployment
- [ ] MongoDB Atlas created and tested
- [ ] GCS buckets created and tested
- [ ] All data migrated (database + files)
- [ ] All secrets created in Secret Manager
- [ ] All APIs enabled
- [ ] Service account permissions granted

### Deployment
- [ ] Application deployed to Cloud Run/App Engine
- [ ] Deployment succeeded without errors
- [ ] Service is accessible via URL

### Post-Deployment
- [ ] OAuth redirect URIs updated
- [ ] Application tested end-to-end
- [ ] Monitoring and alerts set up
- [ ] Custom domain configured (if needed)
- [ ] Budget alerts configured

### Ongoing
- [ ] Monitor logs regularly
- [ ] Review costs monthly
- [ ] Update secrets when needed
- [ ] Keep dependencies updated
- [ ] Backup MongoDB Atlas data

---

## 📚 Additional Resources

- **Cloud Run docs**: https://cloud.google.com/run/docs
- **Secret Manager**: https://cloud.google.com/secret-manager/docs
- **Cloud Storage**: https://cloud.google.com/storage/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Document AI**: https://cloud.google.com/document-ai/docs
- **Vertex AI**: https://cloud.google.com/vertex-ai/docs

---

## 🆘 Need Help?

1. Check logs first: `gcloud run services logs read podcast-generator`
2. Review this guide thoroughly
3. Check Google Cloud Status: https://status.cloud.google.com
4. MongoDB Atlas Status: https://status.mongodb.com

---

**🎊 Congratulations! Your podcast generator is now running in the cloud!**

Your application is:
- ✅ Fully scalable
- ✅ Highly available
- ✅ Secure (HTTPS, secrets managed)
- ✅ Production-ready
- ✅ Cost-effective

**Next steps:** Monitor usage, gather user feedback, and iterate! 🚀
