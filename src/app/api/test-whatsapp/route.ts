import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getPlatformCredentials } from '@/lib/credentials'

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

    // Get user's WhatsApp credentials
    const credentials = await getPlatformCredentials(user.id, 'whatsapp')
    
    if (!credentials || !credentials.whatsapp_phone_id || !credentials.whatsapp_access_token) {
      return NextResponse.json(
        { success: false, error: 'WhatsApp credentials not configured. Please set up your credentials in Settings.' },
        { status: 400 }
      )
    }

    const { to, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing phone number or message' },
        { status: 400 }
      )
    }

    // WhatsApp Business API URL
    const whatsappUrl = `${credentials.whatsapp_api_url || 'https://graph.facebook.com/v15.0'}/${credentials.whatsapp_phone_id}/messages`

    // Message payload
    const messageData = {
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''), // Remove non-digits
      type: 'text',
      text: {
        body: message
      }
    }

    // Send message to WhatsApp API
    const response = await fetch(whatsappUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.whatsapp_access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    })

    const result = await response.json()

    if (response.ok) {
      return NextResponse.json({
        success: true,
        data: result,
        message: 'Test message sent successfully!'
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error?.message || 'Failed to send message',
          details: result
        },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('WhatsApp API test error:', error)
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