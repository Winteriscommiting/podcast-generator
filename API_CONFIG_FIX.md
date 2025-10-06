# API Configuration Fix

## Problem
API requests were failing with CORS errors and trying to reach a non-existent production URL:
```
https://your-render-app-url.onrender.com/api/api/auth/register
```

This was causing:
- ❌ CORS policy errors
- ❌ Network errors (ERR_FAILED)
- ❌ Failed to fetch errors
- ❌ Registration/Login not working

## Root Cause
The `API_BASE_URL` in `js/utils/api.js` was hardcoded to a placeholder production URL:
```javascript
const API_BASE_URL = 'https://your-render-app-url.onrender.com/api';
```

This caused all API requests to go to the wrong server.

## Solution
Updated `API_BASE_URL` to automatically use the correct URL based on where the app is running:

```javascript
const API_BASE_URL = window.location.origin;
```

### How It Works Now:
- **Development**: `http://localhost:3000` → API calls go to `http://localhost:3000/api/...`
- **Production**: `https://yourdomain.com` → API calls go to `https://yourdomain.com/api/...`

## Files Modified
- ✅ `js/utils/api.js` - Fixed API_BASE_URL
- ✅ `js/config.js` - Created environment configuration helper (optional)

## Testing

### 1. Clear Browser Cache
Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac) and clear cached files

### 2. Refresh the Page
Press `Ctrl+F5` (hard refresh) or `Cmd+Shift+R`

### 3. Test Registration
1. Go to http://localhost:3000/login
2. Click "Register" tab
3. Fill in the form
4. Click "Create Account"
5. Should work without CORS errors

### 4. Test Login
1. Click "Login" tab
2. Enter credentials
3. Click "Sign In"
4. Should work without errors

### 5. Verify in DevTools
Open browser console (F12) and check:
- ✅ No CORS errors
- ✅ API requests go to `http://localhost:3000/api/...`
- ✅ Requests return 200 or 201 status codes

## Expected API Endpoints

All API calls should now correctly go to:
- `POST http://localhost:3000/api/auth/register` - Registration
- `POST http://localhost:3000/api/auth/login` - Login
- `GET http://localhost:3000/api/auth/verify` - Verify token
- `GET http://localhost:3000/api/auth/google` - Google OAuth
- `GET http://localhost:3000/api/documents` - Get documents
- `GET http://localhost:3000/api/summaries` - Get summaries
- `GET http://localhost:3000/api/podcasts` - Get podcasts

## For Production Deployment

When you deploy to production, the app will automatically use the production domain. No code changes needed!

Example:
- If deployed to `https://mypodcastapp.com`
- API calls will go to `https://mypodcastapp.com/api/...`

## Additional Configuration (Optional)

If you need more control over environment configuration, use `js/config.js`:

```javascript
// Include in your HTML before other scripts:
<script src="js/config.js"></script>

// Then access in your code:
console.log(window.APP_CONFIG.API_BASE_URL);
console.log(window.APP_CONFIG.IS_DEVELOPMENT);
```
