# OAuth Authentication Setup

This guide will help you configure Google and Apple OAuth authentication for your web application.

## Overview

The OAuth implementation supports:
- ✅ Google Sign-In with Google Identity Services
- ✅ Apple Sign In with Apple ID
- ✅ Account linking for existing users
- ✅ 2FA integration for OAuth users
- ✅ Provider management in user settings
- ✅ Comprehensive error handling

## Prerequisites

Before setting up OAuth, ensure your backend is configured with the necessary endpoints:
- `POST /auth/google` - Verify Google ID tokens
- `POST /auth/apple` - Verify Apple ID tokens  
- `POST /auth/oauth/link` - Link OAuth accounts
- `GET /auth/oauth/providers` - List connected providers
- `DELETE /user/oauth-accounts/{provider}` - Remove OAuth connections

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen
6. Select **Web application** as the application type
7. Add your domain to **Authorized JavaScript origins**:
   - For development: `http://localhost:5173`
   - For production: `https://yourdomain.com`

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com

# Optional: Restrict to specific domain
VITE_GOOGLE_HOSTED_DOMAIN=yourdomain.com
```

### 3. Update Domain Verification

Add these meta tags to your `index.html` `<head>` section:

```html
<!-- Google Site Verification -->
<meta name="google-site-verification" content="your-verification-code" />
```

## Apple Sign In Setup

### 1. Configure Apple Developer Account

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create a new **Services ID**:
   - Description: Your app name
   - Identifier: `com.yourcompany.yourapp.signin`
4. Configure **Sign In with Apple**:
   - Enable the service
   - Add your domain and return URLs
   - For development: `http://localhost:5173`
   - For production: `https://yourdomain.com`

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Apple OAuth
VITE_APPLE_CLIENT_ID=com.yourcompany.yourapp.signin
VITE_APPLE_REDIRECT_URI=https://yourdomain.com

# Optional: Apple Team ID
VITE_APPLE_TEAM_ID=YOUR_TEAM_ID
```

### 3. Domain Verification

Apple requires domain verification. Add this to your domain's `/.well-known/apple-developer-domain-association.txt`:

```
eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...
```

(Get the actual token from Apple Developer Portal)

## Testing Configuration

### 1. Check Configuration Status

The OAuth buttons will automatically detect if they're properly configured:
- ✅ Green button = Ready to use
- ❌ Disabled button = Configuration missing
- ⚠️ Error message = Configuration issue

### 2. Test OAuth Flow

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click the Google or Apple sign-in buttons
4. Complete the OAuth flow
5. Verify the user is authenticated

### 3. Test Account Linking

1. Create a user with email/password
2. Try to sign in with OAuth using the same email
3. You should see the account linking modal
4. Enter your password to link the accounts

## Environment Variables Reference

```bash
# Google OAuth (optional - leave empty to disable)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com

# Apple OAuth (optional - leave empty to disable)
VITE_APPLE_CLIENT_ID=com.yourcompany.yourapp.signin
VITE_APPLE_REDIRECT_URI=https://yourdomain.com

# Optional - Google domain restriction
VITE_GOOGLE_HOSTED_DOMAIN=yourdomain.com

# Optional - Apple Team ID
VITE_APPLE_TEAM_ID=YOUR_TEAM_ID
```

### Conditional UI Behavior

The OAuth buttons automatically show/hide based on configuration:

- **Both configured**: Shows Google + Apple buttons with "or continue with email"
- **Only Google**: Shows only Google button with "or continue with email" 
- **Only Apple**: Shows only Apple button with "or continue with email"
- **Neither configured**: Hides OAuth section entirely, shows only email/password form

This allows you to deploy without OAuth and add providers later by just setting environment variables.

## Features Included

### OAuth Button Components
- `GoogleSignInButton` - Renders Google Sign-In button
- `AppleSignInButton` - Renders Apple Sign In button
- Auto-detection of configuration status
- Loading states and error handling

### Account Linking
- `AccountLinkingModal` - Handles OAuth account conflicts
- Secure password verification for linking
- Support for 2FA during linking process

### Settings Management  
- OAuth provider management in user settings
- Connect/disconnect provider accounts
- View connected account information

### Error Handling
- Configuration validation
- Network error handling
- OAuth-specific error messages
- Graceful fallbacks

## Security Considerations

1. **Token Verification**: All ID tokens are verified server-side
2. **Account Linking**: Requires password verification
3. **Domain Restrictions**: Configure allowed domains
4. **HTTPS Required**: OAuth requires HTTPS in production
5. **Token Expiration**: Handles token refresh automatically

## Troubleshooting

### Google Sign-In Issues

**Button doesn't appear:**
- Check `VITE_GOOGLE_CLIENT_ID` is set correctly
- Verify domain is added to Google OAuth settings
- Check browser console for errors

**"Invalid client" error:**
- Verify client ID matches Google Console
- Check domain authorization in Google Console
- Ensure HTTPS is used in production

### Apple Sign In Issues

**Button is disabled:**
- Check `VITE_APPLE_CLIENT_ID` is set correctly
- Verify Services ID is configured in Apple Developer Portal
- Check domain verification

**"Invalid client" error:**
- Verify client ID matches Apple Developer Portal
- Check domain and return URL configuration
- Ensure domain verification file is accessible

### Account Linking Issues

**Linking modal doesn't appear:**
- Check backend `/auth/google` or `/auth/apple` endpoints
- Verify backend returns `account_linking_required` for conflicts
- Check browser console for API errors

**Password verification fails:**
- Verify `/auth/oauth/link` endpoint implementation
- Check password validation logic
- Ensure proper error handling

## Support

For additional help:
1. Check the browser console for detailed error messages
2. Verify backend API responses match expected format
3. Test with OAuth provider debugging tools
4. Refer to official OAuth documentation:
   - [Google Identity Services](https://developers.google.com/identity/gsi/web)
   - [Apple Sign In](https://developer.apple.com/documentation/sign_in_with_apple)
