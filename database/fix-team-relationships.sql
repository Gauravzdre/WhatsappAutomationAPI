-- =============================================================================
-- FIX TEAM COLLABORATION FOREIGN KEY RELATIONSHIPS
-- =============================================================================
-- This script fixes the foreign key relationships to use profiles table
-- instead of auth.users for better Supabase compatibility

-- First, ensure profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- =============================================================================
-- UPDATE TEAM TABLES TO USE PROFILES INSTEAD OF AUTH.USERS
-- =============================================================================

-- Drop existing foreign key constraints that reference auth.users
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_owner_id_fkey;
ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_user_id_fkey;
ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_invited_by_fkey;
ALTER TABLE public.team_invitations DROP CONSTRAINT IF EXISTS team_invitations_invited_by_fkey;
ALTER TABLE public.team_activity_log DROP CONSTRAINT IF EXISTS team_activity_log_user_id_fkey;

-- Add new foreign key constraints that reference profiles
ALTER TABLE public.teams 
    ADD CONSTRAINT teams_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.team_members 
    ADD CONSTRAINT team_members_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.team_members 
    ADD CONSTRAINT team_members_invited_by_fkey 
    FOREIGN KEY (invited_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.team_invitations 
    ADD CONSTRAINT team_invitations_invited_by_fkey 
    FOREIGN KEY (invited_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.team_activity_log 
    ADD CONSTRAINT team_activity_log_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- =============================================================================
-- CREATE TRIGGER TO AUTO-CREATE PROFILES FOR NEW USERS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- UPDATE VIEWS TO USE PROFILES
-- =============================================================================
DROP VIEW IF EXISTS public.team_member_summary;
CREATE OR REPLACE VIEW public.team_member_summary AS
SELECT 
    tm.id,
    tm.team_id,
    tm.user_id,
    p.email,
    p.full_name,
    p.avatar_url,
    tm.role,
    tm.status,
    tm.permissions,
    tm.joined_at,
    tm.last_active,
    tm.created_at
FROM public.team_members tm
JOIN public.profiles p ON tm.user_id = p.id;

DROP VIEW IF EXISTS public.team_activity_summary;
CREATE OR REPLACE VIEW public.team_activity_summary AS
SELECT 
    tal.id,
    tal.team_id,
    tal.user_id,
    p.email,
    p.full_name,
    tal.action,
    tal.resource_type,
    tal.resource_id,
    tal.details,
    tal.created_at
FROM public.team_activity_log tal
LEFT JOIN public.profiles p ON tal.user_id = p.id
ORDER BY tal.created_at DESC;

-- =============================================================================
-- REFRESH SCHEMA CACHE
-- =============================================================================
-- Force Supabase to refresh its schema cache
NOTIFY pgrst, 'reload schema'; 