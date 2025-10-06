# Authentication Fix - Missing Dependencies

## Problem
The login/registration was failing with these errors:
```
ReferenceError: apiRequest is not defined
ReferenceError: showToast is not defined
```

## Root Cause
The `login.html` file was loading `auth.js` but not loading the `api.js` utility file that contains the required functions:
- `apiRequest()` - for making API calls
- `showToast()` - for displaying notifications

## Solution
Added the `api.js` script before `auth.js` in `login.html`:

```html
<script src="js/utils/api.js"></script>
<script src="js/auth.js"></script>
```

## What These Functions Do

### `apiRequest(endpoint, method, data, token)`
Located in: `js/utils/api.js`
- Makes authenticated API requests
- Handles JWT tokens automatically
- Provides error handling
- Returns JSON responses

### `showToast(message, type, duration)`
Located in: `js/utils/api.js`
- Displays toast notifications
- Types: 'success', 'error', 'warning', 'info'
- Auto-dismisses after duration

## Files Modified
- ✅ `login.html` - Added `js/utils/api.js` script tag

## Testing
1. Open http://localhost:3000/login
2. Try registering a new account
3. Try logging in
4. Both should work without errors now

## Related Files
- `js/auth.js` - Uses apiRequest and showToast
- `js/utils/api.js` - Defines these functions
- `js/dashboard.js` - Also uses these utilities
- `dashboard.html` - Already has api.js loaded correctly
