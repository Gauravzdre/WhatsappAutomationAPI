-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE, -- One brand per user
  name VARCHAR(255) NOT NULL,
  description TEXT,
  industry VARCHAR(100),
  target_audience TEXT,
  brand_voice VARCHAR(50), -- casual, professional, friendly, etc.
  brand_colors JSONB, -- Array of brand colors
  logo_url TEXT,
  website VARCHAR(255),
  social_links JSONB, -- Object with social media links
  business_goals TEXT,
  unique_value_proposition TEXT,
  brand_guidelines TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI chat conversations table
CREATE TABLE IF NOT EXISTS brand_chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  chat_type VARCHAR(50) NOT NULL CHECK (chat_type IN ('scaling', 'sales_strategy', 'content_strategy')),
  title VARCHAR(255),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of chat messages
  context_data JSONB, -- Related content/data that initiated the chat
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add brand_id to existing tables
ALTER TABLE clients ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE brand_content ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_brand_id ON brand_chat_conversations(brand_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_type ON brand_chat_conversations(chat_type);
CREATE INDEX IF NOT EXISTS idx_clients_brand_id ON clients(brand_id);
CREATE INDEX IF NOT EXISTS idx_schedules_brand_id ON schedules(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_content_brand_id ON brand_content(brand_id);

-- Enable RLS for new tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_chat_conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for brands
CREATE POLICY "Users can view their own brand" ON brands
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand" ON brands
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand" ON brands
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand" ON brands
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for chat conversations
CREATE POLICY "Users can view their brand chats" ON brand_chat_conversations
  FOR SELECT USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert chats for their brand" ON brand_chat_conversations
  FOR INSERT WITH CHECK (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their brand chats" ON brand_chat_conversations
  FOR UPDATE USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their brand chats" ON brand_chat_conversations
  FOR DELETE USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

-- Update existing RLS policies to include brand context
-- Update clients policies
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;

CREATE POLICY "Users can view their brand clients" ON clients
  FOR SELECT USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert clients for their brand" ON clients
  FOR INSERT WITH CHECK (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their brand clients" ON clients
  FOR UPDATE USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their brand clients" ON clients
  FOR DELETE USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

-- Update schedules policies
DROP POLICY IF EXISTS "Users can view their own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can insert their own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can update their own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can delete their own schedules" ON schedules;

CREATE POLICY "Users can view their brand schedules" ON schedules
  FOR SELECT USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert schedules for their brand" ON schedules
  FOR INSERT WITH CHECK (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their brand schedules" ON schedules
  FOR UPDATE USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their brand schedules" ON schedules
  FOR DELETE USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

-- Update brand_content policies
DROP POLICY IF EXISTS "Users can view their own content" ON brand_content;
DROP POLICY IF EXISTS "Users can insert their own content" ON brand_content;
DROP POLICY IF EXISTS "Users can update their own content" ON brand_content;
DROP POLICY IF EXISTS "Users can delete their own content" ON brand_content;

-- Also drop any potential brand-based policies that might exist
DROP POLICY IF EXISTS "Users can view their brand content" ON brand_content;
DROP POLICY IF EXISTS "Users can insert content for their brand" ON brand_content;
DROP POLICY IF EXISTS "Users can update their brand content" ON brand_content;
DROP POLICY IF EXISTS "Users can delete their brand content" ON brand_content;

CREATE POLICY "Users can view their brand content" ON brand_content
  FOR SELECT USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert content for their brand" ON brand_content
  FOR INSERT WITH CHECK (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their brand content" ON brand_content
  FOR UPDATE USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their brand content" ON brand_content
  FOR DELETE USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_brands_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_chat_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_brands_updated_at_trigger
  BEFORE UPDATE ON brands 
  FOR EACH ROW 
  EXECUTE FUNCTION update_brands_updated_at();

CREATE TRIGGER update_chat_conversations_updated_at_trigger
  BEFORE UPDATE ON brand_chat_conversations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_chat_conversations_updated_at(); 