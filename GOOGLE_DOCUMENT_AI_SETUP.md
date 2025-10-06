# Google Document AI Setup Guide

This application now supports **Google Cloud Document AI** for superior text extraction from documents (PDF, DOCX). This is optional - the app will work with the built-in extraction methods if Google Document AI is not configured.

## Why Use Google Document AI?

✅ **Better OCR** - Extracts text from scanned PDFs and images  
✅ **Layout Understanding** - Preserves document structure  
✅ **Multi-language Support** - Handles documents in various languages  
✅ **Complex Documents** - Better handling of tables, forms, and complex layouts  
✅ **Higher Accuracy** - Improved text recognition compared to local libraries  

## Current Status

The app is configured with **automatic fallback**:
- **Tries Google Document AI first** (if configured)
- **Falls back to local extraction** (pdf-parse, mammoth) if:
  - Google Document AI is not configured
  - API call fails
  - Credentials are invalid

## Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your **Project ID**

### Step 2: Enable Document AI API

1. In your Google Cloud Console, go to **APIs & Services > Library**
2. Search for "Document AI API"
3. Click **Enable**

### Step 3: Create a Document Processor

1. Go to [Document AI Processors](https://console.cloud.google.com/ai/document-ai/processors)
2. Click **Create Processor**
3. Choose **"Document OCR"** or **"Form Parser"** (recommended for general use)
4. Select a region (e.g., `us`, `eu`)
5. Note your **Processor ID** (from the processor details page)

### Step 4: Create Service Account Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > Service Account**
3. Fill in the service account details
4. Grant it the role: **"Document AI API User"**
5. Click **Done**
6. Click on the service account you just created
7. Go to **Keys** tab
8. Click **Add Key > Create New Key**
9. Choose **JSON** format
10. Save the file as `google-credentials.json` in your project root

### Step 5: Update .env File

Add these lines to your `.env` file:

```env
# Google Cloud Document AI Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id-here
GOOGLE_CLOUD_LOCATION=us
GOOGLE_CLOUD_PROCESSOR_ID=your-processor-id-here
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
```

**Replace:**
- `your-project-id-here` with your Google Cloud Project ID
- `your-processor-id-here` with your Document AI Processor ID
- Update the location if you created processor in different region (`eu`, `asia`, etc.)

### Step 6: Restart the Server

```bash
npm start
```

You should see:
```
✅ Google Document AI configured successfully
```

## Testing

1. Upload a PDF or DOCX file
2. Check the console logs - you should see:
   ```
   Attempting extraction with Google Document AI...
   ✅ Successfully extracted text using Google Document AI
   ```

## Troubleshooting

### "Google Document AI not configured"
- This is normal if you haven't set up the credentials yet
- The app will use local extraction methods

### "Google Document AI initialization failed"
- Check that `GOOGLE_CLOUD_PROJECT_ID` and `GOOGLE_CLOUD_PROCESSOR_ID` are set
- Verify the service account JSON file path is correct
- Ensure the JSON file has proper permissions

### "Permission denied" errors
- Make sure the service account has "Document AI API User" role
- Check that the Document AI API is enabled in your project

### "Processor not found"
- Verify the Processor ID is correct
- Ensure the processor is in the same location as specified in GOOGLE_CLOUD_LOCATION

## Cost Considerations

Google Document AI pricing (as of 2025):
- **Free tier**: 1,000 pages/month
- **After free tier**: ~$1.50 per 1,000 pages

For development and testing, the free tier should be sufficient.

## Fallback Behavior

If Google Document AI fails or is not configured, the app automatically uses:
- **PDF**: `pdf-parse` library
- **DOCX**: `mammoth` library  
- **TXT**: Direct UTF-8 decoding

No manual intervention required!

## Security Notes

⚠️ **IMPORTANT:**
- Add `google-credentials.json` to `.gitignore`
- Never commit your service account credentials to version control
- Keep your processor IDs and project IDs private

## Current .gitignore

The project already includes:
```gitignore
google-credentials.json
*.json (service account keys)
.env
```

## Need Help?

Check the [Google Document AI Documentation](https://cloud.google.com/document-ai/docs/overview)
