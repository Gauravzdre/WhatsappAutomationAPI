import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.COMPOSIO_WEBHOOK_SECRET || 'acdbaccbef00cbc6ce6d0e119134a8c18e62fa4220aff39102c9c6d645a489fa'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-composio-signature')

    // Verify webhook signature
    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(body)
        .digest('hex')
      
      if (signature !== expectedSignature) {
        console.error('❌ Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const data = JSON.parse(body)
    console.log('📨 Composio webhook received:', data)

    // Handle different webhook event types
    switch (data.event_type) {
      case 'connected_account.created':
        console.log('✅ Connected account created:', data.data)
        // Handle new connected account
        break
        
      case 'connected_account.updated':
        console.log('🔄 Connected account updated:', data.data)
        // Handle account updates
        break
        
      case 'connected_account.deleted':
        console.log('🗑️ Connected account deleted:', data.data)
        // Handle account deletion
        break
        
      case 'auth_config.updated':
        console.log('🔐 Auth config updated:', data.data)
        // Handle auth config changes
        break
        
      default:
        console.log('📝 Unknown webhook event:', data.event_type)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Handle webhook verification (if needed)
  return NextResponse.json({ status: 'Webhook endpoint active' })
}
