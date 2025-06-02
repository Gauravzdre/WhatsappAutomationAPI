import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('type')
    const platform = searchParams.get('platform')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query using the new content_generation table
    let query = supabase
      .from('content_generation')
      .select(`
        *,
        brands(name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (contentType) {
      query = query.eq('content_type', contentType)
    }
    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data: content, error } = await query

    if (error) {
      console.error('Error fetching brand content:', error)
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
    }

    // Transform data to match expected format
    const transformedContent = content?.map(item => ({
      id: item.id,
      content_type: item.content_type,
      title: item.brief, // Use brief as title
      text_content: item.generated_content,
      image_url: null, // Can be added to metadata if needed
      image_data: null, // Can be added to metadata if needed  
      platform: item.platform,
      metadata: item.metadata,
      created_at: item.created_at,
      updated_at: item.updated_at,
      brand_name: item.brands?.name,
      status: item.status,
      quality_score: item.quality_score
    }))

    return NextResponse.json({ content: transformedContent || [] })

  } catch (error) {
    console.error('Error in brand content GET:', error)
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

    const body = await request.json()
    const {
      content_type,
      title,
      text_content,
      image_url,
      image_data,
      platform,
      metadata,
      brand_id
    } = body

    if (!content_type) {
      return NextResponse.json(
        { error: 'Content type is required' },
        { status: 400 }
      )
    }

    if (!brand_id) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }

    // Insert new content using content_generation table
    const { data: content, error } = await supabase
      .from('content_generation')
      .insert({
        user_id: user.id,
        brand_id: brand_id,
        content_type: content_type,
        platform: platform,
        brief: title || 'Generated content',
        generated_content: text_content,
        status: 'completed',
        metadata: {
          ...metadata,
          image_url: image_url,
          image_data: image_data,
          created_via: 'brand_content_studio'
        }
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving brand content:', error)
      return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
    }

    // Transform response to match expected format
    const transformedContent = {
      id: content.id,
      content_type: content.content_type,
      title: content.brief,
      text_content: content.generated_content,
      image_url: content.metadata?.image_url || null,
      image_data: content.metadata?.image_data || null,
      platform: content.platform,
      metadata: content.metadata,
      created_at: content.created_at,
      updated_at: content.updated_at,
      status: content.status
    }

    return NextResponse.json({ content: transformedContent })

  } catch (error) {
    console.error('Error in brand content POST:', error)
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

    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('id')

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      )
    }

    // Delete content from content_generation table
    const { error } = await supabase
      .from('content_generation')
      .delete()
      .eq('id', contentId)
      .eq('user_id', user.id) // Ensure user can only delete their own content

    if (error) {
      console.error('Error deleting brand content:', error)
      return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in brand content DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 