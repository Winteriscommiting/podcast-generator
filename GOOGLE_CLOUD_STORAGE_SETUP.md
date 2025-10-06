# ☁️ Google Cloud Storage Setup Guide

## 🎯 Overview

Google Cloud Storage (GCS) will replace your local `uploads/` folder to store:
- 📄 Document files (PDF, DOCX, TXT)
- 🎵 Generated podcast audio files (MP3)

**Benefits**:
- ✅ Accessible from anywhere
- ✅ Automatic CDN delivery
- ✅ Scalable storage (no disk limits)
- ✅ Secure access with signed URLs
- ✅ Automatic backups
- ✅ Works with Google Cloud deployment

---

## 🔧 Step 1: Enable Cloud Storage API

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Select your project: **`podcast-generator-474105`**
3. Navigate to **APIs & Services > Library**
4. Search for **"Cloud Storage API"**
5. Click **"Enable"**
6. Wait for activation (takes ~30 seconds)

---

## 🪣 Step 2: Create Storage Buckets

You'll create TWO buckets for better organization:

### Bucket 1: Documents Storage

```bash
gsutil mb -p podcast-generator-474105 -c STANDARD -l us-central1 gs://podcast-documents-474105/
```

**Settings**:
- Name: `podcast-documents-474105`
- Location: `us-central1` (Iowa - same as your other services)
- Storage class: `Standard`
- Access: Private (use signed URLs)

### Bucket 2: Audio Storage

```bash
gsutil mb -p podcast-generator-474105 -c STANDARD -l us-central1 gs://podcast-audio-474105/
```

**Settings**:
- Name: `podcast-audio-474105`
- Location: `us-central1`
- Storage class: `Standard`
- Access: Private (use signed URLs)

**Alternative: Using Console**

1. Go to: https://console.cloud.google.com/storage
2. Click **"Create Bucket"**
3. Name: `podcast-documents-474105`
4. Location type: **Region**
5. Location: **us-central1 (Iowa)**
6. Storage class: **Standard**
7. Access control: **Uniform**
8. Protection: Leave defaults
9. Click **"Create"**
10. Repeat for `podcast-audio-474105`

---

## 🔑 Step 3: Set Bucket Permissions

For each bucket, configure access:

### Option A: Using Console

1. Open bucket in Cloud Storage browser
2. Go to **"Permissions"** tab
3. Add your service account:
   - Principal: Your service account email from `google-credentials.json`
   - Role: **Storage Object Admin**
4. Click **"Save"**

### Option B: Using Command

```bash
# Documents bucket
gsutil iam ch serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL:roles/storage.objectAdmin gs://podcast-documents-474105

# Audio bucket
gsutil iam ch serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL:roles/storage.objectAdmin gs://podcast-audio-474105
```

Replace `YOUR_SERVICE_ACCOUNT_EMAIL` with the email from your `google-credentials.json` file.

---

## 🔐 Step 4: Configure CORS (Optional)

If you want to upload files directly from browser:

Create `cors-config.json`:
```json
[
  {
    "origin": ["http://localhost:3000", "https://yourdomain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

Apply CORS:
```bash
gsutil cors set cors-config.json gs://podcast-documents-474105
gsutil cors set cors-config.json gs://podcast-audio-474105
```

---

## 📝 Step 5: Update .env Configuration

Add these to your `.env` file:

```properties
# Google Cloud Storage Configuration
GCS_PROJECT_ID=podcast-generator-474105
GCS_DOCUMENTS_BUCKET=podcast-documents-474105
GCS_AUDIO_BUCKET=podcast-audio-474105
GCS_LOCATION=us-central1

# Storage URLs (for debugging)
GCS_DOCUMENTS_URL=https://storage.googleapis.com/podcast-documents-474105
GCS_AUDIO_URL=https://storage.googleapis.com/podcast-audio-474105

# Signed URL expiration (in seconds)
# 3600 = 1 hour, 86400 = 24 hours
GCS_SIGNED_URL_EXPIRATION=3600

