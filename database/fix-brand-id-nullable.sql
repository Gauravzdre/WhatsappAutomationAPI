-- Fix content_generation table to allow nullable brand_id
-- This allows content to be saved even when user doesn't have a brand set up

-- Drop the existing constraint
ALTER TABLE public.content_generation 
DROP CONSTRAINT IF EXISTS content_generation_brand_id_fkey;

-- Modify the column to allow NULL values
ALTER TABLE public.content_generation 
ALTER COLUMN brand_id DROP NOT NULL;

-- Re-add the foreign key constraint with ON DELETE CASCADE
ALTER TABLE public.content_generation 
ADD CONSTRAINT content_generation_brand_id_fkey 
FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;

-- Verify the change
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'content_generation' 
AND column_name = 'brand_id';
