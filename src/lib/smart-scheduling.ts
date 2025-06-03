import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getAIAgentManager } from './ai-agent-manager'

interface AudienceInsights {
  mostActiveHours: number[]
  mostActiveDays: string[]
  engagementPatterns: {
    hour: number
    day: string
    engagement_rate: number
    message_count: number
  }[]
  timeZone: string
  averageResponseTime: number
}

interface ScheduleOptimization {
  recommendedTime: string
  confidence: number
  reasoning: string
  alternativeTimes: string[]
  expectedEngagement: number
  audienceSize: number
}

interface SmartScheduleConfig {
  scheduleId: string
  originalTime: string
  optimizedTime: string
  frequency: string
  audienceSegment?: string
  contentType: string
  platform: string
  aiOptimized: boolean
  optimizationScore: number
  lastOptimized: string
}

export class SmartSchedulingService {
  private supabase = createClientComponentClient()
  private aiManager = getAIAgentManager()

  /**
   * Analyze audience behavior patterns to determine optimal posting times
   */
  async analyzeAudienceBehavior(userId: string, brandId?: string): Promise<AudienceInsights> {
    try {
      // Get message engagement data from the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: messages, error } = await this.supabase
        .from('messages')
        .select(`
          sent_at,
          response_received,
          response_time,
          client_id,
          clients!inner(
            user_id,
            brand_id
          )
        `)
        .eq('clients.user_id', userId)
        .gte('sent_at', thirtyDaysAgo.toISOString())
        .order('sent_at', { ascending: false })

      if (error) {
        console.error('Error fetching message data:', error)
        throw error
      }

      // Analyze patterns
      const hourlyEngagement: { [hour: number]: { total: number, responses: number } } = {}
      const dailyEngagement: { [day: string]: { total: number, responses: number } } = {}
      const responseTimes: number[] = []

      messages?.forEach(message => {
        const sentDate = new Date(message.sent_at)
        const hour = sentDate.getHours()
        const day = sentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

        // Initialize if not exists
        if (!hourlyEngagement[hour]) {
          hourlyEngagement[hour] = { total: 0, responses: 0 }
        }
        if (!dailyEngagement[day]) {
          dailyEngagement[day] = { total: 0, responses: 0 }
        }

        // Count messages
        hourlyEngagement[hour].total++
        dailyEngagement[day].total++

        // Count responses
        if (message.response_received) {
          hourlyEngagement[hour].responses++
          dailyEngagement[day].responses++

          if (message.response_time) {
            responseTimes.push(message.response_time)
          }
        }
      })

      // Calculate engagement patterns
      const engagementPatterns = []
      for (const [hour, data] of Object.entries(hourlyEngagement)) {
        for (const [day, dayData] of Object.entries(dailyEngagement)) {
          const engagementRate = data.total > 0 ? data.responses / data.total : 0
          engagementPatterns.push({
            hour: parseInt(hour),
            day,
            engagement_rate: engagementRate,
            message_count: data.total
          })
        }
      }

      // Find most active hours and days
      const mostActiveHours = Object.entries(hourlyEngagement)
        .sort(([,a], [,b]) => (b.responses / Math.max(b.total, 1)) - (a.responses / Math.max(a.total, 1)))
        .slice(0, 3)
        .map(([hour]) => parseInt(hour))

      const mostActiveDays = Object.entries(dailyEngagement)
        .sort(([,a], [,b]) => (b.responses / Math.max(b.total, 1)) - (a.responses / Math.max(a.total, 1)))
        .slice(0, 3)
        .map(([day]) => day)

      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 0

      return {
        mostActiveHours,
        mostActiveDays,
        engagementPatterns,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        averageResponseTime
      }
    } catch (error) {
      console.error('Error analyzing audience behavior:', error)
      throw error
    }
  }

