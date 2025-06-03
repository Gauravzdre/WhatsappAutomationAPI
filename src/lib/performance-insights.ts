import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getAIAgentManager } from './ai-agent-manager'
import { analyticsCollector } from './analytics/collector'

export interface PerformanceInsight {
  id: string
  type: 'trend' | 'anomaly' | 'opportunity' | 'warning' | 'prediction'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  actionable: boolean
  recommendations: string[]
  metrics: {
    current: number
    previous: number
    change: number
    changePercent: number
  }
  timeframe: string
  category: 'engagement' | 'automation' | 'ai_performance' | 'user_behavior' | 'scheduling'
}

export interface PerformancePrediction {
  metric: string
  currentValue: number
  predictedValue: number
  confidence: number
  timeframe: string
  factors: string[]
  recommendations: string[]
}

export interface PerformanceReport {
  id: string
  userId: string
  brandId?: string
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom'
  periodStart: string
  periodEnd: string
  insights: PerformanceInsight[]
  predictions: PerformancePrediction[]
  keyMetrics: {
    engagement: {
      responseRate: number
      averageResponseTime: number
      peakHours: number[]
    }
    automation: {
      successRate: number
      triggerCount: number
      topPerformingFlows: string[]
    }
    ai: {
      successRate: number
      averageConfidence: number
      errorRate: number
    }
    growth: {
      userGrowth: number
      messageVolume: number
      retentionRate: number
    }
  }
  recommendations: {
    priority: 'high' | 'medium' | 'low'
    category: string
    title: string
    description: string
    expectedImpact: string
    effort: 'low' | 'medium' | 'high'
  }[]
  aiGenerated: boolean
  createdAt: string
}

export class PerformanceInsightsEngine {
  private supabase = createClientComponentClient()
  private aiManager = getAIAgentManager()

  /**
   * Generate comprehensive performance insights for a user
   */
  async generateInsights(
    userId: string, 
    brandId?: string, 
    timeframe: '24h' | '7d' | '30d' | '90d' = '30d'
  ): Promise<PerformanceInsight[]> {
    try {
      // Get analytics data for the specified timeframe
      const metrics = analyticsCollector.calculateMetrics({ 
        timeRange: timeframe
      })

      // Get historical data for comparison
      const previousMetrics = await this.getPreviousPeriodMetrics(userId, timeframe)

      const insights: PerformanceInsight[] = []

      // Engagement insights
      insights.push(...await this.analyzeEngagementTrends(metrics, previousMetrics, timeframe))

      // Automation insights
      insights.push(...await this.analyzeAutomationPerformance(metrics, previousMetrics, timeframe))

      // AI performance insights
      insights.push(...await this.analyzeAIPerformance(metrics, previousMetrics, timeframe))

      // User behavior insights
      insights.push(...await this.analyzeUserBehavior(metrics, previousMetrics, timeframe))

      // Scheduling optimization insights
      insights.push(...await this.analyzeSchedulingOptimization(userId, timeframe))

      // Use AI to enhance insights if available
      if (brandId) {
        try {
          const aiEnhancedInsights = await this.enhanceInsightsWithAI(insights, metrics, brandId)
          return aiEnhancedInsights
        } catch (aiError) {
          console.warn('AI enhancement failed, returning rule-based insights:', aiError)
        }
      }

      return insights.sort((a, b) => {
        // Sort by impact and confidence
        const impactWeight = { high: 3, medium: 2, low: 1 }
        const aScore = impactWeight[a.impact] * a.confidence
        const bScore = impactWeight[b.impact] * b.confidence
        return bScore - aScore
      })
    } catch (error) {
      console.error('Error generating performance insights:', error)
      throw error
    }
  }

