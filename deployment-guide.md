# WhatsApp Automation - Deployment Guide

## 🚀 Option 1: Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free)
- Your Supabase credentials

### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/whatsapp-automation.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "New Project"
   - Import your WhatsApp automation repository
   - Vercel auto-detects Next.js configuration

3. **Environment Variables**
   In Vercel dashboard → Settings → Environment Variables, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel automatically builds and deploys
   - Get your live URL: `https://your-app.vercel.app`

### ⚠️ **Important for Background Jobs**
Vercel has **10-second timeout** for serverless functions. For the message scheduling feature, you'll need:

**Option A: Vercel Cron Jobs (Recommended)**
```typescript
// pages/api/cron/send-messages.ts
export default async function handler(req: NextRequest) {
  // Your message sending logic here
}

// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/send-messages",
      "schedule": "* * * * *"
    }
  ]
}
```

**Option B: External Cron Service**
- Use [cron-job.org](https://cron-job.org) (free)
- Schedule HTTP calls to your `/api/messages/send-scheduled` endpoint

---

## 🌊 Option 2: Railway (Great for Background Jobs)

### ✅ **Why Railway:**
- **Full server environment** - Perfect for node-cron
- **$5/month** starter plan
- **Persistent processes** for background jobs
- **Easy deployment** from GitHub

### Steps:

1. **Create railway.json**
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start",
       "healthcheckPath": "/"
     }
   }
   ```

2. **Update package.json**
   ```json
   {
     "scripts": {
       "start": "next start",
       "build": "next build"
     }
   }
   ```

3. **Deploy**
   - Go to [railway.app](https://railway.app)
   - Connect GitHub repository
   - Add environment variables
   - Deploy automatically

---

## ☁️ Option 3: Digital Ocean App Platform

### ✅ **Why Digital Ocean:**
- **$5/month** basic droplet
- **Full control** over environment
- **Great for scaling**
- **Integrated databases**

### Steps:

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Deploy**
   - Go to [digitalocean.com](https://digitalocean.com)
   - Create new App
   - Connect GitHub repository
   - Configure environment variables
   - Deploy

---

## 🏗️ Option 4: Self-Hosted VPS

### ✅ **Why VPS:**
- **Full control** - Perfect for complex automation
- **Cost effective** for high usage
- **Custom configurations**
- **Multiple apps** on one server

### Recommended Providers:
- **Hetzner** - €4.90/month (excellent value)
- **Linode** - $5/month
- **DigitalOcean Droplet** - $5/month
- **Vultr** - $3.50/month

### Setup Steps:

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Install Nginx for reverse proxy
   sudo apt install nginx -y
   ```

2. **Application Deployment**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/whatsapp-automation.git
   cd whatsapp-automation
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

3. **Create ecosystem.config.js**
   ```javascript
   module.exports = {
     apps: [{
       name: 'whatsapp-automation',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3000,
         NEXT_PUBLIC_SUPABASE_URL: 'your_supabase_url',
         NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_supabase_key',
         WHATSAPP_ACCESS_TOKEN: 'your_whatsapp_token',
         WHATSAPP_PHONE_NUMBER_ID: 'your_phone_id'
       }
     }]
   }
   ```

4. **Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/whatsapp-automation
   server {
     listen 80;
     server_name your-domain.com;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

---

## 📊 **Deployment Comparison**

| Platform | Cost | Background Jobs | Ease | Best For |
|----------|------|----------------|------|----------|
| **Vercel** | Free | Limited (10s) | ⭐⭐⭐⭐⭐ | MVP, Frontend-heavy |
| **Railway** | $5/month | ✅ Full | ⭐⭐⭐⭐ | Small-Medium apps |
| **DigitalOcean** | $5/month | ✅ Full | ⭐⭐⭐ | Scalable apps |
| **VPS** | $3-5/month | ✅ Full | ⭐⭐ | High control needed |

---

## 🎯 **My Recommendation:**

### For MVP/Testing: **Vercel**
- Deploy immediately
- Use external cron service
- Scale later if needed

### For Production: **Railway or VPS**
- Full background job support
- Better for WhatsApp automation
- More reliable message scheduling

---

## 🔧 **Required Environment Variables**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-verify-token

# Optional
NODE_ENV=production
PORT=3000
```

---

## 🚨 **Important Notes:**

1. **WhatsApp Webhook URL**: Update in Meta Developer Console
2. **Database**: Supabase is already cloud-hosted ✅
3. **SSL Certificate**: Required for WhatsApp webhook (auto on most platforms)
4. **Background Jobs**: Critical for message scheduling
5. **Error Monitoring**: Consider adding Sentry for production

Choose based on your needs and budget! 🚀 