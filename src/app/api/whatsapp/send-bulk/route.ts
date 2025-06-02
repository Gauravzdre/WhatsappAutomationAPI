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
      messages, // Array of { to, message }
      brandId, 
      messageType = 'text',
      template,
      aiGenerated = false 
    } = body

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.to || !msg.message) {
        return NextResponse.json(
          { success: false, error: 'Each message must have "to" and "message" fields' },
          { status: 400 }
        )
      }
    }

    // Limit bulk messages to prevent abuse
    if (messages.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Maximum 100 messages per bulk request' },
        { status: 400 }
      )
    }

    // Use enhanced WhatsApp service
    const whatsappService = getEnhancedWhatsAppService()
    const results = await whatsappService.sendBulkMessages(messages, {
      userId: user.id,
      brandId,
      messageType,
      template,
      aiGenerated
    })

    // Calculate summary
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      summary: {
        total: messages.length,
        successful,
        failed,
        successRate: (successful / messages.length) * 100
      },
      results: results.map(r => ({
        to: r.to,
        success: r.success,
        messageId: r.messageId,
        error: r.error
      })),
      message: `Bulk send completed: ${successful}/${messages.length} messages sent successfully`
    })

  } catch (error) {
    console.error('Bulk send API error:', error)
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