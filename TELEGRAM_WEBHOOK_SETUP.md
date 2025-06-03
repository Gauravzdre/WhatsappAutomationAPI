# 🤖 Telegram Webhook Setup Guide

This guide will help you set up your Telegram bot webhook URL for your Schedsy.ai Smart Automation Platform.

## 📋 Prerequisites

1. **Telegram Bot Token**: Get this from [@BotFather](https://t.me/BotFather)
2. **Deployed Application**: Your app must be accessible via HTTPS
3. **Environment Variables**: Access to your `.env.local` file

## 🚀 Quick Setup Methods

### Method 1: Using the Web Interface (Recommended)

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Open the setup page**:
   ```
   http://localhost:3000/telegram-setup
   ```

3. **Follow the on-screen instructions**:
   - Enter your bot token
   - Click "Auto-Generate" for webhook URL
   - Click "Setup Webhook"
   - Copy the environment variables

### Method 2: Using the API Endpoint

1. **Set up webhook via API**:
   ```bash
   curl -X POST http://localhost:3000/api/telegram/setup-webhook \
     -H "Content-Type: application/json" \
     -d '{
       "botToken": "YOUR_BOT_TOKEN",
       "webhookUrl": "https://your-domain.com/api/telegram/webhook"
     }'
   ```

2. **Check webhook status**:
   ```bash
   curl "http://localhost:3000/api/telegram/setup-webhook?botToken=YOUR_BOT_TOKEN"
   ```

### Method 3: Using the Node.js Script

1. **Run the setup script**:
   ```bash
   node scripts/setup-telegram-webhook.js
   ```

2. **Follow the prompts**:
   - Enter your bot token when prompted
   - Enter your webhook URL (or press Enter for default)
   - Copy the generated environment variables

### Method 4: Manual Setup via Telegram API

1. **Set webhook directly**:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://your-domain.com/api/telegram/webhook",
       "allowed_updates": ["message", "callback_query"],
       "drop_pending_updates": true
     }'
   ```

2. **Verify webhook**:
   ```bash
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
   ```

## 🔧 Environment Configuration

### Step 1: Create/Update `.env.local`

Add these variables to your `.env.local` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
TELEGRAM_WEBHOOK_TOKEN=your_verification_token_here
```

### Step 2: Replace Placeholder Values

- **TELEGRAM_BOT_TOKEN**: Your actual bot token from BotFather
- **TELEGRAM_WEBHOOK_URL**: Your deployed application URL + `/api/telegram/webhook`
- **TELEGRAM_WEBHOOK_TOKEN**: A random string for webhook verification (optional)

## 🌐 Webhook URL Examples

### Development (Local Testing)
```
http://localhost:3000/api/telegram/webhook
```
*Note: Telegram requires HTTPS for webhooks, so use ngrok for local testing*

### Production (Deployed App)
```
https://your-app.vercel.app/api/telegram/webhook
https://your-app.netlify.app/api/telegram/webhook
https://your-domain.com/api/telegram/webhook
```

## 🔒 Using ngrok for Local Development

If you want to test webhooks locally:

1. **Install ngrok**:
   ```bash
   npm install -g ngrok
   ```

2. **Start your Next.js app**:
   ```bash
   npm run dev
   ```

3. **Expose your local server**:
   ```bash
   ngrok http 3000
   ```

4. **Use the HTTPS URL from ngrok**:
   ```
   https://abc123.ngrok.io/api/telegram/webhook
   ```

## 🧪 Testing Your Webhook

### Step 1: Verify Webhook is Set
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

Expected response:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-domain.com/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### Step 2: Test Message Sending
1. Find your bot on Telegram by searching for its username
2. Send `/start` or any message to your bot
3. Check your application logs for webhook activity
4. Your bot should echo back your message (current behavior)

### Step 3: Monitor Logs
Watch your application logs for webhook activity:
```bash
# If using npm run dev
# Check the terminal where your Next.js app is running

# Look for messages like:
# 📨 Telegram webhook received: {...}
# ✅ Message processed: {...}
```

## 🔍 Troubleshooting

### Common Issues

1. **Webhook not receiving messages**:
   - Verify your webhook URL is accessible via HTTPS
   - Check that your bot token is correct
   - Ensure your application is running and deployed

2. **SSL/HTTPS errors**:
   - Telegram requires HTTPS for webhooks
   - Use ngrok for local development
   - Ensure your production domain has valid SSL

3. **Bot not responding**:
   - Check your application logs for errors
   - Verify the webhook endpoint is working: `GET /api/telegram/webhook`
   - Test your bot token with a simple API call

### Debug Commands

1. **Test webhook endpoint**:
   ```bash
   curl "https://your-domain.com/api/telegram/webhook?token=test"
   ```

2. **Check bot info**:
   ```bash
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"
   ```

3. **Remove webhook** (if needed):
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook"
   ```

## 📊 Webhook Status Monitoring

### Using the Status API
```bash
curl "http://localhost:3000/api/telegram/status"
```

This will show:
- Connection status
- Last message received
- Webhook configuration
- Error logs (if any)

## 🎯 Next Steps

Once your webhook is set up:

1. **Test basic messaging**: Send messages to your bot
2. **Implement AI responses**: Connect to your AI content generator
3. **Add automation flows**: Set up message automation
4. **Monitor analytics**: Track message delivery and responses

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Bot token from BotFather | `123456789:ABC...` |
| `TELEGRAM_WEBHOOK_URL` | Your webhook endpoint | `https://app.com/api/telegram/webhook` |
| `TELEGRAM_WEBHOOK_TOKEN` | Verification token (optional) | `random_string_123` |

## 🔗 Useful Links

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [BotFather Commands](https://core.telegram.org/bots#6-botfather)
- [Webhook Guide](https://core.telegram.org/bots/api#setwebhook)
- [ngrok Documentation](https://ngrok.com/docs)

---

**Need Help?** Check the troubleshooting section or review your application logs for specific error messages. 