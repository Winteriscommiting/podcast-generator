# ✅ Railway Deployment Fixed - Complete Guide

## 🎉 Problem Solved!

### What Was Wrong:
1. ❌ Railway was trying to use `Dockerfile` (designed for Google Cloud Run)
2. ❌ The Dockerfile runs `npm ci` before copying `package-lock.json`
3. ❌ This caused the build to fail

### What We Fixed:
1. ✅ Renamed `Dockerfile` to `Dockerfile.gcloud`
2. ✅ Railway will now use **Nixpacks** (automatic Node.js detection)
3. ✅ Nixpacks properly handles `package-lock.json`
4. ✅ Code pushed to GitHub - Railway is rebuilding now!

---

## 🚂 Railway Deployment Steps

### Step 1: Wait for Railway Build ⏳

Railway is now rebuilding your app automatically. Go to your Railway dashboard and watch the build logs.

**You should see:**
```
✓ Building with Nixpacks
✓ Installing Node.js dependencies
✓ Running npm install
✓ Building complete
✓ Starting server...
✓ Server running on port XXXX
```

**Build time:** ~2-3 minutes

---

### Step 2: Add Environment Variables 🔐

Once the build completes (or even during the build), you need to add environment variables:

1. **Go to Railway dashboard** → Click your project
2. Click **"Variables"** tab
3. Click **"+ New Variable"**
4. Add these one by one:

#### Required Variables:

```env
MONGODB_URI
mongodb+srv://podcast-user:SecurePass123@podcast-app-cluster.lcsqxxf.mongodb.net/podcast-generator
```

```env
NODE_ENV
production
```

```env
USE_CLOUD_STORAGE
false
```

```env
USE_GOOGLE_TTS
false
```

```env
GOOGLE_CLIENT_ID
36957544811-vih1f3mc8tn02ebotv5kq6m2a2d63ju6.apps.googleusercontent.com
```

```env
GOOGLE_CLIENT_SECRET
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
```

#### Generate Secure Secrets:

Open PowerShell and run:
```powershell
# Generate JWT_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Run again for SESSION_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

Then add:
```env
JWT_SECRET
<paste-generated-string-here>
```

```env
SESSION_SECRET
<paste-generated-string-here>
```

#### Google Credentials (Optional - for Google APIs):

Open `google-credentials.json` in Notepad, copy ALL content, then add:
```env
GOOGLE_CREDENTIALS
<paste-entire-json-content-here>
```

**Note:** This is optional. Your app works without it using Browser TTS.

---

### Step 3: Get Your Railway URL 🌐

After Railway deploys successfully:

1. Go to your Railway project dashboard
2. Click on your service
3. Go to **"Settings"** tab
4. Click **"Generate Domain"** (if not already generated)
5. You'll get a URL like:
   ```
   https://podcast-generator-production-XXXX.up.railway.app
   ```

**Copy this URL** - you'll need it for OAuth setup!

---

### Step 4: Update Google OAuth Redirect URI 🔐

This is **CRITICAL** for login to work!

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. Select project: **`podcast-generator-474105`**
3. Click hamburger menu (☰) → **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID (should show `36957544811-vih1f3mc...`)
5. Click the **edit icon** (pencil) next to it
6. Scroll to **"Authorized redirect URIs"**
7. Click **"+ ADD URI"**
8. Add your Railway URL with callback path:
   ```
   https://your-railway-url.up.railway.app/api/auth/google/callback
   ```
   **Example:**
   ```
   https://podcast-generator-production-a1b2.up.railway.app/api/auth/google/callback
   ```
9. Click **"SAVE"**

⚠️ **Important:** Make sure:
- Use `https://` (not http)
- No trailing slash at the end
- Include `/api/auth/google/callback` exactly

---

### Step 5: Test Your Deployed App! 🎉

1. **Open your Railway URL** in browser
2. You should see the login page
3. Click **"Sign in with Google"**
4. It should redirect you to Google OAuth
5. After signing in, you'll be redirected to the dashboard

**Test these features:**
- ✅ Upload a document (.txt file recommended)
- ✅ Generate a summary
- ✅ Create a podcast with Browser TTS
- ✅ Play the audio
- ✅ Download the podcast
- ✅ Test on mobile device

---

## 🐛 Troubleshooting Guide

### Issue: Build Still Fails

**Check:**
1. Railway is using Nixpacks (not Dockerfile)
2. Go to Railway logs and look for errors
3. Verify `package-lock.json` exists in GitHub repo

**Fix:**
- Go to Railway Settings → Restart deployment
- Check build logs for specific errors

---

### Issue: "Application Error" on Opening URL

**Cause:** Missing environment variables or MongoDB connection issue

**Fix:**
1. Go to Railway → Variables tab
2. Verify `MONGODB_URI` is set correctly
3. Check Railway logs for error messages
4. Ensure MongoDB Atlas network access allows all IPs (`0.0.0.0/0`)

**Test MongoDB Connection:**
Go to MongoDB Atlas:
1. Database Access → Verify user `podcast-user` exists
2. Network Access → Verify `0.0.0.0/0` is allowed
3. Database → Click "Connect" → Verify connection string

---

### Issue: "Redirect URI Mismatch" on Google Login

