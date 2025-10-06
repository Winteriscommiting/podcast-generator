# 🎯 COPY-PASTE GUIDE - Railway Environment Variables

## ✅ ALL ENVIRONMENT VARIABLES READY

Copy each variable name and value exactly as shown below and paste into Railway.

---

## 📋 STEP-BY-STEP INSTRUCTIONS

1. Go to **Railway Dashboard**: https://railway.app/
2. Click on your **podcast-generator** project
3. Click on your **service**
4. Click **"Variables"** tab
5. Click **"+ New Variable"** for each one below
6. Copy Variable Name → Paste in Railway
7. Copy Value → Paste in Railway
8. Click **"Add"**
9. Repeat for all variables

---

## 🔐 ENVIRONMENT VARIABLES (Copy These Exactly)

### Variable 1: MONGODB_URI
```
MONGODB_URI
```
**Value:**
```
mongodb+srv://podcast-user:SecurePass123@podcast-app-cluster.lcsqxxf.mongodb.net/podcast-generator
```

---

### Variable 2: NODE_ENV
```
NODE_ENV
```
**Value:**
```
production
```

---

### Variable 3: USE_CLOUD_STORAGE
```
USE_CLOUD_STORAGE
```
**Value:**
```
false
```

---

### Variable 4: USE_GOOGLE_TTS
```
USE_GOOGLE_TTS
```
**Value:**
```
false
```

---

### Variable 5: GOOGLE_CLIENT_ID
```
GOOGLE_CLIENT_ID
```
**Value:**
```
36957544811-vih1f3mc8tn02ebotv5kq6m2a2d63ju6.apps.googleusercontent.com
```

---

### Variable 6: GOOGLE_CLIENT_SECRET
```
GOOGLE_CLIENT_SECRET
```
**Value:**
```
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
```

---

### Variable 7: JWT_SECRET
```
JWT_SECRET
```
**Value:**
```
OU1Xm6HkI7ARlsr9MegTanfd8oJxWC3Z
```

---

### Variable 8: SESSION_SECRET
```
SESSION_SECRET
```
**Value:**
```
ctVEMHxwumvfaGN6qo98I2zZyjhpBKL4
```

---

## 🌐 GET YOUR RAILWAY URL

After adding all variables:

1. Go to **"Settings"** tab
2. Scroll to **"Networking"** section
3. You should see a domain like:
   ```
   podcast-generator-production-XXXX.up.railway.app
   ```
4. If not, click **"Generate Domain"**
5. **COPY THIS URL** - you'll need it next!

---

## 🔐 UPDATE GOOGLE OAUTH (CRITICAL!)

**Without this, login will NOT work!**

### Step 1: Get Your Railway URL
Copy it from Railway Settings → Networking (from above)

Example:
```
https://podcast-generator-production-a1b2.up.railway.app
```

### Step 2: Create Full Redirect URI
Take your Railway URL and add `/api/auth/google/callback` at the end:

Example:
```
https://podcast-generator-production-a1b2.up.railway.app/api/auth/google/callback
```

### Step 3: Add to Google Console

1. Open: https://console.cloud.google.com/
2. Select project: **podcast-generator-474105**
3. Click menu (☰) → **APIs & Services** → **Credentials**
4. Find OAuth 2.0 Client ID: **36957544811-vih1f3mc...**
5. Click **edit** (pencil icon)
6. Scroll to **"Authorized redirect URIs"**
7. Click **"+ ADD URI"**
8. Paste your full redirect URI (from Step 2)
9. Click **"SAVE"**
10. Wait 2-3 minutes for changes to take effect

---

## ✅ VERIFICATION CHECKLIST

Before testing, verify:

- [ ] All 8 environment variables added in Railway
- [ ] Railway shows "Deployed" with green checkmark
- [ ] Railway domain generated
- [ ] Copied Railway URL
- [ ] Created full redirect URI (URL + /api/auth/google/callback)
- [ ] Added redirect URI to Google Console
- [ ] Clicked "SAVE" in Google Console
- [ ] Waited 2-3 minutes

---

## 🧪 TEST YOUR APP

### Test Sequence:

1. **Open Railway URL** in browser (Chrome recommended)
2. Should see **login page** (not error page)
3. Click **"Sign in with Google"**
4. Should redirect to **Google login**
5. Sign in with your Google account
6. Should redirect back to **dashboard**
7. Try **uploading a .txt file**
8. Click **"Generate Summary"**
9. After summary created, click **"Create Podcast"**
10. **Play the audio** - should use Browser TTS
11. Try **downloading** the podcast
12. Test on **mobile device**

---

## 🎉 SUCCESS INDICATORS

Your deployment is successful when:

