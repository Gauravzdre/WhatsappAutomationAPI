import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { UpdateTeamMemberRequest, ROLE_PERMISSIONS, canManageRole } from '@/types/team'

export async function PUT(
  request: NextRequest,
  { params }: { params: { teamId: string; memberId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { teamId, memberId } = params
    const body: UpdateTeamMemberRequest = await request.json()

    // Check if user has permission to manage team members
    const { data: userMembership, error: userMemberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (userMemberError || !userMembership) {
      return NextResponse.json({ error: 'Team not found or access denied' }, { status: 404 })
    }

    // Only owners and admins can manage members
    if (!['owner', 'admin'].includes(userMembership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get target member info
    const { data: targetMember, error: targetError } = await supabase
      .from('team_members')
      .select('role, user_id')
      .eq('id', memberId)
      .eq('team_id', teamId)
      .single()

    if (targetError || !targetMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Check if user can manage the target member's role
    if (body.role && !canManageRole(userMembership.role, targetMember.role)) {
      return NextResponse.json({ error: 'Cannot manage this member\'s role' }, { status: 403 })
    }

    // Prevent changing owner role
    if (targetMember.role === 'owner' || body.role === 'owner') {
      return NextResponse.json({ error: 'Cannot change owner role' }, { status: 403 })
    }

    // Update member
    const updateData: any = {}
    if (body.role) {
      updateData.role = body.role
      updateData.permissions = ROLE_PERMISSIONS[body.role]
    }
    if (body.status) updateData.status = body.status
    if (body.permissions) updateData.permissions = body.permissions

    const { data: updatedMember, error: updateError } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('id', memberId)
      .select(`
        *,
        user:profiles(
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating team member:', updateError)
      return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 })
    }

    // Log member update activity
    await supabase.rpc('log_team_activity', {
      p_team_id: teamId,
      p_user_id: user.id,
      p_action: 'member_updated',
      p_resource_type: 'team_member',
      p_resource_id: memberId,
      p_details: { changes: Object.keys(updateData), target_user: targetMember.user_id }
    })

    return NextResponse.json({ 
      success: true, 
      member: updatedMember,
      message: 'Team member updated successfully'
    })
  } catch (error) {
    console.error('Update team member API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { teamId: string; memberId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { teamId, memberId } = params

    // Check if user has permission to manage team members
    const { data: userMembership, error: userMemberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (userMemberError || !userMembership) {
      return NextResponse.json({ error: 'Team not found or access denied' }, { status: 404 })
    }

    // Get target member info
    const { data: targetMember, error: targetError } = await supabase
      .from('team_members')
      .select('role, user_id')
      .eq('id', memberId)
      .eq('team_id', teamId)
      .single()

    if (targetError || !targetMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Prevent removing owner
    if (targetMember.role === 'owner') {
      return NextResponse.json({ error: 'Cannot remove team owner' }, { status: 403 })
    }

    // Only owners and admins can remove members, and they can only remove lower-role members
    if (!['owner', 'admin'].includes(userMembership.role) || 
        !canManageRole(userMembership.role, targetMember.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Remove member
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)

    if (deleteError) {
      console.error('Error removing team member:', deleteError)
      return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 })
    }

    // Log member removal activity
    await supabase.rpc('log_team_activity', {
      p_team_id: teamId,
      p_user_id: user.id,
      p_action: 'member_removed',
      p_resource_type: 'team_member',
      p_resource_id: memberId,
      p_details: { target_user: targetMember.user_id, target_role: targetMember.role }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Team member removed successfully'
    })
  } catch (error) {
    console.error('Remove team member API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 