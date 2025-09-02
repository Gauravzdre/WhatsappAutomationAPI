-- Fix content loading issues in Supabase
-- Run this in the Supabase SQL Editor

-- 1. Fix content_generation table constraint to allow all content types
ALTER TABLE public.content_generation 
DROP CONSTRAINT IF EXISTS content_generation_content_type_check;

ALTER TABLE public.content_generation 
ADD CONSTRAINT content_generation_content_type_check 
CHECK (content_type IN ('social_post', 'whatsapp', 'email', 'ad_copy', 'blog', 'sms', 'image', 'text', 'video', 'upload'));

-- 2. Fix brand_id to be nullable (allow content without brands)
ALTER TABLE public.content_generation 
DROP CONSTRAINT IF EXISTS content_generation_brand_id_fkey;

ALTER TABLE public.content_generation 
ALTER COLUMN brand_id DROP NOT NULL;

ALTER TABLE public.content_generation 
ADD CONSTRAINT content_generation_brand_id_fkey 
FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;

-- 3. Ensure RLS policies are correct
DROP POLICY IF EXISTS "Users can manage own content generation" ON public.content_generation;

CREATE POLICY "Users can manage own content generation" ON public.content_generation
    FOR ALL USING (auth.uid() = user_id);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_generation_user_id ON public.content_generation(user_id);
CREATE INDEX IF NOT EXISTS idx_content_generation_brand_id ON public.content_generation(brand_id);
CREATE INDEX IF NOT EXISTS idx_content_generation_status ON public.content_generation(status);
CREATE INDEX IF NOT EXISTS idx_content_generation_created_at ON public.content_generation(created_at DESC);

-- 5. Verify the changes
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'content_generation' 
AND column_name = 'brand_id';

SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'content_generation_content_type_check';

-- 6. Test content insertion (optional - remove if not needed)
-- This will test if content can be saved successfully
DO $$
DECLARE
    test_user_id UUID := (SELECT id FROM auth.users LIMIT 1);
    test_brand_id UUID := (SELECT id FROM public.brands LIMIT 1);
    test_content_id UUID;
BEGIN
    -- Insert test content
    INSERT INTO public.content_generation (
        user_id,
        brand_id,
        content_type,
        platform,
        brief,
        generated_content,
        status,
        metadata
    ) VALUES (
        test_user_id,
        test_brand_id,
        'text',
        'test',
        'Test content for debugging',
        'This is a test content item',
        'completed',
        '{"test": true, "created_via": "sql_fix"}'::jsonb
    ) RETURNING id INTO test_content_id;
    
    -- Verify it was created
    RAISE NOTICE 'Test content created with ID: %', test_content_id;
    
    -- Clean up
    DELETE FROM public.content_generation WHERE id = test_content_id;
    RAISE NOTICE 'Test content cleaned up';
END $$;
