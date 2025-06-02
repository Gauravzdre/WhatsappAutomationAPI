import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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
      .select(`
        id,
        user_id,
        brand_id,
        name,
        type,
        status,
        created_at,
        brands(name)
      `)
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
        data: {
          totalAgents: 0,
          agents: [],
          duplicateAnalysis: {},
          summary: 'No agents found'
        }
      })
    }

    // Group agents by brand_id and type
    const agentGroups: { [key: string]: any[] } = {}
    const typeCount: { [key: string]: number } = {}
    const brandCount: { [key: string]: number } = {}
    
    agents.forEach(agent => {
      const key = `${agent.brand_id}-${agent.type}`
      if (!agentGroups[key]) {
        agentGroups[key] = []
      }
      agentGroups[key].push(agent)
      
      // Count by type
      typeCount[agent.type] = (typeCount[agent.type] || 0) + 1
      
      // Count by brand
      const brandName = (agent.brands && agent.brands[0]?.name) || 'Unknown Brand'
      brandCount[brandName] = (brandCount[brandName] || 0) + 1
    })

    // Find duplicates
    const duplicateGroups = Object.entries(agentGroups).filter(([key, group]) => group.length > 1)
    const duplicateDetails = duplicateGroups.map(([key, group]) => {
      const [brandId, type] = key.split('-')
      return {
        brandId,
        type,
        brandName: (group[0]?.brands && group[0].brands[0]?.name) || 'Unknown',
        count: group.length,
        duplicates: group.length - 1,
        agents: group.map(agent => ({
          id: agent.id,
          name: agent.name,
          status: agent.status,
          created_at: agent.created_at
        }))
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalAgents: agents.length,
        totalDuplicates: duplicateGroups.reduce((sum, [, group]) => sum + group.length - 1, 0),
        typeBreakdown: typeCount,
        brandBreakdown: brandCount,
        duplicateGroups: duplicateDetails,
        agentTypes: Array.from(new Set(agents.map(a => a.type))),
        brands: Array.from(new Set(agents.map(a => (a.brands && a.brands[0]?.name)).filter(Boolean))),
        summary: `Found ${agents.length} total agents, ${duplicateGroups.length} duplicate groups containing ${duplicateGroups.reduce((sum, [, group]) => sum + group.length - 1, 0)} duplicate agents`
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