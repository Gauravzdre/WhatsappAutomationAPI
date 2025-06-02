import { NextRequest, NextResponse } from 'next/server';
import { messagingManager } from '@/lib/messaging/manager';
import { aiContentGenerator } from '@/lib/ai-content-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📨 Telegram webhook received:', JSON.stringify(body, null, 2));

    // Ensure platforms are connected
    await messagingManager.connectAll();

    // Initialize AI content generator if not already done
    if (!aiContentGenerator.isReady()) {
      await aiContentGenerator.initialize();
    }

    // Process the incoming message
    const message = await messagingManager.receiveMessage(body, 'telegram');
    
    if (message) {
      console.log('✅ Message processed:', {
        id: message.id,
        chatId: message.chatId,
        text: message.text,
        sender: message.sender?.name
      });

      // Process message with AI content generation
      if (message.text && !message.text.startsWith('/')) {
        let responseContent = '🤖 Hello! I received your message and I\'m processing it...';
        
        try {
          console.log('🤖 Generating AI response for:', message.text);
          
          // Generate AI response
          const aiResponse = await aiContentGenerator.generateResponse({
            userMessage: message.text,
            chatId: message.chatId,
            userContext: {
              name: message.sender?.name,
              previousMessages: [] // TODO: Implement message history
            },
            responseType: 'conversational'
          });

          console.log('✅ AI Response generated successfully:', {
            content: aiResponse.content.substring(0, 100) + '...',
            confidence: aiResponse.confidence,
            model: aiResponse.metadata.model
          });

          responseContent = aiResponse.content;

        } catch (aiError) {
          console.error('❌ AI generation failed, using fallback:', aiError);
          
          // Intelligent fallback based on message content
          const userMessage = message.text.toLowerCase();
          if (userMessage.includes('hello') || userMessage.includes('hi')) {
            responseContent = '👋 Hello! I\'m ClientPing AI Assistant. How can I help you today?';
          } else if (userMessage.includes('help')) {
            responseContent = '🤝 I\'m here to help with business automation and messaging. What do you need assistance with?';
          } else if (userMessage.includes('feature')) {
            responseContent = '🚀 I offer AI-powered messaging automation, content generation, and business insights. What interests you most?';
          } else {
            responseContent = `🤖 Thanks for your message! I'm ClientPing AI Assistant. I can help with automation and messaging. How can I assist you?`;
          }
        }

        try {
          // Send response (either AI-generated or fallback)
          await messagingManager.sendMessage(
            message.chatId, 
            responseContent, 
            'telegram'
          );
          
          console.log('✅ Response sent successfully');

          // TODO: Store message and response in database
          // TODO: Update analytics
          // TODO: Trigger automation flows if needed

        } catch (sendError) {
          console.error('❌ Failed to send response:', sendError);
          // Don't throw error - webhook should still return 200
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