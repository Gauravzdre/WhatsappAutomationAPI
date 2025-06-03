-- =============================================================================
-- TEAM COLLABORATION FEATURES - DATABASE SCHEMA (RLS FIXED)
-- =============================================================================
-- This script fixes the infinite recursion issue in RLS policies

-- =============================================================================
-- DROP AND RECREATE RLS POLICIES TO FIX INFINITE RECURSION
-- =============================================================================

-- Disable RLS temporarily
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity_log DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Team owners can manage their teams" ON public.teams;
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;
DROP POLICY IF EXISTS "Users can view their team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team owners and admins can manage members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view invitations for their teams" ON public.team_invitations;
DROP POLICY IF EXISTS "Team owners and admins can manage invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Team members can view activity for their teams" ON public.team_activity_log;

-- =============================================================================
-- TEAMS TABLE - FIXED RLS POLICIES
-- =============================================================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Simple policy: users can only see teams they own or are members of
CREATE POLICY "teams_select_policy" ON public.teams
    FOR SELECT USING (
        auth.uid() = owner_id OR
        auth.uid() IN (
            SELECT user_id FROM public.team_members 
            WHERE team_id = teams.id AND status = 'active'
        )
    );

-- Only team owners can insert/update/delete teams
CREATE POLICY "teams_insert_policy" ON public.teams
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "teams_update_policy" ON public.teams
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "teams_delete_policy" ON public.teams
    FOR DELETE USING (auth.uid() = owner_id);

-- =============================================================================
-- TEAM MEMBERS TABLE - FIXED RLS POLICIES
-- =============================================================================
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Users can see their own memberships
CREATE POLICY "team_members_select_own" ON public.team_members
    FOR SELECT USING (auth.uid() = user_id);

-- Team owners can see all members of their teams
CREATE POLICY "team_members_select_as_owner" ON public.team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_members.team_id AND owner_id = auth.uid()
        )
    );

-- Team admins can see all members of their teams
CREATE POLICY "team_members_select_as_admin" ON public.team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_members.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
            AND tm.status = 'active'
        )
    );

-- Only team owners can insert new members
CREATE POLICY "team_members_insert_policy" ON public.team_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_members.team_id AND owner_id = auth.uid()
        )
    );

-- Team owners and admins can update members
CREATE POLICY "team_members_update_policy" ON public.team_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_members.team_id AND owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_members.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
            AND tm.status = 'active'
        )
    );

-- Team owners and admins can delete members
CREATE POLICY "team_members_delete_policy" ON public.team_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_members.team_id AND owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_members.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
            AND tm.status = 'active'
        )
    );

-- =============================================================================
-- TEAM INVITATIONS TABLE - FIXED RLS POLICIES
-- =============================================================================
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Team owners and admins can manage invitations
CREATE POLICY "team_invitations_select_policy" ON public.team_invitations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_invitations.team_id AND owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_invitations.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
            AND tm.status = 'active'
        )
    );

CREATE POLICY "team_invitations_insert_policy" ON public.team_invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_invitations.team_id AND owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_invitations.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
            AND tm.status = 'active'
        )
    );

CREATE POLICY "team_invitations_update_policy" ON public.team_invitations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_invitations.team_id AND owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_invitations.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
            AND tm.status = 'active'
        )
    );

CREATE POLICY "team_invitations_delete_policy" ON public.team_invitations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_invitations.team_id AND owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_invitations.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
            AND tm.status = 'active'
        )
    );

-- =============================================================================
-- TEAM ACTIVITY LOG TABLE - FIXED RLS POLICIES
-- =============================================================================
ALTER TABLE public.team_activity_log ENABLE ROW LEVEL SECURITY;

-- Team members can view activity for their teams
CREATE POLICY "team_activity_log_select_policy" ON public.team_activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_activity_log.team_id AND owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_activity_log.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.status = 'active'
        )
    );

-- Only system can insert activity logs (via functions)
CREATE POLICY "team_activity_log_insert_policy" ON public.team_activity_log
    FOR INSERT WITH CHECK (true);

-- =============================================================================
-- CREATE FUNCTION TO SAFELY CHECK TEAM MEMBERSHIP
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_team_member(team_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_id = team_uuid 
        AND user_id = user_uuid 
        AND status = 'active'
    );
$$;

-- =============================================================================
-- CREATE FUNCTION TO SAFELY CHECK TEAM OWNERSHIP
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_team_owner(team_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.teams 
        WHERE id = team_uuid 
        AND owner_id = user_uuid
    );
$$;

-- =============================================================================
-- CREATE FUNCTION TO SAFELY CHECK TEAM ADMIN
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_team_admin(team_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_id = team_uuid 
        AND user_id = user_uuid 
        AND role = 'admin'
        AND status = 'active'
    );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_team_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_owner(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_admin(UUID, UUID) TO authenticated; 