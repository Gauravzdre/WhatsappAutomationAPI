# WhatsApp AI Automation Platform

AI-powered WhatsApp automation with multi-agent system using Julep AI.

## 🚀 Quick Start

```bash
# Clone and install
git clone <repo-url>
cd whatsapp-automation
npm install

# Configure .env.local with your API keys (see .env.example)
# Start development
npm run dev
```

## 🛠 Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API, Supabase PostgreSQL
- **AI**: Julep SDK, Multi-agent workflows
- **Integrations**: WhatsApp Business API, Social platforms
- **Deployment**: Netlify with serverless functions

## 🤖 AI Agents

- **Brand Persona**: Maintains brand voice consistency
- **Content Creator**: Generates platform-optimized content  
- **Scheduler**: AI-powered timing optimization
- **Sales Agent**: Automated customer interactions
- **Analytics**: Performance insights and recommendations
- **Campaign Orchestrator**: Cross-platform coordination

## 📋 Setup

1. **Environment Variables** - Copy `.env.example` to `.env.local` and configure:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   JULEP_API_KEY=your_julep_key
   WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token
   ```

2. **Database** - Run Supabase migrations:
   ```bash
   npx supabase db push
   ```

3. **WhatsApp** - Configure webhook URL:
   ```
   https://yourdomain.com/api/whatsapp/webhook
   ```

## 🎯 Features

### Brand Management
- **Complete Brand Setup** - Comprehensive brand identity creation
- **Edit Brand Details** - Full editing capabilities with validation
- **Delete Brand** - Safe brand deletion with confirmation
- **Unsaved Changes Detection** - Prevents accidental data loss
- **Brand Guidelines** - Custom brand voice and visual identity

### Content & Automation
- **Content Studio** - Multi-platform content generation
- **Smart Scheduling** - Audience-optimized timing
- **Customer Management** - Automated support
- **Real-time Analytics** - Performance dashboards
- **WhatsApp Integration** - Business API automation

### User Experience
- **Responsive Design** - Works on all devices
- **Dark Mode Support** - Automatic theme switching
- **Form Validation** - Real-time input validation
- **Loading States** - Clear feedback for all operations
- **Error Handling** - Comprehensive error management

## 🚀 Deployment

Deploy to Netlify:

1. Connect your repository to Netlify
2. Configure environment variables in Netlify dashboard
3. Deploy with automatic builds on push

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── brand-setup/       # Brand management
│   ├── dashboard/         # Main dashboard
│   └── ...
├── components/            # Reusable components
├── lib/                   # Utilities and configurations
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
```

## 🧹 Recent Improvements

- ✅ Enhanced brand editing with full CRUD operations
- ✅ Added brand deletion with confirmation dialog
- ✅ Improved form validation and error handling
- ✅ Added unsaved changes detection
- ✅ Cleaned up unnecessary files and documentation
- ✅ Improved API endpoints for better data handling
- ✅ Enhanced user experience with better feedback

## 📞 Support

- Issues: GitHub Issues
- Docs: Built-in help system

## 🔐 User Credential Management

The platform now supports **user-specific API credentials** for all social media platforms. Each user can configure their own API keys and access tokens instead of relying on global credentials.

### Supported Platforms

- **WhatsApp Business API**
  - Phone Number ID
  - Access Token
  - API URL (customizable)
  - Webhook Verify Token

- **Facebook**
  - Access Token
  - Page ID

- **Instagram**
  - Access Token
  - Account ID

- **Twitter/X**
  - API Key
  - API Secret Key
  - Access Token
  - Access Token Secret

- **LinkedIn**
  - Access Token
  - Page ID

- **TikTok**
  - Access Token

- **YouTube**
  - API Key
  - Channel ID

### How It Works

1. **Users configure their own credentials** in the Settings page
2. **Credentials are stored securely** in the database with encryption
3. **APIs automatically use user credentials** instead of global ones
4. **Each user manages their own integrations** independently

### Security Features

- All sensitive tokens are stored as password fields
- Row-level security ensures users only access their own credentials
- Credentials are validated before API calls
- Clear error messages guide users to configure missing credentials

### For Developers

Use the credential helper functions in your API endpoints:

```typescript
import { getPlatformCredentials, hasValidCredentials } from '@/lib/credentials'

// Check if user has valid credentials
const hasCredentials = await hasValidCredentials(userId, 'whatsapp')

// Get platform-specific credentials
const credentials = await getPlatformCredentials(userId, 'whatsapp')
```

**Note:** OpenAI API key remains a system-level credential for security reasons.

## 🎨 Recent Improvements

Built with Julep AI agents for intelligent automation. 