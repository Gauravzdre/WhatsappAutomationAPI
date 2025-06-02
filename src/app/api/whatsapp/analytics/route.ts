import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getEnhancedWhatsAppService } from '@/lib/whatsapp-enhanced'

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
    const days = parseInt(searchParams.get('days') || '30')

    // Validate days parameter
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { success: false, error: 'Days parameter must be between 1 and 365' },
        { status: 400 }
      )
    }

    // Use enhanced WhatsApp service to get analytics
    const whatsappService = getEnhancedWhatsAppService()
    const analytics = await whatsappService.getMessageAnalytics(
      user.id, 
      brandId || undefined, 
      days
    )

    if (!analytics) {
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve analytics' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...analytics,
        period: {
          days,
          startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        },
        brandId: brandId || 'all'
      }
    })

  } catch (error) {
    console.error('Analytics API error:', error)
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