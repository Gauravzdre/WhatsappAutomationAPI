import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { smartSchedulingService } from '@/lib/smart-scheduling'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { brandId, scheduleIds } = body

    // Optimize existing schedules
    const optimizedSchedules = await smartSchedulingService.optimizeExistingSchedules(
      user.id, 
      brandId
    )

    // Filter by specific schedule IDs if provided
    const filteredSchedules = scheduleIds 
      ? optimizedSchedules.filter(schedule => scheduleIds.includes(schedule.scheduleId))
      : optimizedSchedules

    return NextResponse.json({
      success: true,
      optimizedSchedules: filteredSchedules,
      totalOptimized: filteredSchedules.length,
      message: `Successfully optimized ${filteredSchedules.length} schedule(s)`
    })
  } catch (error) {
    console.error('Schedule optimization API error:', error)
    return NextResponse.json({ 
      error: 'Failed to optimize schedules',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const scheduleId = searchParams.get('scheduleId')

    // Get performance analytics
    const analytics = await smartSchedulingService.getSchedulePerformanceAnalytics(
      user.id,
      scheduleId || undefined
    )

    return NextResponse.json({
      success: true,
      analytics,
      message: 'Schedule performance analytics retrieved'
    })
  } catch (error) {
    console.error('Schedule analytics API error:', error)
    return NextResponse.json({ 
      error: 'Failed to get schedule analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 