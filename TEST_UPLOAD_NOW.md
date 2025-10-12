# 🧪 Audio Upload Testing Guide

## Services Status

✅ **RVC Service**: Running on http://localhost:5000 (Mock mode)
✅ **Node.js Server**: Running on http://localhost:3000
✅ **MongoDB**: Connected

## 🔍 Debugging Added

I've added extensive console logging throughout the upload process. Every step will now show a log message!

### Console Logs You'll See:

1. **🎬 "Initializing voice cloning module..."** - When page loads
2. **"Upload button found: true/false"** - Checks if button exists
3. **"Upload form found: true/false"** - Checks if form exists
4. **"File input found: true/false"** - Checks if file input exists
5. **"Drop zone found: true/false"** - Checks if drop zone exists
6. **"✅ Upload form event listener attached"** - Confirms form is ready

When you interact:
7. **🎭 "Opening upload voice modal..."** - When you click "Upload New Voice"
8. **"Modal found: true/false"** - Confirms modal exists
9. **"✅ Modal opened and form reset"** - Modal is displayed
10. **🖱️ "Drop zone clicked..."** - When you click the drop zone
11. **📁 "File input changed, files: X"** - When you select a file
12. **📎 "File selected: filename.mp3"** - File name
13. **"File details: {name, type, size}"** - File information
14. **"✅ File validation passed..."** - File is valid
15. **"✅ File preview displayed"** - Preview shown

When you submit:
16. **🎤 "Starting voice upload..."** - Form submitted
17. **"Selected file: [file object]"** - Confirms file exists
18. **📝 "Voice details: {...}"** - Form data
19. **📤 "Sending upload request..."** - Uploading
20. **📥 "Response status: 200"** - Server response
21. **✅ "Upload response: {...}"** - Success data

---

## 📝 TEST STEPS

### Step 1: Open Browser Console

1. Open Chrome/Edge browser
2. Go to: http://localhost:3000
3. Press **F12** to open Developer Tools
4. Click **Console** tab
5. Clear the console (click 🚫 icon)

### Step 2: Login

1. Click "Sign in with Google"
2. Login with your Google account
3. You should land on the dashboard

### Step 3: Go to Voice Cloning

1. In the dashboard, click the **"Voice Cloning"** tab (microphone icon)
2. **Check Console**: You should see:
   ```
   🎬 Initializing voice cloning module...
   Upload button found: true
   Upload form found: true
   File input found: true
   Drop zone found: true
   ✅ Upload form event listener attached
   ```

### Step 4: Open Upload Modal

1. Click the **"Upload New Voice"** button
2. **Check Console**: You should see:
   ```
   🎭 Opening upload voice modal...
   Modal found: true
   ✅ Modal opened and form reset
   ```
3. The modal should appear with a form

### Step 5: Select Audio File

**Option A - Click to Browse:**
1. Click the drop zone (purple box with microphone icon)
2. **Check Console**: `🖱️ Drop zone clicked, triggering file input`
3. File picker opens
4. Select an audio file (MP3, WAV, OGG, or M4A)
5. **Check Console**:
   ```
   📁 File input changed, files: 1
   📎 File selected: your-file.mp3
   File details: {name: "...", type: "audio/mpeg", size: 12345}
   ✅ File validation passed, stored in selectedVoiceFile
   ✅ File preview displayed
   ```

**Option B - Drag & Drop:**
1. Drag an audio file from your computer
2. Drop it on the purple drop zone
3. **Check Console**: Same logs as above

### Step 6: Fill Form

1. **Voice Name**: Enter a name (e.g., "My Voice")
2. **Description**: Optional description
3. **Gender**: Select from dropdown
4. **Language**: Select language
5. **Accent**: Optional
6. **Tags**: Optional (comma-separated)

### Step 7: Submit Upload

1. Click **"Upload Voice"** button
2. **Check Console**: You should see:
   ```
   🎤 Starting voice upload...
   Selected file: File {name: "...", ...}
   📝 Voice details: {name: "My Voice", gender: "male", language: "en-US", fileSize: 12345}
   📤 Sending upload request...
   📥 Response status: 200
   ✅ Upload response: {success: true, voice: {...}}
   ```
