# Quick Start - Railway Deployment

## 🚀 Ready to Deploy!

Your app is configured and ready. Follow these **5 simple steps**:

---

## Step 1: Push to GitHub (5 minutes)

Open **PowerShell** in this folder:

```powershell
cd d:\Pod-app-zai
```

Run these commands:

```powershell
# Initialize git
git init

# Add all files
git add .

# Create commit
git commit -m "Initial commit - ready for Railway"

# Go to GitHub and create new private repository
# Name: podcast-generator
# Then run:
git remote add origin https://github.com/winteriscommiting/podcast-generator.git

# Push code (will ask for authentication)
git push -u origin main
```

**Note**: If it says `master` instead of `main`:
```powershell
git branch -M main
git push -u origin main
```

---

## Step 2: Create Railway Account (2 minutes)

1. Go to **https://railway.app/**
2. Click **"Start a New Project"**
3. Sign in with **GitHub**
4. Authorize Railway

---

## Step 3: Deploy from GitHub (3 minutes)

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **`podcast-generator`**
4. Railway will automatically build and deploy!

---

## Step 4: Add Environment Variables (5 minutes)

Click on your project → **"Variables"** tab → Add these:

```env
MONGODB_URI=mongodb+srv://podcast-user:SecurePass123@podcast-app-cluster.lcsqxxf.mongodb.net/podcast-generator

NODE_ENV=production

USE_CLOUD_STORAGE=false

USE_GOOGLE_TTS=false

JWT_SECRET=<generate-random-32-characters>

SESSION_SECRET=<generate-random-32-characters>

GOOGLE_CLIENT_ID=36957544811-vih1f3mc8tn02ebotv5kq6m2a2d63ju6.apps.googleusercontent.com

GOOGLE_CLIENT_SECRET=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
```

**For Google Credentials** (paste entire file content):
```env
GOOGLE_CREDENTIALS=<paste entire google-credentials.json content here>
```

---

## Step 5: Update OAuth Redirect (2 minutes)

After Railway deploys (you'll get a URL like `https://podcast-generator-production.up.railway.app`):

1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Select project: **podcast-generator-474105**
3. Go to **APIs & Services** → **Credentials**
4. Click your OAuth Client ID
5. Add new redirect URI:
   ```
   https://your-railway-url.up.railway.app/api/auth/google/callback
   ```
6. Click **Save**

---

## ✅ Done!

Your app is now live! Test it:

1. Open your Railway URL
2. Sign in with Google
3. Upload a document
4. Generate summary
5. Create podcast with Browser TTS

---

## 🆘 Need Help?

Check the full guide: **RAILWAY_DEPLOYMENT_GUIDE.md**

Common issues:
- **Build fails**: Check Railway logs
- **MongoDB error**: Verify connection string
- **OAuth not working**: Check redirect URI matches exactly
- **Audio not working**: Clear browser cache, try Chrome

---

## 📝 What You Get

- ✅ Live app URL
- ✅ Automatic HTTPS
- ✅ Auto-deploy on GitHub push
- ✅ Free $5/month credit
- ✅ 500 hours runtime
- ✅ 100GB bandwidth

---

**Total Time: ~15-20 minutes** ⏱️

Ready? Start with Step 1! 🚀
