# 🌐 Netlify Deployment Guide

## 🚀 Quick Deploy to Netlify

### Option 1: Git-based Deployment (Recommended)

1. **Push to GitHub** (if not done already):
   ```bash
   git add .
   git commit -m "Add Netlify configuration"
   git push origin main
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Configure build settings:
     - **Build command**: `npm run build:netlify`
     - **Publish directory**: `out`
     - **Functions directory**: `netlify/functions`

3. **Environment Variables**:
   In Netlify dashboard → Site Settings → Environment Variables, add:
   ```
   NETLIFY=true
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
   ```

4. **Deploy**: Click "Deploy site"

### Option 2: Drag & Drop Deployment

1. **Build locally**:
   ```bash
   npm run build:netlify
   ```

2. **Drag & Drop**:
   - Go to [netlify.com](https://netlify.com)
   - Drag the `out` folder to the deploy area

---

## ⚠️ Important Differences from Vercel

### ✅ What Works:
- ✅ Static site hosting
- ✅ Serverless functions (API routes)
- ✅ Environment variables
- ✅ Custom domains
- ✅ SSL certificates

### 🔄 What's Different:
- 🔄 **API Routes**: Converted to Netlify Functions
- 🔄 **Background Jobs**: No built-in cron (use external service)
- 🔄 **Build Process**: Uses static export
- 🔄 **File Structure**: Functions in `/netlify/functions/`

### 🚨 Limitations:
- ❌ **No built-in cron jobs** for message scheduling
- ❌ **No server-side rendering** (static export only)
- ❌ **File upload handling** is more complex

---

## 🔧 Required Modifications Made

### 1. **netlify.toml**
- Build configuration
- Redirects for API routes
- CORS headers

### 2. **next.config.js**
- Static export enabled for Netlify
- Image optimization disabled
- Trailing slashes enabled

### 3. **Netlify Functions**
- `/netlify/functions/health.js` - Health check
- `/netlify/functions/clients-import.js` - CSV import (needs completion)

### 4. **Package.json**
- Added `build:netlify` script

---

## 🔄 Background Jobs Solution

Since Netlify doesn't have built-in cron jobs, use **external services**:

### Option 1: Zapier (Easiest)
- Create a Zap that runs every minute
- Trigger: Schedule
- Action: Webhook to your Netlify function

### Option 2: GitHub Actions
```yaml
# .github/workflows/cron.yml
name: Message Scheduler
on:
  schedule:
    - cron: '* * * * *' # Every minute
jobs:
  send-messages:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger message sending
        run: |
          curl -X POST https://your-site.netlify.app/.netlify/functions/send-scheduled-messages
```

### Option 3: cron-job.org (Free)
- Set up free cron job
- URL: `https://your-site.netlify.app/.netlify/functions/send-scheduled-messages`
- Schedule: Every minute

---

## 📊 Netlify vs Vercel Comparison

| Feature | Netlify | Vercel |
|---------|---------|---------|
| **Hosting** | ✅ Free | ✅ Free |
| **Next.js Support** | ✅ Good | ✅ Excellent |
| **API Routes** | ✅ Functions | ✅ Native |
| **Background Jobs** | ❌ External | ✅ Built-in |
| **Build Times** | ⚡ Fast | ⚡ Fast |
| **Custom Domains** | ✅ Free | ✅ Free |

---

## 🎯 Recommendation

### Choose Netlify if:
- ✅ You prefer Netlify's interface
- ✅ You're okay with external cron services
- ✅ You want static hosting
- ✅ You're already using Netlify ecosystem

### Choose Vercel if:
- ✅ You need built-in background jobs
- ✅ You want seamless Next.js integration
- ✅ You prefer server-side features
- ✅ You want easier API route handling

---

## 🚀 Deploy Now!

Ready to deploy? Run these commands:

```bash
# Commit Netlify configuration
git add .
git commit -m "Configure for Netlify deployment"
git push origin main

# Then go to netlify.com and deploy!
```

Your app will be live at: `https://your-app-name.netlify.app`

---

## 🔧 Post-Deployment Setup

1. **Update WhatsApp Webhook**:
   ```
   https://your-app-name.netlify.app/.netlify/functions/whatsapp-webhook
   ```

2. **Set up external cron** for message scheduling

3. **Test all functionality**:
   - Authentication
   - Client management  
   - CSV import
   - Health check: `https://your-app-name.netlify.app/.netlify/functions/health`

---

## 🆘 Troubleshooting

### Build Fails?
- Check environment variables are set
- Verify `NETLIFY=true` is set during build

### API Routes Not Working?
- Check `netlify.toml` redirects
- Verify functions are in correct directory

### Import Not Working?
- Complete the CSV parsing logic in `clients-import.js`
- Add proper multipart form parsing

Ready to deploy on Netlify? 🚀 