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

    const { brandId, agents } = await request.json()
    
    if (!brandId || !agents || !Array.isArray(agents)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: brandId and agents array' },
        { status: 400 }
      )
    }

    // Verify the brand belongs to the user
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('id', brandId)
      .eq('user_id', user.id)
      .single()

    if (brandError || !brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found or unauthorized' },
        { status: 404 }
      )
    }

    // Create AI agents for the brand
    const agentPromises = agents.map(async (agentConfig: any) => {
      const { data: agent, error } = await supabase
        .from('ai_agents')
        .insert({
          user_id: user.id,
          brand_id: brandId,
          name: agentConfig.name,
          type: agentConfig.type,
          configuration: agentConfig.configuration || {},
          status: 'active',
          performance_metrics: {
            created_at: new Date().toISOString(),
            messages_processed: 0,
            response_time: 0,
            accuracy_score: 0
          }
        })
        .select()
        .single()

      if (error) {
        console.error(`Error creating ${agentConfig.type} agent:`, error)
        throw error
      }

      return agent
    })

    const createdAgents = await Promise.all(agentPromises)

    return NextResponse.json({
      success: true,
      data: createdAgents,
      message: `Successfully created ${createdAgents.length} AI agents`
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create AI agents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

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

    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')

    let query = supabase
      .from('ai_agents')
      .select(`
        *,
        brands(name)
      `)
      .eq('user_id', user.id)

    if (brandId) {
      query = query.eq('brand_id', brandId)
    }

    const { data: agents, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch AI agents', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: agents || []
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