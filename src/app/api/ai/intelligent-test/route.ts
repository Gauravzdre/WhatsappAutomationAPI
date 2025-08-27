import { NextRequest, NextResponse } from 'next/server';
import { intelligentAI } from '@/lib/intelligent-ai-generator';
import { conversationManager } from '@/lib/conversation-manager';

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, userName, action, systemPrompt, chatbotName, industry } = await request.json();

    if (action === 'test_ai') {
      if (!message) {
        return NextResponse.json({
          success: false,
          error: 'Message is required'
        }, { status: 400 });
      }

      console.log('🧪 Testing intelligent AI system...');

      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OpenAI API key not found');
        return NextResponse.json({
          success: false,
          error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.',
          details: 'Missing API key configuration'
        }, { status: 500 });
      }

      // Initialize AI if needed
      if (!intelligentAI.isReady()) {
        try {
          await intelligentAI.initialize();
        } catch (error) {
          console.error('❌ AI initialization failed:', error);
          return NextResponse.json({
            success: false,
            error: 'Failed to initialize AI system',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
        }
      }

      // Generate intelligent response
      const response = await intelligentAI.generateIntelligentResponse({
        userMessage: message,
        chatId: chatId || 'test-chat',
        userName: userName || 'Test User',
        platform: 'test'
      });

      return NextResponse.json({
        success: true,
        response: response.content,
        metadata: {
          confidence: response.confidence,
          hasContext: response.hasContext,
          conversationLength: response.conversationLength,
          model: response.metadata.model,
          responseTime: response.metadata.responseTime,
          contextUsed: response.metadata.contextUsed,
          tokensUsed: response.metadata.tokensUsed
        },
        timestamp: new Date().toISOString()
      });

    } else if (action === 'test_chatbot') {
      if (!message) {
        return NextResponse.json({
          success: false,
          error: 'Message is required'
        }, { status: 400 });
      }

      console.log('🤖 Testing chatbot with custom configuration...', {
        chatbotName,
        industry,
        hasSystemPrompt: !!systemPrompt,
        systemPromptLength: systemPrompt?.length || 0,
        messageLength: message.length
      });

      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OpenAI API key not found');
        
        // Provide a fallback response when API key is missing
        const fallbackResponse = `Hello! I'm ${chatbotName || 'your AI assistant'} for ${industry || 'general assistance'}. 

I'd be happy to help you, but it looks like the AI system isn't fully configured yet. Here's what I can tell you:

• I'm designed to assist with ${industry || 'various business needs'}
• I can help with customer support, lead generation, and general inquiries
• Once the system is properly configured, I'll be able to provide more intelligent responses

How can I assist you today?`;

        return NextResponse.json({
          success: true,
          response: fallbackResponse,
          metadata: {
            chatbotName: chatbotName || 'AI Assistant',
            industry: industry || 'General',
            hasCustomPrompt: !!systemPrompt,
            mode: 'fallback',
            reason: 'API key not configured'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Initialize AI if needed
      if (!intelligentAI.isReady()) {
        try {
          await intelligentAI.initialize();
        } catch (error) {
          console.error('❌ AI initialization failed:', error);
          
          // Provide a fallback response when AI initialization fails
          const fallbackResponse = `Hello! I'm ${chatbotName || 'your AI assistant'} for ${industry || 'general assistance'}. 

I'm experiencing some technical difficulties right now, but I'm still here to help! Here's what I can assist with:

• General information about ${industry || 'our services'}
• Basic customer support questions
• Connecting you with the right resources

What would you like to know?`;

          return NextResponse.json({
            success: true,
            response: fallbackResponse,
            metadata: {
              chatbotName: chatbotName || 'AI Assistant',
              industry: industry || 'General',
              hasCustomPrompt: !!systemPrompt,
              mode: 'fallback',
              reason: 'AI initialization failed'
            },
            timestamp: new Date().toISOString()
          });
        }
      }

      // Create a contextual response using the system prompt
      let responseContent = '';
      
      if (systemPrompt && systemPrompt.trim()) {
        try {
          console.log('🎯 Using custom system prompt for AI generation');
          
          // Create a conversation-style prompt that uses the system prompt as context
          const conversationPrompt = `${systemPrompt}

User Message: "${message}"

Please respond as ${chatbotName} according to your role and guidelines above. Keep your response natural, helpful, and aligned with your expertise in ${industry}.`;

          const response = await intelligentAI.generateIntelligentResponse({
            userMessage: conversationPrompt,
            chatId: `chatbot-test-${Date.now()}`,
            userName: userName || 'Test User',
            platform: 'chatbot-test'
          });
          responseContent = response.content;
          
          console.log('✅ Generated AI response successfully using custom system prompt');
          
        } catch (error) {
          console.error('❌ Error generating AI response:', error);
          responseContent = `Hello! I'm ${chatbotName || 'your AI assistant'} for ${industry || 'general assistance'}. 

I understand you said: "${message}"

I'm here to help with ${industry || 'your needs'}. While I'm experiencing some technical issues with my advanced features, I can still assist you with basic information and support.

How can I help you today?`;
        }
      } else {
        console.log('⚠️ No system prompt available, using basic response');
        responseContent = `Hello! I'm ${chatbotName || 'your AI assistant'} for ${industry || 'general assistance'}. 

You said: "${message}"

I'm here to help! While my configuration is still being set up, I can assist you with general questions about ${industry || 'our services'}. 

What specific information are you looking for?`;
      }

      return NextResponse.json({
        success: true,
        response: responseContent,
        metadata: {
          chatbotName: chatbotName || 'AI Assistant',
          industry: industry || 'General',
          hasCustomPrompt: !!systemPrompt,
          systemPromptLength: systemPrompt?.length || 0,
          mode: systemPrompt && systemPrompt.trim() ? 'ai-enhanced' : 'basic'
        },
        timestamp: new Date().toISOString()
      });

    } else if (action === 'get_history') {
      if (!chatId) {
        return NextResponse.json({
          success: false,
          error: 'ChatId is required'
        }, { status: 400 });
      }

      const history = await conversationManager.getConversationHistory(chatId, 20);
      const context = await conversationManager.getConversationContext(chatId);

      return NextResponse.json({
        success: true,
        history: history.map(msg => ({
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp
        })),
        context: context ? {
          messageCount: context.messageCount,
          firstMessageAt: context.firstMessageAt,
          lastMessageAt: context.lastMessageAt,
          platform: context.platform
        } : null,
        timestamp: new Date().toISOString()
      });

    } else if (action === 'clear_history') {
      if (!chatId) {
        return NextResponse.json({
          success: false,
          error: 'ChatId is required'
        }, { status: 400 });
      }

      await conversationManager.clearConversationHistory(chatId);

      return NextResponse.json({
        success: true,
        message: 'Conversation history cleared',
        timestamp: new Date().toISOString()
      });

    } else if (action === 'status') {
      const aiStatus = intelligentAI.getStatus();
      const conversationStats = conversationManager.getStats();

      return NextResponse.json({
        success: true,
        aiStatus,
        conversationStats,
        environmentCheck: {
          hasOpenAIKey: !!process.env.OPENAI_API_KEY,
          nodeEnv: process.env.NODE_ENV
        },
        timestamp: new Date().toISOString()
      });

    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Use: test_ai, test_chatbot, get_history, clear_history, or status'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Intelligent AI test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const aiStatus = intelligentAI.getStatus();
    const conversationStats = conversationManager.getStats();

    return NextResponse.json({
      success: true,
      system: 'Intelligent AI Testing Endpoint',
      version: '1.0.0',
      aiStatus,
      conversationStats,
      environmentCheck: {
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        nodeEnv: process.env.NODE_ENV
      },
      availableActions: [
        'test_ai - Test AI response generation',
        'test_chatbot - Test chatbot with custom configuration',
        'get_history - Get conversation history',
        'clear_history - Clear conversation history',
        'status - Get system status'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Status check error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get status',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 