3. Toast notification: "Voice sample uploaded successfully!"
4. Modal closes
5. Voice appears in the list with "Processing" status

---

## ❓ WHAT TO CHECK IN CONSOLE

### ✅ SUCCESS - You should see ALL these logs:

```
🎬 Initializing voice cloning module...
Upload button found: true
Upload form found: true
File input found: true
Drop zone found: true
✅ Upload form event listener attached

[Click "Upload New Voice"]
🎭 Opening upload voice modal...
Modal found: true
✅ Modal opened and form reset

[Click drop zone]
🖱️ Drop zone clicked, triggering file input

[Select file]
📁 File input changed, files: 1
📎 File selected: my-voice.mp3
File details: {name: "my-voice.mp3", type: "audio/mpeg", size: 2456789}
✅ File validation passed, stored in selectedVoiceFile
✅ File preview displayed

[Submit form]
🎤 Starting voice upload...
Selected file: File {name: "my-voice.mp3", ...}
📝 Voice details: {name: "My Voice", gender: "male", language: "en-US", fileSize: 2456789}
📤 Sending upload request...
📥 Response status: 200
✅ Upload response: {success: true, voice: {...}, message: "..."}
🔄 Reloading voices...
```

---

## 🚨 TROUBLESHOOTING

### Problem: "Upload button found: false"

**Cause**: Button doesn't exist in HTML
**Solution**: Verify you're on the Voice Cloning tab

### Problem: "Upload form found: false"

**Cause**: Modal HTML missing
**Solution**: Refresh the page, check dashboard.html

### Problem: No logs after clicking "Upload New Voice"

**Cause**: Event listener not attached or button not clicked
**Solution**: 
- Refresh page
- Make sure you see "✅ Upload form event listener attached"
- Try clicking button again

### Problem: "File input changed, files: 0"

**Cause**: No file selected
**Solution**: Make sure you select a file in the file picker

### Problem: "❌ Invalid file type: application/octet-stream"

**Cause**: File type not recognized
**Solution**: Convert file to MP3 or WAV format

### Problem: "❌ File too large: 52428800"

**Cause**: File exceeds 50MB
**Solution**: Compress or trim the audio file

### Problem: "❌ No file selected" when submitting

**Cause**: `selectedVoiceFile` is null
**Solution**: 
- Make sure you see "✅ File validation passed" log
- Try selecting file again
- Check if file preview is displayed

### Problem: "❌ No voice name"

**Cause**: Voice name field is empty
**Solution**: Fill in the "Voice Name" field

### Problem: "Response status: 401"

**Cause**: Not authenticated or token expired
**Solution**: Logout and login again

### Problem: "Response status: 500"

**Cause**: Server error
**Solution**: Check terminal logs for Node.js server errors

### Problem: No console logs at all

**Cause**: JavaScript not loading
**Solution**: 
- Hard refresh: Ctrl+Shift+R
- Clear browser cache
- Check if dashboard.js is loaded in Network tab

---

## 📸 COPY CONSOLE OUTPUT

If upload still doesn't work:

1. Complete all test steps above
2. **Copy ALL console output** (right-click → "Save as...")
3. Share the console logs with me
4. I'll identify the exact failure point

The logs will show EXACTLY where the process stops!

---

## 🎯 EXPECTED RESULT

✅ Upload succeeds
✅ Modal closes
✅ Toast: "Voice sample uploaded successfully!"
✅ Voice appears in list with status: "Processing"
✅ After ~2 seconds: Status changes to "Ready"

---

## 🔧 ADDITIONAL CHECKS

### Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Submit upload
4. Look for request: `upload` to `/api/custom-voices/upload`
5. Check:
   - **Status**: Should be 200
   - **Headers**: Check Authorization header
   - **Payload**: Check FormData contains file
   - **Response**: Check JSON response

### Check Application Tab

1. Go to **Application** tab
2. **Local Storage** → http://localhost:3000
3. Check if `token` exists
4. If missing: Login again

---

## ✅ READY TO TEST!

1. Services are running ✅
2. Debugging logs added ✅
3. Console open ✅
4. Let's find where it fails! 🔍

**Start from Step 1 and report back which console logs you see!**
