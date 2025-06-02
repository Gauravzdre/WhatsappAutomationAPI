-- =============================================================================
-- DATABASE CLEANUP SCRIPT
-- =============================================================================
-- Run this BEFORE the main setup.sql to clean existing tables
-- This will remove all data - only use in development!

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS public.message_analytics;
DROP VIEW IF EXISTS public.dashboard_stats;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.webhooks CASCADE;
DROP TABLE IF EXISTS public.performance_reports CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.content_generation CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.ai_agents CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop any existing brand_content table from previous setup
DROP TABLE IF EXISTS public.brand_content CASCADE;

-- Drop any custom functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Clean up any remaining policies (RLS)
-- Note: Policies are automatically dropped with tables

-- Reset sequences if any
-- DROP SEQUENCE IF EXISTS public.any_sequence_name;

-- Completion message
DO $$
BEGIN
    RAISE NOTICE 'Database cleanup completed successfully!';
    RAISE NOTICE 'All existing tables, views, and functions have been removed.';
    RAISE NOTICE 'You can now run the main setup.sql script.';
END $$; 