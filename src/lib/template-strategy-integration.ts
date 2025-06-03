import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { strategyService } from './strategy-service'
import type { ContentPillar, Strategy } from '@/types/strategy'

export interface TemplateWithStrategy {
  id: string
  name: string
  content: string
  content_pillar?: ContentPillar
  strategy_id?: string
  performance_score?: number
  created_at: string
  updated_at: string
}

export interface TemplateScheduleContext {
  template: TemplateWithStrategy
  strategy?: Strategy
  recommended_time?: string
  content_pillar_optimal_times?: Record<ContentPillar, string[]>
}

export class TemplateStrategyIntegration {
  private supabase = createClientComponentClient()

  /**
   * Get templates with strategy context for scheduling optimization
   */
  async getTemplatesWithStrategyContext(userId: string): Promise<TemplateScheduleContext[]> {
    try {
      // Get templates with strategy information
      const { data: templates, error } = await this.supabase
        .from('templates')
        .select(`
          *,
          strategies:strategy_id (
            id,
            name,
            content_distribution,
            target_metrics,
            audience_segments (*)
          )
        `)
        .eq('user_id', userId)

      if (error) throw error

      const templateContexts: TemplateScheduleContext[] = []

      for (const template of templates || []) {
        const context: TemplateScheduleContext = {
          template: {
            id: template.id,
            name: template.name,
            content: template.content,
            content_pillar: template.content_pillar,
            strategy_id: template.strategy_id,
            performance_score: template.performance_score,
            created_at: template.created_at,
            updated_at: template.updated_at
          }
        }

        // Add strategy context if available
        if (template.strategies) {
          context.strategy = template.strategies
        }

        // Add optimal timing recommendations based on content pillar
        if (template.content_pillar) {
          context.content_pillar_optimal_times = this.getContentPillarOptimalTimes()
          context.recommended_time = this.getRecommendedTimeForPillar(template.content_pillar)
        }

        templateContexts.push(context)
      }

      return templateContexts
    } catch (error) {
      console.error('Error fetching templates with strategy context:', error)
      throw error
    }
  }

