# Google OAuth Setup Instructions

To enable Google Sign-In functionality, you need to set up Google OAuth credentials:

## 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google Identity Services API

## 2. Configure OAuth Consent Screen

1. Navigate to "APIs & Services" > "OAuth consent screen"
2. Configure your app information:
   - App name: "Avnera Fashion"
   - User support email: your email
   - App domain: `http://localhost:3000` (for development)
   - Authorized domains: `localhost` (for development)

## 3. Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: "Avnera Web Client"
5. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-domain.com/api/auth/callback/google` (for production)

## 4. Update Environment Variables

Copy your credentials and update `.env.local`:

```env
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

## 5. Restart Development Server

After updating the environment variables:

```bash
npm run dev
```

The Google Sign-In button will now appear on the login page and function correctly.

## Production Setup

For production deployment:
1. Add your production domain to authorized domains
2. Add production callback URL to OAuth settings
3. Update environment variables in your hosting platform