  /**
   * Get AI-powered schedule optimization recommendations
   */
  async getScheduleOptimization(
    userId: string,
    scheduleConfig: {
      messageContent: string
      currentTime: string
      frequency: string
      contentType: string
      platform: string
      targetAudience?: any
    },
    brandId?: string
  ): Promise<ScheduleOptimization> {
    try {
      // Get audience insights
      const audienceInsights = await this.analyzeAudienceBehavior(userId, brandId)

      // Use AI agent to analyze and recommend optimal timing
      if (brandId) {
        try {
          const optimizedSchedules = await this.aiManager.optimizeScheduling(brandId, [{
            ...scheduleConfig,
            audienceInsights
          }])

          if (optimizedSchedules && optimizedSchedules.length > 0) {
            const optimization = optimizedSchedules[0]
            return {
              recommendedTime: optimization.recommendedTime || this.getBestTimeFromInsights(audienceInsights),
              confidence: optimization.confidence || 0.8,
              reasoning: optimization.reasoning || this.generateReasoningFromInsights(audienceInsights),
              alternativeTimes: optimization.alternativeTimes || this.getAlternativeTimesFromInsights(audienceInsights),
              expectedEngagement: optimization.expectedEngagement || this.calculateExpectedEngagement(audienceInsights),
              audienceSize: optimization.audienceSize || 0
            }
          }
        } catch (aiError) {
          console.warn('AI optimization failed, falling back to rule-based optimization:', aiError)
        }
      }

      // Fallback to rule-based optimization
      return this.getRuleBasedOptimization(audienceInsights, scheduleConfig)
    } catch (error) {
      console.error('Error getting schedule optimization:', error)
      throw error
    }
  }

