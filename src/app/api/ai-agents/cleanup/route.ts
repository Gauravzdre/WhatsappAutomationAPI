import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all agents for the user
    const { data: agents, error: fetchError } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching agents:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch agents' },
        { status: 500 }
      )
    }

    if (!agents || agents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No agents found',
        duplicatesRemoved: 0
      })
    }

    // Group agents by brand_id and type
    const agentGroups: { [key: string]: any[] } = {}
    
    agents.forEach(agent => {
      const key = `${agent.brand_id}-${agent.type}`
      if (!agentGroups[key]) {
        agentGroups[key] = []
      }
      agentGroups[key].push(agent)
    })

    // Find duplicates and keep only the most recent ones
    const agentsToDelete: string[] = []
    let duplicatesFound = 0

    Object.values(agentGroups).forEach(group => {
      if (group.length > 1) {
        // Sort by created_at desc (most recent first)
        group.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        
        // Keep the first (most recent) and mark others for deletion
        for (let i = 1; i < group.length; i++) {
          agentsToDelete.push(group[i].id)
          duplicatesFound++
        }
      }
    })

    // Delete duplicate agents
    let deletedCount = 0
    if (agentsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('ai_agents')
        .delete()
        .in('id', agentsToDelete)

      if (deleteError) {
        console.error('Error deleting duplicate agents:', deleteError)
        return NextResponse.json(
          { success: false, error: 'Failed to delete duplicate agents' },
          { status: 500 }
        )
      }

      deletedCount = agentsToDelete.length
    }

    return NextResponse.json({
      success: true,
      message: `Cleanup completed. ${deletedCount} duplicate agents removed.`,
      duplicatesRemoved: deletedCount,
      totalAgentsBefore: agents.length,
      totalAgentsAfter: agents.length - deletedCount,
      details: {
        agentGroupsFound: Object.keys(agentGroups).length,
        duplicateGroupsFound: Object.values(agentGroups).filter(group => group.length > 1).length
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 