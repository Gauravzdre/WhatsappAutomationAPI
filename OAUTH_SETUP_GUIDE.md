# OAuth Setup Guide for Facebook & Instagram (Composio)

This guide will help you set up the OAuth integration using Composio's platform, so users can connect their Facebook and Instagram accounts with just one click.

## 🚀 Quick Setup

### 1. Get Composio API Key

1. Go to [Composio](https://composio.dev/) and create an account
2. Navigate to your dashboard and get your API key
3. The API key will be used to access Composio's OAuth capabilities

### 2. Set Environment Variables

Add this to your `.env` file:

```bash
# OAuth Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Composio Configuration (Required for OAuth)
COMPOSIO_API_KEY=your_composio_api_key_here
```

### 3. Test Composio Integration

Run the test script to see what OAuth capabilities are available:

```bash
npm run test:composio
```

This will show you:
- Available toolkits (Facebook, Instagram, etc.)
- OAuth configurations for each platform
- Required fields for OAuth connections

### 4. Test the Integration

1. Start your development server: `npm run dev`
2. Go to `/oauth-demo` to test the OAuth flow
3. Click "Connect" buttons to test Facebook and Instagram connections

## 🔧 How It Works

1. **User clicks "Connect"** → Composio generates OAuth URL
2. **User grants permissions** → Platform redirects back with authorization code
3. **Composio handles token exchange** → Gets access token automatically
4. **Account connected** → User can now use platform features

## 📱 Supported Platforms

Composio supports multiple platforms including:
- **Facebook** - Pages, posts, comments, insights
- **Instagram** - Posts, stories, comments, insights
- **LinkedIn** - Company pages, posts, analytics
- **Twitter/X** - Tweets, followers, analytics
- **And many more...**

## 🚨 Troubleshooting

### Common Issues

1. **"COMPOSIO_API_KEY environment variable is required"**
   - Check that `COMPOSIO_API_KEY` is set in your `.env` file
   - Restart your development server after adding it

2. **"Toolkit not found"**
   - Run `npm run test:composio` to see available toolkits
   - Check if the platform you want is supported by Composio

3. **"No OAuth configuration found"**
   - Some platforms may not have OAuth enabled in Composio
   - Check the toolkit details for available auth schemes

### Testing

Run these test scripts to verify your setup:

```bash
# Test Composio toolkits and OAuth capabilities
npm run test:composio

# Test OAuth service logic
npm run test:oauth:simple
```

## 🔒 Security Notes

- OAuth tokens are handled securely through Composio's platform
- No access tokens are stored in your application
- All communication uses HTTPS
- Composio manages token refresh and security

## 📚 Next Steps

After setting up Composio OAuth:

1. Test the connection flow in your browser
2. Explore available toolkits with `npm run test:composio`
3. Integrate OAuth buttons into your main settings page
4. Use connected accounts for posting and analytics

## 🆘 Need Help?

If you encounter issues:

1. Check the browser console for errors
2. Verify your Composio API key is correct
3. Ensure environment variables are set correctly
4. Run the test scripts to diagnose problems
5. Check Composio's documentation for platform-specific setup

---

**🎉 That's it!** Your users can now connect social media accounts through Composio's secure OAuth platform with just one click.
