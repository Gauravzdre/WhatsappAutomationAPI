-- Create brand_content table for storing generated content
CREATE TABLE IF NOT EXISTS brand_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('text', 'image', 'upload')),
  title VARCHAR(255),
  text_content TEXT,
  image_url TEXT,
  image_data JSONB, -- For storing image metadata (original filename, size, etc.)
  platform VARCHAR(50),
  metadata JSONB, -- For storing additional data like generation params, style, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brand_content_user_id ON brand_content(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_content_type ON brand_content(content_type);
CREATE INDEX IF NOT EXISTS idx_brand_content_platform ON brand_content(platform);
CREATE INDEX IF NOT EXISTS idx_brand_content_created_at ON brand_content(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE brand_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (with DROP IF EXISTS to prevent conflicts)
DROP POLICY IF EXISTS "Users can view their own content" ON brand_content;
CREATE POLICY "Users can view their own content" ON brand_content
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own content" ON brand_content;
CREATE POLICY "Users can insert their own content" ON brand_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own content" ON brand_content;
CREATE POLICY "Users can update their own content" ON brand_content
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own content" ON brand_content;
CREATE POLICY "Users can delete their own content" ON brand_content
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at updates
CREATE TRIGGER update_brand_content_updated_at 
  BEFORE UPDATE ON brand_content 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 