import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type {
  Strategy,
  ContentPillar,
  ContentPillarAnalytics,
  StrategyAnalytics,
  AudienceSegment,
  StrategyDashboard,
  ContentPillarInsights,
  PerformanceInsights,
  StrategyTemplate,
  StrategyWizardData,
  ContentDistribution
} from '@/types/strategy'

export class StrategyService {
  private supabase = createClientComponentClient()

  /**
   * Create a new strategy
   */
  async createStrategy(data: Partial<Strategy>): Promise<Strategy> {
    try {
      const { data: user } = await this.supabase.auth.getUser()
      if (!user.user) throw new Error('User not authenticated')

      const strategyData = {
        user_id: user.user.id,
        name: data.name || 'Untitled Strategy',
        description: data.description || '',
        business_objectives: data.business_objectives || {},
        target_metrics: data.target_metrics || {},
        content_distribution: data.content_distribution || {
          educational: 40,
          promotional: 30,
          engagement: 20,
          support: 10
        },
        status: data.status || 'draft'
      }

      const { data: strategy, error } = await this.supabase
        .from('strategies')
        .insert(strategyData)
        .select()
        .single()

      if (error) throw error

      // Initialize content pillar analytics
      await this.initializeContentPillarAnalytics(strategy.id)

      return strategy
    } catch (error) {
      console.error('Error creating strategy:', error)
      throw error
    }
  }

  /**
   * Create strategy from wizard data
   */
  async createStrategyFromWizard(wizardData: StrategyWizardData): Promise<Strategy> {
    try {
      const strategyData: Partial<Strategy> = {
        name: `${wizardData.business_foundation.business_name} Strategy`,
        description: `Strategy for ${wizardData.business_foundation.industry} targeting ${wizardData.business_foundation.target_audience}`,
        business_objectives: {
          primary_goal: wizardData.objectives.primary_objective,
          secondary_goals: wizardData.objectives.secondary_objectives,
          target_audience: wizardData.business_foundation.target_audience,
          value_proposition: wizardData.business_foundation.value_proposition,
          key_challenges: []
        },
        target_metrics: wizardData.objectives.target_metrics,
        content_distribution: wizardData.content_strategy.content_distribution,
        status: 'active'
      }

      const strategy = await this.createStrategy(strategyData)

      // Create audience segments if provided
      if (wizardData.audience_insights.segments.length > 0) {
        for (const segmentData of wizardData.audience_insights.segments) {
          if (segmentData.name && segmentData.criteria) {
            await this.createAudienceSegment(strategy.id, {
              name: segmentData.name,
              description: segmentData.description,
              criteria: segmentData.criteria,
              communication_preferences: wizardData.audience_insights.communication_preferences
            })
          }
        }
      }

      return strategy
    } catch (error) {
      console.error('Error creating strategy from wizard:', error)
      throw error
    }
  }

  /**
   * Get all strategies for current user
   */
  async getStrategies(): Promise<Strategy[]> {
    try {
      const { data: strategies, error } = await this.supabase
        .from('strategies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return strategies || []
    } catch (error) {
      console.error('Error fetching strategies:', error)
      throw error
    }
  }

  /**
   * Get strategy by ID with related data
   */
  async getStrategy(id: string): Promise<{
    strategy: Strategy
    analytics: ContentPillarAnalytics[]
    segments: AudienceSegment[]
    template_count: number
  }> {
    try {
      const [strategyResult, analyticsResult, segmentsResult, templateCountResult] = await Promise.all([
        this.supabase.from('strategies').select('*').eq('id', id).single(),
        this.supabase.from('content_pillar_analytics').select('*').eq('strategy_id', id),
        this.supabase.from('audience_segments').select('*').eq('strategy_id', id),
        this.supabase.from('templates').select('id').eq('strategy_id', id)
      ])

      if (strategyResult.error) throw strategyResult.error

      return {
        strategy: strategyResult.data,
        analytics: analyticsResult.data || [],
        segments: segmentsResult.data || [],
        template_count: templateCountResult.data?.length || 0
      }
    } catch (error) {
      console.error('Error fetching strategy:', error)
      throw error
    }
  }

  /**
   * Update strategy
   */
  async updateStrategy(id: string, data: Partial<Strategy>): Promise<Strategy> {
    try {
      const { data: strategy, error } = await this.supabase
        .from('strategies')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return strategy
    } catch (error) {
      console.error('Error updating strategy:', error)
      throw error
    }
  }

  /**
   * Delete strategy
   */
  async deleteStrategy(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('strategies')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting strategy:', error)
      throw error
    }
  }

