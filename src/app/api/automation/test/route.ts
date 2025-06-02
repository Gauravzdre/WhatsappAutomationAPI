import { NextRequest, NextResponse } from 'next/server';
import { messagingManager } from '@/lib/messaging/manager';
import { aiContentGenerator } from '@/lib/ai-content-generator';

export async function POST(request: NextRequest) {
  try {
    const { platform, automationType, message } = await request.json();

    if (!platform || !automationType || !message) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: platform, automationType, message'
      }, { status: 400 });
    }

    // Ensure platforms are connected
    await messagingManager.connectAll();

    // Initialize AI content generator if not already done
    if (!aiContentGenerator.isReady()) {
      await aiContentGenerator.initialize();
    }

    // Create a test chat ID for demonstration
    const testChatId = `test_${Date.now()}`;
    const testUserId = `test_user_${Date.now()}`;

    // Send the test automation message
    try {
      await messagingManager.sendMessage(testChatId, message, platform);

      console.log(`✅ Test automation message sent successfully:`, {
        platform,
        automationType,
        chatId: testChatId,
        message: message.substring(0, 100) + '...'
      });

      return NextResponse.json({
        success: true,
        data: {
          message: 'Test automation message sent successfully',
          platform,
          automationType,
          testChatId,
          sentMessage: message
        }
      });

    } catch (sendError) {
      console.error('❌ Failed to send test message:', sendError);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to send test message. Please check your platform configuration.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Automation test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test automation'
    }, { status: 500 });
  }
} 