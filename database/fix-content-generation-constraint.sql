-- Fix content_generation table constraint to allow 'image' and 'text' content types
-- Run this script to update the existing database schema

-- Drop the existing constraint
ALTER TABLE public.content_generation 
DROP CONSTRAINT IF EXISTS content_generation_content_type_check;

-- Add the new constraint with additional content types
ALTER TABLE public.content_generation 
ADD CONSTRAINT content_generation_content_type_check 
CHECK (content_type IN ('social_post', 'whatsapp', 'email', 'ad_copy', 'blog', 'sms', 'image', 'text'));

-- Verify the change
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'content_generation_content_type_check';

