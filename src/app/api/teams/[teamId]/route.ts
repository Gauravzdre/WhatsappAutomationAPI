import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { UpdateTeamRequest } from '@/types/team'

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { teamId } = params

    // Get team with member info
    const { data: team, error } = await supabase
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
      .eq('id', teamId)
      .eq('team_members.user_id', user.id)
      .eq('team_members.status', 'active')
      .single()

    if (error || !team) {
      return NextResponse.json({ error: 'Team not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ success: true, team })
  } catch (error) {
    console.error('Get team API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { teamId } = params
    const body: UpdateTeamRequest = await request.json()

    // Check if user has permission to update team
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('role, permissions')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (memberError || !membership) {
      return NextResponse.json({ error: 'Team not found or access denied' }, { status: 404 })
    }

    // Only owners and admins can update team settings
    if (!['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update team
    const updateData: any = {}
    if (body.name?.trim()) updateData.name = body.name.trim()
    if (body.description !== undefined) updateData.description = body.description?.trim()
    if (body.settings) updateData.settings = body.settings

    const { data: team, error: updateError } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', teamId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating team:', updateError)
      return NextResponse.json({ error: 'Failed to update team' }, { status: 500 })
    }

    // Log team update activity
    await supabase.rpc('log_team_activity', {
      p_team_id: teamId,
      p_user_id: user.id,
      p_action: 'team_updated',
      p_resource_type: 'team',
      p_resource_id: teamId,
      p_details: { changes: Object.keys(updateData) }
    })

    return NextResponse.json({ 
      success: true, 
      team,
      message: 'Team updated successfully'
    })
  } catch (error) {
    console.error('Update team API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { teamId } = params

    // Check if user is team owner
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('owner_id, name')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    if (team.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only team owners can delete teams' }, { status: 403 })
    }

    // Soft delete team (mark as deleted)
    const { error: deleteError } = await supabase
      .from('teams')
      .update({ status: 'deleted' })
      .eq('id', teamId)

    if (deleteError) {
      console.error('Error deleting team:', deleteError)
      return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 })
    }

    // Log team deletion activity
    await supabase.rpc('log_team_activity', {
      p_team_id: teamId,
      p_user_id: user.id,
      p_action: 'team_deleted',
      p_resource_type: 'team',
      p_resource_id: teamId,
      p_details: { team_name: team.name }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Team deleted successfully'
    })
  } catch (error) {
    console.error('Delete team API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 