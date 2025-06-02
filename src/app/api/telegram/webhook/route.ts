import { NextRequest, NextResponse } from 'next/server';
import { messagingManager } from '@/lib/messaging/manager';
import { aiContentGenerator } from '@/lib/ai-content-generator';
import { automationEngine } from '@/lib/automation/engine';
import { contactManager } from '@/lib/automation/contacts';
import { analyticsCollector } from '@/lib/analytics/collector';

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

      // Process message with automation system
      if (message.text && !message.text.startsWith('/')) {
        const startTime = Date.now();
        
        try {
          console.log('🤖 Processing message with automation system:', message.text);
          
          // Track message received
          analyticsCollector.trackMessageReceived(
            message.chatId,
            message.sender?.id || message.chatId,
            'telegram',
            message.text
          );
          
          // Get or create contact
          let contact = contactManager.getContact(message.chatId);
          if (!contact) {
            contact = contactManager.createContact(
              message.chatId, 
              message.sender?.id || message.chatId, 
              message.sender?.name
            );
            console.log('👤 New contact created:', contact.id);
            
            // Track new user joined
            analyticsCollector.trackUserJoined(
              message.chatId,
              message.sender?.id || message.chatId,
              'telegram',
              contact.segment
            );
          } else {
            // Update contact activity
            contactManager.incrementMessageCount(message.chatId);
            console.log('👤 Contact updated:', contact.id);
            
            // Track user activity
            analyticsCollector.trackUserActivity(
              message.chatId,
              message.sender?.id || message.chatId,
              'telegram',
              contact.segment,
              contact.tags
            );
          }

          // Process message through automation engine
          const automationResult = await automationEngine.processMessage(
            message.chatId,
            message.text,
            message.sender?.id || message.chatId,
            message.sender?.name
          );

          console.log('🔄 Automation result:', {
            triggered: automationResult.triggered,
            flowId: automationResult.flowId,
            actionsTaken: automationResult.actionsTaken
          });

          // Track automation trigger
          if (automationResult.triggered && automationResult.flowId) {
            analyticsCollector.trackAutomationTriggered(
              message.chatId,
              message.sender?.id || message.chatId,
              'telegram',
              automationResult.flowId,
              !automationResult.error
            );
          }

          let responseContent = '';
          let useAI = false;

          if (automationResult.triggered && automationResult.actionsTaken.length > 0) {
            // Check if any action requires AI response
            const aiAction = automationResult.actionsTaken.find(action => action.includes('ai_response'));
            if (aiAction) {
              useAI = true;
            } else {
              // Use predefined message from automation flow
              const messageAction = automationResult.actionsTaken.find(action => action.includes('send_message'));
              if (messageAction) {
                // Get the flow and extract the message
                const flow = automationEngine.getFlow(automationResult.flowId!);
                const sendAction = flow?.actions.find(a => a.type === 'send_message');
                if (sendAction?.config.message) {
                  responseContent = sendAction.config.message;
                }
              }
            }
          } else {
            // No automation triggered, use AI for response
            useAI = true;
          }

          // Generate response content
          if (useAI || !responseContent) {
            try {
              console.log('🤖 Generating AI response...');
              
              const aiResponse = await aiContentGenerator.generateResponse({
                userMessage: message.text,
                chatId: message.chatId,
                userContext: {
                  name: message.sender?.name,
                  previousMessages: [] // TODO: Implement message history from contact
                },
                responseType: 'conversational'
              });

              responseContent = aiResponse.content;
              console.log('✅ AI Response generated:', responseContent.substring(0, 100) + '...');

              // Track AI response
              const aiResponseTime = Date.now() - startTime;
              analyticsCollector.trackAiResponse(
                message.chatId,
                message.sender?.id || message.chatId,
                'telegram',
                aiResponse.metadata.model || 'fallback',
                aiResponse.confidence,
                aiResponseTime,
                true
              );

                          } catch (aiError) {
                console.error('❌ AI generation failed, using intelligent fallback:', aiError);
                
                // Track AI error
                const aiErrorTime = Date.now() - startTime;
                analyticsCollector.trackAiResponse(
                  message.chatId,
                  message.sender?.id || message.chatId,
                  'telegram',
                  'fallback',
                  0,
                  aiErrorTime,
                  false
                );
                
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
          }

          // Send response
          if (responseContent) {
            await messagingManager.sendMessage(
              message.chatId, 
              responseContent, 
              'telegram'
            );
            
            console.log('✅ Response sent successfully');
            
            // Track message sent
            const totalResponseTime = Date.now() - startTime;
            analyticsCollector.trackMessageSent(
              message.chatId,
              message.sender?.id || message.chatId,
              'telegram',
              totalResponseTime
            );
          }

        } catch (error) {
          console.error('❌ Message processing error:', error);
          
          // Send fallback error message
          try {
            await messagingManager.sendMessage(
              message.chatId, 
              '🤖 Sorry, I encountered an issue processing your message. Please try again!', 
              'telegram'
            );
          } catch (sendError) {
            console.error('❌ Failed to send error message:', sendError);
          }
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