import { NextRequest, NextResponse } from 'next/server';
import { messagingManager } from '@/lib/messaging/manager';

export async function GET() {
  try {
    const status = await messagingManager.getStatus();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      platforms: status.platforms,
      summary: {
        totalPlatforms: status.totalCount,
        connectedPlatforms: status.connectedCount,
        defaultPlatform: status.defaultPlatform,
        available: Object.keys(status.platforms),
        connected: Object.entries(status.platforms)
          .filter(([_, platformStatus]: [string, any]) => platformStatus.connected)
          .map(([name]) => name)
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to get messaging status:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'connect':
        await messagingManager.connectAll();
        const statusAfterConnect = await messagingManager.getStatus();
        return NextResponse.json({
          success: true,
          message: 'Connection attempt completed',
          status: statusAfterConnect
        });
        
      case 'disconnect':
        await messagingManager.disconnectAll();
        const statusAfterDisconnect = await messagingManager.getStatus();
        return NextResponse.json({
          success: true,
          message: 'Disconnection completed',
          status: statusAfterDisconnect
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "connect" or "disconnect"' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('❌ Failed to execute action:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to execute action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 