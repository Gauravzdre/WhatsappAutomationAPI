-- Strategy Implementation Schema
-- Phase 1: Core strategy management with enhanced template categorization

-- Core strategy management
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  business_objectives JSONB,
  target_metrics JSONB,
  content_distribution JSONB DEFAULT '{"educational": 40, "promotional": 30, "engagement": 20, "support": 10}',
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audience segmentation (Phase 1 basic version)
CREATE TABLE audience_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  criteria JSONB, -- Demographics, behavior patterns, etc.
  communication_preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content pillar analytics
CREATE TABLE content_pillar_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
  pillar_type VARCHAR(50) CHECK (pillar_type IN ('educational', 'promotional', 'engagement', 'support')),
  templates_count INTEGER DEFAULT 0,
  performance_score DECIMAL(3,2) DEFAULT 0.00,
  engagement_rate DECIMAL(5,4) DEFAULT 0.0000,
  conversion_rate DECIMAL(5,4) DEFAULT 0.0000,
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- Strategy analytics for tracking
CREATE TABLE strategy_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
  metric_type VARCHAR(100) NOT NULL, -- content_pillar, sequence_performance, etc.
  metric_data JSONB,
  calculated_for_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enhance existing templates table (check if columns exist first)
DO $$ 
BEGIN
  -- Add content_pillar column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'templates' AND column_name = 'content_pillar') THEN
    ALTER TABLE templates ADD COLUMN content_pillar VARCHAR(50) 
    CHECK (content_pillar IN ('educational', 'promotional', 'engagement', 'support'));
  END IF;

  -- Add strategy_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'templates' AND column_name = 'strategy_id') THEN
    ALTER TABLE templates ADD COLUMN strategy_id UUID REFERENCES strategies(id);
  END IF;

  -- Add performance_score column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'templates' AND column_name = 'performance_score') THEN
    ALTER TABLE templates ADD COLUMN performance_score DECIMAL(3,2) DEFAULT 0.00;
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_strategies_user ON strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_strategy ON templates(strategy_id);
CREATE INDEX IF NOT EXISTS idx_templates_pillar ON templates(content_pillar);
CREATE INDEX IF NOT EXISTS idx_content_pillar_analytics_strategy ON content_pillar_analytics(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_analytics_date ON strategy_analytics(calculated_for_date);
CREATE INDEX IF NOT EXISTS idx_audience_segments_strategy ON audience_segments(strategy_id);

-- Enable RLS on new tables
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pillar_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own strategies" ON strategies
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their strategy segments" ON audience_segments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM strategies 
      WHERE strategies.id = audience_segments.strategy_id 
      AND strategies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their content pillar analytics" ON content_pillar_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM strategies 
      WHERE strategies.id = content_pillar_analytics.strategy_id 
      AND strategies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their strategy analytics" ON strategy_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM strategies 
      WHERE strategies.id = strategy_analytics.strategy_id 
      AND strategies.user_id = auth.uid()
    )
  );

-- Create helper functions
CREATE OR REPLACE FUNCTION update_content_pillar_stats(strategy_uuid UUID)
RETURNS void AS $$
DECLARE
  pillar_type_var VARCHAR(50);
BEGIN
  -- Update content pillar analytics based on templates
  FOR pillar_type_var IN SELECT UNNEST(ARRAY['educational', 'promotional', 'engagement', 'support'])
  LOOP
    INSERT INTO content_pillar_analytics (strategy_id, pillar_type, templates_count, calculated_at)
    SELECT 
      strategy_uuid,
      pillar_type_var,
      COUNT(*),
      NOW()
    FROM templates 
    WHERE strategy_id = strategy_uuid AND content_pillar = pillar_type_var
    ON CONFLICT (strategy_id, pillar_type) 
    DO UPDATE SET 
      templates_count = EXCLUDED.templates_count,
      calculated_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update analytics when templates change
CREATE OR REPLACE FUNCTION trigger_update_pillar_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.strategy_id IS NOT NULL THEN
      PERFORM update_content_pillar_stats(NEW.strategy_id);
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.strategy_id IS NOT NULL THEN
      PERFORM update_content_pillar_stats(OLD.strategy_id);
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pillar_stats_trigger') THEN
    CREATE TRIGGER update_pillar_stats_trigger
      AFTER INSERT OR UPDATE OR DELETE ON templates
      FOR EACH ROW
      EXECUTE FUNCTION trigger_update_pillar_stats();
  END IF;
END $$; 