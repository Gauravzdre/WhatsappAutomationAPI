-- Quick fix for infinite recursion in RLS policies
-- Run this in Supabase SQL Editor

-- Disable RLS temporarily
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity_log DISABLE ROW LEVEL SECURITY;

-- Drop problematic policies
DROP POLICY IF EXISTS "Team owners can manage their teams" ON public.teams;
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;
DROP POLICY IF EXISTS "Users can view their team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team owners and admins can manage members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view invitations for their teams" ON public.team_invitations;
DROP POLICY IF EXISTS "Team owners and admins can manage invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Team members can view activity for their teams" ON public.team_activity_log;

-- Re-enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity_log ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for teams
CREATE POLICY "teams_owner_access" ON public.teams
    FOR ALL USING (auth.uid() = owner_id);

-- Create simple policies for team_members
CREATE POLICY "team_members_own_access" ON public.team_members
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "team_members_owner_access" ON public.team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_members.team_id AND owner_id = auth.uid()
        )
    );

-- Create simple policies for team_invitations
CREATE POLICY "team_invitations_owner_access" ON public.team_invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_invitations.team_id AND owner_id = auth.uid()
        )
    );

-- Create simple policies for team_activity_log
CREATE POLICY "team_activity_owner_access" ON public.team_activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_activity_log.team_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "team_activity_insert_access" ON public.team_activity_log
    FOR INSERT WITH CHECK (true); 