# Enable/disable cloud storage
USE_CLOUD_STORAGE=true
```

---

## 🧪 Step 6: Test Storage Setup

Run the test script:

```powershell
node test-cloud-storage.js
```

This will:
- ✅ Verify bucket access
- ✅ Test file upload
- ✅ Generate signed URL
- ✅ Test file download
- ✅ Test file deletion
- ✅ Show storage quotas

---

## 🔄 Step 7: Migrate Local Files to Cloud

Run the migration script:

```powershell
node migrate-files-to-gcs.js
```

This will:
- ✅ Upload all files from `uploads/documents/` to GCS
- ✅ Upload all files from `uploads/audio/` to GCS
- ✅ Update database records with new GCS URLs
- ✅ Verify all files uploaded successfully
- ✅ Create backup of local files
- ✅ Generate migration report

**What it does**:
1. Scans local upload directories
2. Uploads each file to appropriate GCS bucket
3. Updates MongoDB records with new cloud URLs
4. Creates signed URLs for private access
5. Backs up local files (optional)
6. Shows before/after comparison

---

## 📊 Storage Classes & Pricing

### Standard Storage (Recommended)
- **Use for**: Frequently accessed files
- **Cost**: $0.020 per GB/month
- **Best for**: Active podcast audio, recent documents

### Nearline Storage
- **Use for**: Files accessed <1/month
- **Cost**: $0.010 per GB/month
- **Best for**: Archive of old podcasts

### Free Tier
- **5 GB** storage per month FREE
- **5,000** Class A operations/month FREE
- **50,000** Class B operations/month FREE

**Example Cost Calculation**:
- 1,000 podcasts × 1 MB = 1 GB = **$0.02/month**
- Very affordable for most use cases!

---

## 🔒 Security Best Practices

1. ✅ **Use Signed URLs**: Never make buckets public
2. ✅ **Set Expiration**: Signed URLs should expire (1-24 hours)
3. ✅ **Uniform Access**: Use IAM, not ACLs
4. ✅ **Service Account**: Use dedicated service account
5. ✅ **Lifecycle Rules**: Auto-delete temporary files
6. ✅ **Versioning**: Enable for important data
7. ✅ **Encryption**: Enabled by default (AES-256)

---

## 🎨 File Organization Structure

```
podcast-documents-474105/
├── {userId}/
│   ├── {documentId}.pdf
│   ├── {documentId}.docx
│   └── {documentId}.txt

podcast-audio-474105/
├── {userId}/
│   ├── {podcastId}.mp3
│   └── {podcastId}-preview.mp3
└── temp/
    └── processing-{timestamp}.mp3
```

---

## 🚀 Performance Optimization

### 1. CDN Integration
Enable Cloud CDN for faster delivery:
```bash
gcloud compute backend-buckets create podcast-cdn \
  --gcs-bucket-name=podcast-audio-474105 \
  --enable-cdn
```

### 2. Lifecycle Management
Auto-delete temporary files after 7 days:

Create `lifecycle-config.json`:
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 7,
          "matchesPrefix": ["temp/"]
        }
      }
    ]
  }
}
```

Apply:
```bash
gsutil lifecycle set lifecycle-config.json gs://podcast-audio-474105
```

### 3. Caching Headers
Set cache control for audio files:
```bash
gsutil -m setmeta -h "Cache-Control:public, max-age=86400" gs://podcast-audio-474105/**/*.mp3
```

---

## 📈 Monitoring & Quotas

### Check Storage Usage
```bash
gsutil du -sh gs://podcast-documents-474105
gsutil du -sh gs://podcast-audio-474105
```

### View Bucket Details
```bash
gsutil ls -L -b gs://podcast-documents-474105
```

### Monitor in Console
- Go to: https://console.cloud.google.com/storage
- View size, objects, requests, bandwidth
- Set up billing alerts

---

## 🆘 Troubleshooting

### Permission Denied Error
```
Solution: Verify service account has Storage Object Admin role
Command: gcloud projects get-iam-policy podcast-generator-474105
```

### Bucket Already Exists
```
Solution: Bucket names are globally unique. Try different name:
- podcast-documents-474105-v2
- podcast-docs-{random-string}
```

### Upload Timeout
```
Solution: Increase timeout in storage client configuration
Add: timeout: 60000 (60 seconds)
```

### File Not Found
```
Solution: Check file path format
Correct: userId/documentId.pdf
Wrong: /userId/documentId.pdf (no leading slash)
```

---

## 🔗 Useful Commands

```bash
# List all files in bucket
gsutil ls gs://podcast-documents-474105

# Get file details
gsutil ls -l gs://podcast-documents-474105/path/to/file.pdf

# Copy file from local to GCS
gsutil cp localfile.mp3 gs://podcast-audio-474105/

# Download file from GCS to local
gsutil cp gs://podcast-audio-474105/file.mp3 .

# Delete file
gsutil rm gs://podcast-audio-474105/old-file.mp3

# Make file public (not recommended)
gsutil acl ch -u AllUsers:R gs://bucket/file.mp3

# View bucket IAM policy
gsutil iam get gs://podcast-documents-474105
```

---

## 📚 Next Steps

After setting up Cloud Storage:

1. ✅ Run test script to verify setup
2. ✅ Migrate existing files to cloud
3. ✅ Update application code to use GCS
4. ✅ Test file uploads/downloads
5. ✅ Deploy to Google Cloud Platform
6. ✅ Monitor usage and costs

---

## 🎉 Benefits Summary

| Feature | Local Storage | Cloud Storage |
|---------|--------------|---------------|
| **Accessibility** | Same machine only | Anywhere in world |
| **Scalability** | Limited by disk | Unlimited |
| **Reliability** | Single point failure | 99.999999999% durability |
| **Backup** | Manual | Automatic |
| **CDN** | No | Yes |
| **Cost** | Free but limited | $0.02/GB/month |
| **Deployment** | Complex | Simple |

---

**🚀 Ready to set up? Follow Steps 1-6 above, then run the test and migration scripts!**