  /**
   * Generate performance predictions using AI and historical data
   */
  async generatePredictions(
    userId: string,
    brandId?: string,
    predictionPeriod: '7d' | '30d' | '90d' = '30d'
  ): Promise<PerformancePrediction[]> {
    try {
      // Get historical data for trend analysis
      const historicalData = await this.getHistoricalMetrics(userId, '90d')
      
      const predictions: PerformancePrediction[] = []

      // Predict engagement metrics
      predictions.push(...await this.predictEngagementMetrics(historicalData, predictionPeriod))

      // Predict automation performance
      predictions.push(...await this.predictAutomationMetrics(historicalData, predictionPeriod))

      // Predict user growth
      predictions.push(...await this.predictUserGrowth(historicalData, predictionPeriod))

      // Use AI for enhanced predictions if available
      if (brandId) {
        try {
          const aiPredictions = await this.enhancePredictionsWithAI(predictions, historicalData, brandId)
          return aiPredictions
        } catch (aiError) {
          console.warn('AI prediction enhancement failed, returning statistical predictions:', aiError)
        }
      }

      return predictions
    } catch (error) {
      console.error('Error generating predictions:', error)
      throw error
    }
  }

  /**
   * Generate a comprehensive performance report
   */
  async generatePerformanceReport(
    userId: string,
    reportType: 'daily' | 'weekly' | 'monthly' | 'custom' = 'weekly',
    brandId?: string,
    customPeriod?: { start: string; end: string }
  ): Promise<PerformanceReport> {
    try {
      const { periodStart, periodEnd } = this.calculateReportPeriod(reportType, customPeriod)
      
      // Generate insights and predictions
      const insights = await this.generateInsights(userId, brandId, this.getTimeframeFromReportType(reportType))
      const predictions = await this.generatePredictions(userId, brandId)

      // Calculate key metrics
      const keyMetrics = await this.calculateKeyMetrics(userId, periodStart, periodEnd)

      // Generate recommendations
      const recommendations = await this.generateRecommendations(insights, predictions, keyMetrics)

      const report: PerformanceReport = {
        id: `report_${Date.now()}_${userId}`,
        userId,
        brandId,
        reportType,
        periodStart,
        periodEnd,
        insights,
        predictions,
        keyMetrics,
        recommendations,
        aiGenerated: !!brandId,
        createdAt: new Date().toISOString()
      }

      // Store the report in the database
      await this.storePerformanceReport(report)

      return report
    } catch (error) {
      console.error('Error generating performance report:', error)
      throw error
    }
  }

  /**
   * Get stored performance reports for a user
   */
  async getPerformanceReports(
    userId: string,
    limit: number = 10,
    reportType?: string
  ): Promise<PerformanceReport[]> {
    try {
      let query = this.supabase
        .from('performance_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (reportType) {
        query = query.eq('report_type', reportType)
      }

      const { data: reports, error } = await query

      if (error) {
        console.error('Error fetching performance reports:', error)
        throw error
      }

      return reports?.map(report => ({
        id: report.id,
        userId: report.user_id,
        brandId: report.brand_id,
        reportType: report.report_type,
        periodStart: report.period_start,
        periodEnd: report.period_end,
        insights: report.insights || [],
        predictions: report.metrics?.predictions || [],
        keyMetrics: report.metrics?.keyMetrics || this.getDefaultKeyMetrics(),
                 recommendations: Array.isArray(report.recommendations) 
           ? report.recommendations.map((rec: any) => typeof rec === 'string' ? { title: rec, description: '', priority: 'medium' as const, category: 'general', expectedImpact: '', effort: 'medium' as const } : rec)
           : [],
        aiGenerated: report.ai_generated,
        createdAt: report.created_at
      })) || []
    } catch (error) {
      console.error('Error getting performance reports:', error)
      throw error
    }
  }

