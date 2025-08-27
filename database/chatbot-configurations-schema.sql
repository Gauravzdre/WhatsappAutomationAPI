-- =============================================================================
-- CHATBOT CONFIGURATIONS DATABASE SCHEMA
-- =============================================================================
-- Inspired by Hexabot's multi-channel, multi-lingual chatbot framework
-- This schema stores user requirements and generated configurations for intelligent chatbots

-- Create chatbot_configurations table for storing complete chatbot setups
CREATE TABLE IF NOT EXISTS public.chatbot_configurations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'configuring', 'training', 'ready', 'deployed')) DEFAULT 'draft',
    
    -- Store complete requirements as JSONB for flexibility
    requirements JSONB NOT NULL DEFAULT '{}',
    
    -- Store generated configuration
    generated_config JSONB NOT NULL DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for common queries
    CONSTRAINT chatbot_configurations_name_check CHECK (char_length(name) >= 1)
);

-- Create chatbot_knowledge_base table for storing knowledge base entries
CREATE TABLE IF NOT EXISTS public.chatbot_knowledge_base (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chatbot_id UUID NOT NULL REFERENCES public.chatbot_configurations(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Full-text search support
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
        setweight(to_tsvector('english', array_to_string(tags, ' ')), 'C')
    ) STORED
);

-- Create chatbot_conversation_flows table for storing conversation flows
CREATE TABLE IF NOT EXISTS public.chatbot_conversation_flows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chatbot_id UUID NOT NULL REFERENCES public.chatbot_configurations(id) ON DELETE CASCADE,
    flow_id TEXT NOT NULL,
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    trigger_value TEXT,
    steps JSONB NOT NULL DEFAULT '[]',
    
    -- Flow metadata
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique flow_id per chatbot
    UNIQUE(chatbot_id, flow_id)
);

-- Create chatbot_user_segments table for user segmentation (inspired by Hexabot's labels)
CREATE TABLE IF NOT EXISTS public.chatbot_user_segments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chatbot_id UUID NOT NULL REFERENCES public.chatbot_configurations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    criteria TEXT NOT NULL,
    description TEXT,
    
    -- Segment configuration
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique segment name per chatbot
    UNIQUE(chatbot_id, name)
);

-- Create chatbot_integrations table for storing integration configurations
CREATE TABLE IF NOT EXISTS public.chatbot_integrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chatbot_id UUID NOT NULL REFERENCES public.chatbot_configurations(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL,
    integration_name TEXT NOT NULL,
    configuration JSONB NOT NULL DEFAULT '{}',
    
    -- Integration status
    is_enabled BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique integration per chatbot
    UNIQUE(chatbot_id, integration_type, integration_name)
);

-- Create chatbot_analytics table for storing analytics configuration
CREATE TABLE IF NOT EXISTS public.chatbot_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chatbot_id UUID NOT NULL REFERENCES public.chatbot_configurations(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    configuration JSONB NOT NULL DEFAULT '{}',
    
    -- Analytics settings
    is_enabled BOOLEAN DEFAULT true,
    reporting_frequency TEXT DEFAULT 'daily',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique metric per chatbot
    UNIQUE(chatbot_id, metric_name)
);

