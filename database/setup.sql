-- =============================================================================
-- AI WHATSAPP AUTOMATION PLATFORM - DATABASE SETUP
-- =============================================================================
-- This script creates all necessary tables for the AI automation platform
-- Run this in your Supabase SQL editor or PostgreSQL database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- USER PROFILES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    company_name TEXT,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================================================
-- BRANDS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    description TEXT NOT NULL,
    brand_voice JSONB DEFAULT '{}'::jsonb,
    visual_identity JSONB DEFAULT '{}'::jsonb,
    target_audience JSONB DEFAULT '{}'::jsonb,
    guidelines TEXT,
    goals TEXT[] DEFAULT ARRAY[]::TEXT[],
    budget INTEGER DEFAULT 0,
    ai_persona_agent_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Brands policies
CREATE POLICY IF NOT EXISTS "Users can manage own brands" ON public.brands
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- AI AGENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.ai_agents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'brand_persona', 
        'content_creator', 
        'scheduler', 
        'sales', 
        'analytics', 
        'campaign_orchestrator'
    )),
    julep_agent_id TEXT,
    configuration JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    memory_context JSONB DEFAULT '{}'::jsonb,
    performance_metrics JSONB DEFAULT '{}'::jsonb,
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

-- AI Agents policies
CREATE POLICY IF NOT EXISTS "Users can manage own ai agents" ON public.ai_agents
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- CLIENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    company TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    last_interaction TIMESTAMP WITH TIME ZONE,
    total_messages INTEGER DEFAULT 0,
    client_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY IF NOT EXISTS "Users can manage own clients" ON public.clients
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- CONVERSATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    ai_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
    julep_session_id TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY IF NOT EXISTS "Users can manage own conversations" ON public.conversations
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- MESSAGES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'audio', 'video')),
    whatsapp_message_id TEXT,
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY IF NOT EXISTS "Users can manage own messages" ON public.messages
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- SCHEDULES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    message_content TEXT NOT NULL,
    schedule_type TEXT NOT NULL CHECK (schedule_type IN ('once', 'daily', 'weekly', 'monthly', 'custom')),
    schedule_config JSONB DEFAULT '{}'::jsonb,
    next_send_time TIMESTAMP WITH TIME ZONE,
    last_sent TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    ai_optimized BOOLEAN DEFAULT FALSE,
    optimization_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Schedules policies
CREATE POLICY IF NOT EXISTS "Users can manage own schedules" ON public.schedules
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- CONTENT GENERATION TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.content_generation (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    ai_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('social_post', 'whatsapp', 'email', 'ad_copy', 'blog', 'sms', 'image', 'text')),
    platform TEXT,
    brief TEXT NOT NULL,
    target_audience JSONB DEFAULT '{}'::jsonb,
    generated_content TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    quality_score DECIMAL(3,2),
    feedback JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.content_generation ENABLE ROW LEVEL SECURITY;

-- Content Generation policies
CREATE POLICY IF NOT EXISTS "Users can manage own content generation" ON public.content_generation
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- PERFORMANCE REPORTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.performance_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'campaign', 'custom')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    metrics JSONB DEFAULT '{}'::jsonb,
    insights JSONB DEFAULT '{}'::jsonb,
    recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
    ai_generated BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'completed' CHECK (status IN ('generating', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.performance_reports ENABLE ROW LEVEL SECURITY;

-- Performance Reports policies
CREATE POLICY IF NOT EXISTS "Users can manage own performance reports" ON public.performance_reports
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- CAMPAIGNS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    campaign_type TEXT NOT NULL CHECK (campaign_type IN ('awareness', 'engagement', 'conversion', 'retention')),
    target_audience JSONB DEFAULT '{}'::jsonb,
    content_strategy JSONB DEFAULT '{}'::jsonb,
    schedule_config JSONB DEFAULT '{}'::jsonb,
    budget DECIMAL(10,2),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    performance_metrics JSONB DEFAULT '{}'::jsonb,
    ai_orchestrated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
CREATE POLICY IF NOT EXISTS "Users can manage own campaigns" ON public.campaigns
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- SETTINGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    whatsapp_phone_id TEXT,
    whatsapp_access_token TEXT,
    whatsapp_api_url TEXT DEFAULT 'https://graph.facebook.com/v15.0',
    whatsapp_verify_token TEXT,
    test_phone_number TEXT,
    facebook_access_token TEXT,
    facebook_page_id TEXT,
    instagram_access_token TEXT,
    instagram_account_id TEXT,
    twitter_api_key TEXT,
    twitter_api_secret TEXT,
    twitter_access_token TEXT,
    twitter_access_token_secret TEXT,
    linkedin_access_token TEXT,
    linkedin_page_id TEXT,
    tiktok_access_token TEXT,
    youtube_api_key TEXT,
    youtube_channel_id TEXT,
    ai_model_config JSONB DEFAULT '{
        "model": "gpt-4",
        "temperature": 0.7,
        "max_tokens": 1000,
        "response_style": "professional"
    }'::jsonb,
    notification_settings JSONB DEFAULT '{
        "email_notifications": true,
        "whatsapp_notifications": false,
        "daily_reports": true
    }'::jsonb,
    business_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Settings policies
