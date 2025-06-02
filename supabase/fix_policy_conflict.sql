-- Fix for policy conflict: "Users can view their own content" already exists
-- This script drops all existing policies and recreates them properly

-- Drop all existing brand_content policies
DROP POLICY IF EXISTS "Users can view their own content" ON brand_content;
DROP POLICY IF EXISTS "Users can insert their own content" ON brand_content;
DROP POLICY IF EXISTS "Users can update their own content" ON brand_content;
DROP POLICY IF EXISTS "Users can delete their own content" ON brand_content;

-- Drop any brand-based policies that might exist
DROP POLICY IF EXISTS "Users can view their brand content" ON brand_content;
DROP POLICY IF EXISTS "Users can insert content for their brand" ON brand_content;
DROP POLICY IF EXISTS "Users can update their brand content" ON brand_content;
DROP POLICY IF EXISTS "Users can delete their brand content" ON brand_content;

-- Create the correct policies for brand-based access
-- These policies check both user_id for backwards compatibility AND brand_id for new brand system
CREATE POLICY "Users can view their brand content" ON brand_content
  FOR SELECT USING (
    auth.uid() = user_id OR 
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert content for their brand" ON brand_content
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their brand content" ON brand_content
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their brand content" ON brand_content
  FOR DELETE USING (
    auth.uid() = user_id OR 
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  ); 