-- Create chatbot_deployments table for tracking deployments across channels
CREATE TABLE IF NOT EXISTS public.chatbot_deployments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chatbot_id UUID NOT NULL REFERENCES public.chatbot_configurations(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    deployment_status TEXT NOT NULL CHECK (deployment_status IN ('pending', 'deploying', 'active', 'paused', 'failed')) DEFAULT 'pending',
    
    -- Deployment configuration
    channel_config JSONB NOT NULL DEFAULT '{}',
    webhook_url TEXT,
    api_credentials JSONB DEFAULT '{}',
    
    -- Deployment metadata
    deployed_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique deployment per chatbot per channel
    UNIQUE(chatbot_id, channel)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Indexes for chatbot_configurations
CREATE INDEX IF NOT EXISTS idx_chatbot_configurations_status ON public.chatbot_configurations(status);
CREATE INDEX IF NOT EXISTS idx_chatbot_configurations_industry ON public.chatbot_configurations(industry);
CREATE INDEX IF NOT EXISTS idx_chatbot_configurations_created_at ON public.chatbot_configurations(created_at DESC);

-- Indexes for chatbot_knowledge_base
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_base_chatbot_id ON public.chatbot_knowledge_base(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_base_category ON public.chatbot_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_base_search ON public.chatbot_knowledge_base USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_base_tags ON public.chatbot_knowledge_base USING GIN(tags);

-- Indexes for chatbot_conversation_flows
CREATE INDEX IF NOT EXISTS idx_chatbot_conversation_flows_chatbot_id ON public.chatbot_conversation_flows(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversation_flows_trigger ON public.chatbot_conversation_flows(trigger_type, trigger_value);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversation_flows_active ON public.chatbot_conversation_flows(chatbot_id, is_active);

-- Indexes for chatbot_user_segments
CREATE INDEX IF NOT EXISTS idx_chatbot_user_segments_chatbot_id ON public.chatbot_user_segments(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_user_segments_active ON public.chatbot_user_segments(chatbot_id, is_active);

-- Indexes for chatbot_integrations
CREATE INDEX IF NOT EXISTS idx_chatbot_integrations_chatbot_id ON public.chatbot_integrations(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_integrations_type ON public.chatbot_integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_chatbot_integrations_enabled ON public.chatbot_integrations(chatbot_id, is_enabled);

-- Indexes for chatbot_analytics
CREATE INDEX IF NOT EXISTS idx_chatbot_analytics_chatbot_id ON public.chatbot_analytics(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_analytics_enabled ON public.chatbot_analytics(chatbot_id, is_enabled);

-- Indexes for chatbot_deployments
CREATE INDEX IF NOT EXISTS idx_chatbot_deployments_chatbot_id ON public.chatbot_deployments(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_deployments_channel ON public.chatbot_deployments(channel);
CREATE INDEX IF NOT EXISTS idx_chatbot_deployments_status ON public.chatbot_deployments(deployment_status);

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

-- Triggers for updated_at
CREATE TRIGGER update_chatbot_configurations_updated_at 
    BEFORE UPDATE ON public.chatbot_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_knowledge_base_updated_at 
    BEFORE UPDATE ON public.chatbot_knowledge_base 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_conversation_flows_updated_at 
    BEFORE UPDATE ON public.chatbot_conversation_flows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_user_segments_updated_at 
    BEFORE UPDATE ON public.chatbot_user_segments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_integrations_updated_at 
    BEFORE UPDATE ON public.chatbot_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_analytics_updated_at 
    BEFORE UPDATE ON public.chatbot_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_deployments_updated_at 
    BEFORE UPDATE ON public.chatbot_deployments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.chatbot_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_user_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_deployments ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on your auth system)
-- For now, allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON public.chatbot_configurations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.chatbot_knowledge_base
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.chatbot_conversation_flows
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.chatbot_user_segments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.chatbot_integrations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.chatbot_analytics
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.chatbot_deployments
    FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================================================

-- Insert a sample chatbot configuration
INSERT INTO public.chatbot_configurations (
    name,
    description,
    industry,
    status,
    requirements,
    generated_config
) VALUES (
    'ClientPing Demo Bot',
    'A sample chatbot for demonstrating ClientPing capabilities',
    'Technology',
    'ready',
    '{
        "name": "ClientPing Demo Bot",
        "description": "A sample chatbot for demonstrating ClientPing capabilities",
        "industry": "Technology",
        "businessType": "SaaS Platform",
        "channels": ["telegram", "whatsapp"],
        "primaryChannel": "telegram",
        "languages": ["English"],
        "defaultLanguage": "English",
        "useCases": ["customer_support", "lead_generation"],
        "customUseCases": [],
        "hasKnowledgeBase": true,
        "businessData": {
            "products": "ClientPing - WhatsApp AI Automation Platform",
            "services": "Chatbot creation, automation, analytics",
            "policies": "24/7 support, 30-day free trial",
            "faqs": "How to create a chatbot? What channels are supported?"
        },
        "userSegments": [],
        "conversationStyle": "helpful",
        "responseTime": "fast",
        "escalationRules": ["Complex technical issues", "Billing problems"],
        "integrations": ["analytics"],
        "customIntegrations": [],
        "analyticsNeeds": ["conversation_volume", "user_satisfaction"],
        "reportingFrequency": "daily",
        "advancedFeatures": ["quick_replies", "typing_indicators"],
        "customFeatures": []
    }',
    '{
        "systemPrompt": "You are ClientPing Demo Bot, an intelligent AI assistant for a SaaS Platform business in the Technology industry. Communication Style: Focus on being helpful and supportive to users. Your primary responsibilities include: - Provide customer support and answer questions - Generate and qualify leads for the business. Escalation Guidelines: When encountering the following situations, offer to connect the user with a human agent: - Complex technical issues - Billing problems. Always be helpful, accurate, and aligned with the business goals.",
        "conversationFlow": [
            {
                "id": "welcome",
                "name": "Welcome Message",
                "trigger": "conversation_start",
                "steps": [
                    {
                        "type": "message",
                        "content": "Hello! I am ClientPing Demo Bot, your AI assistant. How can I help you today?"
                    }
                ]
            }
        ],
        "knowledgeBase": [
            {
                "category": "products",
                "title": "Product Information",
                "content": "ClientPing - WhatsApp AI Automation Platform",
                "tags": ["products", "catalog", "inventory"]
            }
        ],
        "integrationSettings": {
            "analytics": {
                "enabled": true,
                "type": "tracking",
                "events": ["conversation_started", "goal_completed"]
            }
        },
        "analyticsConfig": {
            "trackingEnabled": true,
            "metrics": ["conversation_volume", "user_satisfaction"],
            "reportingFrequency": "daily",
            "dashboards": ["conversation_volume", "user_satisfaction", "response_accuracy", "conversion_rates"]
        }
    }'
) ON CONFLICT DO NOTHING;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.chatbot_configurations IS 'Main table storing chatbot configurations and requirements inspired by Hexabot framework';
COMMENT ON TABLE public.chatbot_knowledge_base IS 'Knowledge base entries for chatbots, similar to Hexabot knowledge base feature';
COMMENT ON TABLE public.chatbot_conversation_flows IS 'Conversation flows and dialog management, inspired by Hexabot visual editor';
COMMENT ON TABLE public.chatbot_user_segments IS 'User segmentation and labeling system, inspired by Hexabot user labels';
COMMENT ON TABLE public.chatbot_integrations IS 'Integration configurations, inspired by Hexabot plugin system';
COMMENT ON TABLE public.chatbot_analytics IS 'Analytics configuration, inspired by Hexabot analytics dashboard';
COMMENT ON TABLE public.chatbot_deployments IS 'Multi-channel deployment tracking, inspired by Hexabot multi-channel support'; 