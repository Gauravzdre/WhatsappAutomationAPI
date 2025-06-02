import { NextRequest, NextResponse } from 'next/server';
import { getEnhancedWhatsAppService } from '@/lib/whatsapp-enhanced';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully!');
    return new NextResponse(challenge);
  } else {
    console.error('Webhook verification failed. Expected token:', VERIFY_TOKEN, 'Received:', token);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log webhook data for debugging
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));
    
    if (!body.object) {
      console.log('No object in webhook body, ignoring');
      return NextResponse.json({ status: 'ok' });
    }

    // Handle incoming messages using enhanced service
    const whatsappService = getEnhancedWhatsAppService();
    const result = await whatsappService.handleIncomingMessage(body);
    
    if (!result.success && result.error) {
      console.error('Error handling incoming message:', result.error);
    }

    // Always return 200 to WhatsApp to prevent retries
    return NextResponse.json({ status: 'ok' });
    
  } catch (error) {
    console.error('Webhook error:', error);
    
    // Store webhook error for debugging
    try {
      // You could store this error in a webhooks table for debugging
      console.error('Webhook processing failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        body: await request.text() // Note: this might fail if body was already parsed
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }
    
    // Always return 200 to prevent WhatsApp retries
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 200 });
  }
} 