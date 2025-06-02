# 🚀 AI WhatsApp Automation Platform - Database Setup Guide

## Overview
This guide will help you set up the complete database schema for your AI WhatsApp automation platform and connect it to the frontend.

## 📋 Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js**: Version 18 or higher
3. **WhatsApp Business API**: Meta Business account with WhatsApp Business API access

## 🛠️ Database Setup Steps

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: `whatsapp-ai-automation`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
4. Click "Create new project"

### Step 2: Run Database Schema

1. Navigate to your Supabase project dashboard
2. Go to **SQL Editor** in the sidebar
3. Create a new query
4. Copy and paste the entire contents from `database/setup.sql`
5. Click **RUN** to execute the script

The script will create:
- ✅ 11 main tables with proper relationships
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for optimal performance
- ✅ Triggers for auto-updating timestamps
- ✅ Sample data for development
- ✅ Analytics views for dashboard

### Step 3: Environment Configuration

1. In your Supabase project, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**
   - **anon/public key**
   - **service_role/secret key** (only if needed for admin operations)

3. Create/update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# WhatsApp Business API (Optional - configure in app settings)
WHATSAPP_PHONE_ID=your_phone_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_API_URL=https://graph.facebook.com/v15.0

# AI Services (Optional)
OPENAI_API_KEY=your_openai_key
JULEP_API_KEY=your_julep_key
```

### Step 4: Authentication Setup

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure your authentication providers:
   - **Email/Password**: Enable for development
   - **Social Providers**: Configure Google, GitHub, etc. (optional)
3. Set up email templates and SMTP (optional)

### Step 5: RLS Policies Verification

The setup script automatically creates RLS policies, but verify they're working:

1. Go to **Authentication** → **Policies**
2. You should see policies for all tables
3. Test by creating a user and checking data access

## 🎨 Frontend Connection

### Dashboard Features
- ✅ **Real-time AI Agent Status**: Connected to `ai_agents` table
- ✅ **Brand Management**: Connected to `brands` table
- ✅ **Client Analytics**: Connected to `clients` table
- ✅ **Message Analytics**: Connected to `messages` table
- ✅ **Performance Metrics**: Connected to `performance_reports` table

### Settings Features
- ✅ **WhatsApp API Configuration**: Stored in `settings` table
- ✅ **AI Model Settings**: JSONB configuration in `settings`
- ✅ **Test Connection**: Real WhatsApp API testing

### Brand Creation
- ✅ **AI-Enhanced Form**: Creates records in `brands` table
- ✅ **Automatic AI Agents**: Creates 6 AI agents per brand
- ✅ **Brand Analytics**: Tracks performance in `ai_agents` table

## 🧪 Testing the Setup

### 1. Test Database Connection

```bash
# Install dependencies
npm install

# Run the application
npm run dev
```

### 2. Test User Registration

1. Go to `http://localhost:3000`
2. Sign up with a new account
3. Check if user appears in Supabase **Authentication** → **Users**

### 3. Test Brand Creation

1. Navigate to "Create AI Brand" from dashboard
2. Fill out the brand form
3. Submit and verify data appears in:
   - `brands` table
   - `ai_agents` table (6 agents should be created)

### 4. Test WhatsApp Integration

1. Go to **Settings** → **WhatsApp** tab
2. Configure your WhatsApp Business API credentials
3. Use the test connection feature
4. Check if settings are saved in `settings` table

## 📊 Database Schema Overview

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `brands` | Store brand information | JSONB for flexible data |
| `ai_agents` | AI agent configurations | Links to brands, performance tracking |
| `clients` | Customer/contact management | Phone numbers, engagement data |
| `messages` | WhatsApp message history | AI-generated flags, metadata |
| `conversations` | Chat session management | Links clients to brands |
| `schedules` | Automated message scheduling | AI-optimized timing |
| `settings` | User configuration | WhatsApp API, AI model settings |

### Relationships

```
brands (1) ←→ (many) ai_agents
brands (1) ←→ (many) clients  
clients (1) ←→ (many) conversations
conversations (1) ←→ (many) messages
ai_agents (1) ←→ (many) messages
```

## 🔧 API Endpoints

The platform includes these functional API routes:

### Brand Management
- `POST /api/brands` - Create new brand
- `GET /api/brands` - List user's brands

### AI Agent Management  
- `POST /api/ai-agents` - Create AI agents for brand
- `GET /api/ai-agents` - List user's AI agents

### WhatsApp Integration
- `POST /api/test-whatsapp` - Test WhatsApp API connection
- `POST /api/whatsapp/webhook` - Handle incoming messages

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Verify your Supabase URL and anon key in `.env.local`
   - Check if environment variables are loaded

2. **RLS policy errors**
   - Make sure you're authenticated when testing
   - Verify policies exist for all tables

3. **WhatsApp API errors**
   - Check your phone number ID and access token
   - Verify phone number is registered with WhatsApp Business

4. **Build errors**
   - Run `npm run build` to check for TypeScript errors
   - Clear `.next` folder and rebuild if needed

### Database Debugging

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT tablename, policyname, roles, cmd, qual 
FROM pg_policies WHERE schemaname = 'public';

-- Check user data
SELECT * FROM auth.users LIMIT 5;
SELECT * FROM public.brands LIMIT 5;
```

## 🎉 Success!

Once setup is complete, you'll have:

- ✅ Fully functional AI automation platform
- ✅ Secure multi-tenant database with RLS
- ✅ Real-time dashboard with live data
- ✅ WhatsApp Business API integration
- ✅ AI agent management system
- ✅ Complete brand automation workflow

Your platform is now ready for production use! 🚀

## 📞 Support

If you encounter any issues:
1. Check the console for detailed error messages
2. Verify all environment variables are set
3. Test database connection in Supabase dashboard
4. Review the SQL setup script for any missed steps

Happy automating! 🤖✨ 