**Error Message:** "Error 400: redirect_uri_mismatch"

**Fix:**
1. Check the exact error message - it shows the redirect URI used
2. Copy that EXACT URI
3. Go to Google Cloud Console → Credentials
4. Add that EXACT URI to Authorized redirect URIs
5. Save and wait 5 minutes for changes to propagate
6. Try again

---

### Issue: Audio Not Working

**Possible Causes:**
1. Browser doesn't support Web Speech API
2. HTTPS required for Browser TTS
3. Microphone permission needed

**Fix:**
1. Use **Google Chrome** (best support for Web Speech API)
2. Railway provides HTTPS automatically ✅
3. Grant microphone permission when browser asks
4. Clear browser cache and reload
5. Check browser console for errors (F12)

---

### Issue: Downloads Not Working

**Fix:**
1. Make sure you're logged in
2. Check browser's download settings
3. Try a different browser
4. Check Railway logs for authentication errors

---

### Issue: Can't Upload Documents

**Possible Causes:**
1. File too large (Railway has limits)
2. Authentication issue
3. Server out of memory

**Fix:**
1. Try smaller files first (under 5MB)
2. Check Railway logs for errors
3. Verify you're logged in
4. Check file format (.txt, .pdf, .docx)

---

## 📊 Railway Monitoring

### Check App Health:

1. **Railway Dashboard** → Your Project
2. Click **"Deployments"** → View latest deployment
3. Click **"View Logs"** → See real-time server logs

**Healthy logs should show:**
```
✅ Google credentials loaded from environment variable
✅ MongoDB connection successful
✅ Server running on port XXXX
```

**Warning logs (OK to ignore):**
```
ℹ️  No Google credentials found - using fallback services
   - Browser TTS for audio generation
   - Local storage for files
```

---

## 💰 Railway Free Tier Limits

Your app is within free tier limits:

- ✅ **$5 credit/month** - Your app uses ~$2-3/month
- ✅ **500 hours** - More than enough for 24/7 uptime
- ✅ **100GB bandwidth** - Plenty for testing
- ✅ **Persistent disk** - 1GB included (enough for audio files)

**Monitor usage:** Railway Dashboard → Usage tab

---

## 🎯 Post-Deployment Checklist

After successful deployment, verify:

- [ ] Railway build completed successfully
- [ ] All environment variables added
- [ ] Railway URL generated
- [ ] OAuth redirect URI added to Google Console
- [ ] Can open Railway URL in browser
- [ ] Can sign in with Google
- [ ] Can upload a document
- [ ] Can generate summary
- [ ] Can create podcast
- [ ] Audio plays correctly
- [ ] Can download podcast
- [ ] Works on mobile device

---

## 🚀 Next Steps (Optional)

### 1. Custom Domain (Optional)

**Add your own domain:**
1. Railway Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `podcast.yourdomain.com`)
4. Update DNS records as shown
5. Update OAuth redirect URI to use custom domain

### 2. Enable Google Cloud Storage (Optional)

**For persistent file storage:**
1. Enable billing in Google Cloud (~₹1000 prepayment)
2. Set `USE_CLOUD_STORAGE=true` in Railway
3. Files will survive Railway restarts
4. Cost: ~₹0.50-₹2 per month

### 3. Enable Google Cloud TTS (Optional)

**For more voice options:**
1. Enable billing in Google Cloud
2. Enable Text-to-Speech API
3. Set `USE_GOOGLE_TTS=true` in Railway
4. Get 1 million characters free/month
5. Cost after: ~$4 per million characters

---

## 🎉 Success Indicators

**Your deployment is successful when:**

1. ✅ Railway shows "Deployed" status with green checkmark
2. ✅ Opening Railway URL shows login page
3. ✅ Google OAuth login works
4. ✅ Can access dashboard after login
5. ✅ Can upload and process documents
6. ✅ Browser TTS generates audio
7. ✅ Audio player works with controls
8. ✅ Downloads work correctly

---

## 📞 Need More Help?

### Check These Resources:

1. **Railway Logs**: Railway Dashboard → Deployments → View Logs
2. **MongoDB Logs**: MongoDB Atlas → Database → Metrics
3. **Google Cloud Logs**: Google Console → Operations → Logging
4. **Browser Console**: Press F12 in browser

### Common Log Messages:

**✅ Good:**
```
Server running on port 3000
MongoDB connection successful
✅ Google credentials loaded
```

**⚠️ Warning (OK):**
```
ℹ️  No Google credentials found - using fallback services
```

**❌ Error (Need to Fix):**
```
MongoError: Authentication failed
Error: Cannot find module...
Port 3000 is already in use
```

---

## 🎊 You're Almost There!

**Current Status:**
- ✅ Code pushed to GitHub
- ✅ Railway is rebuilding with Nixpacks
- ⏳ Waiting for build to complete
- ⏸️ Need to add environment variables
- ⏸️ Need to update OAuth redirect URI

**Next Immediate Action:**
1. **Watch Railway build logs** - should complete in ~2-3 minutes
2. **Add environment variables** as listed in Step 2
3. **Get Railway URL** from Settings
4. **Update OAuth redirect URI** in Google Console
5. **Test the app!** 🎉

---

Let me know when Railway build completes, and I'll help you with the next steps! 🚀
