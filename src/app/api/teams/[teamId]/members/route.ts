import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { InviteTeamMemberRequest, ROLE_PERMISSIONS } from '@/types/team'
import { sendTeamInvitation, generateInvitationUrl } from '@/lib/email/invitation-service'

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

    // Check if user is team member
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (memberError || !membership) {
      return NextResponse.json({ error: 'Team not found or access denied' }, { status: 404 })
    }

    // Get team members (without profiles join for now to avoid relationship errors)
    const { data: members, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching team members:', error)
      return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
    }

    return NextResponse.json({ success: true, members })
  } catch (error) {
    console.error('Get team members API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
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
    const body: InviteTeamMemberRequest = await request.json()
    const { email, role, message } = body

    if (!email?.trim() || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
    }

    // Check if user has permission to invite members
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

    // Only owners and admins can invite members
    if (!['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions to invite members' }, { status: 403 })
    }

    // Check if user is already a team member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a team member' }, { status: 400 })
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabase
      .from('team_invitations')
      .select('id')
      .eq('team_id', teamId)
      .eq('email', email.toLowerCase().trim())
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation already sent to this email' }, { status: 400 })
    }

    // Get team info for invitation
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('name, description, max_members')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Check team member limit
    const { count: memberCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .eq('status', 'active')

    if (memberCount && memberCount >= team.max_members) {
      return NextResponse.json({ error: 'Team has reached maximum member limit' }, { status: 400 })
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .insert({
        team_id: teamId,
        email: email.toLowerCase().trim(),
        role,
        invited_by: user.id,
        message: message?.trim()
      })
      .select('*')
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // Log invitation activity
    try {
      await supabase.rpc('log_team_activity', {
        p_team_id: teamId,
        p_user_id: user.id,
        p_action: 'member_invited',
        p_resource_type: 'team_invitation',
        p_resource_id: invitation.id,
        p_details: { email, role }
      })
    } catch (activityError) {
      console.warn('Activity logging failed (non-critical):', activityError)
    }

    // Send invitation email
    try {
      const invitationUrl = generateInvitationUrl(invitation.token)
      const emailSent = await sendTeamInvitation({
        teamName: team.name,
        teamDescription: team.description,
        inviterName: user.email || 'Team Admin',
        inviterEmail: user.email || '',
        inviteeEmail: email,
        role,
        invitationToken: invitation.token,
        invitationUrl,
        message
      })

      if (!emailSent) {
        console.warn('Failed to send invitation email, but invitation was created')
      }
    } catch (emailError) {
      console.error('Email sending failed (non-critical):', emailError)
    }

    return NextResponse.json({ 
      success: true, 
      invitation,
      message: 'Invitation sent successfully'
    })
  } catch (error) {
    console.error('Invite team member API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 