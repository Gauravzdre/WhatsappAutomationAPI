import { NextRequest, NextResponse } from 'next/server';
import { messagingManager } from '@/lib/messaging/manager';

export async function POST(request: NextRequest) {
  try {
    const { chatId, text, options } = await request.json();

    if (!chatId || !text) {
      return NextResponse.json(
        { error: 'chatId and text are required' },
        { status: 400 }
      );
    }

    console.log('📤 Sending Telegram message:', { chatId, text: text.substring(0, 50) + '...' });

    const message = await messagingManager.sendMessage(
      chatId,
      text,
      'telegram',
      options
    );

    console.log('✅ Message sent successfully:', message.id);

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        chatId: message.chatId,
        timestamp: message.timestamp,
        platform: message.platform
      }
    });

  } catch (error) {
    console.error('❌ Failed to send Telegram message:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return platform status for testing
  try {
    const status = await messagingManager.getStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
} 