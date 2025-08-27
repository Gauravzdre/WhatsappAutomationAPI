# 🤖 Chatbot Setup Guide

## Quick Setup for Full AI Functionality

Your chatbot testing interface is working, but for full AI capabilities, you need to configure an OpenAI API key.

### Step 1: Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the generated API key (starts with `sk-`)

### Step 2: Configure the API Key

Create a `.env.local` file in your project root directory:

```bash
# In your project root (same level as package.json)
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Step 3: Restart the Development Server

```bash
npm run dev
```

## Current Functionality

### ✅ Working Now (Fallback Mode)
- Chatbot responds with basic, contextual messages
- Uses chatbot name and industry information
- Echoes user messages and provides helpful fallback responses
- Dark mode interface with error handling

### 🚀 With OpenAI API Key (Full AI Mode)
- Intelligent, context-aware responses
- Uses custom system prompts from chatbot configurations
- Learns from conversation history
- Industry-specific expertise
- Natural language understanding

## Testing Your Setup

1. **Check Status**: Click the "Status" button in the chatbot selector
2. **Look for Green Checkmarks**: 
   - ✅ OpenAI API Key: Configured
   - ✅ AI System: Ready

3. **Test a Message**: Send any message to see intelligent responses

## Troubleshooting

### API Key Issues
- Make sure the file is named exactly `.env.local`
- Ensure there are no spaces around the `=` sign
- Restart the development server after adding the key
- Check that the key starts with `sk-`

### Still Getting Fallback Responses?
- Check the browser console for error messages
- Verify the API key is valid on OpenAI platform
- Make sure you have credits available in your OpenAI account

### Environment File Location
```
your-project/
├── src/
├── public/
├── package.json
├── .env.local          ← Create this file here
└── README.md
```

## Cost Information

- **GPT-4o-mini**: Very cost-effective (~$0.15 per 1M input tokens)
- **Typical conversation**: Less than $0.01 per exchange
- **Free tier**: OpenAI provides $5 in free credits for new accounts

## Security Note

- Never commit `.env.local` to version control
- The `.env.local` file is automatically ignored by Git
- Keep your API keys secure and don't share them

---

**Need Help?** Check the console logs in your browser's developer tools for detailed error messages. 