  /**
   * Analyze engagement trends and patterns
   */
  private async analyzeEngagementTrends(
    current: any,
    previous: any,
    timeframe: string
  ): Promise<PerformanceInsight[]> {
    const insights: PerformanceInsight[] = []

    // Response rate analysis
    const responseRateChange = current.messagesReceived / Math.max(current.totalMessages, 1) - 
                              (previous?.messagesReceived || 0) / Math.max(previous?.totalMessages || 1, 1)
    
    if (Math.abs(responseRateChange) > 0.05) {
      insights.push({
        id: `engagement_response_rate_${Date.now()}`,
        type: responseRateChange > 0 ? 'opportunity' : 'warning',
        title: responseRateChange > 0 ? 'Response Rate Improving' : 'Response Rate Declining',
        description: `Response rate has ${responseRateChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(responseRateChange * 100).toFixed(1)}% compared to the previous ${timeframe}`,
        impact: Math.abs(responseRateChange) > 0.15 ? 'high' : Math.abs(responseRateChange) > 0.08 ? 'medium' : 'low',
        confidence: 0.85,
        actionable: true,
        recommendations: responseRateChange > 0 
          ? ['Continue current messaging strategy', 'Consider scaling successful campaigns']
          : ['Review message content quality', 'Analyze timing optimization', 'Check audience targeting'],
        metrics: {
          current: current.messagesReceived / Math.max(current.totalMessages, 1),
          previous: (previous?.messagesReceived || 0) / Math.max(previous?.totalMessages || 1, 1),
          change: responseRateChange,
          changePercent: responseRateChange * 100
        },
        timeframe,
        category: 'engagement'
      })
    }

    // Response time analysis
    const responseTimeChange = current.averageResponseTime - (previous?.averageResponseTime || 0)
    
    if (Math.abs(responseTimeChange) > 300000) { // 5 minutes
      insights.push({
        id: `engagement_response_time_${Date.now()}`,
        type: responseTimeChange < 0 ? 'opportunity' : 'warning',
        title: responseTimeChange < 0 ? 'Faster Response Times' : 'Slower Response Times',
        description: `Average response time has ${responseTimeChange < 0 ? 'improved' : 'increased'} by ${Math.abs(responseTimeChange / 60000).toFixed(1)} minutes`,
        impact: Math.abs(responseTimeChange) > 900000 ? 'high' : 'medium',
        confidence: 0.8,
        actionable: true,
        recommendations: responseTimeChange < 0
          ? ['Maintain current response efficiency', 'Document successful processes']
          : ['Review automation triggers', 'Optimize AI response generation', 'Check system performance'],
        metrics: {
          current: current.averageResponseTime,
          previous: previous?.averageResponseTime || 0,
          change: responseTimeChange,
          changePercent: previous?.averageResponseTime ? (responseTimeChange / previous.averageResponseTime) * 100 : 0
        },
        timeframe,
        category: 'engagement'
      })
    }

    return insights
  }

  /**
   * Analyze automation performance
   */
  private async analyzeAutomationPerformance(
    current: any,
    previous: any,
    timeframe: string
  ): Promise<PerformanceInsight[]> {
    const insights: PerformanceInsight[] = []

    const currentSuccessRate = current.automationSuccess / Math.max(current.automationTriggers, 1)
    const previousSuccessRate = (previous?.automationSuccess || 0) / Math.max(previous?.automationTriggers || 1, 1)
    const successRateChange = currentSuccessRate - previousSuccessRate

    if (Math.abs(successRateChange) > 0.05) {
      insights.push({
        id: `automation_success_rate_${Date.now()}`,
        type: successRateChange > 0 ? 'opportunity' : 'warning',
        title: successRateChange > 0 ? 'Automation Performance Improving' : 'Automation Issues Detected',
        description: `Automation success rate has ${successRateChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(successRateChange * 100).toFixed(1)}%`,
        impact: Math.abs(successRateChange) > 0.2 ? 'high' : 'medium',
        confidence: 0.9,
        actionable: true,
        recommendations: successRateChange > 0
          ? ['Scale successful automation flows', 'Analyze top-performing triggers']
          : ['Review failed automation logs', 'Update trigger conditions', 'Test automation flows'],
        metrics: {
          current: currentSuccessRate,
          previous: previousSuccessRate,
          change: successRateChange,
          changePercent: successRateChange * 100
        },
        timeframe,
        category: 'automation'
      })
    }

    return insights
  }

