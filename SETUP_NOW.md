# 🚀 Quick Setup: Enable Google AI NOW

Follow these steps to enable premium AI features in 15 minutes!

---

## Option 1: Interactive Setup (Easiest)

Run this command:

```bash
node setup-google-cloud.js
```

The script will guide you step by step! ✨

---

## Option 2: Manual Setup (Quick Reference)

### 1️⃣ Create Project (2 min)

Go to: https://console.cloud.google.com/
- Click "New Project"
- Name: `podcast-generator`
- Copy your **Project ID**

### 2️⃣ Enable APIs (3 min)

Click these links (replace PROJECT_ID with yours):

**Document AI:**
```
https://console.cloud.google.com/apis/library/documentai.googleapis.com?project=PROJECT_ID
```
Click "Enable"

**Vertex AI:**
```
https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=PROJECT_ID
```
Click "Enable"

### 3️⃣ Create Processor (2 min)

Go to: https://console.cloud.google.com/ai/document-ai/processors
- Click "Create Processor"
- Choose "Document OCR"
- Select region: **us** (or eu/asia)
- Copy **Processor ID**

### 4️⃣ Create Service Account (4 min)

Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
- Click "Create Service Account"
- Name: `podcast-app-service`
- Add roles:
  - **Document AI API User**
  - **Vertex AI User**
- Click through to complete

### 5️⃣ Download Key (2 min)

- Click on service account
- Go to "Keys" tab
- Click "Add Key" → "Create new key"
- Choose **JSON**
- Save as `google-credentials.json`
- **Move to:** `D:\Pod-app-zai\google-credentials.json`

### 6️⃣ Update .env (2 min)

Edit `D:\Pod-app-zai\.env` and add:

```env
# Google Cloud Document AI Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id-here
GOOGLE_CLOUD_LOCATION=us
GOOGLE_CLOUD_PROCESSOR_ID=your-processor-id-here
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Google Cloud Vertex AI Configuration
VERTEX_AI_PROJECT_ID=your-project-id-here
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-1.5-flash
```

**Replace:**
- `your-project-id-here` with your Project ID
- `your-processor-id-here` with your Processor ID

### 7️⃣ Restart Server

```bash
npm start
```

Look for:
```
✅ Google Document AI configured successfully
✅ Vertex AI configured successfully
```

---

## ✅ Done!

Now test:
1. Upload a document
2. Click "Summarize"
3. Enjoy AI-powered features! 🎉

---

## Need Help?

- **Full Guide:** See `GOOGLE_API_COMPLETE_SETUP.md`
- **Troubleshooting:** Check server console logs
- **Verify:** Both checkmarks (✅) should appear on server start

---

## Cost

- **Free tier:** 1,000 pages/month + $300 credits
- **Perfect for development and testing**
- **No charges until you exceed free tier**

Get started now! 🚀