CREATE POLICY IF NOT EXISTS "Users can manage own settings" ON public.settings
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- WEBHOOKS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    webhook_type TEXT NOT NULL CHECK (webhook_type IN ('whatsapp', 'julep', 'custom')),
    source TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- Webhooks policies
CREATE POLICY IF NOT EXISTS "Users can view own webhooks" ON public.webhooks
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Brands indexes
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON public.brands(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_status ON public.brands(status);

-- AI Agents indexes
CREATE INDEX IF NOT EXISTS idx_ai_agents_user_id ON public.ai_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_brand_id ON public.ai_agents(brand_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_type ON public.ai_agents(type);
CREATE INDEX IF NOT EXISTS idx_ai_agents_status ON public.ai_agents(status);

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_brand_id ON public.clients(brand_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone_number ON public.clients(phone_number);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_brand_id ON public.conversations(brand_id);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_client_id ON public.messages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON public.messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_messages_ai_generated ON public.messages(ai_generated);

-- Schedules indexes
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON public.schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_brand_id ON public.schedules(brand_id);
CREATE INDEX IF NOT EXISTS idx_schedules_next_send_time ON public.schedules(next_send_time);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON public.schedules(status);

-- Content Generation indexes
CREATE INDEX IF NOT EXISTS idx_content_generation_user_id ON public.content_generation(user_id);
CREATE INDEX IF NOT EXISTS idx_content_generation_brand_id ON public.content_generation(brand_id);
CREATE INDEX IF NOT EXISTS idx_content_generation_status ON public.content_generation(status);

-- Webhooks indexes
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON public.webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON public.webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_webhooks_created_at ON public.webhooks(created_at);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE OR REPLACE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON public.ai_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_content_generation_updated_at BEFORE UPDATE ON public.content_generation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_performance_reports_updated_at BEFORE UPDATE ON public.performance_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SAMPLE DATA FOR DEVELOPMENT
-- =============================================================================

-- Insert sample data only if tables are empty
DO $$
DECLARE
    sample_user_id UUID;
    sample_brand_id UUID;
    sample_client_id UUID;
    sample_agent_id UUID;
BEGIN
    -- Check if we're in development mode (you can modify this condition)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brands' AND table_schema = 'public') THEN
        
        -- Create a sample user (this would normally be handled by Supabase Auth)
        -- Note: In production, users come from auth.users, managed by Supabase Auth
        
        -- Sample brand
        INSERT INTO public.brands (id, user_id, name, industry, description, brand_voice, target_audience, guidelines, goals, budget)
        SELECT 
            uuid_generate_v4(),
            auth.uid(),
            'TechCorp Solutions',
            'Technology',
            'AI-powered business automation solutions for modern enterprises',
            '{"tone": "professional", "personality": ["innovative", "trustworthy", "expert"], "keywords": ["innovation", "automation", "efficiency"]}',
            '{"demographics": "Business owners, 25-55 years old", "interests": ["technology", "automation", "productivity"], "platforms": ["WhatsApp", "LinkedIn", "Email"]}',
            'Always maintain professional tone, focus on business value, use data-driven insights',
            ARRAY['Increase Brand Awareness', 'Generate Leads', 'Drive Sales'],
            5000
        WHERE auth.uid() IS NOT NULL
        ON CONFLICT DO NOTHING;

        -- Sample clients (only insert if user exists)
        INSERT INTO public.clients (user_id, name, phone_number, email, company, tags, status)
        SELECT 
            auth.uid(),
            'John Smith',
            '+1234567890',
            'john@example.com',
            'ABC Corp',
            ARRAY['lead', 'enterprise'],
            'active'
        WHERE auth.uid() IS NOT NULL
        ON CONFLICT DO NOTHING;

        INSERT INTO public.clients (user_id, name, phone_number, email, company, tags, status)
        SELECT 
            auth.uid(),
            'Sarah Johnson',
            '+1234567891',
            'sarah@startup.com',
            'Startup Inc',
            ARRAY['customer', 'small-business'],
            'active'
        WHERE auth.uid() IS NOT NULL
        ON CONFLICT DO NOTHING;

        -- Sample schedules
        INSERT INTO public.schedules (user_id, name, message_content, schedule_type, status, next_send_time)
        SELECT 
            auth.uid(),
            'Weekly Newsletter',
            'Hi! Here are this week''s tech updates and automation tips...',
            'weekly',
            'active',
            NOW() + INTERVAL '1 week'
        WHERE auth.uid() IS NOT NULL
        ON CONFLICT DO NOTHING;

    END IF;
END $$;

-- =============================================================================
-- VIEWS FOR ANALYTICS
-- =============================================================================

-- Dashboard stats view
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
    u.id as user_id,
    (SELECT COUNT(*) FROM public.brands WHERE user_id = u.id AND status = 'active') as active_brands,
    (SELECT COUNT(*) FROM public.clients WHERE user_id = u.id AND status = 'active') as active_clients,
    (SELECT COUNT(*) FROM public.ai_agents WHERE user_id = u.id AND status = 'active') as active_agents,
    (SELECT COUNT(*) FROM public.schedules WHERE user_id = u.id AND status = 'active') as active_schedules,
    (SELECT COUNT(*) FROM public.messages WHERE user_id = u.id AND DATE(created_at) = CURRENT_DATE) as messages_today,
    (SELECT COUNT(*) FROM public.conversations WHERE user_id = u.id AND status = 'active') as active_conversations
FROM auth.users u;

-- Messages analytics view
CREATE OR REPLACE VIEW public.message_analytics AS
SELECT 
    user_id,
    DATE(created_at) as date,
    COUNT(*) as total_messages,
    COUNT(*) FILTER (WHERE direction = 'outbound') as sent_messages,
    COUNT(*) FILTER (WHERE direction = 'inbound') as received_messages,
    COUNT(*) FILTER (WHERE ai_generated = true) as ai_generated_messages,
    AVG(CASE WHEN direction = 'outbound' AND ai_generated = true THEN 1 ELSE 0 END) as ai_automation_rate
FROM public.messages
GROUP BY user_id, DATE(created_at);

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'AI WhatsApp Automation Platform database setup completed successfully!';
    RAISE NOTICE 'Created tables: profiles, brands, ai_agents, clients, conversations, messages, schedules, content_generation, performance_reports, campaigns, settings, webhooks';
    RAISE NOTICE 'Created indexes, triggers, and sample data for development';
    RAISE NOTICE 'All Row Level Security (RLS) policies are enabled for data protection';
END $$;

-- =============================================================================
-- MIGRATION: Add social media columns to existing settings table
-- =============================================================================
-- Run this if you have an existing settings table

ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS whatsapp_verify_token TEXT,
ADD COLUMN IF NOT EXISTS facebook_access_token TEXT,
ADD COLUMN IF NOT EXISTS facebook_page_id TEXT,
ADD COLUMN IF NOT EXISTS instagram_access_token TEXT,
ADD COLUMN IF NOT EXISTS instagram_account_id TEXT,
ADD COLUMN IF NOT EXISTS twitter_api_key TEXT,
ADD COLUMN IF NOT EXISTS twitter_api_secret TEXT,
ADD COLUMN IF NOT EXISTS twitter_access_token TEXT,
ADD COLUMN IF NOT EXISTS twitter_access_token_secret TEXT,
ADD COLUMN IF NOT EXISTS linkedin_access_token TEXT,
ADD COLUMN IF NOT EXISTS linkedin_page_id TEXT,
ADD COLUMN IF NOT EXISTS tiktok_access_token TEXT,
ADD COLUMN IF NOT EXISTS youtube_api_key TEXT,
ADD COLUMN IF NOT EXISTS youtube_channel_id TEXT;

-- ============================================================================= 