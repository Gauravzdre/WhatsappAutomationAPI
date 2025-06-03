-- =============================================================================
-- SMART SCHEDULING SYSTEM DATABASE SCHEMA
-- =============================================================================
-- This schema adds AI-powered scheduling optimization capabilities

-- Add AI optimization fields to existing schedules table
ALTER TABLE public.schedules 
ADD COLUMN IF NOT EXISTS ai_optimized BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS optimization_settings JSONB,
ADD COLUMN IF NOT EXISTS original_cron TEXT,
ADD COLUMN IF NOT EXISTS optimization_confidence DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS expected_engagement DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS optimization_reasoning TEXT,
ADD COLUMN IF NOT EXISTS last_optimized_at TIMESTAMP WITH TIME ZONE;

-- Create audience insights table for behavior analysis
CREATE TABLE IF NOT EXISTS public.audience_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    most_active_hours INTEGER[] DEFAULT '{}',
    most_active_days TEXT[] DEFAULT '{}',
    engagement_patterns JSONB DEFAULT '{}',
    time_zone TEXT DEFAULT 'UTC',
    average_response_time INTEGER DEFAULT 0, -- in seconds
    total_messages_analyzed INTEGER DEFAULT 0,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one insight record per user/brand per day
    UNIQUE(user_id, brand_id, analysis_date)
);

-- Create schedule optimization history table
CREATE TABLE IF NOT EXISTS public.schedule_optimization_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    optimization_type TEXT NOT NULL CHECK (optimization_type IN ('ai_recommendation', 'manual_adjustment', 'bulk_optimization')),
    original_cron TEXT NOT NULL,
    optimized_cron TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    expected_engagement DECIMAL(3,2),
    reasoning TEXT,
    optimization_settings JSONB DEFAULT '{}',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    performance_data JSONB DEFAULT '{}' -- Track actual performance vs predictions
);

-- Create engagement tracking table for learning
CREATE TABLE IF NOT EXISTS public.message_engagement_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    message_content TEXT,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_time TIME NOT NULL,
    day_of_week INTEGER NOT NULL, -- 0-6 (Sunday-Saturday)
    response_received BOOLEAN DEFAULT FALSE,
    response_time INTEGER, -- seconds until response
    engagement_score DECIMAL(3,2) DEFAULT 0.0, -- 0-1 scale
    was_ai_optimized BOOLEAN DEFAULT FALSE,
    optimization_confidence DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create smart scheduling configurations table
CREATE TABLE IF NOT EXISTS public.smart_scheduling_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    auto_optimization_enabled BOOLEAN DEFAULT TRUE,
    optimization_frequency TEXT DEFAULT 'weekly' CHECK (optimization_frequency IN ('daily', 'weekly', 'monthly')),
    min_confidence_threshold DECIMAL(3,2) DEFAULT 0.7,
    learning_period_days INTEGER DEFAULT 30,
    preferred_time_ranges JSONB DEFAULT '{}', -- User-defined time preferences
    excluded_time_ranges JSONB DEFAULT '{}', -- Times to avoid
    audience_segments JSONB DEFAULT '{}', -- Custom audience segmentation
    optimization_goals JSONB DEFAULT '{}', -- engagement, response_rate, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One config per user/brand combination
    UNIQUE(user_id, brand_id)
);

-- Enable Row Level Security
ALTER TABLE public.audience_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_optimization_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_engagement_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_scheduling_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audience_insights
CREATE POLICY "Users can view their own audience insights" ON public.audience_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audience insights" ON public.audience_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audience insights" ON public.audience_insights
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audience insights" ON public.audience_insights
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for schedule_optimization_history
CREATE POLICY "Users can view their own optimization history" ON public.schedule_optimization_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own optimization history" ON public.schedule_optimization_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for message_engagement_tracking
CREATE POLICY "Users can view their own engagement tracking" ON public.message_engagement_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own engagement tracking" ON public.message_engagement_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own engagement tracking" ON public.message_engagement_tracking
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for smart_scheduling_config
CREATE POLICY "Users can view their own scheduling config" ON public.smart_scheduling_config
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduling config" ON public.smart_scheduling_config
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduling config" ON public.smart_scheduling_config
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduling config" ON public.smart_scheduling_config
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audience_insights_user_brand_date 
    ON public.audience_insights(user_id, brand_id, analysis_date);

CREATE INDEX IF NOT EXISTS idx_schedule_optimization_history_schedule 
    ON public.schedule_optimization_history(schedule_id);

CREATE INDEX IF NOT EXISTS idx_message_engagement_tracking_user_sent_at 
    ON public.message_engagement_tracking(user_id, sent_at);

CREATE INDEX IF NOT EXISTS idx_message_engagement_tracking_schedule 
    ON public.message_engagement_tracking(schedule_id);

CREATE INDEX IF NOT EXISTS idx_smart_scheduling_config_user_brand 
    ON public.smart_scheduling_config(user_id, brand_id);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_audience_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_smart_scheduling_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_audience_insights_updated_at ON public.audience_insights;
CREATE TRIGGER trigger_update_audience_insights_updated_at
    BEFORE UPDATE ON public.audience_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_audience_insights_updated_at();

DROP TRIGGER IF EXISTS trigger_update_smart_scheduling_config_updated_at ON public.smart_scheduling_config;
CREATE TRIGGER trigger_update_smart_scheduling_config_updated_at
    BEFORE UPDATE ON public.smart_scheduling_config
    FOR EACH ROW
    EXECUTE FUNCTION update_smart_scheduling_config_updated_at();

-- Insert default smart scheduling configurations for existing users
INSERT INTO public.smart_scheduling_config (user_id, auto_optimization_enabled, optimization_frequency, min_confidence_threshold)
SELECT DISTINCT user_id, TRUE, 'weekly', 0.7
FROM public.schedules
WHERE NOT EXISTS (
    SELECT 1 FROM public.smart_scheduling_config 
    WHERE smart_scheduling_config.user_id = schedules.user_id
)
ON CONFLICT (user_id, brand_id) DO NOTHING;

-- Create a view for schedule analytics
CREATE OR REPLACE VIEW public.schedule_performance_analytics AS
SELECT 
    s.id as schedule_id,
    s.user_id,
    s.client_id,
    s.message,
    s.cron,
    s.ai_optimized,
    s.optimization_confidence,
    s.expected_engagement,
    COUNT(met.id) as total_messages_sent,
    AVG(met.engagement_score) as avg_engagement_score,
    AVG(met.response_time) as avg_response_time,
    COUNT(CASE WHEN met.response_received THEN 1 END) as responses_received,
    ROUND(
        COUNT(CASE WHEN met.response_received THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(met.id), 0) * 100, 2
    ) as response_rate_percentage
FROM public.schedules s
LEFT JOIN public.message_engagement_tracking met ON s.id = met.schedule_id
GROUP BY s.id, s.user_id, s.client_id, s.message, s.cron, s.ai_optimized, s.optimization_confidence, s.expected_engagement;

-- Grant permissions
GRANT SELECT ON public.schedule_performance_analytics TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.audience_insights IS 'Stores analyzed audience behavior patterns for smart scheduling optimization';
COMMENT ON TABLE public.schedule_optimization_history IS 'Tracks all schedule optimization changes and their performance';
COMMENT ON TABLE public.message_engagement_tracking IS 'Records message engagement data for machine learning and optimization';
COMMENT ON TABLE public.smart_scheduling_config IS 'User preferences and settings for smart scheduling features';
COMMENT ON VIEW public.schedule_performance_analytics IS 'Aggregated view of schedule performance metrics for analytics'; 