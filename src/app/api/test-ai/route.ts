import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing AI import...');
    
    // Test import
    const { aiContentGenerator } = await import('@/lib/ai-content-generator');
    console.log('✅ AI import successful');
    
    // Test initialization
    await aiContentGenerator.initialize();
    console.log('✅ AI initialization successful');
    
    // Test response generation
    const response = await aiContentGenerator.generateResponse({
      userMessage: 'Hello test',
      chatId: 'test-123',
      responseType: 'conversational'
    });
    console.log('✅ AI response generation successful');
    
    return NextResponse.json({
      success: true,
      message: 'AI Content Generator test successful',
      response: response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ AI test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 