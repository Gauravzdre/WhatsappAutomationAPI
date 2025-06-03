import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

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

    // Get team activity logs (without profiles join for now to avoid relationship errors)
    const { data: activities, error } = await supabase
      .from('team_activity_log')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching team activity:', error)
      return NextResponse.json({ error: 'Failed to fetch team activity' }, { status: 500 })
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('team_activity_log')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)

    if (countError) {
      console.error('Error counting team activity:', countError)
    }

    return NextResponse.json({ 
      success: true, 
      activities,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
  } catch (error) {
    console.error('Get team activity API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 