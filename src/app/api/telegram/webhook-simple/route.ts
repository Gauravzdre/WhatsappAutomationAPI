import { NextRequest, NextResponse } from 'next/server';
import { messagingManager } from '@/lib/messaging/manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📨 Simple webhook received:', JSON.stringify(body, null, 2));

    // Ensure platforms are connected
    await messagingManager.connectAll();

    // Process the incoming message
    const message = await messagingManager.receiveMessage(body, 'telegram');
    
    if (message) {
      console.log('✅ Message processed:', {
        id: message.id,
        chatId: message.chatId,
        text: message.text,
        sender: message.sender?.name
      });

      // Simple response without AI
      if (message.text && !message.text.startsWith('/')) {
        const simpleResponse = `🤖 Simple response: I received "${message.text}". AI integration coming soon!`;
        
        try {
          await messagingManager.sendMessage(
            message.chatId, 
            simpleResponse, 
            'telegram'
          );
          console.log('✅ Simple response sent successfully');
        } catch (error) {
          console.error('❌ Failed to send simple response:', error);
        }
      }
    }

    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('❌ Simple webhook error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'Simple webhook endpoint active' });
} 