# Railway Deployment Guide - Step by Step

## ✅ Pre-Deployment Checklist

Your app is ready for Railway! Here's what's already configured:
- ✅ MongoDB Atlas (free M0 tier)
- ✅ Local file storage (no billing required)
- ✅ Browser TTS (free audio generation)
- ✅ All bugs fixed
- ✅ `.gitignore` created
- ✅ `railway.json` created
- ✅ Server uses `process.env.PORT`

---

## 📋 Step 1: Push Your Code to GitHub

### Option A: Using Git Command Line (Recommended)

1. **Open PowerShell** in your project folder:
   ```powershell
   cd d:\Pod-app-zai
   ```

2. **Initialize Git repository**:
   ```powershell
   git init
   ```

3. **Add all files**:
   ```powershell
   git add .
   ```

4. **Create initial commit**:
   ```powershell
   git commit -m "Initial commit - ready for Railway deployment"
   ```

5. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Repository name: `podcast-generator`
   - Make it **Private** (to protect your credentials)
   - Do NOT initialize with README
   - Click "Create repository"

6. **Add GitHub as remote**:
   ```powershell
   git remote add origin https://github.com/winteriscommiting/podcast-generator.git
   ```

7. **Push to GitHub** (will prompt for authentication):
   ```powershell
   git push -u origin main
   ```
   
   **If it asks for `master` instead of `main`**:
   ```powershell
   git branch -M main
   git push -u origin main
   ```

   **Authentication Options**:
   - **Personal Access Token** (Recommended): GitHub will prompt you to authenticate
     - Go to https://github.com/settings/tokens
     - Generate new token (classic)
     - Select `repo` scope
     - Use token as password when prompted
   - **GitHub Desktop**: Download from https://desktop.github.com/ for easier GUI authentication

### Option B: Using GitHub Desktop (Easier for Beginners)

1. Download and install **GitHub Desktop**: https://desktop.github.com/
2. Sign in with your GitHub account
3. Click **"Add"** → **"Add Existing Repository"**
4. Browse to `d:\Pod-app-zai`
5. Click **"Publish repository"**
6. Name it `podcast-generator`
7. Make it **Private**
8. Click **"Publish Repository"**

---

## 🚂 Step 2: Deploy to Railway

### 1. Create Railway Account

1. Go to https://railway.app/
2. Click **"Login"** or **"Start a New Project"**
3. **Sign up with GitHub** (easiest option)
4. Authorize Railway to access your repositories

### 2. Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **`winteriscommiting/podcast-generator`**
4. Railway will automatically:
   - Detect Node.js project
   - Install dependencies
   - Build the app
   - Start the server

### 3. Configure Environment Variables

Railway needs your environment variables. Click on your project, then:

1. Go to **"Variables"** tab
2. Add these variables one by one:

```env
MONGODB_URI=mongodb+srv://podcast-user:SecurePass123@podcast-app-cluster.lcsqxxf.mongodb.net/podcast-generator

JWT_SECRET=your-jwt-secret-key-here

SESSION_SECRET=your-session-secret-key-here

GOOGLE_CLIENT_ID=36957544811-vih1f3mc8tn02ebotv5kq6m2a2d63ju6.apps.googleusercontent.com

GOOGLE_CLIENT_SECRET=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

NODE_ENV=production

USE_CLOUD_STORAGE=false

USE_GOOGLE_TTS=false
```

**Important**: For JWT_SECRET and SESSION_SECRET, generate secure random strings:
```powershell
# Generate random secrets in PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### 4. Handle Google Credentials

Railway doesn't support uploading files directly, so we need to add `google-credentials.json` as an environment variable:

1. Open your `google-credentials.json` file
2. Copy the entire contents
3. In Railway Variables, add:
   ```
   GOOGLE_CREDENTIALS=<paste the entire JSON content here>
   ```

4. Update your code to read from environment variable (I'll create a fix for this)

### 5. Deploy

1. Railway will automatically deploy when you add variables
2. Wait for build to complete (usually 2-3 minutes)
3. Once deployed, Railway will give you a URL like:
   ```
   https://podcast-generator-production.up.railway.app
   ```

---

## 🔐 Step 3: Update Google OAuth

After Railway gives you the deployment URL:

1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Select project: **`podcast-generator-474105`**
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **"Authorized redirect URIs"**, add:
   ```
   https://your-railway-url.up.railway.app/api/auth/google/callback
   ```
6. Click **Save**

---

## 🗂️ Step 4: Handle File Uploads

Since Railway uses ephemeral storage (files get deleted on restart), you have two options:

### Option A: Continue with Local Storage (Free, but files may be lost)
- Keep `USE_CLOUD_STORAGE=false`
- Files in `uploads/` folder will persist unless Railway restarts
- Good for testing

### Option B: Migrate to Google Cloud Storage (Requires billing)
- Set `USE_CLOUD_STORAGE=true`
- Enable billing in Google Cloud (₹1000 prepayment in India)
- Run migration script: `node migrate-files-to-gcs.js`
- Files will persist permanently

**Recommended for now**: Start with Option A (local storage) for testing.

---

## ✅ Step 5: Test Your Deployed App

1. Open your Railway URL in browser
2. Test Google OAuth login
3. Upload a document
4. Generate a summary
5. Create a podcast with Browser TTS
6. Download the audio file

---

## 📊 Railway Free Tier Limits

- ✅ **$5 free credit per month**
- ✅ **500 hours of usage**
- ✅ **100 GB bandwidth**
- ✅ **Custom domain support**
- ✅ **Automatic HTTPS**
- ✅ **GitHub auto-deploy**

This is MORE than enough for your podcast app!

---

## 🐛 Troubleshooting

### Build Fails
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure `package.json` has correct start script

### MongoDB Connection Error
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access (should allow all IPs: `0.0.0.0/0`)
- Ensure database user password doesn't have special characters

### Google OAuth Not Working
- Verify redirect URI is added to Google Console
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Railway
- Ensure callback URL matches exactly (https://, no trailing slash)

### Audio Not Working
- Browser TTS should work automatically
- No billing or setup required
- Test with different browsers (Chrome recommended)

---

## 🎉 Success!

Once deployed, your app will be live at:
```
https://your-app-name.up.railway.app
```

You can now:
- ✅ Upload documents from anywhere
- ✅ Generate AI summaries
- ✅ Create podcasts with Browser TTS
- ✅ Share your app with others
- ✅ Access from any device

---

## 📝 Next Steps (Optional)

1. **Custom Domain**: Connect your own domain in Railway settings
2. **Google Cloud Storage**: Enable billing and migrate files for persistence
3. **Monitoring**: Check Railway dashboard for usage and logs
4. **Updates**: Push to GitHub → Railway auto-deploys

---

## 🆘 Need Help?

If you get stuck at any step:
1. Check Railway logs (click on your project → "Deployments" → "View Logs")
2. Verify environment variables are set correctly
3. Test OAuth redirect URIs match your Railway URL
4. Ensure MongoDB Atlas network access allows all IPs

---

**Ready to deploy?** Start with Step 1! 🚀
