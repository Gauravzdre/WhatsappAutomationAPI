import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Bot token is required'
      }, { status: 400 });
    }

    // Validate token format
    if (!/^\d+:[A-Za-z0-9_-]+$/.test(token)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid bot token format'
      }, { status: 400 });
    }

    // Test the bot token by calling Telegram's getMe API
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok || !telegramData.ok) {
      return NextResponse.json({
        success: false,
        error: 'Invalid bot token or bot not accessible'
      }, { status: 400 });
    }

    // Extract bot information
    const botInfo = telegramData.result;

    return NextResponse.json({
      success: true,
      data: {
        botId: botInfo.id,
        botUsername: botInfo.username,
        botName: botInfo.first_name,
        canJoinGroups: botInfo.can_join_groups,
        canReadAllGroupMessages: botInfo.can_read_all_group_messages,
        supportsInlineQueries: botInfo.supports_inline_queries
      }
    });

  } catch (error) {
    console.error('❌ Telegram validation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to validate bot token'
    }, { status: 500 });
  }
} 