import { NextRequest, NextResponse } from 'next/server';
import { messagingManager } from '@/lib/messaging/manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📨 Telegram webhook received:', JSON.stringify(body, null, 2));

    // Process the incoming message
    const message = await messagingManager.receiveMessage(body, 'telegram');
    
    if (message) {
      console.log('✅ Message processed:', {
        id: message.id,
        chatId: message.chatId,
        text: message.text,
        sender: message.sender?.name
      });

      // Here you can add your message processing logic:
      // - Store in database
      // - Trigger automation flows
      // - Generate AI responses
      // - Update analytics
      
      // For now, let's send a simple echo response
      if (message.text && !message.text.startsWith('/')) {
        const echoResponse = `🤖 Echo: ${message.text}`;
        
        try {
          await messagingManager.sendMessage(
            message.chatId, 
            echoResponse, 
            'telegram'
          );
        } catch (error) {
          console.error('❌ Failed to send echo response:', error);
        }
      }
    }

    // Telegram expects a 200 OK response
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('❌ Telegram webhook error:', error);
    
    // Still return 200 to prevent Telegram from retrying
    return NextResponse.json({ ok: false, error: 'Internal server error' });
  }
}

// Handle Telegram webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  // Simple token verification (you should use a more secure method in production)
  if (token === process.env.TELEGRAM_WEBHOOK_TOKEN) {
    return NextResponse.json({ status: 'webhook verified' });
  }
  
  return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
} 