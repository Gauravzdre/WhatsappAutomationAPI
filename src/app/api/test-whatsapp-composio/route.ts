import { NextRequest, NextResponse } from 'next/server'
import { composioService } from '@/lib/composio'

export async function POST(request: NextRequest) {
  try {
    const { phoneId, accessToken, apiUrl, to, message } = await request.json()

    // Validate required fields
    if (!phoneId || !accessToken || !to || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Clean phone number (remove non-digits)
    const cleanPhoneNumber = to.replace(/\D/g, '')
    
    if (!cleanPhoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    console.log('🚀 Sending WhatsApp test message via Composio to:', cleanPhoneNumber)

    // Use Composio service instead of manual API calls
    const success = await composioService.sendWhatsAppMessage(
      cleanPhoneNumber,
      message,
      accessToken,
      phoneId
    )

    if (success) {
      console.log('✅ WhatsApp message sent successfully via Composio')
      return NextResponse.json({
        success: true,
        provider: 'composio',
        message: 'Message sent successfully via Composio',
        phoneNumber: cleanPhoneNumber,
        enhancedFeatures: {
          errorHandling: 'Enhanced error handling via Composio',
          analytics: 'Message analytics available',
          scheduling: 'Scheduling available in Phase 2',
          aiIntegration: 'AI integration available in Phase 3'
        }
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send message via Composio',
          provider: 'composio'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in test-whatsapp-composio API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        provider: 'composio'
      },
      { status: 500 }
    )
  }
} 