import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { CreateTeamRequest, ROLE_PERMISSIONS } from '@/types/team'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get teams where user is owner or member
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members!inner(
          id,
          role,
          status,
          joined_at
        )
      `)
      .eq('team_members.user_id', user.id)
      .eq('team_members.status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching teams:', error)
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
    }

    return NextResponse.json({ success: true, teams })
  } catch (error) {
    console.error('Teams API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateTeamRequest = await request.json()
    const { name, description, plan_type = 'free', settings } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
    }

    // Default settings
    const defaultSettings = {
      allow_member_invites: true,
      require_approval: false,
      default_role: 'member' as const,
      brand_access: 'shared' as const,
      ...settings
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: name.trim(),
        description: description?.trim(),
        owner_id: user.id,
        plan_type,
        settings: defaultSettings
      })
      .select()
      .single()

    if (teamError) {
      console.error('Error creating team:', teamError)
      return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
    }

    // Add owner as team member
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: 'owner',
        permissions: ROLE_PERMISSIONS.owner,
        status: 'active',
        joined_at: new Date().toISOString()
      })

    if (memberError) {
      console.error('Error adding team owner:', memberError)
      // Clean up team if member creation fails
      await supabase.from('teams').delete().eq('id', team.id)
      return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
    }

    // Log team creation activity (skip if function doesn't exist)
    try {
      await supabase.rpc('log_team_activity', {
        p_team_id: team.id,
        p_user_id: user.id,
        p_action: 'team_created',
        p_resource_type: 'team',
        p_resource_id: team.id,
        p_details: { team_name: team.name }
      })
    } catch (activityError) {
      console.warn('Activity logging failed (non-critical):', activityError)
    }

    return NextResponse.json({ 
      success: true, 
      team,
      message: 'Team created successfully'
    })
  } catch (error) {
    console.error('Create team API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 