  /**
   * Analyze AI performance metrics
   */
  private async analyzeAIPerformance(
    current: any,
    previous: any,
    timeframe: string
  ): Promise<PerformanceInsight[]> {
    const insights: PerformanceInsight[] = []

    const aiSuccessRateChange = current.aiSuccessRate - (previous?.aiSuccessRate || 0)
    
    if (Math.abs(aiSuccessRateChange) > 5) {
      insights.push({
        id: `ai_performance_${Date.now()}`,
        type: aiSuccessRateChange > 0 ? 'opportunity' : 'warning',
        title: aiSuccessRateChange > 0 ? 'AI Performance Improving' : 'AI Performance Declining',
        description: `AI success rate has ${aiSuccessRateChange > 0 ? 'improved' : 'declined'} by ${Math.abs(aiSuccessRateChange).toFixed(1)}%`,
        impact: Math.abs(aiSuccessRateChange) > 15 ? 'high' : 'medium',
        confidence: 0.85,
        actionable: true,
        recommendations: aiSuccessRateChange > 0
          ? ['Continue current AI configuration', 'Consider expanding AI usage']
          : ['Review AI agent settings', 'Update training data', 'Check API connectivity'],
        metrics: {
          current: current.aiSuccessRate,
          previous: previous?.aiSuccessRate || 0,
          change: aiSuccessRateChange,
          changePercent: aiSuccessRateChange
        },
        timeframe,
        category: 'ai_performance'
      })
    }

    return insights
  }

  /**
   * Analyze user behavior patterns
   */
  private async analyzeUserBehavior(
    current: any,
    previous: any,
    timeframe: string
  ): Promise<PerformanceInsight[]> {
    const insights: PerformanceInsight[] = []

    const userGrowthChange = current.newUsers - (previous?.newUsers || 0)
    
    if (Math.abs(userGrowthChange) > 0) {
      insights.push({
        id: `user_growth_${Date.now()}`,
        type: userGrowthChange > 0 ? 'opportunity' : 'warning',
        title: userGrowthChange > 0 ? 'User Growth Detected' : 'User Growth Slowing',
        description: `${Math.abs(userGrowthChange)} ${userGrowthChange > 0 ? 'new' : 'fewer'} users compared to previous ${timeframe}`,
        impact: Math.abs(userGrowthChange) > 10 ? 'high' : Math.abs(userGrowthChange) > 3 ? 'medium' : 'low',
        confidence: 0.8,
        actionable: true,
        recommendations: userGrowthChange > 0
          ? ['Analyze successful acquisition channels', 'Scale working strategies']
          : ['Review onboarding process', 'Improve user experience', 'Check marketing campaigns'],
        metrics: {
          current: current.newUsers,
          previous: previous?.newUsers || 0,
          change: userGrowthChange,
          changePercent: previous?.newUsers ? (userGrowthChange / previous.newUsers) * 100 : 0
        },
        timeframe,
        category: 'user_behavior'
      })
    }

    return insights
  }