  /**
   * Get strategy dashboard data
   */
  async getStrategyDashboard(): Promise<StrategyDashboard> {
    try {
      const { data: user } = await this.supabase.auth.getUser()
      if (!user.user) throw new Error('User not authenticated')

      // Get all strategies
      const { data: strategies } = await this.supabase
        .from('strategies')
        .select('*')

      // Get all templates
      const { data: templates } = await this.supabase
        .from('templates')
        .select('id, content_pillar, strategy_id, performance_score')

      // Get content pillar analytics
      const { data: pillarAnalytics } = await this.supabase
        .from('content_pillar_analytics')
        .select('*')

      const strategiesData = strategies || []
      const templatesData = templates || []
      const analyticsData = pillarAnalytics || []

      // Calculate overview metrics
      const totalStrategies = strategiesData.length
      const activeStrategies = strategiesData.filter(s => s.status === 'active').length
      const totalTemplates = templatesData.length
      const categorizedTemplates = templatesData.filter(t => t.content_pillar).length

      // Calculate content distribution health
      const contentDistributionHealth = this.calculateContentDistributionHealth(templatesData)

      // Calculate overall performance score
      const overallPerformanceScore = this.calculateOverallPerformanceScore(analyticsData)

      // Get content pillar health
      const contentPillarHealth = await this.getContentPillarHealth(strategiesData[0])

      // Get performance insights
      const performanceInsights = await this.getPerformanceInsights()

      // Generate quick actions
      const quickActions = this.generateQuickActions(
        totalTemplates,
        categorizedTemplates,
        contentPillarHealth
      )

      return {
        strategy_overview: {
          total_strategies: totalStrategies,
          active_strategies: activeStrategies,
          total_templates: totalTemplates,
          categorized_templates: categorizedTemplates,
          overall_performance_score: overallPerformanceScore,
          content_distribution_health: contentDistributionHealth
        },
        content_pillar_health: contentPillarHealth,
        performance_insights: performanceInsights,
        quick_actions: quickActions
      }
    } catch (error) {
      console.error('Error fetching strategy dashboard:', error)
      throw error
    }
  }

  /**
   * Get content pillar analytics and insights
   */
  async getContentPillarInsights(strategyId?: string): Promise<ContentPillarInsights> {
    try {
      let templatesQuery = this.supabase
        .from('templates')
        .select('content_pillar, performance_score')

      if (strategyId) {
        templatesQuery = templatesQuery.eq('strategy_id', strategyId)
      }

      const { data: templates } = await templatesQuery

      const templatesData = templates || []

      // Calculate pillar distribution
      const pillarCounts = {
        educational: templatesData.filter(t => t.content_pillar === 'educational').length,
        promotional: templatesData.filter(t => t.content_pillar === 'promotional').length,
        engagement: templatesData.filter(t => t.content_pillar === 'engagement').length,
        support: templatesData.filter(t => t.content_pillar === 'support').length
      }

      const totalCategorized = Object.values(pillarCounts).reduce((sum, count) => sum + count, 0)

      const pillarDistribution = {
        educational: {
          count: pillarCounts.educational,
          percentage: totalCategorized > 0 ? (pillarCounts.educational / totalCategorized) * 100 : 0
        },
        promotional: {
          count: pillarCounts.promotional,
          percentage: totalCategorized > 0 ? (pillarCounts.promotional / totalCategorized) * 100 : 0
        },
        engagement: {
          count: pillarCounts.engagement,
          percentage: totalCategorized > 0 ? (pillarCounts.engagement / totalCategorized) * 100 : 0
        },
        support: {
          count: pillarCounts.support,
          percentage: totalCategorized > 0 ? (pillarCounts.support / totalCategorized) * 100 : 0
        }
      }

      // Ideal distribution
      const idealDistribution = { educational: 40, promotional: 30, engagement: 20, support: 10 }

      // Find missing and overweight pillars
      const missingPillars: ContentPillar[] = []
      const overweightPillars: ContentPillar[] = []

      Object.entries(pillarDistribution).forEach(([pillar, data]) => {
        const ideal = idealDistribution[pillar as ContentPillar]
        if (data.percentage < ideal - 10) {
          missingPillars.push(pillar as ContentPillar)
        } else if (data.percentage > ideal + 10) {
          overweightPillars.push(pillar as ContentPillar)
        }
      })

      // Generate suggestions
      const suggestedActions = this.generateContentSuggestions(missingPillars, overweightPillars)

      // Performance comparison
      const pillarPerformances = Object.entries(pillarCounts).map(([pillar, count]) => {
        const pillarTemplates = templatesData.filter(t => t.content_pillar === pillar)
        const avgPerformance = pillarTemplates.length > 0
          ? pillarTemplates.reduce((sum, t) => sum + (t.performance_score || 0), 0) / pillarTemplates.length
          : 0
        return { pillar: pillar as ContentPillar, performance: avgPerformance }
      })

      const bestPerforming = pillarPerformances.reduce((best, current) =>
        current.performance > best.performance ? current : best
      )

      const worstPerforming = pillarPerformances.reduce((worst, current) =>
        current.performance < worst.performance ? current : worst
      )

      const averageEngagement = pillarPerformances.reduce((sum, p) => sum + p.performance, 0) / pillarPerformances.length

      return {
        pillar_distribution: pillarDistribution,
        recommendations: {
          missing_pillars: missingPillars,
          overweight_pillars: overweightPillars,
          suggested_actions: suggestedActions
        },
        performance_comparison: {
          best_performing: bestPerforming.pillar,
          worst_performing: worstPerforming.pillar,
          average_engagement: averageEngagement
        }
      }
    } catch (error) {
      console.error('Error getting content pillar insights:', error)
      throw error
    }
  }

