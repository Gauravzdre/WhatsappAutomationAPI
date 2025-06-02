import { NextRequest, NextResponse } from 'next/server';
import { analyticsCollector } from '@/lib/analytics/collector';
import { automationEngine } from '@/lib/automation/engine';
import { contactManager } from '@/lib/automation/contacts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const timeRange = searchParams.get('timeRange') as '1h' | '24h' | '7d' | '30d' | '90d' || '24h';
    const platform = searchParams.get('platform') || undefined;
    const segment = searchParams.get('segment') || undefined;

    switch (action) {
      case 'dashboard':
        // Get comprehensive dashboard data
        const dashboardMetrics = analyticsCollector.calculateMetrics({ timeRange, platform, userSegment: segment });
        const realtimeStats = analyticsCollector.getRealtimeStats();
        const contactStats = contactManager.getContactStats();
        const flowStats = automationEngine.getFlowStats();

        return NextResponse.json({
          success: true,
          data: {
            metrics: dashboardMetrics,
            realtime: realtimeStats,
            contacts: contactStats,
            flows: flowStats,
            timeRange,
            timestamp: new Date().toISOString()
          }
        });

      case 'metrics':
        // Get specific metrics with filters
        const metrics = analyticsCollector.calculateMetrics({ 
          timeRange, 
          platform, 
          userSegment: segment 
        });

        return NextResponse.json({
          success: true,
          data: {
            metrics,
            filters: { timeRange, platform, segment },
            timestamp: new Date().toISOString()
          }
        });

      case 'realtime':
        // Get real-time statistics
        const realtime = analyticsCollector.getRealtimeStats();
        
        return NextResponse.json({
          success: true,
          data: {
            realtime,
            timestamp: new Date().toISOString()
          }
        });

      case 'activity':
        // Get activity data (hourly/daily)
        const activityType = searchParams.get('type') || 'hourly';
        const activityMetrics = analyticsCollector.calculateMetrics({ timeRange, platform, userSegment: segment });
        
        const activityData = activityType === 'daily' 
          ? activityMetrics.dailyActivity 
          : activityMetrics.hourlyActivity;

        return NextResponse.json({
          success: true,
          data: {
            activity: activityData,
            type: activityType,
            filters: { timeRange, platform, segment },
            timestamp: new Date().toISOString()
          }
        });

      case 'performance':
        // Get performance metrics
        const performanceMetrics = analyticsCollector.calculateMetrics({ timeRange, platform, userSegment: segment });
        
        return NextResponse.json({
          success: true,
          data: {
            performance: {
              averageResponseTime: performanceMetrics.averageResponseTime,
              aiSuccessRate: performanceMetrics.aiSuccessRate,
              averageAiConfidence: performanceMetrics.averageAiConfidence,
              automationSuccessRate: performanceMetrics.automationSuccess > 0 
                ? (performanceMetrics.automationSuccess / (performanceMetrics.automationSuccess + performanceMetrics.automationFailures)) * 100 
                : 0,
              userRetention: performanceMetrics.userRetention,
              platformBreakdown: performanceMetrics.platformBreakdown
            },
            filters: { timeRange, platform, segment },
            timestamp: new Date().toISOString()
          }
        });

      case 'export':
        // Export analytics data
        const exportFormat = searchParams.get('format') || 'json';
        const exportMetrics = analyticsCollector.calculateMetrics({ timeRange, platform, userSegment: segment });
        const exportEvents = analyticsCollector.exportEvents({ timeRange, platform, userSegment: segment });

        if (exportFormat === 'csv') {
          // Convert to CSV format
          const csvData = convertToCSV(exportEvents);
          
          return new NextResponse(csvData, {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="analytics-${timeRange}-${Date.now()}.csv"`
            }
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            metrics: exportMetrics,
            events: exportEvents.slice(0, 1000), // Limit for performance
            totalEvents: exportEvents.length,
            filters: { timeRange, platform, segment, format: exportFormat },
            timestamp: new Date().toISOString()
          }
        });

      case 'summary':
        // Get summary statistics
        const summaryMetrics = analyticsCollector.calculateMetrics({ timeRange: '24h' });
        const weeklyMetrics = analyticsCollector.calculateMetrics({ timeRange: '7d' });
        
        return NextResponse.json({
          success: true,
          data: {
            today: {
              messages: summaryMetrics.totalMessages,
              users: summaryMetrics.activeUsers,
              automations: summaryMetrics.automationTriggers,
              aiResponses: summaryMetrics.aiResponses
            },
            thisWeek: {
              messages: weeklyMetrics.totalMessages,
              users: weeklyMetrics.totalUsers,
              newUsers: weeklyMetrics.newUsers,
              retention: weeklyMetrics.userRetention
            },
            topFlows: summaryMetrics.topFlows,
            timestamp: new Date().toISOString()
          }
        });

      default:
        // Default: return basic overview
        const overviewMetrics = analyticsCollector.calculateMetrics({ timeRange: '24h' });
        
        return NextResponse.json({
          success: true,
          data: {
            overview: {
              totalMessages: overviewMetrics.totalMessages,
              activeUsers: overviewMetrics.activeUsers,
              automationTriggers: overviewMetrics.automationTriggers,
              aiResponses: overviewMetrics.aiResponses,
              averageResponseTime: Math.round(overviewMetrics.averageResponseTime),
              aiSuccessRate: Math.round(overviewMetrics.aiSuccessRate)
            },
            timestamp: new Date().toISOString()
          }
        });
    }
  } catch (error) {
    console.error('❌ Analytics API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'clear_old_events':
        // Clear old analytics events
        const days = data?.days || 30;
        const removedCount = analyticsCollector.clearOldEvents(days);
        
        return NextResponse.json({
          success: true,
          data: {
            removedEvents: removedCount,
            message: `Cleared ${removedCount} events older than ${days} days`
          }
        });

      case 'track_custom_event':
        // Track a custom analytics event
        if (!data?.type || !data?.chatId || !data?.userId || !data?.platform) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: type, chatId, userId, platform'
          }, { status: 400 });
        }

        // For now, we'll track it as a user activity event
        analyticsCollector.trackUserActivity(
          data.chatId,
          data.userId,
          data.platform,
          data.segment || 'unknown',
          data.tags || []
        );

        return NextResponse.json({
          success: true,
          data: {
            message: 'Custom event tracked successfully'
          }
        });

      case 'generate_report':
        // Generate a comprehensive analytics report
        const reportTimeRange = data?.timeRange || '7d';
        const reportMetrics = analyticsCollector.calculateMetrics({ timeRange: reportTimeRange });
        const reportContactStats = contactManager.getContactStats();
        const reportFlowStats = automationEngine.getFlowStats();

        const report = {
          period: reportTimeRange,
          generatedAt: new Date().toISOString(),
          summary: {
            totalMessages: reportMetrics.totalMessages,
            totalUsers: reportMetrics.totalUsers,
            activeUsers: reportMetrics.activeUsers,
            newUsers: reportMetrics.newUsers,
            userRetention: reportMetrics.userRetention,
            averageResponseTime: reportMetrics.averageResponseTime,
            aiSuccessRate: reportMetrics.aiSuccessRate,
            automationSuccessRate: reportMetrics.automationSuccess > 0 
              ? (reportMetrics.automationSuccess / (reportMetrics.automationSuccess + reportMetrics.automationFailures)) * 100 
              : 0
          },
          details: {
            messageMetrics: {
              received: reportMetrics.messagesReceived,
              sent: reportMetrics.messagesSent,
              responseTime: reportMetrics.averageResponseTime
            },
            userMetrics: {
              total: reportMetrics.totalUsers,
              active: reportMetrics.activeUsers,
              new: reportMetrics.newUsers,
              retention: reportMetrics.userRetention
            },
            automationMetrics: {
              triggers: reportMetrics.automationTriggers,
              success: reportMetrics.automationSuccess,
              failures: reportMetrics.automationFailures,
              topFlows: reportMetrics.topFlows
            },
            aiMetrics: {
              responses: reportMetrics.aiResponses,
              successRate: reportMetrics.aiSuccessRate,
              averageConfidence: reportMetrics.averageAiConfidence,
              errors: reportMetrics.aiErrors
            },
            platformMetrics: reportMetrics.platformBreakdown,
            contactStats: reportContactStats,
            flowStats: reportFlowStats
          },
          charts: {
            hourlyActivity: reportMetrics.hourlyActivity,
            dailyActivity: reportMetrics.dailyActivity
          }
        };

        return NextResponse.json({
          success: true,
          data: { report }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Analytics API POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to convert events to CSV
function convertToCSV(events: any[]): string {
  if (events.length === 0) return 'No data available';

  const headers = ['timestamp', 'type', 'chatId', 'userId', 'platform', 'metadata'];
  const csvRows = [headers.join(',')];

  events.forEach(event => {
    const row = [
      event.timestamp,
      event.type,
      event.chatId,
      event.userId,
      event.platform,
      JSON.stringify(event.metadata).replace(/,/g, ';') // Replace commas to avoid CSV issues
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
} 