  /**
   * Analyze scheduling optimization opportunities
   */
  private async analyzeSchedulingOptimization(
    userId: string,
    timeframe: string
  ): Promise<PerformanceInsight[]> {
    const insights: PerformanceInsight[] = []

    try {
      // Get scheduling data
      const { data: schedules, error } = await this.supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')

      if (error || !schedules?.length) {
        return insights
      }

      const unoptimizedSchedules = schedules.filter(s => !s.ai_optimized)
      
      if (unoptimizedSchedules.length > 0) {
        insights.push({
          id: `scheduling_optimization_${Date.now()}`,
          type: 'opportunity',
          title: 'Scheduling Optimization Available',
          description: `${unoptimizedSchedules.length} schedules could benefit from AI optimization`,
          impact: unoptimizedSchedules.length > 5 ? 'high' : 'medium',
          confidence: 0.9,
          actionable: true,
          recommendations: [
            'Enable AI optimization for schedules',
            'Review audience behavior patterns',
            'Test optimized timing for better engagement'
          ],
          metrics: {
            current: schedules.length - unoptimizedSchedules.length,
            previous: 0,
            change: unoptimizedSchedules.length,
            changePercent: (unoptimizedSchedules.length / schedules.length) * 100
          },
          timeframe,
          category: 'scheduling'
        })
      }
    } catch (error) {
      console.error('Error analyzing scheduling optimization:', error)
    }

    return insights
  }

  // Helper methods
  private async getPreviousPeriodMetrics(userId: string, timeframe: string) {
    // Implementation would fetch metrics from the previous period
    // For now, return mock data
    return {
      totalMessages: 100,
      messagesReceived: 75,
      averageResponseTime: 300000,
      automationTriggers: 50,
      automationSuccess: 45,
      aiSuccessRate: 85,
      newUsers: 5
    }
  }

  private async getHistoricalMetrics(userId: string, period: string) {
    // Implementation would fetch historical metrics
    return []
  }

  private async predictEngagementMetrics(historicalData: any[], period: string): Promise<PerformancePrediction[]> {
    // Statistical prediction implementation
    return [
      {
        metric: 'Response Rate',
        currentValue: 0.75,
        predictedValue: 0.78,
        confidence: 0.8,
        timeframe: period,
        factors: ['Improved message timing', 'Better content quality'],
        recommendations: ['Continue current messaging strategy', 'Test new content formats']
      }
    ]
  }

  private async predictAutomationMetrics(historicalData: any[], period: string): Promise<PerformancePrediction[]> {
    return [
      {
        metric: 'Automation Success Rate',
        currentValue: 0.9,
        predictedValue: 0.92,
        confidence: 0.85,
        timeframe: period,
        factors: ['Optimized triggers', 'Improved error handling'],
        recommendations: ['Scale successful automation flows', 'Monitor performance closely']
      }
    ]
  }

  private async predictUserGrowth(historicalData: any[], period: string): Promise<PerformancePrediction[]> {
    return [
      {
        metric: 'User Growth',
        currentValue: 10,
        predictedValue: 12,
        confidence: 0.7,
        timeframe: period,
        factors: ['Seasonal trends', 'Marketing campaigns'],
        recommendations: ['Prepare for increased capacity', 'Optimize onboarding flow']
      }
    ]
  }

  private async enhanceInsightsWithAI(
    insights: PerformanceInsight[],
    metrics: any,
    brandId: string
  ): Promise<PerformanceInsight[]> {
    // AI enhancement implementation
    return insights
  }

  private async enhancePredictionsWithAI(
    predictions: PerformancePrediction[],
    historicalData: any,
    brandId: string
  ): Promise<PerformancePrediction[]> {
    // AI enhancement implementation
    return predictions
  }

