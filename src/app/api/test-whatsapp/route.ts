import { NextRequest, NextResponse } from 'next/server'

interface WhatsAppMessage {
  messaging_product: 'whatsapp'
  to: string
  type: 'text'
  text: {
    body: string
  }
}

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

    const payload: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to: cleanPhoneNumber,
      type: 'text',
      text: {
        body: message,
      },
    }

    const whatsappApiUrl = `${apiUrl}/${phoneId}/messages`
    
    console.log('Sending WhatsApp test message to:', cleanPhoneNumber)
    console.log('Using API URL:', whatsappApiUrl)

    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const responseData = await response.text()
    
    if (!response.ok) {
      console.error('WhatsApp API Error Response:', responseData)
      
      let errorMessage = 'Failed to send message'
      try {
        const errorJson = JSON.parse(responseData)
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message
        } else if (errorJson.error?.error_user_msg) {
          errorMessage = errorJson.error.error_user_msg
        }
      } catch {
        errorMessage = `HTTP ${response.status}: ${responseData}`
      }

      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          details: responseData 
        },
        { status: response.status }
      )
    }

    const result = JSON.parse(responseData)
    console.log('WhatsApp message sent successfully:', result)

    return NextResponse.json({
      success: true,
      messageId: result.messages?.[0]?.id,
      data: result
    })

  } catch (error) {
    console.error('Error in test-whatsapp API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
} 