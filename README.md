# WhatsApp Automation

A Next.js 14 application for automating WhatsApp message scheduling using the WhatsApp Cloud API and Supabase.

## Features

- **User Authentication**: Secure login/signup with Supabase Auth
- **Client Management**: Add, edit, and delete WhatsApp contacts
- **Message Scheduling**: Create automated message schedules using cron expressions
- **Real-time Dashboard**: View statistics and manage your automation
- **Background Jobs**: Automated message sending based on schedules

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI + Radix UI
- **Backend**: Supabase (Database + Auth)
- **Messaging**: WhatsApp Cloud API
- **Scheduling**: node-cron + cron-parser

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Supabase Account** - [Create one here](https://supabase.com)
3. **WhatsApp Business Account** - [Set up WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd whatsapp-automation
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new Supabase project
2. Go to Settings > API to get your project URL and keys
3. Run the database migration:

```bash
# If you have Supabase CLI installed
npx supabase db push

# Or manually run the SQL in supabase/migrations/001_initial_schema.sql
# in your Supabase SQL editor
```

### 4. Set Up WhatsApp Cloud API

1. Create a Facebook Developer account
2. Create a new app and add WhatsApp product
3. Get your Phone Number ID and Access Token
4. Add your webhook URL (for production)

### 5. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy from env.example
cp env.example .env.local
```

Fill in your environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# WhatsApp Cloud API Configuration
WHATSAPP_API_URL=https://graph.facebook.com/v15.0
WHATSAPP_PHONE_ID=your_whatsapp_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
```

### 6. Run the Application

```bash
# Start the development server
npm run dev

# In a separate terminal, start the background job runner
npm run jobs
```

The application will be available at `http://localhost:3000`.

## Usage

### 1. Authentication
- Visit the app and sign up with your email
- Confirm your email if required by Supabase settings

### 2. Add Clients
- Go to the Clients page
- Add WhatsApp contacts with their phone numbers (include country code)

### 3. Create Schedules
- Go to the Schedules page
- Select a client, write your message, and set a cron expression
- Examples:
  - `0 9 * * *` - Daily at 9 AM
  - `0 9 * * 1` - Every Monday at 9 AM
  - `0 9 1 * *` - First day of every month at 9 AM

### 4. Monitor Dashboard
- View statistics on total clients, schedules, and pending messages
- Track when messages were last sent

## Cron Expression Examples

| Expression | Description |
|------------|-------------|
| `0 9 * * *` | Daily at 9:00 AM |
| `0 9 * * 1` | Every Monday at 9:00 AM |
| `0 9 1 * *` | First day of every month at 9:00 AM |
| `0 9,17 * * *` | Daily at 9:00 AM and 5:00 PM |
| `*/30 9-17 * * 1-5` | Every 30 minutes, 9 AM to 5 PM, Monday to Friday |

## Development

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages
│   ├── clients/           # Client management
│   ├── schedules/         # Schedule management
│   └── login/             # Authentication
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client config
│   ├── whatsapp.ts       # WhatsApp API service
│   └── utils.ts          # General utilities
├── hooks/                # Custom React hooks
└── server/               # Server-side code
    └── jobs/             # Background job runners
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run jobs` - Start background job runner
- `npm run lint` - Run ESLint

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Background Jobs

For production, you'll need to run the background job runner separately:

1. Deploy the job runner to a service like Railway, Render, or a VPS
2. Or use Supabase Edge Functions for serverless scheduling
3. Ensure the job runner has access to the same environment variables

## Troubleshooting

### Common Issues

1. **WhatsApp API Errors**
   - Verify your access token and phone number ID
   - Check that your WhatsApp Business account is verified
   - Ensure phone numbers include country codes without '+'

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check that RLS policies are correctly set up
   - Ensure the database migration was applied

3. **Scheduling Issues**
   - Verify cron expressions using online validators
   - Check that the job runner is running
   - Monitor console logs for errors

### Testing Locally

To test message scheduling locally:

1. Set a cron expression like `* * * * *` (every minute)
2. Create a test schedule
3. Monitor the job runner console for activity
4. Check your WhatsApp for received messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Supabase and WhatsApp API documentation
3. Create an issue in the repository 