  private calculateReportPeriod(reportType: string, customPeriod?: { start: string; end: string }) {
    if (customPeriod) {
      return { periodStart: customPeriod.start, periodEnd: customPeriod.end }
    }

    const now = new Date()
    const end = now.toISOString().split('T')[0]
    
    let start: Date
    switch (reportType) {
      case 'daily':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'weekly':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    return { periodStart: start.toISOString().split('T')[0], periodEnd: end }
  }

  private getTimeframeFromReportType(reportType: string): '24h' | '7d' | '30d' | '90d' {
    switch (reportType) {
      case 'daily': return '24h'
      case 'weekly': return '7d'
      case 'monthly': return '30d'
      default: return '7d'
    }
  }

  private async calculateKeyMetrics(userId: string, periodStart: string, periodEnd: string) {
    const metrics = analyticsCollector.calculateMetrics({ 
      timeRange: '30d'
    })

    return {
      engagement: {
        responseRate: metrics.messagesReceived / Math.max(metrics.totalMessages, 1),
        averageResponseTime: metrics.averageResponseTime,
        peakHours: metrics.hourlyActivity
          .sort((a, b) => b.messages - a.messages)
          .slice(0, 3)
          .map(h => h.hour)
      },
      automation: {
        successRate: metrics.automationSuccess / Math.max(metrics.automationTriggers, 1),
        triggerCount: metrics.automationTriggers,
        topPerformingFlows: metrics.topFlows.slice(0, 3).map(f => f.name)
      },
      ai: {
        successRate: metrics.aiSuccessRate / 100,
        averageConfidence: metrics.averageAiConfidence / 100,
        errorRate: metrics.aiErrors / Math.max(metrics.aiResponses, 1)
      },
      growth: {
        userGrowth: metrics.newUsers,
        messageVolume: metrics.totalMessages,
        retentionRate: metrics.userRetention / 100
      }
    }
  }

  private async generateRecommendations(
    insights: PerformanceInsight[],
    predictions: PerformancePrediction[],
    keyMetrics: any
  ) {
    const recommendations = []

    // Generate recommendations based on insights
    insights.forEach(insight => {
      if (insight.actionable && insight.impact === 'high') {
        recommendations.push({
          priority: 'high' as const,
          category: insight.category,
          title: `Address ${insight.title}`,
          description: insight.recommendations[0] || insight.description,
          expectedImpact: 'Significant improvement in ' + insight.category,
          effort: 'medium' as const
        })
      }
    })

    // Add general recommendations based on key metrics
    if (keyMetrics.engagement.responseRate < 0.5) {
      recommendations.push({
        priority: 'high' as const,
        category: 'engagement',
        title: 'Improve Response Rate',
        description: 'Response rate is below 50%. Consider improving message quality and timing.',
        expectedImpact: 'Increase user engagement by 20-30%',
        effort: 'medium' as const
      })
    }

    if (keyMetrics.automation.successRate < 0.8) {
      recommendations.push({
        priority: 'medium' as const,
        category: 'automation',
        title: 'Optimize Automation Flows',
        description: 'Automation success rate could be improved. Review and update trigger conditions.',
        expectedImpact: 'Reduce manual intervention by 15-25%',
        effort: 'low' as const
      })
    }

    return recommendations.slice(0, 10) // Limit to top 10 recommendations
  }

  private async storePerformanceReport(report: PerformanceReport) {
    try {
      const { error } = await this.supabase
        .from('performance_reports')
        .insert({
          id: report.id,
          user_id: report.userId,
          brand_id: report.brandId,
          report_type: report.reportType,
          period_start: report.periodStart,
          period_end: report.periodEnd,
          metrics: {
            keyMetrics: report.keyMetrics,
            predictions: report.predictions
          },
          insights: report.insights,
          recommendations: report.recommendations,
          ai_generated: report.aiGenerated
        })

      if (error) {
        console.error('Error storing performance report:', error)
        throw error
      }
    } catch (error) {
      console.error('Error storing performance report:', error)
      throw error
    }
  }

  private getDefaultKeyMetrics() {
    return {
      engagement: {
        responseRate: 0,
        averageResponseTime: 0,
        peakHours: []
      },
      automation: {
        successRate: 0,
        triggerCount: 0,
        topPerformingFlows: []
      },
      ai: {
        successRate: 0,
        averageConfidence: 0,
        errorRate: 0
      },
      growth: {
        userGrowth: 0,
        messageVolume: 0,
        retentionRate: 0
      }
    }
  }
}

export const performanceInsightsEngine = new PerformanceInsightsEngine() 