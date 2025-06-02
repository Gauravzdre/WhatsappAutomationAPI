import { NextRequest, NextResponse } from 'next/server';
import { aiContentGenerator } from '@/lib/ai-content-generator';

export async function GET(request: NextRequest) {
  try {
    const status = aiContentGenerator.getStatus();
    
    return NextResponse.json({
      success: true,
      ai: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ AI status check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get AI status',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'initialize') {
      await aiContentGenerator.initialize();
      
      return NextResponse.json({
        success: true,
        message: 'AI Content Generator initialized',
        status: aiContentGenerator.getStatus(),
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'test') {
      const testMessage = body.message || 'Hello, this is a test message';
      
      const response = await aiContentGenerator.generateResponse({
        userMessage: testMessage,
        chatId: 'test-chat',
        responseType: 'conversational'
      });

      return NextResponse.json({
        success: true,
        test: {
          input: testMessage,
          output: response
        },
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use "initialize" or "test"'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ AI action failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to execute AI action',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 