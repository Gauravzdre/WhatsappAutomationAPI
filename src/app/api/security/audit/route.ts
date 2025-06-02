import { NextRequest, NextResponse } from 'next/server';
import { securityAuditLogger } from '@/lib/security/audit-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '100');
    const category = searchParams.get('category') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const userId = searchParams.get('userId') || undefined;

    switch (action) {
      case 'events':
        // Get recent security events
        const events = securityAuditLogger.getRecentEvents(limit, category, severity);
        return NextResponse.json({
          success: true,
          data: {
            events,
            total: events.length,
            filters: { category, severity, limit }
          }
        });

      case 'metrics':
        // Get security metrics
        const metrics = securityAuditLogger.getSecurityMetrics();
        return NextResponse.json({
          success: true,
          data: metrics
        });

      case 'threats':
        // Detect potential security threats
        const threats = securityAuditLogger.detectThreats();
        return NextResponse.json({
          success: true,
          data: {
            threats,
            threatCount: threats.length,
            timestamp: new Date().toISOString()
          }
        });

      case 'user-events':
        // Get events for a specific user
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'User ID is required for user-events action'
          }, { status: 400 });
        }
        
        const userEvents = securityAuditLogger.getEventsByUser(userId, limit);
        return NextResponse.json({
          success: true,
          data: {
            events: userEvents,
            userId,
            total: userEvents.length
          }
        });

      case 'failed-auth':
        // Get failed authentication attempts
        const timeWindow = parseInt(searchParams.get('timeWindow') || '3600000'); // 1 hour default
        const failedAuths = securityAuditLogger.getFailedAuthAttempts(timeWindow);
        return NextResponse.json({
          success: true,
          data: {
            events: failedAuths,
            total: failedAuths.length,
            timeWindow
          }
        });

      case 'export':
        // Export events for analysis
        const startTime = searchParams.get('startTime') ? parseInt(searchParams.get('startTime')!) : undefined;
        const endTime = searchParams.get('endTime') ? parseInt(searchParams.get('endTime')!) : undefined;
        const exportedEvents = securityAuditLogger.exportEvents(startTime, endTime);
        
        return NextResponse.json({
          success: true,
          data: {
            events: exportedEvents,
            total: exportedEvents.length,
            exportRange: {
              startTime: startTime ? new Date(startTime).toISOString() : 'beginning',
              endTime: endTime ? new Date(endTime).toISOString() : 'now'
            }
          }
        });

      default:
        // Default: return overview
        const overviewMetrics = securityAuditLogger.getSecurityMetrics();
        const recentThreats = securityAuditLogger.detectThreats();
        const recentEvents = securityAuditLogger.getRecentEvents(10);

        return NextResponse.json({
          success: true,
          data: {
            overview: {
              metrics: overviewMetrics,
              threats: recentThreats,
              recentEvents: recentEvents.length,
              lastUpdated: new Date().toISOString()
            }
          }
        });
    }
  } catch (error) {
    console.error('❌ Security audit API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'clear-old':
        // Clear old events
        const olderThan = data.olderThan || (Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days default
        const clearedCount = securityAuditLogger.clearOldEvents(olderThan);
        
        return NextResponse.json({
          success: true,
          data: {
            message: `Cleared ${clearedCount} old events`,
            clearedCount,
            olderThan: new Date(olderThan).toISOString()
          }
        });

      case 'log-custom':
        // Log a custom security event
        const { userId, event, category, severity, details, success } = data;
        
        if (!event || !category || !severity || details === undefined || success === undefined) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: event, category, severity, details, success'
          }, { status: 400 });
        }

        securityAuditLogger.logEvent({
          userId,
          event,
          category,
          severity,
          details,
          success
        });

        return NextResponse.json({
          success: true,
          data: {
            message: 'Custom security event logged successfully'
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Security audit POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 