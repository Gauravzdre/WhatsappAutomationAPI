# Team Collaboration RLS Fix Guide

## 🚨 Issue: Infinite Recursion in RLS Policies

The team collaboration features are experiencing an infinite recursion error in Supabase Row Level Security (RLS) policies:

```
Error: infinite recursion detected in policy for relation "team_members"
```

## 🔍 Root Cause

The RLS policies were referencing each other in a circular manner:
- `teams` table policy checks `team_members` table
- `team_members` table policy checks `teams` table
- This creates an infinite loop when Supabase tries to evaluate permissions

## 🛠️ Quick Fix (Temporary Solution)

**Step 1: Run this SQL in Supabase SQL Editor**

Copy and paste the contents of `database/disable-rls-temporarily.sql`:

```sql
-- Temporary fix: Disable RLS on team tables to resolve infinite recursion
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
```

**Step 2: Restart your development server**

```bash
npm run dev
```

**Step 3: Test team creation**

- Go to `/teams` page
- Click "Create Team"
- Fill in team details
- Verify team is created successfully

## 🔒 Proper Fix (Long-term Solution)

For production, implement proper non-recursive RLS policies using the file `database/team-collaboration-schema-rls-fixed.sql`.

### Key Changes in Proper Fix:

1. **Separate Policies by Operation**: Instead of complex `FOR ALL` policies, create specific policies for SELECT, INSERT, UPDATE, DELETE
2. **Avoid Circular References**: Use direct ownership checks instead of cross-table references where possible
3. **Helper Functions**: Create security definer functions to safely check permissions
4. **Simplified Logic**: Reduce complexity in policy conditions

### Example of Fixed Policy:

```sql
-- Instead of this (causes recursion):
CREATE POLICY "complex_policy" ON public.teams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_id = teams.id AND user_id = auth.uid()
        )
    );

-- Use this (no recursion):
CREATE POLICY "teams_owner_access" ON public.teams
    FOR ALL USING (auth.uid() = owner_id);
```

## 📋 Testing Checklist

After applying the fix:

- [ ] Can create new teams
- [ ] Can view existing teams
- [ ] Can invite team members
- [ ] Can manage team settings
- [ ] No infinite recursion errors in logs
- [ ] Team member permissions work correctly

## 🔄 Migration Steps for Production

1. **Backup Database**: Always backup before making RLS changes
2. **Apply in Staging**: Test the fix in staging environment first
3. **Monitor Logs**: Watch for any permission-related errors
4. **Gradual Rollout**: Consider feature flags for team functionality
5. **Rollback Plan**: Keep the disable RLS script ready as emergency rollback

## 📝 Files Modified

- `database/disable-rls-temporarily.sql` - Quick fix (disables RLS)
- `database/team-collaboration-schema-rls-fixed.sql` - Proper fix (non-recursive policies)
- `src/app/api/teams/route.ts` - API restored to full functionality
- `TEAM_COLLABORATION_FIX.md` - This guide

## ⚠️ Security Note

**Temporary Solution**: Disabling RLS removes security restrictions on team tables. This is acceptable for development but should be replaced with proper policies for production.

**Production Recommendation**: Implement the proper RLS policies from `team-collaboration-schema-rls-fixed.sql` before deploying to production.

## 🎯 Next Steps

1. ✅ Apply temporary fix (disable RLS)
2. ✅ Test team creation functionality
3. 🔄 Implement proper RLS policies for production
4. 🔄 Add comprehensive team permission tests
5. 🔄 Update team collaboration documentation

---

**Status**: ✅ Quick fix ready - Team creation should now work!  
**Priority**: 🔴 High - Implement proper RLS policies before production deployment 