import { NextRequest, NextResponse } from 'next/server';
import { messagingManager } from '@/lib/messaging/manager';
import { aiContentGenerator } from '@/lib/ai-content-generator';
import { intelligentAI } from '@/lib/intelligent-ai-generator';
import { automationEngine } from '@/lib/automation/engine';
import { contactManager } from '@/lib/automation/contacts';
import { analyticsCollector } from '@/lib/analytics/collector';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📨 Telegram webhook received:', JSON.stringify(body, null, 2));

    // Ensure platforms are connected
    await messagingManager.connectAll();

    // Initialize AI systems if not already done
    if (!aiContentGenerator.isReady()) {
      await aiContentGenerator.initialize();
    }
    
    // Initialize intelligent AI system
    if (!intelligentAI.isReady()) {
      try {
        await intelligentAI.initialize();
        console.log('✅ Intelligent AI system ready');
      } catch (error) {
        console.log('⚠️ Intelligent AI not available, using fallback:', error instanceof Error ? error.message : 'Unknown error');
      }
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
              console.log('🤖 Generating intelligent AI response...');
              
              // Try intelligent AI first (with conversation context)
              if (intelligentAI.isReady()) {
                const intelligentResponse = await intelligentAI.generateIntelligentResponse({
                  userMessage: message.text,
                  chatId: message.chatId,
                  userName: message.sender?.name,
                  platform: 'telegram'
                });

                responseContent = intelligentResponse.content;
                console.log(`✅ Intelligent AI response generated (${intelligentResponse.conversationLength} messages in context):`, 
                  responseContent.substring(0, 100) + '...');

                // Track intelligent AI response
                analyticsCollector.trackAiResponse(
                  message.chatId,
                  message.sender?.id || message.chatId,
                  'telegram',
                  intelligentResponse.metadata.model,
                  intelligentResponse.confidence,
                  intelligentResponse.metadata.responseTime,
                  true
                );
              } else {
                // Fallback to original AI system
                console.log('🔄 Using fallback AI system...');
                const aiResponse = await aiContentGenerator.generateResponse({
                  userMessage: message.text,
                  chatId: message.chatId,
                  userContext: {
                    name: message.sender?.name,
                    previousMessages: []
                  },
                  responseType: 'conversational'
                });

                responseContent = aiResponse.content;
                console.log('✅ Fallback AI response generated:', responseContent.substring(0, 100) + '...');

                // Track fallback AI response
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
              }

            } catch (aiError) {
              console.error('❌ All AI systems failed, using basic fallback:', aiError);
              
              // Track AI error
              const aiErrorTime = Date.now() - startTime;
              analyticsCollector.trackAiResponse(
                message.chatId,
                message.sender?.id || message.chatId,
                'telegram',
                'basic-fallback',
                0,
                aiErrorTime,
                false
              );
              
              // Basic fallback response
              const userName = message.sender?.name ? ` ${message.sender.name}` : '';
              responseContent = `🤖 Hello${userName}! I'm ClientPing AI Assistant. I'm experiencing some technical difficulties right now, but I'm here to help with business automation and messaging. Please try asking your question again!`;
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