  /**
   * Auto-categorize a template based on content analysis
   */
  async categorizeTemplate(templateId: string): Promise<ContentPillar> {
    try {
      const { data: template, error } = await this.supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error) throw error

      // Use the strategy service's categorization logic
      const pillar = this.categorizeTemplateContent(template.content)

      // Update the template with the categorization
      await this.supabase
        .from('templates')
        .update({ content_pillar: pillar })
        .eq('id', templateId)

      return pillar
    } catch (error) {
      console.error('Error categorizing template:', error)
      throw error
    }
  }

  /**
   * Bulk categorize templates for a specific strategy
   */
  async bulkCategorizeTemplates(strategyId: string): Promise<{ success: number; failed: number }> {
    try {
      const { data: templates, error } = await this.supabase
        .from('templates')
        .select('*')
        .eq('strategy_id', strategyId)
        .is('content_pillar', null)

      if (error) throw error

      let success = 0
      let failed = 0

      for (const template of templates || []) {
        try {
          await this.categorizeTemplate(template.id)
          success++
        } catch (error) {
          console.error(`Failed to categorize template ${template.id}:`, error)
          failed++
        }
      }

      return { success, failed }
    } catch (error) {
      console.error('Error bulk categorizing templates:', error)
      throw error
    }
  }

  /**
   * Get recommended scheduling time based on content pillar
   */
  getRecommendedTimeForPillar(pillar: ContentPillar): string {
    const pillarTimes = {
      educational: '09:00', // Morning when people are focused
      promotional: '14:00', // Afternoon when people are more likely to make purchasing decisions
      engagement: '18:00', // Evening when people are more social
      support: '11:00' // Mid-morning when people might need help
    }

    return pillarTimes[pillar]
  }

  /**
   * Get optimal times for each content pillar
   */
  getContentPillarOptimalTimes(): Record<ContentPillar, string[]> {
    return {
      educational: ['09:00', '10:00', '14:00'], // Focus times
      promotional: ['12:00', '14:00', '19:00'], // Decision times
      engagement: ['17:00', '18:00', '20:00'], // Social times
      support: ['10:00', '11:00', '15:00'] // Help-seeking times
    }
  }

  /**
   * Calculate content distribution health for a strategy
   */
  async calculateContentDistributionHealth(strategyId: string): Promise<{
    health_score: number
    recommendations: string[]
    pillar_balance: Record<ContentPillar, { actual: number; target: number; status: string }>
  }> {
    try {
      // Get strategy and its templates
      const [strategyResult, templatesResult] = await Promise.all([
        this.supabase.from('strategies').select('*').eq('id', strategyId).single(),
        this.supabase.from('templates').select('content_pillar').eq('strategy_id', strategyId)
      ])

      if (strategyResult.error) throw strategyResult.error

      const strategy = strategyResult.data
      const templates = templatesResult.data || []

      const contentDistribution = strategy.content_distribution
      const categorizedTemplates = templates.filter(t => t.content_pillar)

      // Calculate actual distribution
      const pillarCounts = {
        educational: categorizedTemplates.filter(t => t.content_pillar === 'educational').length,
        promotional: categorizedTemplates.filter(t => t.content_pillar === 'promotional').length,
        engagement: categorizedTemplates.filter(t => t.content_pillar === 'engagement').length,
        support: categorizedTemplates.filter(t => t.content_pillar === 'support').length
      }

      const totalCategorized = Object.values(pillarCounts).reduce((sum, count) => sum + count, 0)

      const pillarBalance: Record<ContentPillar, { actual: number; target: number; status: string }> = {
        educational: {
          actual: totalCategorized > 0 ? (pillarCounts.educational / totalCategorized) * 100 : 0,
          target: contentDistribution.educational,
          status: 'optimal'
        },
        promotional: {
          actual: totalCategorized > 0 ? (pillarCounts.promotional / totalCategorized) * 100 : 0,
          target: contentDistribution.promotional,
          status: 'optimal'
        },
        engagement: {
          actual: totalCategorized > 0 ? (pillarCounts.engagement / totalCategorized) * 100 : 0,
          target: contentDistribution.engagement,
          status: 'optimal'
        },
        support: {
          actual: totalCategorized > 0 ? (pillarCounts.support / totalCategorized) * 100 : 0,
          target: contentDistribution.support,
          status: 'optimal'
        }
      }

      // Calculate health score and recommendations
      let totalDeviation = 0
      const recommendations: string[] = []

      Object.entries(pillarBalance).forEach(([pillar, balance]) => {
        const deviation = Math.abs(balance.actual - balance.target)
        totalDeviation += deviation

        if (deviation > 15) {
          balance.status = 'critical'
          recommendations.push(`${pillar} content is significantly ${balance.actual < balance.target ? 'under' : 'over'}-represented`)
        } else if (deviation > 5) {
          balance.status = 'needs_attention'
          recommendations.push(`${pillar} content needs minor adjustment`)
        }
      })

      const healthScore = Math.max(0, 100 - (totalDeviation / 4))

      if (totalCategorized < templates.length) {
        recommendations.push(`${templates.length - totalCategorized} templates need categorization`)
      }

      return {
        health_score: Math.round(healthScore),
        recommendations,
        pillar_balance: pillarBalance
      }
    } catch (error) {
      console.error('Error calculating content distribution health:', error)
      throw error
    }
  }

  /**
   * Simple rule-based content categorization
   */
  private categorizeTemplateContent(content: string): ContentPillar {
    const lowerContent = content.toLowerCase()

    // Educational keywords
    if (lowerContent.includes('learn') || 
        lowerContent.includes('tip') || 
        lowerContent.includes('how to') ||
        lowerContent.includes('tutorial') ||
        lowerContent.includes('guide') ||
        lowerContent.includes('did you know')) {
      return 'educational'
    }

    // Promotional keywords
    if (lowerContent.includes('buy') || 
        lowerContent.includes('offer') || 
        lowerContent.includes('sale') ||
        lowerContent.includes('discount') ||
        lowerContent.includes('special') ||
        lowerContent.includes('limited time') ||
        lowerContent.includes('purchase')) {
      return 'promotional'
    }

    // Engagement keywords
    if (lowerContent.includes('question') || 
        lowerContent.includes('poll') || 
        lowerContent.includes('share') ||
        lowerContent.includes('what do you think') ||
        lowerContent.includes('tell us') ||
        lowerContent.includes('comment') ||
        lowerContent.includes('feedback')) {
      return 'engagement'
    }

    // Support keywords
    if (lowerContent.includes('help') || 
        lowerContent.includes('support') || 
        lowerContent.includes('problem') ||
        lowerContent.includes('issue') ||
        lowerContent.includes('contact us') ||
        lowerContent.includes('assistance') ||
        lowerContent.includes('faq')) {
      return 'support'
    }

    // Default to educational if no clear indicators
    return 'educational'
  }
}

export const templateStrategyIntegration = new TemplateStrategyIntegration() 