✅ Railway build completed without errors
✅ Opening URL shows login page (not "Application Error")
✅ Google OAuth redirects correctly (no "redirect_uri_mismatch")
✅ Dashboard loads after login
✅ Can upload documents
✅ Summaries generate successfully
✅ Podcasts create with Browser TTS
✅ Audio plays with controls
✅ Downloads work
✅ Works on mobile

---

## 🐛 TROUBLESHOOTING

### "Application Error" Page

**Cause:** Missing environment variables or MongoDB connection issue

**Fix:**
1. Check Railway logs: Deployments → View Logs
2. Verify all 8 variables are in Railway
3. Check MONGODB_URI is correct (no typos)
4. Restart deployment: Settings → Restart

---

### "redirect_uri_mismatch" Error

**Error shows:**
```
Error 400: redirect_uri_mismatch
The redirect URI in the request: https://your-url.up.railway.app/api/auth/google/callback
does not match...
```

**Fix:**
1. Copy the EXACT URI from the error message
2. Go to Google Console → Credentials
3. Edit OAuth Client
4. Add that EXACT URI to Authorized redirect URIs
5. Save and wait 5 minutes
6. Clear browser cache
7. Try again

---

### Build Failed on Railway

**Fix:**
1. Check Railway build logs for specific error
2. Verify `package-lock.json` exists in GitHub
3. Verify no `Dockerfile` in root (should be `Dockerfile.gcloud`)
4. Try: Settings → Redeploy

---

### Audio Not Playing

**Fix:**
1. Use **Chrome browser** (best Browser TTS support)
2. Grant **microphone permission** when asked
3. Ensure **HTTPS** (Railway provides this automatically)
4. Clear browser cache
5. Check browser console (F12) for errors

---

### MongoDB Connection Failed

**Error in Railway logs:**
```
MongoServerError: Authentication failed
```

**Fix:**
1. Go to MongoDB Atlas: https://cloud.mongodb.com/
2. Click **Database Access**
3. Verify user **podcast-user** exists with password **SecurePass123**
4. Click **Network Access**
5. Verify **0.0.0.0/0** is in IP Access List
6. If not, click **"+ ADD IP ADDRESS"** → **"ALLOW ACCESS FROM ANYWHERE"**
7. Restart Railway deployment

---

## 🚀 DEPLOYMENT TIMELINE

**Expected timing:**
- Railway build: 2-3 minutes ✅
- Add environment variables: 3-5 minutes ⏳
- Generate domain: Instant 🎯
- Update OAuth: 2 minutes + 2-3 minutes propagation ⏱️
- Testing: 5-10 minutes 🧪

**Total: 15-20 minutes** ⏱️

---

## 📊 MONITORING YOUR APP

### Railway Dashboard

**Check status:**
1. Go to Railway → Your Project
2. See deployment status (green = good)
3. Click **"View Logs"** to see real-time output

**Healthy logs:**
```
✅ Server running on port 3000
✅ MongoDB connection successful
✅ Google credentials loaded from environment variable
```

**Warning logs (OK to ignore):**
```
ℹ️  No Google credentials found - using fallback services
```

### MongoDB Atlas

**Check database:**
1. Go to: https://cloud.mongodb.com/
2. Click **"Browse Collections"**
3. Should see: users, summaries, podcasts collections
4. Data should be there from localhost

---

## 💰 COST TRACKING

**Current setup is 100% FREE:**

- Railway Free Tier: $5 credit/month (enough for 24/7)
- MongoDB Atlas M0: Free forever
- Browser TTS: Free (Web API)
- Google OAuth: Free

**Your app uses ~$2-3/month, well within free tier!**

**Monitor usage:**
- Railway Dashboard → Usage tab
- Shows credit used, hours remaining

---

## 🎊 YOU'RE READY!

**Current Status:**
✅ Code pushed to GitHub
✅ Railway is building/deployed
✅ Environment variables ready to add
✅ OAuth setup ready

**Next Action:**
1. **Go to Railway now:** https://railway.app/
2. **Add the 8 environment variables** (copy from above)
3. **Get your Railway URL**
4. **Update OAuth redirect URI** in Google Console
5. **Test your app!**

---

## 📞 NEED MORE HELP?

**Detailed guides available:**
- `RAILWAY_DEPLOYMENT_COMPLETE_GUIDE.md` - Full troubleshooting
- `DEPLOYMENT_STATUS_NOW.md` - Current status overview
- `RAILWAY_DEPLOYMENT_GUIDE.md` - Complete setup guide

**Check Railway logs for errors:**
Railway Dashboard → Deployments → View Logs

---

**🎉 You're almost done! Go add those environment variables!** 🚀
