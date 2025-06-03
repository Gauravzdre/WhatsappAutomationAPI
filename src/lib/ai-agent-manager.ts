import { getJulepService } from './julep-client';
import { createClient } from '@supabase/supabase-js';

interface BrandAgents {
  brandPersona?: string;
  contentCreator?: string;
  scheduler?: string;
  salesAgent?: string;
  analytics?: string;
  campaignOrchestrator?: string;
}

interface AgentInitializationData {
  brandId: string;
  brandData: {
    name: string;
    industry: string;
    description: string;
    voice: any;
    guidelines: string;
    targetAudience: any;
  };
  userId: string;
}

class AIAgentManager {
  private julepService;
  private supabase;
  private supabaseKey: string;
  private julepApiKey: string;

  constructor(supabaseKey?: string, julepApiKey?: string) {
    // Make supabase optional for development
    this.supabaseKey = supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-key'
    this.julepApiKey = julepApiKey || process.env.JULEP_API_KEY || 'demo-key'
    
    if (!this.supabaseKey || this.supabaseKey === 'demo-key') {
      console.warn('⚠️ Using demo mode - Supabase key not provided')
    }
    
    if (!this.julepApiKey || this.julepApiKey === 'demo-key') {
      console.warn('⚠️ Using demo mode - Julep API key not provided')
    }

    this.julepService = getJulepService();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      this.supabaseKey
    );
  }

  async initializeAgentsForBrand(data: AgentInitializationData): Promise<BrandAgents> {
    try {
      console.log(`Initializing AI agents for brand: ${data.brandData.name}`);

      // Check if agents already exist for this brand
      const existingAgents = await this.getBrandAgents(data.brandId);
      const existingTypes = new Set(existingAgents.map(agent => agent.type));
      
      console.log(`Found ${existingAgents.length} existing agents for brand ${data.brandId}`);
      console.log(`Existing agent types:`, Array.from(existingTypes));

      // Initialize Julep service
      await this.julepService.initialize();

      // Create all agents for the brand
      const agents: BrandAgents = {};

      // Fill in existing agents first
      existingAgents.forEach(agent => {
        switch(agent.type) {
          case 'brand_persona':
            agents.brandPersona = agent.julep_agent_id;
            break;
          case 'content_creator':
            agents.contentCreator = agent.julep_agent_id;
            break;
          case 'scheduler':
            agents.scheduler = agent.julep_agent_id;
            break;
          case 'sales':
            agents.salesAgent = agent.julep_agent_id;
            break;
          case 'analytics':
            agents.analytics = agent.julep_agent_id;
            break;
          case 'campaign_orchestrator':
            agents.campaignOrchestrator = agent.julep_agent_id;
            break;
        }
      });

      // 1. Brand Persona Agent
      if (!existingTypes.has('brand_persona')) {
        console.log('Creating Brand Persona Agent...');
        const brandPersonaAgent = await this.julepService.createBrandPersonaAgent({
          name: data.brandData.name,
          industry: data.brandData.industry,
          voice: data.brandData.voice,
          guidelines: data.brandData.guidelines
        });

        agents.brandPersona = brandPersonaAgent.id;

        // Store in database
        await this.storeAgentInDB({
          userId: data.userId,
          brandId: data.brandId,
          name: `${data.brandData.name} Brand Persona`,
          type: 'brand_persona',
          julepAgentId: brandPersonaAgent.id,
          configuration: {
            brand_name: data.brandData.name,
            industry: data.brandData.industry,
            voice: data.brandData.voice,
            guidelines: data.brandData.guidelines
          }
        });
      } else {
        console.log('Brand Persona Agent already exists, skipping creation');
      }

      // 2. Content Creator Agent
      if (!existingTypes.has('content_creator')) {
        console.log('Creating Content Creator Agent...');
        const contentCreatorAgent = await this.julepService.createContentCreatorAgent(
          data.brandId,
          {
            name: data.brandData.name,
            voice: data.brandData.voice,
            targetAudience: data.brandData.targetAudience
          }
        );

        agents.contentCreator = contentCreatorAgent.id;

        await this.storeAgentInDB({
          userId: data.userId,
          brandId: data.brandId,
          name: `${data.brandData.name} Content Creator`,
          type: 'content_creator',
          julepAgentId: contentCreatorAgent.id,
          configuration: {
            brand_persona: data.brandData,
            content_types: ['social_post', 'whatsapp', 'email', 'ad_copy']
          }
        });
      } else {
        console.log('Content Creator Agent already exists, skipping creation');
      }

      // 3. Scheduler Agent
      if (!existingTypes.has('scheduler')) {
        console.log('Creating Scheduler Agent...');
        const schedulerAgent = await this.julepService.createSchedulerAgent(
          data.brandId,
          data.brandData.targetAudience
        );

        agents.scheduler = schedulerAgent.id;

        await this.storeAgentInDB({
          userId: data.userId,
          brandId: data.brandId,
          name: `${data.brandData.name} Scheduler`,
          type: 'scheduler',
          julepAgentId: schedulerAgent.id,
          configuration: {
            target_audience: data.brandData.targetAudience,
            platforms: ['whatsapp', 'instagram', 'facebook', 'twitter', 'linkedin']
          }
        });
      } else {
        console.log('Scheduler Agent already exists, skipping creation');
      }

      // 4. Sales Agent
      if (!existingTypes.has('sales')) {
        console.log('Creating Sales Agent...');
        const salesAgent = await this.julepService.createSalesAgent(
          data.brandId,
          {
            name: data.brandData.name,
            voice: data.brandData.voice,
            industry: data.brandData.industry
          },
          {
            // This would come from brand's product/service data
            products: [],
            pricing: {},
            policies: {}
          }
        );

        agents.salesAgent = salesAgent.id;

        await this.storeAgentInDB({
          userId: data.userId,
          brandId: data.brandId,
          name: `${data.brandData.name} Sales Agent`,
          type: 'sales',
          julepAgentId: salesAgent.id,
          configuration: {
            brand_persona: data.brandData,
            conversation_style: 'professional',
            escalation_triggers: ['angry_customer', 'complex_request', 'refund_request']
          }
        });
      } else {
        console.log('Sales Agent already exists, skipping creation');
      }

      // 5. Analytics Agent
      if (!existingTypes.has('analytics')) {
        console.log('Creating Analytics Agent...');
        const analyticsAgent = await this.julepService.createAnalyticsAgent(data.brandId);

        agents.analytics = analyticsAgent.id;

        await this.storeAgentInDB({
          userId: data.userId,
          brandId: data.brandId,
          name: `${data.brandData.name} Analytics`,
          type: 'analytics',
          julepAgentId: analyticsAgent.id,
          configuration: {
            report_types: ['daily', 'weekly', 'monthly', 'campaign'],
            metrics: ['engagement', 'conversions', 'reach', 'sentiment']
          }
        });
      } else {
        console.log('Analytics Agent already exists, skipping creation');
      }

      // 6. Campaign Orchestrator
      if (!existingTypes.has('campaign_orchestrator')) {
        console.log('Creating Campaign Orchestrator...');
        const campaignOrchestrator = await this.julepService.createCampaignOrchestratorAgent(data.brandId);

        agents.campaignOrchestrator = campaignOrchestrator.id;

        await this.storeAgentInDB({
          userId: data.userId,
          brandId: data.brandId,
          name: `${data.brandData.name} Campaign Orchestrator`,
          type: 'campaign_orchestrator',
          julepAgentId: campaignOrchestrator.id,
          configuration: {
            coordination_agents: [
              agents.brandPersona,
              agents.contentCreator,
              agents.scheduler,
              agents.salesAgent,
              agents.analytics
            ]
          }
        });
      } else {
        console.log('Campaign Orchestrator already exists, skipping creation');
      }

      // Update brand with AI persona agent
      await this.supabase
        .from('brands')
        .update({ ai_persona_agent_id: agents.brandPersona })
        .eq('id', data.brandId);

      console.log('All AI agents initialized successfully!');
      return agents;

    } catch (error) {
      console.error('Error initializing AI agents:', error);
      throw new Error(`Failed to initialize AI agents: ${error}`);
    }
  }

  private async storeAgentInDB(agentData: {
    userId: string;
    brandId: string;
    name: string;
    type: string;
    julepAgentId: string;
    configuration: any;
  }) {
    const { error } = await this.supabase
      .from('ai_agents')
      .insert({
        user_id: agentData.userId,
        name: agentData.name,
        type: agentData.type,
        julep_agent_id: agentData.julepAgentId,
        configuration: agentData.configuration,
        status: 'active',
        memory_context: {},
        performance_metrics: {}
      });

    if (error) {
      throw new Error(`Failed to store agent in database: ${error.message}`);
    }
  }

  async getBrandAgents(brandId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('ai_agents')
      .select('*')
      .eq('user_id', brandId); // Assuming user_id maps to brand context

    if (error) {
      throw new Error(`Failed to get brand agents: ${error.message}`);
    }

    return data || [];
  }

  async generateContent(
    brandId: string,
    request: {
      contentType: string;
      platform: string;
      brief: string;
      targetAudience?: any;
    }
  ) {
    try {
      // Get content creator and scheduler agents
      const agents = await this.getBrandAgents(brandId);
      const contentCreator = agents.find(a => a.type === 'content_creator');
      const scheduler = agents.find(a => a.type === 'scheduler');

      if (!contentCreator || !scheduler) {
        throw new Error('Content creator or scheduler agent not found');
      }

      // Execute content generation workflow
      const task = await this.julepService.executeContentGenerationWorkflow(
        contentCreator.julep_agent_id,
        scheduler.julep_agent_id,
        {
          content_type: request.contentType,
          platform: request.platform,
          brief: request.brief,
          target_audience: request.targetAudience || {}
        }
      );

      return task;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }

  async handleCustomerMessage(
    brandId: string,
    customerId: string,
    message: string,
    context: any = {}
  ) {
    try {
      // Get sales agent
      const agents = await this.getBrandAgents(brandId);
      const salesAgent = agents.find(a => a.type === 'sales');

      if (!salesAgent) {
        throw new Error('Sales agent not found for brand');
      }

      // Execute customer interaction workflow
      const response = await this.julepService.executeCustomerInteractionWorkflow(
        salesAgent.julep_agent_id,
        customerId,
        message,
        context
      );

      // Store conversation in database
      await this.storeConversationMessage({
        brandId,
        customerId,
        message,
        response: response.response.content,
        agentId: salesAgent.julep_agent_id,
        sessionId: response.session.id
      });

      return response;
    } catch (error) {
      console.error('Error handling customer message:', error);
      throw error;
    }
  }

  private async storeConversationMessage(data: {
    brandId: string;
    customerId: string;
    message: string;
    response: string;
    agentId: string;
    sessionId: string;
  }) {
    // This would store the conversation in the messages table
    // Implementation depends on your conversation flow requirements
    console.log('Storing conversation message:', data);
  }

  async generateAnalyticsReport(
    brandId: string,
    reportType: string,
    data: any
  ) {
    try {
      const agents = await this.getBrandAgents(brandId);
      const analyticsAgent = agents.find(a => a.type === 'analytics');

      if (!analyticsAgent) {
        throw new Error('Analytics agent not found for brand');
      }

      const report = await this.julepService.executeAnalyticsWorkflow(
        analyticsAgent.julep_agent_id,
        reportType,
        data
      );

      // Store report in database
      await this.storeAnalyticsReport({
        brandId,
        reportType,
        report,
        agentId: analyticsAgent.julep_agent_id
      });

      return report;
    } catch (error) {
      console.error('Error generating analytics report:', error);
      throw error;
    }
  }

  private async storeAnalyticsReport(data: {
    brandId: string;
    reportType: string;
    report: any;
    agentId: string;
  }) {
    const { error } = await this.supabase
      .from('performance_reports')
      .insert({
        brand_id: data.brandId,
        report_type: data.reportType,
        period_start: new Date().toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
        metrics: data.report.output || {},
        insights: { agent_generated: true },
        recommendations: [],
        ai_generated: true
      });

    if (error) {
      console.error('Error storing analytics report:', error);
    }
  }

  async optimizeScheduling(brandId: string, schedules: any[]) {
    try {
      const agents = await this.getBrandAgents(brandId);
      const scheduler = agents.find(a => a.type === 'scheduler');

      if (!scheduler) {
        throw new Error('Scheduler agent not found for brand');
      }

      console.log('Optimizing schedules for brand:', brandId);
      
      // Process each schedule for optimization
      const optimizedSchedules = [];
      
      for (const schedule of schedules) {
        try {
          // Create a task for the scheduler agent to analyze and optimize
          const task = await this.julepService.createTask(
            scheduler.julep_agent_id,
            {
              name: `optimize_schedule_${Date.now()}`,
              description: 'Optimize message scheduling based on audience behavior and engagement patterns',
              main: [
                {
                  tool: 'analyze_engagement_patterns',
                  arguments: {
                    platform: schedule.platform || 'whatsapp',
                    time_range: '30_days',
                    audience_segment: 'all',
                    current_schedule: schedule.currentTime,
                    message_content: schedule.messageContent,
                    frequency: schedule.frequency,
                    audience_insights: schedule.audienceInsights
                  }
                }
              ]
            }
          );

          // For now, since we're using mock implementation, we'll use rule-based optimization
          // In a real implementation, you would execute the task and wait for results
          console.log('Created optimization task:', task.id);
          
          // Use rule-based optimization as the primary method for now
          const optimizedSchedule = this.getRuleBasedOptimization(schedule);
          optimizedSchedules.push(optimizedSchedule);

        } catch (scheduleError) {
          console.error('Error optimizing individual schedule:', scheduleError);
          // Add rule-based fallback for this schedule
          optimizedSchedules.push(this.getRuleBasedOptimization(schedule));
        }
      }

      return optimizedSchedules;
    } catch (error) {
      console.error('Error optimizing scheduling:', error);
      throw error;
    }
  }

  // Helper methods for extracting AI optimization results
  private extractRecommendedTime(aiResponse: any, schedule: any): string {
    try {
      // Try to extract from AI response
      if (aiResponse?.recommended_time) {
        return aiResponse.recommended_time;
      }
      
      // Fallback to audience insights
      if (schedule.audienceInsights?.mostActiveHours?.length > 0) {
        const bestHour = schedule.audienceInsights.mostActiveHours[0];
        return `${bestHour.toString().padStart(2, '0')}:00`;
      }
      
      return schedule.currentTime || '09:00';
    } catch (error) {
      return schedule.currentTime || '09:00';
    }
  }

  private extractConfidence(aiResponse: any): number {
    try {
      if (aiResponse?.confidence) {
        return Math.min(Math.max(aiResponse.confidence, 0), 1);
      }
      return 0.75; // Default confidence
    } catch (error) {
      return 0.75;
    }
  }

  private extractReasoning(aiResponse: any, schedule: any): string {
    try {
      if (aiResponse?.reasoning) {
        return aiResponse.reasoning;
      }
      
      // Generate reasoning based on audience insights
      const insights = schedule.audienceInsights;
      if (insights?.mostActiveHours?.length > 0) {
        const bestHour = insights.mostActiveHours[0];
        const avgResponse = Math.round(insights.averageResponseTime / 60);
        return `Based on audience analysis, ${bestHour}:00 shows highest engagement. Average response time is ${avgResponse} minutes. This timing aligns with your audience's active periods.`;
      }
      
      return 'Optimized based on general best practices for audience engagement.';
    } catch (error) {
      return 'Optimized based on general best practices for audience engagement.';
    }
  }

  private extractAlternativeTimes(aiResponse: any, schedule: any): string[] {
    try {
      if (aiResponse?.alternative_times && Array.isArray(aiResponse.alternative_times)) {
        return aiResponse.alternative_times;
      }
      
      // Generate alternatives from audience insights
      if (schedule.audienceInsights?.mostActiveHours?.length > 1) {
        return schedule.audienceInsights.mostActiveHours
          .slice(1, 4)
          .map((hour: number) => `${hour.toString().padStart(2, '0')}:00`);
      }
      
      return ['10:00', '14:00', '18:00']; // Default alternatives
    } catch (error) {
      return ['10:00', '14:00', '18:00'];
    }
  }

  private extractExpectedEngagement(aiResponse: any): number {
    try {
      if (aiResponse?.expected_engagement) {
        return Math.min(Math.max(aiResponse.expected_engagement, 0), 1);
      }
      return 0.35; // Default expected engagement
    } catch (error) {
      return 0.35;
    }
  }

  private getRuleBasedOptimization(schedule: any) {
    const insights = schedule.audienceInsights;
    
    // Rule-based optimization fallback
    let recommendedTime = '09:00';
    let reasoning = 'Optimized using rule-based analysis.';
    
    if (insights?.mostActiveHours?.length > 0) {
      const bestHour = insights.mostActiveHours[0];
      recommendedTime = `${bestHour.toString().padStart(2, '0')}:00`;
      reasoning = `Based on audience data, ${bestHour}:00 shows the highest engagement rate.`;
    }
    
    return {
      ...schedule,
      recommendedTime,
      confidence: 0.7,
      reasoning,
      alternativeTimes: insights?.mostActiveHours?.slice(1, 4)?.map((h: number) => `${h.toString().padStart(2, '0')}:00`) || ['10:00', '14:00', '18:00'],
      expectedEngagement: insights?.engagementPatterns?.[0]?.engagement_rate || 0.3,
      audienceSize: insights?.engagementPatterns?.length || 0
    };
  }

  async updateAgentMemory(agentId: string, newContext: any) {
    try {
      const { error } = await this.supabase
        .from('ai_agents')
        .update({
          memory_context: newContext,
          updated_at: new Date().toISOString()
        })
        .eq('julep_agent_id', agentId);

      if (error) {
        throw new Error(`Failed to update agent memory: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating agent memory:', error);
      throw error;
    }
  }

  async getAgentPerformanceMetrics(brandId: string) {
    try {
      const { data, error } = await this.supabase
        .from('ai_agents')
        .select('type, performance_metrics, created_at')
        .eq('user_id', brandId);

      if (error) {
        throw new Error(`Failed to get agent metrics: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting agent performance metrics:', error);
      throw error;
    }
  }
}

// Singleton instance
let aiAgentManager: AIAgentManager | null = null;

export const getAIAgentManager = (): AIAgentManager => {
  if (!aiAgentManager) {
    aiAgentManager = new AIAgentManager();
  }
  return aiAgentManager;
};

export default AIAgentManager;
export type { BrandAgents, AgentInitializationData }; 