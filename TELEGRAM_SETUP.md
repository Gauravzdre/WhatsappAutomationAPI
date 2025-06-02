# 🤖 Telegram Bot Setup Guide

## **Quick Start (30 minutes)**

### **Step 1: Create Telegram Bot (5 minutes)**

1. **Open Telegram** and search for `@BotFather`
2. **Send**: `/newbot`
3. **Enter bot name**: `My AI Assistant` (or your preferred name)
4. **Enter username**: `your_bot_name_bot` (must end with 'bot')
5. **Copy the token**: You'll get something like:
   ```
   123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890
   ```

### **Step 2: Configure Environment Variables (2 minutes)**

Create a `.env.local` file in your project root:

```bash
# Copy .env.example to .env.local
cp env.example .env.local
```

Edit `.env.local` and add your tokens:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890
TELEGRAM_WEBHOOK_URL=http://localhost:3000/api/telegram/webhook
TELEGRAM_WEBHOOK_TOKEN=my-custom-webhook-security-token-2025

# Your existing variables...
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
# ... etc
```

**Note**: 
- `TELEGRAM_BOT_TOKEN`: From @BotFather (required)
- `TELEGRAM_WEBHOOK_URL`: Your app's webhook URL
- `TELEGRAM_WEBHOOK_TOKEN`: Any secure string you create (for verification)

### **Step 3: Start Development Server (1 minute)**

```bash
npm run dev
```

Your bot is now ready for local testing! 🎉

---

## **Testing Your Bot (5 minutes)**

### **Test 1: Check Bot Status**
```bash
curl http://localhost:3000/api/telegram/status
```

Expected response:
```json
{
  "timestamp": "2025-01-27T...",
  "summary": {
    "connectedPlatforms": 1,
    "defaultPlatform": "telegram"
  }
}
```

### **Test 2: Send a Message to Your Bot**
1. **Find your bot** in Telegram (search for the username you created)
2. **Send message**: `Hello bot!`
3. **Expect echo**: `🤖 Echo: Hello bot!`

### **Test 3: Send Message via API**
```bash
curl -X POST http://localhost:3000/api/telegram/send \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "YOUR_CHAT_ID",
    "text": "Hello from API!"
  }'
```

**To get your Chat ID**: Send any message to your bot and check the server logs.

---

## **Production Deployment**

### **Step 1: Deploy Your App**
Deploy to your preferred platform (Vercel, Netlify, etc.)

### **Step 2: Update Environment Variables**
In your production environment, set:
```bash
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
```

### **Step 3: Set Webhook**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/telegram/webhook"
  }'
```

---

## **Bot Commands Setup (Optional)**

Set up bot commands for better UX:

1. **Message @BotFather**: `/setcommands`
2. **Select your bot**
3. **Send commands list**:
```
start - Start using the bot
help - Get help information
status - Check bot status
generate - Generate AI content
```

---

## **Testing Commands**

### **Manual Testing**
- Send `/start` to your bot
- Send any text message
- Check that you get echo responses

### **API Testing**
```bash
# Test status
curl http://localhost:3000/api/telegram/status

# Test sending
curl -X POST http://localhost:3000/api/telegram/send \
  -H "Content-Type: application/json" \
  -d '{"chatId": "123456789", "text": "Test message"}'
```

### **Webhook Testing**
```bash
# Verify webhook (in production)
curl "https://your-domain.com/api/telegram/webhook?token=your-webhook-token"
```

---

## **Troubleshooting**

### **❌ Bot Not Responding**
- Check that `TELEGRAM_BOT_TOKEN` is correct
- Verify bot is started (`/start` command)
- Check server logs for errors

### **❌ Webhook Issues**
- Ensure HTTPS for production webhooks
- Verify `TELEGRAM_WEBHOOK_URL` is publicly accessible
- Check webhook status: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`

### **❌ API Errors**
- Verify environment variables are loaded
- Check network connectivity
- Validate bot token with Telegram API

---

## **Next Steps**

Once your bot is working:

1. **✅ Task #1 Complete**: Telegram Bot API Integration
2. **🚀 Next**: Start Task #2 - AI Content Generator
3. **🔗 Integration**: Connect bot to your AI agents
4. **📊 Analytics**: Add message tracking to dashboard
5. **🤖 Automation**: Set up conversation flows

---

## **Security Notes**

- **Never commit** `.env.local` to git
- **Use HTTPS** for production webhooks
- **Rotate tokens** periodically
- **Validate webhook** sources in production
- **Rate limit** API endpoints

Your Telegram bot is now ready for AI automation! 🚀