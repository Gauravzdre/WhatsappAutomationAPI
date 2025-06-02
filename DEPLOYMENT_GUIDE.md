# Netlify Deployment Guide

## 🚀 Deployment Steps

### 1. Build and Deploy
The project is now configured for Netlify deployment. Run:

```bash
# Deploy to production
netlify deploy --prod
```

### 2. Environment Variables Setup

**CRITICAL**: You must set up these environment variables in your Netlify dashboard:

#### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key  
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

#### WhatsApp Business API
- `WHATSAPP_API_URL` - https://graph.facebook.com/v15.0
- `WHATSAPP_PHONE_ID` - Your WhatsApp phone number ID
- `WHATSAPP_ACCESS_TOKEN` - Your WhatsApp access token

#### OpenAI (for AI features)
- `OPENAI_API_KEY` - Your OpenAI API key

#### Composio (for advanced automation)
- `COMPOSIO_API_KEY` - Your Composio API key

### 3. Set Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Navigate to your site
3. Go to **Site settings** > **Environment variables**
4. Click **Add a variable** for each required environment variable above

### 4. Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL setup scripts in your Supabase dashboard
3. Copy your project URL and keys to Netlify environment variables

## 🐛 Troubleshooting

### API 404 Errors
If you see `/api/*` routes returning 404:
- Ensure the `@netlify/plugin-nextjs` plugin is working
- Check that environment variables are set
- Redeploy the site after setting environment variables

### Authentication Issues
If you see "Invalid Refresh Token" errors:
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- Make sure the Supabase project is active
- Check that your domain is added to Supabase auth settings

### Database Connection Issues
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check that RLS policies are properly configured
- Ensure database tables exist

## 🔧 Build Configuration

The project uses:
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18
- **Framework**: Next.js with App Router

## 📱 Features Available After Deployment

✅ Authentication system  
✅ WhatsApp Business API integration  
✅ Client management  
✅ Message scheduling  
✅ AI-powered content generation  
✅ Brand management  
✅ Analytics dashboard  

## 🔗 Post-Deployment Setup

1. **Create your first brand** - Use the brand setup wizard
2. **Configure WhatsApp** - Add your Business API credentials in settings
3. **Import clients** - Use the CSV import feature or add manually
4. **Set up messaging** - Create your first automated message schedule

## 🌐 Live Site

Once deployed, your site will be available at your Netlify URL (e.g., `https://your-site.netlify.app`)

## 🚨 Security Notes

- Never commit API keys to the repository
- Use Netlify's environment variables for all sensitive data
- Keep your Supabase service role key private
- Regularly rotate your WhatsApp access tokens 