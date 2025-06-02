import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getEnhancedWhatsAppService } from '@/lib/whatsapp-enhanced'

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

    const body = await request.json()
    const { 
      to, 
      message, 
      brandId, 
      clientId, 
      messageType = 'text',
      template,
      aiGenerated = false 
    } = body

    // Validate required fields
    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, message' },
        { status: 400 }
      )
    }

    // Use enhanced WhatsApp service
    const whatsappService = getEnhancedWhatsAppService()
    const result = await whatsappService.sendMessage(to, message, {
      userId: user.id,
      brandId,
      clientId,
      messageType,
      template,
      aiGenerated
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Message sent successfully'
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to send message' 
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Send message API error:', error)
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