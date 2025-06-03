-- =============================================================================
-- TEAM COLLABORATION FEATURES - DATABASE SCHEMA (SUPABASE COMPATIBLE)
-- =============================================================================
-- This script adds team collaboration functionality to the existing platform
-- Run this after the main setup.sql

-- =============================================================================
-- CREATE ALL TABLES FIRST (WITHOUT POLICIES)
-- =============================================================================

-- TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
    max_members INTEGER DEFAULT 5,
    settings JSONB DEFAULT '{
        "allow_member_invites": true,
        "require_approval": false,
        "default_role": "member",
        "brand_access": "shared"
    }'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
    permissions JSONB DEFAULT '{
        "brands": {"read": true, "write": false, "delete": false},
        "clients": {"read": true, "write": false, "delete": false},
        "messages": {"read": true, "write": false, "delete": false},
        "schedules": {"read": true, "write": false, "delete": false},
        "analytics": {"read": true, "write": false, "delete": false},
        "team": {"read": true, "write": false, "delete": false}
    }'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- TEAM INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.team_invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
    invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TEAM ACTIVITY LOG TABLE
CREATE TABLE IF NOT EXISTS public.team_activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DROP EXISTING POLICIES (IF ANY)
-- =============================================================================
DROP POLICY IF EXISTS "Team owners can manage their teams" ON public.teams;
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;
DROP POLICY IF EXISTS "Users can view their team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team owners and admins can manage members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view invitations for their teams" ON public.team_invitations;
DROP POLICY IF EXISTS "Team owners and admins can manage invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Team members can view activity for their teams" ON public.team_activity_log;

-- =============================================================================
-- CREATE POLICIES (NOW THAT ALL TABLES EXIST)
-- =============================================================================

-- Teams policies
CREATE POLICY "Team owners can manage their teams" ON public.teams
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Team members can view their teams" ON public.teams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_id = teams.id AND user_id = auth.uid()
        )
    );

-- Team members policies
CREATE POLICY "Users can view their team memberships" ON public.team_members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Team owners and admins can manage members" ON public.team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_members.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role IN ('owner', 'admin')
        )
    );

-- Team invitations policies
CREATE POLICY "Team members can view invitations for their teams" ON public.team_invitations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_id = team_invitations.team_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Team owners and admins can manage invitations" ON public.team_invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_invitations.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role IN ('owner', 'admin')
        )
    );

-- Team activity log policies
CREATE POLICY "Team members can view activity for their teams" ON public.team_activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_id = team_activity_log.team_id AND user_id = auth.uid()
        )
    );

-- =============================================================================
-- UPDATE EXISTING TABLES FOR TEAM SUPPORT
-- =============================================================================

-- Add team_id to existing tables (only if columns don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='brands' AND column_name='team_id') THEN
        ALTER TABLE public.brands ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='team_id') THEN
        ALTER TABLE public.clients ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_agents' AND column_name='team_id') THEN
        ALTER TABLE public.ai_agents ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schedules' AND column_name='team_id') THEN
        ALTER TABLE public.schedules ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='team_id') THEN
        ALTER TABLE public.conversations ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
    END IF;
END $$;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
DROP INDEX IF EXISTS idx_teams_owner_id;
DROP INDEX IF EXISTS idx_teams_status;
DROP INDEX IF EXISTS idx_team_members_team_id;
DROP INDEX IF EXISTS idx_team_members_user_id;
DROP INDEX IF EXISTS idx_team_members_role;
DROP INDEX IF EXISTS idx_team_members_status;
DROP INDEX IF EXISTS idx_team_invitations_team_id;
DROP INDEX IF EXISTS idx_team_invitations_email;
DROP INDEX IF EXISTS idx_team_invitations_token;
DROP INDEX IF EXISTS idx_team_invitations_status;
DROP INDEX IF EXISTS idx_team_activity_log_team_id;
DROP INDEX IF EXISTS idx_team_activity_log_user_id;
DROP INDEX IF EXISTS idx_team_activity_log_created_at;
DROP INDEX IF EXISTS idx_brands_team_id;
DROP INDEX IF EXISTS idx_clients_team_id;
DROP INDEX IF EXISTS idx_ai_agents_team_id;
DROP INDEX IF EXISTS idx_schedules_team_id;
DROP INDEX IF EXISTS idx_conversations_team_id;

