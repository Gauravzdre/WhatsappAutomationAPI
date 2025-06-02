import { NextRequest, NextResponse } from 'next/server';
import { aiContentGenerator } from '@/lib/ai-content-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📨 AI Webhook received:', JSON.stringify(body, null, 2));

    // Extract message from Telegram update
    const message = body.message;
    if (!message || !message.text || message.text.startsWith('/')) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const chatId = message.chat.id;
    const userMessage = message.text;
    const userName = message.from?.first_name || 'User';

    console.log(`📤 Processing message from ${userName}: "${userMessage}"`);

    // Initialize AI if needed
    if (!aiContentGenerator.isReady()) {
      console.log('🤖 Initializing AI...');
      await aiContentGenerator.initialize();
    }

    // Generate AI response
    let responseText = '';
    try {
      const aiResponse = await aiContentGenerator.generateResponse({
        userMessage: userMessage,
        chatId: chatId.toString(),
        userContext: { name: userName },
        responseType: 'conversational'
      });
      
      responseText = aiResponse.content;
      console.log('✅ AI response generated:', responseText.substring(0, 100) + '...');
      
    } catch (aiError) {
      console.error('❌ AI generation failed:', aiError);
      responseText = `🤖 Hello ${userName}! I received your message: "${userMessage}". I'm ClientPing AI Assistant and I'm here to help!`;
    }

    // Send response via Telegram API
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!telegramToken) {
      console.error('❌ No Telegram bot token found');
      return NextResponse.json({ ok: false, error: 'No bot token' });
    }

    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    const telegramPayload = {
      chat_id: chatId,
      text: responseText,
      parse_mode: 'HTML'
    };

    console.log('📤 Sending to Telegram:', telegramPayload.text.substring(0, 100) + '...');

    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telegramPayload)
    });

    const telegramResult = await telegramResponse.json();
    
    if (telegramResponse.ok) {
      console.log('✅ Message sent successfully to Telegram');
      return NextResponse.json({ ok: true, sent: true });
    } else {
      console.error('❌ Telegram API error:', telegramResult);
      return NextResponse.json({ ok: false, error: 'Telegram API error' });
    }

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'AI Webhook endpoint active',
    ai_ready: aiContentGenerator.isReady(),
    timestamp: new Date().toISOString()
  });
} 