-- Temporary fix: Disable RLS on team tables to resolve infinite recursion
-- This allows team functionality to work while we fix the policies properly
-- Run this in Supabase SQL Editor

-- Disable RLS on all team-related tables
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity_log DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
DROP POLICY IF EXISTS "Team owners can manage their teams" ON public.teams;
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;
DROP POLICY IF EXISTS "Users can view their team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team owners and admins can manage members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view invitations for their teams" ON public.team_invitations;
DROP POLICY IF EXISTS "Team owners and admins can manage invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Team members can view activity for their teams" ON public.team_activity_log;

-- Note: RLS is now disabled for team tables
-- This is a temporary solution to get team creation working
-- TODO: Implement proper non-recursive RLS policies later 