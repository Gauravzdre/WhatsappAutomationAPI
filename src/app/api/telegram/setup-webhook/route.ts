import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl, botToken } = await request.json();
    
    if (!webhookUrl || !botToken) {
      return NextResponse.json(
        { error: 'Missing webhookUrl or botToken' },
        { status: 400 }
      );
    }

    // Set up the webhook with Telegram
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true
      }),
    });

    const result = await response.json();

    if (result.ok) {
      return NextResponse.json({
        success: true,
        message: 'Webhook set up successfully',
        webhookUrl,
        result
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.description || 'Failed to set webhook',
        result
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Setup webhook error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const botToken = searchParams.get('botToken');
    
    if (!botToken) {
      return NextResponse.json(
        { error: 'Missing botToken parameter' },
        { status: 400 }
      );
    }

    // Get current webhook info
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/getWebhookInfo`;
    
    const response = await fetch(telegramApiUrl);
    const result = await response.json();

    return NextResponse.json({
      success: true,
      webhookInfo: result.result
    });

  } catch (error) {
    console.error('❌ Get webhook info error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 