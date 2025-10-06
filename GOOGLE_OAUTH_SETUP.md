# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Podcast Generator application.

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing one)
   - Click "Select a project" → "New Project"
   - Enter project name: "Podcast Generator"
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" for User Type
     - Fill in the required fields:
       - App name: Podcast Generator
       - User support email: your email
       - Developer contact: your email
     - Click "Save and Continue"
     - Skip Scopes (click "Save and Continue")
     - Add test users if needed
     - Click "Save and Continue"

5. **Configure OAuth Client**
   - Application type: "Web application"
   - Name: "Podcast Generator Web Client"
   - Authorized JavaScript origins:
     - http://localhost:3000
   - Authorized redirect URIs:
     - http://localhost:3000/api/auth/google/callback
   - Click "Create"

6. **Copy Your Credentials**
   - You'll see a popup with:
     - Client ID (looks like: xxxxx.apps.googleusercontent.com)
     - Client Secret
   - Copy both values

## Step 2: Update Environment Variables

1. Open your `.env` file in the project root
2. Replace the placeholder values with your actual credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

## Step 3: Test the Integration

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Open the application**:
   - Navigate to: http://localhost:3000/login

3. **Click "Continue with Google"**:
   - You should be redirected to Google's login page
   - Sign in with your Google account
   - Grant permissions to the application
   - You'll be redirected back to the dashboard

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Console exactly matches:
  `http://localhost:3000/api/auth/google/callback`
- No trailing slashes
- Exact protocol (http vs https)

### Error: "Access blocked: This app's request is invalid"
- Make sure you've enabled the Google+ API
- Check that your OAuth consent screen is properly configured

### Error: "unauthorized_client"
- Verify your Client ID and Client Secret are correct in `.env`
- Make sure there are no extra spaces or quotes

### Can't see login button
- Clear browser cache
- Make sure server restarted after changes
- Check browser console for JavaScript errors

## Security Notes for Production

When deploying to production:

1. **Update authorized domains** in Google Console:
   - Add your production domain (e.g., https://yourdomain.com)
   - Update redirect URI to use HTTPS

2. **Update `.env` file**:
   ```env
   NODE_ENV=production
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   ```

3. **Enable secure cookies**:
   - The app automatically uses secure cookies in production
   - Make sure you're using HTTPS

4. **Verify OAuth consent screen**:
   - Consider changing from "External" to "Internal" if appropriate
   - Add privacy policy and terms of service URLs

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
