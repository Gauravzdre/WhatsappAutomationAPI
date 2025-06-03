import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { smartSchedulingService } from '@/lib/smart-scheduling'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')

    // Analyze audience behavior
    const insights = await smartSchedulingService.analyzeAudienceBehavior(user.id, brandId || undefined)

    return NextResponse.json({
      success: true,
      insights,
      message: 'Audience behavior analysis completed'
    })
  } catch (error) {
    console.error('Audience analysis API error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze audience behavior',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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
      messageContent, 
      currentTime, 
      frequency, 
      contentType = 'message', 
      platform = 'whatsapp',
      targetAudience,
      brandId 
    } = body

    if (!messageContent || !currentTime || !frequency) {
      return NextResponse.json({ 
        error: 'Missing required fields: messageContent, currentTime, frequency' 
      }, { status: 400 })
    }

    // Get schedule optimization
    const optimization = await smartSchedulingService.getScheduleOptimization(
      user.id,
      {
        messageContent,
        currentTime,
        frequency,
        contentType,
        platform,
        targetAudience
      },
      brandId
    )

    return NextResponse.json({
      success: true,
      optimization,
      message: 'Schedule optimization completed'
    })
  } catch (error) {
    console.error('Schedule optimization API error:', error)
    return NextResponse.json({ 
      error: 'Failed to optimize schedule',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 