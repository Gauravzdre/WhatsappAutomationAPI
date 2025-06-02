-- Enhanced AI-Powered WhatsApp Automation Schema
-- This migration adds all tables for AI agents, campaigns, analytics, and advanced features

-- AI Agents and Sessions
CREATE TABLE IF NOT EXISTS ai_agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'brand_persona', 'content_creator', 'scheduler', 'sales', 'analytics'
    julep_agent_id VARCHAR(255) UNIQUE,
    configuration JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'archived'
    memory_context JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    julep_session_id VARCHAR(255) UNIQUE,
    context JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Brand Management
CREATE TABLE IF NOT EXISTS brands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    description TEXT,
    brand_voice JSONB DEFAULT '{}', -- tone, personality, keywords
    visual_identity JSONB DEFAULT '{}', -- colors, fonts, logo_url
    target_audience JSONB DEFAULT '{}',
    brand_guidelines TEXT,
    ai_persona_agent_id UUID REFERENCES ai_agents(id),
    performance_score DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advanced Content Management
CREATE TABLE IF NOT EXISTS content_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'whatsapp', 'social_post', 'email', 'ad_copy'
    platform VARCHAR(50), -- 'instagram', 'facebook', 'twitter', 'linkedin'
    template_content TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- Dynamic variables
    ai_generated BOOLEAN DEFAULT false,
    performance_score DECIMAL(3,2) DEFAULT 0.00,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50), -- 'product_launch', 'seasonal', 'engagement', 'lead_gen'
    target_audience JSONB DEFAULT '{}',
    goals JSONB DEFAULT '{}', -- reach, engagement, conversions
    content_strategy JSONB DEFAULT '{}',
    ai_orchestrator_agent_id UUID REFERENCES ai_agents(id),
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10,2),
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Scheduling System
CREATE TABLE IF NOT EXISTS schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES content_campaigns(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    message_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'video', 'document'
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    target_audience JSONB DEFAULT '{}',
    platform VARCHAR(50) DEFAULT 'whatsapp', -- 'whatsapp', 'instagram', 'facebook', 'twitter'
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    optimal_time_suggestion TIMESTAMP WITH TIME ZONE,
    ai_optimized BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
    engagement_prediction JSONB DEFAULT '{}',
    actual_performance JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advanced Customer Management
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    profile JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    interaction_history JSONB DEFAULT '[]',
    lead_score INTEGER DEFAULT 0,
    lifecycle_stage VARCHAR(50) DEFAULT 'lead', -- 'lead', 'prospect', 'customer', 'advocate'
    last_interaction TIMESTAMP WITH TIME ZONE,
    ai_insights JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WhatsApp Triggers and Automation
CREATE TABLE IF NOT EXISTS whatsapp_triggers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL, -- 'keyword', 'time_based', 'behavior', 'event'
    trigger_conditions JSONB NOT NULL,
    response_type VARCHAR(50) NOT NULL, -- 'preset', 'ai_generated', 'handoff'
    preset_responses JSONB DEFAULT '[]',
    ai_sales_agent_id UUID REFERENCES ai_agents(id),
    personalization_level VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    success_metrics JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation Management
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    ai_agent_id UUID REFERENCES ai_agents(id),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'waiting', 'closed', 'escalated'
    context JSONB DEFAULT '{}',
    sentiment_score DECIMAL(3,2) DEFAULT 0.00,
    intent_analysis JSONB DEFAULT '{}',
    handoff_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'customer', 'ai', 'human'
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'video', 'document'
    metadata JSONB DEFAULT '{}',
    ai_confidence DECIMAL(3,2),
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics and Insights
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    source VARCHAR(50), -- 'whatsapp', 'instagram', 'facebook', 'website'
    session_id VARCHAR(255),
    customer_id UUID REFERENCES customers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS performance_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'campaign'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    metrics JSONB NOT NULL,
    insights JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    ai_generated BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_agents_user_id ON ai_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_type ON ai_agents(type);
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_content_campaigns_brand_id ON content_campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_scheduled_time ON schedules(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_customers_phone_number ON customers(phone_number);
CREATE INDEX IF NOT EXISTS idx_customers_brand_id ON customers(brand_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_brand_id ON analytics_events(brand_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- RLS Policies
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables (user can only access their own data)
DO $$
DECLARE
    table_name text;
    tables text[] := ARRAY['ai_agents', 'ai_sessions', 'brands', 'content_templates', 'content_campaigns', 'schedules', 'customers', 'whatsapp_triggers', 'conversations', 'messages', 'analytics_events', 'performance_reports'];
BEGIN
    FOREACH table_name IN ARRAY tables
    LOOP
        EXECUTE format('
            CREATE POLICY %I_user_access ON %I 
            FOR ALL USING (user_id = auth.uid())', 
            table_name || '_policy', table_name);
    END LOOP;
END $$;

-- Special policies for related tables
CREATE POLICY content_templates_brand_access ON content_templates 
FOR ALL USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY whatsapp_triggers_brand_access ON whatsapp_triggers 
FOR ALL USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY conversations_brand_access ON conversations 
FOR ALL USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY messages_conversation_access ON messages 
FOR ALL USING (conversation_id IN (
    SELECT id FROM conversations WHERE brand_id IN (
        SELECT id FROM brands WHERE user_id = auth.uid()
    )
)); 