CREATE INDEX idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX idx_teams_status ON public.teams(status);

CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_members_role ON public.team_members(role);
CREATE INDEX idx_team_members_status ON public.team_members(status);

CREATE INDEX idx_team_invitations_team_id ON public.team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX idx_team_invitations_status ON public.team_invitations(status);

CREATE INDEX idx_team_activity_log_team_id ON public.team_activity_log(team_id);
CREATE INDEX idx_team_activity_log_user_id ON public.team_activity_log(user_id);
CREATE INDEX idx_team_activity_log_created_at ON public.team_activity_log(created_at);

-- Add indexes for team_id columns in existing tables (only if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brands') THEN
        CREATE INDEX IF NOT EXISTS idx_brands_team_id ON public.brands(team_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        CREATE INDEX IF NOT EXISTS idx_clients_team_id ON public.clients(team_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_agents') THEN
        CREATE INDEX IF NOT EXISTS idx_ai_agents_team_id ON public.ai_agents(team_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schedules') THEN
        CREATE INDEX IF NOT EXISTS idx_schedules_team_id ON public.schedules(team_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
        CREATE INDEX IF NOT EXISTS idx_conversations_team_id ON public.conversations(team_id);
    END IF;
END $$;

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================
DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
DROP TRIGGER IF EXISTS update_team_invitations_updated_at ON public.team_invitations;

-- Only create triggers if the update function exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_team_invitations_updated_at BEFORE UPDATE ON public.team_invitations
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =============================================================================
-- FUNCTIONS FOR TEAM MANAGEMENT
-- =============================================================================

-- Function to create a default team for new users
CREATE OR REPLACE FUNCTION create_default_team_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.teams (name, description, owner_id)
    VALUES (
        COALESCE(NEW.full_name, 'My Team') || '''s Team',
        'Default team for ' || COALESCE(NEW.full_name, NEW.email),
        NEW.id
    );
    
    -- Add the user as owner to their team
    INSERT INTO public.team_members (team_id, user_id, role, status, joined_at)
    SELECT id, NEW.id, 'owner', 'active', NOW()
    FROM public.teams 
    WHERE owner_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_default_team_trigger ON public.profiles;

-- Only create trigger if profiles table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TRIGGER create_default_team_trigger
            AFTER INSERT ON public.profiles
            FOR EACH ROW
            EXECUTE FUNCTION create_default_team_for_user();
    END IF;
END $$;

-- Function to log team activities
CREATE OR REPLACE FUNCTION log_team_activity(
    p_team_id UUID,
    p_user_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.team_activity_log (
        team_id, user_id, action, resource_type, resource_id, details
    ) VALUES (
        p_team_id, p_user_id, p_action, p_resource_type, p_resource_id, p_details
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- VIEWS FOR TEAM ANALYTICS
-- =============================================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS public.team_member_summary;
DROP VIEW IF EXISTS public.team_activity_summary;

-- Team member summary view
CREATE VIEW public.team_member_summary AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    COUNT(tm.id) as total_members,
    COUNT(CASE WHEN tm.role = 'owner' THEN 1 END) as owners,
    COUNT(CASE WHEN tm.role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN tm.role = 'manager' THEN 1 END) as managers,
    COUNT(CASE WHEN tm.role = 'member' THEN 1 END) as members,
    COUNT(CASE WHEN tm.role = 'viewer' THEN 1 END) as viewers,
    COUNT(CASE WHEN tm.status = 'active' THEN 1 END) as active_members,
    COUNT(CASE WHEN tm.last_active > NOW() - INTERVAL '7 days' THEN 1 END) as active_last_week
FROM public.teams t
LEFT JOIN public.team_members tm ON t.id = tm.team_id
GROUP BY t.id, t.name;

-- Team activity summary view
CREATE VIEW public.team_activity_summary AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    COUNT(tal.id) as total_activities,
    COUNT(CASE WHEN tal.created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as activities_last_24h,
    COUNT(CASE WHEN tal.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as activities_last_week,
    COUNT(DISTINCT tal.user_id) as active_users,
    MAX(tal.created_at) as last_activity
FROM public.teams t
LEFT JOIN public.team_activity_log tal ON t.id = tal.team_id
GROUP BY t.id, t.name; 