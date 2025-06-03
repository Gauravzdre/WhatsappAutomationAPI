import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { performanceInsightsEngine } from '@/lib/performance-insights'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const timeframe = searchParams.get('timeframe') as '24h' | '7d' | '30d' | '90d' || '30d'
    const reportType = searchParams.get('reportType') as 'daily' | 'weekly' | 'monthly' | 'custom' || 'weekly'
    const brandId = searchParams.get('brandId') || undefined

    switch (action) {
      case 'insights':
        const insights = await performanceInsightsEngine.generateInsights(
          user.id,
          brandId,
          timeframe
        )
        
        return NextResponse.json({
          success: true,
          data: { insights },
          message: 'Performance insights generated successfully'
        })

      case 'predictions':
        const predictionPeriod = searchParams.get('predictionPeriod') as '7d' | '30d' | '90d' || '30d'
        const predictions = await performanceInsightsEngine.generatePredictions(
          user.id,
          brandId,
          predictionPeriod
        )
        
        return NextResponse.json({
          success: true,
          data: { predictions },
          message: 'Performance predictions generated successfully'
        })

      case 'reports':
        const limit = parseInt(searchParams.get('limit') || '10')
        const reports = await performanceInsightsEngine.getPerformanceReports(
          user.id,
          limit,
          reportType !== 'weekly' ? reportType : undefined
        )
        
        return NextResponse.json({
          success: true,
          data: { reports },
          message: 'Performance reports retrieved successfully'
        })

      case 'summary':
        // Get a quick summary of key insights and metrics
        const summaryInsights = await performanceInsightsEngine.generateInsights(
          user.id,
          brandId,
          '7d'
        )
        
        const topInsights = summaryInsights
          .filter(insight => insight.impact === 'high' || insight.confidence > 0.8)
          .slice(0, 5)
        
        return NextResponse.json({
          success: true,
          data: { 
            insights: topInsights,
            totalInsights: summaryInsights.length,
            highImpactInsights: summaryInsights.filter(i => i.impact === 'high').length
          },
          message: 'Performance summary generated successfully'
        })

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: insights, predictions, reports, or summary' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Performance insights API error:', error)
    return NextResponse.json({ 
      error: 'Failed to process performance insights request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, reportType, brandId, customPeriod } = body

    switch (action) {
      case 'generate_report':
        const report = await performanceInsightsEngine.generatePerformanceReport(
          user.id,
          reportType || 'weekly',
          brandId,
          customPeriod
        )
        
        return NextResponse.json({
          success: true,
          data: { report },
          message: 'Performance report generated successfully'
        })

      case 'generate_insights':
        const { timeframe = '30d' } = body
        const insights = await performanceInsightsEngine.generateInsights(
          user.id,
          brandId,
          timeframe
        )
        
        return NextResponse.json({
          success: true,
          data: { insights },
          message: 'Performance insights generated successfully'
        })

      case 'generate_predictions':
        const { predictionPeriod = '30d' } = body
        const predictions = await performanceInsightsEngine.generatePredictions(
          user.id,
          brandId,
          predictionPeriod
        )
        
        return NextResponse.json({
          success: true,
          data: { predictions },
          message: 'Performance predictions generated successfully'
        })

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: generate_report, generate_insights, or generate_predictions' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Performance insights POST API error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate performance insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 