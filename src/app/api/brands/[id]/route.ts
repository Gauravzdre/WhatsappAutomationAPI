import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const brandId = params.id

    // Fetch specific brand by ID
    const { data: brand, error } = await supabase
      .from('brands')
      .select(`
        *,
        ai_agents(count)
      `)
      .eq('id', brandId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Brand not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch brand', details: error.message },
        { status: 500 }
      )
    }

    // Transform database data to match frontend form structure
    const transformedBrand = transformBrandData(brand)

    return NextResponse.json({
      success: true,
      brand: transformedBrand
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brandData = await request.json()
    const brandId = params.id

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
      .eq('id', brandId)
      .eq('user_id', user.id) // Ensure user can only update their own brand
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Brand not found' },
          { status: 404 }
        )
      }
      console.error('Error updating brand:', error)
      return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      brand: transformBrandData(brand) 
    })

  } catch (error) {
    console.error('Error in brands PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brandId = params.id

    // First, delete associated AI agents
    try {
      const { error: agentsError } = await supabase
        .from('ai_agents')
        .delete()
        .eq('brand_id', brandId)
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
      .eq('id', brandId)
      .eq('user_id', user.id) // Ensure user can only delete their own brand

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Brand not found' },
          { status: 404 }
        )
      }
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