  /**
   * Apply AI optimization to existing schedules
   */
  async optimizeExistingSchedules(userId: string, brandId?: string): Promise<SmartScheduleConfig[]> {
    try {
      // Get all active schedules for the user
      const { data: schedules, error } = await this.supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .eq('ai_optimized', false)

      if (error) {
        console.error('Error fetching schedules:', error)
        throw error
      }

      const optimizedSchedules: SmartScheduleConfig[] = []

      for (const schedule of schedules || []) {
        try {
          const optimization = await this.getScheduleOptimization(userId, {
            messageContent: schedule.message_content || schedule.message || '',
            currentTime: this.extractTimeFromCron(schedule.cron || ''),
            frequency: schedule.schedule_type || 'daily',
            contentType: 'message',
            platform: 'whatsapp'
          }, brandId)

          // Update schedule with optimization
          const optimizedConfig: SmartScheduleConfig = {
            scheduleId: schedule.id,
            originalTime: this.extractTimeFromCron(schedule.cron || ''),
            optimizedTime: optimization.recommendedTime,
            frequency: schedule.schedule_type || 'daily',
            contentType: 'message',
            platform: 'whatsapp',
            aiOptimized: true,
            optimizationScore: optimization.confidence,
            lastOptimized: new Date().toISOString()
          }

          // Update the schedule in the database
          const newCron = this.generateOptimizedCron(
            schedule.cron || '',
            optimization.recommendedTime
          )

          const { error: updateError } = await this.supabase
            .from('schedules')
            .update({
              cron: newCron,
              ai_optimized: true,
              optimization_settings: {
                original_time: optimizedConfig.originalTime,
                optimized_time: optimization.recommendedTime,
                confidence: optimization.confidence,
                reasoning: optimization.reasoning,
                last_optimized: new Date().toISOString()
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', schedule.id)

          if (updateError) {
            console.error('Error updating schedule:', updateError)
            continue
          }

          optimizedSchedules.push(optimizedConfig)
        } catch (scheduleError) {
          console.error(`Error optimizing schedule ${schedule.id}:`, scheduleError)
          continue
        }
      }

      return optimizedSchedules
    } catch (error) {
      console.error('Error optimizing existing schedules:', error)
      throw error
    }
  }

  /**
   * Get performance analytics for scheduled messages
   */
  async getSchedulePerformanceAnalytics(userId: string, scheduleId?: string) {
    try {
      let query = this.supabase
        .from('messages')
        .select(`
          sent_at,
          response_received,
          response_time,
          ai_generated,
          schedule_id,
          clients!inner(user_id)
        `)
        .eq('clients.user_id', userId)

      if (scheduleId) {
        query = query.eq('schedule_id', scheduleId)
      }

      const { data: messages, error } = await query
        .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('sent_at', { ascending: false })

      if (error) {
        console.error('Error fetching schedule performance:', error)
        throw error
      }

      // Calculate performance metrics
      const totalMessages = messages?.length || 0
      const responsesReceived = messages?.filter(m => m.response_received).length || 0
      const averageResponseTime = messages?.filter(m => m.response_time)
        .reduce((sum, m, _, arr) => sum + (m.response_time || 0) / arr.length, 0) || 0

      // Group by hour for timing analysis
      const hourlyPerformance: { [hour: number]: { sent: number, responses: number } } = {}
      messages?.forEach(message => {
        const hour = new Date(message.sent_at).getHours()
        if (!hourlyPerformance[hour]) {
          hourlyPerformance[hour] = { sent: 0, responses: 0 }
        }
        hourlyPerformance[hour].sent++
        if (message.response_received) {
          hourlyPerformance[hour].responses++
        }
      })

      return {
        totalMessages,
        responsesReceived,
        responseRate: totalMessages > 0 ? responsesReceived / totalMessages : 0,
        averageResponseTime,
        hourlyPerformance,
        bestPerformingHours: Object.entries(hourlyPerformance)
          .sort(([,a], [,b]) => (b.responses / Math.max(b.sent, 1)) - (a.responses / Math.max(a.sent, 1)))
          .slice(0, 3)
          .map(([hour, data]) => ({
            hour: parseInt(hour),
            responseRate: data.responses / Math.max(data.sent, 1),
            messageCount: data.sent
          }))
      }
    } catch (error) {
      console.error('Error getting schedule performance analytics:', error)
      throw error
    }
  }

  // Helper methods
  private getBestTimeFromInsights(insights: AudienceInsights): string {
    if (insights.mostActiveHours.length > 0) {
      const bestHour = insights.mostActiveHours[0]
      return `${bestHour.toString().padStart(2, '0')}:00`
    }
    return '09:00' // Default fallback
  }

  private generateReasoningFromInsights(insights: AudienceInsights): string {
    const bestHour = insights.mostActiveHours[0] || 9
    const bestDay = insights.mostActiveDays[0] || 'monday'
    
    return `Based on your audience analysis, ${bestHour}:00 shows the highest engagement rate. Your audience is most active on ${bestDay}s with an average response time of ${Math.round(insights.averageResponseTime / 60)} minutes.`
  }

  private getAlternativeTimesFromInsights(insights: AudienceInsights): string[] {
    return insights.mostActiveHours.slice(1, 4).map(hour => 
      `${hour.toString().padStart(2, '0')}:00`
    )
  }

  private calculateExpectedEngagement(insights: AudienceInsights): number {
    const bestPattern = insights.engagementPatterns
      .sort((a, b) => b.engagement_rate - a.engagement_rate)[0]
    
    return bestPattern?.engagement_rate || 0.3
  }

  private getRuleBasedOptimization(
    insights: AudienceInsights, 
    config: any
  ): ScheduleOptimization {
    // Rule-based fallback optimization
    const bestTime = this.getBestTimeFromInsights(insights)
    
    return {
      recommendedTime: bestTime,
      confidence: 0.7,
      reasoning: this.generateReasoningFromInsights(insights),
      alternativeTimes: this.getAlternativeTimesFromInsights(insights),
      expectedEngagement: this.calculateExpectedEngagement(insights),
      audienceSize: 0
    }
  }

  private extractTimeFromCron(cron: string): string {
    try {
      const parts = cron.split(' ')
      if (parts.length >= 2) {
        const minute = parts[0]
        const hour = parts[1]
        return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
      }
    } catch (error) {
      console.error('Error extracting time from cron:', error)
    }
    return '09:00'
  }

  private generateOptimizedCron(originalCron: string, newTime: string): string {
    try {
      const [hour, minute] = newTime.split(':')
      const parts = originalCron.split(' ')
      
      if (parts.length >= 5) {
        parts[0] = minute
        parts[1] = hour
        return parts.join(' ')
      }
    } catch (error) {
      console.error('Error generating optimized cron:', error)
    }
    
    // Fallback to daily schedule with new time
    const [hour, minute] = newTime.split(':')
    return `${minute} ${hour} * * *`
  }
}

export const smartSchedulingService = new SmartSchedulingService() 