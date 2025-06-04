import { NextRequest, NextResponse } from 'next/server';
import { intelligentAI } from '@/lib/intelligent-ai-generator';
import { conversationManager } from '@/lib/conversation-manager';

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, userName, action } = await request.json();

    if (action === 'test_ai') {
      if (!message || !chatId) {
        return NextResponse.json({
          success: false,
          error: 'Message and chatId are required'
        }, { status: 400 });
      }

      console.log('🧪 Testing intelligent AI system...');

      // Initialize AI if needed
      if (!intelligentAI.isReady()) {
        try {
          await intelligentAI.initialize();
        } catch (error) {
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
        chatId: chatId,
        userName: userName,
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
        timestamp: new Date().toISOString()
      });

    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Use: test_ai, get_history, clear_history, or status'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Intelligent AI test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
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
      availableActions: [
        'test_ai - Test AI response generation',
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