# OAuth Integration for Facebook & Instagram

This implementation provides a simple, secure way to connect Facebook and Instagram accounts without manually copying and pasting access tokens.

## 🚀 Features

- **One-Click Connection**: Users simply click "Connect" and are redirected to Meta's authorization page
- **Automatic Token Management**: Access tokens are handled securely through Composio's OAuth service
- **No Manual Token Entry**: Eliminates the need to copy/paste long access tokens
- **Secure Callback Handling**: OAuth callbacks are processed securely with proper error handling
- **Real-time Status Updates**: Visual feedback showing connection status and progress

## 🛠️ Setup Requirements

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Composio API Key (Required for OAuth)
COMPOSIO_API_KEY=your_composio_api_key

# App URL for OAuth callbacks
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Composio Configuration

1. Sign up at [Composio](https://composio.dev)
2. Get your API key from the dashboard
3. Configure Facebook and Instagram OAuth apps in your Composio dashboard

### 3. Meta Developer Setup

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app or use existing one
3. Add Facebook Login and Instagram Basic Display products
4. Configure OAuth redirect URIs:
   - `http://localhost:3000/api/oauth/callback/facebook`
   - `http://localhost:3000/api/oauth/callback/instagram`

## 📱 How It Works

### User Flow

1. **User clicks "Connect"** button for Facebook or Instagram
2. **System generates OAuth URL** using Composio service
3. **User is redirected** to Meta's authorization page
4. **User grants permissions** for their accounts
5. **Meta redirects back** to our callback endpoint
6. **System processes callback** and stores connection details
7. **User sees success message** and connection status

### Technical Flow

```
Frontend → API Route → Composio → Meta OAuth → Callback → Success
```

## 🔧 API Endpoints

### OAuth Initiation
- `GET /api/oauth/connect/facebook` - Get Facebook OAuth URL
- `GET /api/oauth/connect/instagram` - Get Instagram OAuth URL

### OAuth Callbacks
- `GET /api/oauth/callback/facebook` - Handle Facebook OAuth callback
- `GET /api/oauth/callback/instagram` - Handle Instagram OAuth callback

## 🎯 Usage Examples

### Basic Integration

```tsx
import { OAuthConnectButtons } from '@/components/oauth-connect-buttons'

function MyComponent() {
  return (
    <OAuthConnectButtons 
      onConnectionSuccess={(platform, accountName) => {
        console.log(`${platform} connected: ${accountName}`)
      }}
      onConnectionError={(platform, error) => {
        console.error(`${platform} failed: ${error}`)
      }}
    />
  )
}
```

### Custom Styling

```tsx
<OAuthConnectButtons 
  onConnectionSuccess={(platform, accountName) => {
    // Handle successful connection
    toast.success(`${platform} connected successfully!`)
  }}
  onConnectionError={(platform, error) => {
    // Handle connection errors
    toast.error(`Failed to connect ${platform}: ${error}`)
  }}
/>
```

## 🔒 Security Features

- **OAuth 2.0 Compliant**: Follows industry-standard OAuth 2.0 protocol
- **Secure Token Storage**: Access tokens are never exposed in the UI
- **Automatic Token Refresh**: Handled by Composio service
- **Callback Validation**: Secure callback processing with state validation
- **Error Handling**: Comprehensive error handling and user feedback

## 🧪 Testing

### Demo Page

Visit `/oauth-demo` to test the OAuth integration:

```bash
npm run dev
# Navigate to http://localhost:3000/oauth-demo
```

### Test Accounts

- Use Facebook Developer test accounts for development
- Instagram Business accounts are required for Instagram integration
- Test with different permission scopes

## 🚨 Troubleshooting

### Common Issues

1. **"Failed to initialize OAuth"**
   - Check `COMPOSIO_API_KEY` environment variable
   - Verify Composio service is accessible

2. **"No authorization code received"**
   - Check OAuth redirect URIs in Meta Developer Console
   - Verify callback endpoints are accessible

3. **"Connection failed"**
   - Check Meta app permissions and scopes
   - Verify user has proper account access

### Debug Mode

Enable debug logging by checking browser console and server logs for detailed error information.

## 📚 Dependencies

- `@composio/client` - OAuth service integration
- `next/server` - API route handling
- `lucide-react` - Icons
- `@/components/ui/*` - UI components

## 🔄 Future Enhancements

- [ ] Token refresh handling
- [ ] Connection status persistence
- [ ] Multiple account support
- [ ] OAuth for additional platforms (Twitter, LinkedIn)
- [ ] Webhook integration for real-time updates

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Composio documentation
3. Check Meta Developer documentation
4. Review server logs for detailed error information

---

**Note**: This implementation replaces the manual token input fields with a modern, secure OAuth flow. Users no longer need to copy/paste access tokens, making the connection process much simpler and more secure.
