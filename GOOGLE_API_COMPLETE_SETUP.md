# Complete Google API Setup Guide
## Document AI + Vertex AI Integration

This guide will help you set up **Google Cloud Document AI** for advanced document reading and **Google Cloud Vertex AI** for AI-powered summarization using Gemini models.

---

## 🎯 What You'll Get

### **Document AI (Text Extraction)**
✅ Superior OCR for scanned PDFs  
✅ Better handling of complex layouts  
✅ Multi-language support  
✅ Extract text from images in documents  

### **Vertex AI (Summarization)**
✅ AI-powered summaries using Google Gemini  
✅ Natural, coherent summaries  
✅ Better understanding of context  
✅ Multiple summary styles (brief, standard, detailed)  

---

## 📋 Prerequisites

- Google Cloud account (free tier available)
- Credit card for verification (free tier includes $300 credits)
- 15-20 minutes for setup

---

## 🚀 Step-by-Step Setup

### **Step 1: Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `podcast-generator` (or your choice)
4. Click **"Create"**
5. Wait for project creation (takes ~30 seconds)
6. **Note your Project ID** (e.g., `podcast-generator-123456`)

---

### **Step 2: Enable Required APIs**

#### Enable Document AI API

1. Go to [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search for **"Document AI API"**
3. Click on it → Click **"Enable"**
4. Wait for activation (~1 minute)

#### Enable Vertex AI API

1. In the same Library, search for **"Vertex AI API"**
2. Click on it → Click **"Enable"**
3. Wait for activation

---

### **Step 3: Create Document AI Processor**

1. Go to [Document AI Processors](https://console.cloud.google.com/ai/document-ai/processors)
2. Click **"Create Processor"**
3. Select **"Document OCR"** (recommended) or **"Form Parser"**
4. Choose **Processor name**: `document-ocr-processor`
5. Select **Region**: `us` (or `eu`, `asia` - your preference)
6. Click **"Create"**
7. **Copy the Processor ID** from the processor details page
   - It looks like: `1234567890abcdef`
8. **Note the Location** (e.g., `us`, `eu`)

---

### **Step 4: Create Service Account**

1. Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click **"Create Service Account"**
3. **Service account details:**
   - Name: `podcast-app-service`
   - Description: `Service account for podcast generator app`
4. Click **"Create and Continue"**
5. **Grant roles** - Add these two roles:
   - **Document AI API User**
   - **Vertex AI User**
6. Click **"Continue"** → **"Done"**

---

### **Step 5: Create Service Account Key**

1. Click on the service account you just created
2. Go to the **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Choose **JSON** format
5. Click **"Create"**
6. A JSON file will download automatically
7. **Rename it to:** `google-credentials.json`
8. **Move it to your project root:** `D:\Pod-app-zai\google-credentials.json`

---

### **Step 6: Update .env File**

Open your `.env` file and add/update these lines:

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
- `your-project-id-here` → Your actual Project ID from Step 1
- `your-processor-id-here` → Your Processor ID from Step 3
- Update `GOOGLE_CLOUD_LOCATION` if you chose a different region

---

### **Step 7: Restart the Server**

```bash
npm start
```

You should see:
```
Initializing Google Cloud services...
✅ Google Document AI configured successfully
✅ Vertex AI configured successfully
```

---

## 🧪 Testing

1. Upload a document - should use Document AI
2. Click Summarize - should use Vertex AI (Gemini)

---

## 💰 Pricing

- **Document AI:** 1,000 pages/month FREE
- **Vertex AI:** Free quota + $300 credits for new users
- Perfect for development and testing!

For full guide, see `GOOGLE_DOCUMENT_AI_SETUP.md`
