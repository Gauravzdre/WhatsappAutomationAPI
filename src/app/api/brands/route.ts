import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { getAIAgentManager } from '@/lib/ai-agent-manager'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Transform database brand data to frontend format
function transformBrandData(brand: any) {
  return {
    ...brand,
    brand_voice: brand.brand_voice?.tone || '',
    brand_colors: brand.visual_identity?.colors || [],
    logo_url: brand.visual_identity?.logo_url || '',
    target_audience: brand.target_audience?.description || '',
    business_goals: brand.target_audience?.demographics || brand.goals?.[0] || '',
    brand_guidelines: brand.brand_voice?.guidelines || brand.guidelines || '',
    unique_value_proposition: '',
    website: '',
    social_links: {
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: '',
      tiktok: '',
      youtube: ''
    }
  }
}

// Add CORS headers to help with browser extension issues
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      const response = NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
      return addCorsHeaders(response)
    }

    // Fetch user's first brand (assuming one brand per user for now)
    const { data: brands, error } = await supabase
      .from('brands')
      .select(`
        *,
        ai_agents(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Database error:', error)
      const response = NextResponse.json(
        { success: false, error: 'Failed to fetch brands', details: error.message },
        { status: 500 }
      )
      return addCorsHeaders(response)
    }

    // Return the first brand or null if no brands exist
    const brand = brands && brands.length > 0 ? brands[0] : null

    // Transform database data to match frontend form structure
    const transformedBrand = brand ? transformBrandData(brand) : null

    const response = NextResponse.json({
      success: true,
      brand: transformedBrand
    })
    return addCorsHeaders(response)

  } catch (error) {
    console.error('API error:', error)
    const response = NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

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

    const brandData = await request.json()
    
    // Validate required fields
    if (!brandData.name) {
      return NextResponse.json(
        { success: false, error: 'Brand name is required' },
        { status: 400 }
      )
    }

    // Check if user already has a brand
    const { data: existingBrands, error: checkError } = await supabase
      .from('brands')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (checkError) {
      console.error('Error checking existing brands:', checkError)
      return NextResponse.json(
        { success: false, error: 'Failed to check existing brands' },
        { status: 500 }
      )
    }

    if (existingBrands && existingBrands.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You can only create one brand per account. Please edit your existing brand instead.' },
        { status: 400 }
      )
    }

    // Map form data to database schema
    const dbData = {
      user_id: user.id,
      name: brandData.name,
      industry: brandData.industry || 'general',
      description: brandData.description || '',
      brand_voice: {
        tone: brandData.brand_voice || 'professional',
        guidelines: brandData.brand_guidelines || ''
      },
      visual_identity: {
        colors: brandData.brand_colors || [],
        logo_url: brandData.logo_url || ''
      },
      target_audience: {
        description: brandData.target_audience || '',
        demographics: brandData.business_goals || ''
      },
      guidelines: brandData.brand_guidelines || '',
      goals: brandData.business_goals ? [brandData.business_goals] : []
    }

    // Insert brand into database
    const { data: brand, error } = await supabase
      .from('brands')
      .insert(dbData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create brand', details: error.message },
        { status: 500 }
      )
    }

    // Initialize AI agents for the brand
    try {
      const aiAgentManager = getAIAgentManager()
      const agents = await aiAgentManager.initializeAgentsForBrand({
        brandId: brand.id,
        brandData: {
          name: brandData.name,
          industry: brandData.industry || 'general',
          description: brandData.description || '',
          voice: brandData.brand_voice || 'professional',
          guidelines: brandData.brand_guidelines || '',
          targetAudience: brandData.target_audience || ''
        },
        userId: brand.user_id
      })

      return NextResponse.json({
        success: true,
        brand: transformBrandData(brand),
        agents,
        message: 'Brand created successfully with AI agents'
      })
    } catch (agentError) {
      console.error('Error initializing AI agents:', agentError)
      // Still return success since brand was created
      return NextResponse.json({
        success: true,
        brand: transformBrandData(brand),
        message: 'Brand created successfully, but some AI agents may not be initialized'
      })
    }

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

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...brandData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!brandData.name) {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      )
    }

    // Map form data to database schema
    const updateData = {
      name: brandData.name,
      industry: brandData.industry || 'general',
      description: brandData.description || '',
      brand_voice: {
        tone: brandData.brand_voice || 'professional',
        guidelines: brandData.brand_guidelines || ''
      },
      visual_identity: {
        colors: brandData.brand_colors || [],
        logo_url: brandData.logo_url || ''
      },
      target_audience: {
        description: brandData.target_audience || '',
        demographics: brandData.business_goals || ''
      },
      guidelines: brandData.brand_guidelines || '',
      goals: brandData.business_goals ? [brandData.business_goals] : []
    }

    // Update brand
    const { data: brand, error } = await supabase
      .from('brands')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own brand
      .select()
      .single()

    if (error) {
      console.error('Error updating brand:', error)
      return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 })
    }

    return NextResponse.json({ brand: transformBrandData(brand) })

  } catch (error) {
    console.error('Error in brands PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }

    // First, delete associated AI agents
    try {
      const { error: agentsError } = await supabase
        .from('ai_agents')
        .delete()
        .eq('brand_id', id)
        .eq('user_id', user.id)

      if (agentsError) {
        console.error('Error deleting AI agents:', agentsError)
        // Continue with brand deletion even if agent deletion fails
      }
    } catch (agentError) {
      console.error('Error cleaning up AI agents:', agentError)
      // Continue with brand deletion
    }

    // Delete the brand
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only delete their own brand

    if (error) {
      console.error('Error deleting brand:', error)
      return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Brand deleted successfully' 
    })

  } catch (error) {
    console.error('Error in brands DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 