  /**
   * Update template content pillar
   */
  async updateTemplateContentPillar(templateId: string, pillar: ContentPillar, strategyId?: string): Promise<void> {
    try {
      const updateData: any = { content_pillar: pillar }
      if (strategyId) {
        updateData.strategy_id = strategyId
      }

      const { error } = await this.supabase
        .from('templates')
        .update(updateData)
        .eq('id', templateId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating template content pillar:', error)
      throw error
    }
  }

  /**
   * Auto-categorize templates using AI (placeholder for future implementation)
   */
  async autoCategorizeTemplates(strategyId: string): Promise<{ categorized: number; failed: number }> {
    try {
      // Get uncategorized templates for the strategy
      const { data: templates } = await this.supabase
        .from('templates')
        .select('*')
        .eq('strategy_id', strategyId)
        .is('content_pillar', null)

      if (!templates || templates.length === 0) {
        return { categorized: 0, failed: 0 }
      }

      let categorized = 0
      let failed = 0

      // Simple rule-based categorization (will be enhanced with AI later)
      for (const template of templates) {
        try {
          const pillar = this.categorizeTemplateContent(template.content)
          await this.updateTemplateContentPillar(template.id, pillar)
          categorized++
        } catch (error) {
          console.error(`Failed to categorize template ${template.id}:`, error)
          failed++
        }
      }

      return { categorized, failed }
    } catch (error) {
      console.error('Error auto-categorizing templates:', error)
      throw error
    }
  }

  // Private helper methods

  private async initializeContentPillarAnalytics(strategyId: string): Promise<void> {
    const pillars: ContentPillar[] = ['educational', 'promotional', 'engagement', 'support']

    for (const pillar of pillars) {
      await this.supabase
        .from('content_pillar_analytics')
        .insert({
          strategy_id: strategyId,
          pillar_type: pillar,
          templates_count: 0,
          performance_score: 0,
          engagement_rate: 0,
          conversion_rate: 0
        })
    }
  }

  private async createAudienceSegment(strategyId: string, segmentData: Partial<AudienceSegment>): Promise<void> {
    await this.supabase
      .from('audience_segments')
      .insert({
        strategy_id: strategyId,
        ...segmentData
      })
  }

  private calculateContentDistributionHealth(templates: any[]): number {
    if (templates.length === 0) return 0

    const categorized = templates.filter(t => t.content_pillar).length
    const categorizationScore = (categorized / templates.length) * 50

    // Calculate distribution balance score
    const pillarCounts = {
      educational: templates.filter(t => t.content_pillar === 'educational').length,
      promotional: templates.filter(t => t.content_pillar === 'promotional').length,
      engagement: templates.filter(t => t.content_pillar === 'engagement').length,
      support: templates.filter(t => t.content_pillar === 'support').length
    }

    const total = Object.values(pillarCounts).reduce((sum, count) => sum + count, 0)
    if (total === 0) return categorizationScore

    const actualDistribution = {
      educational: (pillarCounts.educational / total) * 100,
      promotional: (pillarCounts.promotional / total) * 100,
      engagement: (pillarCounts.engagement / total) * 100,
      support: (pillarCounts.support / total) * 100
    }

    const idealDistribution = { educational: 40, promotional: 30, engagement: 20, support: 10 }

    const deviations = Object.entries(actualDistribution).map(([pillar, actual]) => {
      const ideal = idealDistribution[pillar as ContentPillar]
      return Math.abs(actual - ideal)
    })

    const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length
    const balanceScore = Math.max(0, 50 - avgDeviation)

    return Math.round(categorizationScore + balanceScore)
  }

  private calculateOverallPerformanceScore(analytics: ContentPillarAnalytics[]): number {
    if (analytics.length === 0) return 0

    const totalScore = analytics.reduce((sum, analytic) => sum + analytic.performance_score, 0)
    return Math.round((totalScore / analytics.length) * 100)
  }

  private async getContentPillarHealth(strategy?: Strategy): Promise<any[]> {
    if (!strategy) return []

    const { data: analytics } = await this.supabase
      .from('content_pillar_analytics')
      .select('*')
      .eq('strategy_id', strategy.id)

    const contentDistribution = strategy.content_distribution
    
    return (analytics || []).map(analytic => {
      const target = contentDistribution[analytic.pillar_type as ContentPillar] || 0
      const actual = analytic.templates_count
      const totalTemplates = Object.values(contentDistribution).reduce((sum: number, val: number) => sum + val, 0)
      const actualPercentage = totalTemplates > 0 ? (actual / totalTemplates) * 100 : 0

      let status: 'optimal' | 'needs_attention' | 'critical' = 'optimal'
      const recommendations: string[] = []

      if (Math.abs(actualPercentage - target) > 15) {
        status = 'critical'
        recommendations.push(`Significant imbalance in ${analytic.pillar_type} content`)
      } else if (Math.abs(actualPercentage - target) > 5) {
        status = 'needs_attention'
        recommendations.push(`Minor adjustment needed for ${analytic.pillar_type} content`)
      }

      return {
        pillar: analytic.pillar_type,
        template_count: actual,
        target_percentage: target,
        actual_percentage: actualPercentage,
        performance_score: analytic.performance_score,
        status,
        recommendations
      }
    })
  }

  private async getPerformanceInsights(): Promise<PerformanceInsights> {
    // Placeholder implementation - will be enhanced with real analytics
    return {
      top_performing_pillar: 'educational',
      underperforming_pillars: ['support'],
      engagement_trends: [],
      optimization_opportunities: []
    }
  }

  private generateQuickActions(totalTemplates: number, categorizedTemplates: number, pillarHealth: any[]): any[] {
    const actions = []

    if (categorizedTemplates < totalTemplates) {
      actions.push({
        id: 'categorize-templates',
        type: 'rebalance_content',
        title: 'Categorize Templates',
        description: `${totalTemplates - categorizedTemplates} templates need content pillar assignment`,
        priority: 'high',
        estimated_time: '10 minutes',
        category: 'content'
      })
    }

    const criticalPillars = pillarHealth.filter(p => p.status === 'critical')
    if (criticalPillars.length > 0) {
      actions.push({
        id: 'rebalance-content',
        type: 'rebalance_content',
        title: 'Rebalance Content',
        description: `${criticalPillars.length} content pillars need attention`,
        priority: 'high',
        estimated_time: '15 minutes',
        category: 'content'
      })
    }

    return actions
  }

  private generateContentSuggestions(missing: ContentPillar[], overweight: ContentPillar[]): string[] {
    const suggestions = []

    missing.forEach(pillar => {
      suggestions.push(`Create more ${pillar} content to reach ideal distribution`)
    })

    overweight.forEach(pillar => {
      suggestions.push(`Reduce ${pillar} content or create more content in other pillars`)
    })

    if (suggestions.length === 0) {
      suggestions.push('Content distribution is well balanced!')
    }

    return suggestions
  }

  private categorizeTemplateContent(content: string): ContentPillar {
    // Simple rule-based categorization (to be enhanced with AI)
    const lowerContent = content.toLowerCase()

    if (lowerContent.includes('learn') || lowerContent.includes('tip') || lowerContent.includes('how to')) {
      return 'educational'
    } else if (lowerContent.includes('buy') || lowerContent.includes('offer') || lowerContent.includes('sale')) {
      return 'promotional'
    } else if (lowerContent.includes('question') || lowerContent.includes('poll') || lowerContent.includes('share')) {
      return 'engagement'
    } else {
      return 'support'
    }
  }
}

export const strategyService = new StrategyService() 