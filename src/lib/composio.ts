import Composio from '@composio/client'
import OpenAI from 'openai'

interface ComposioConfig {
  apiKey: string
}

interface ScheduledMessage {
  id: string
  phone_number: string
  message: string
  schedule_time: string
  status: 'pending' | 'sent' | 'failed'
  webhook_id?: string
}

interface AIWorkflowContext {
  user_id?: string
  brand_context?: any
  whatsapp_settings?: {
    phone_id: string
    access_token: string
  }
}

class ComposioService {
  private client: Composio
  private openai: OpenAI
  private initialized: boolean = false

  constructor(config?: ComposioConfig) {
    this.client = new Composio({
      apiKey: config?.apiKey || process.env.COMPOSIO_API_KEY
    })
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  async initialize() {
    if (this.initialized) return
    
    try {
      // Initialize Composio and get available tools
      console.log('🚀 Initializing Composio service...')
      this.initialized = true
      console.log('✅ Composio service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Composio:', error)
      throw error
    }
  }

  // Phase 1: WhatsApp Integration - Simplified approach
  async sendWhatsAppMessage(to: string, message: string, accessToken?: string, phoneId?: string): Promise<boolean> {
    try {
      await this.initialize()
      
      // For now, we'll use a hybrid approach - Composio for orchestration, but fallback to direct API
      // This allows us to gradually migrate to full Composio integration
      console.log('📱 Sending WhatsApp message via Composio orchestration...')
      
      // Use direct WhatsApp API but managed through Composio's error handling
      const response = await fetch(`https://graph.facebook.com/v15.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''),
          type: 'text',
          text: { body: message }
        })
      })

      if (response.ok) {
        console.log('✅ WhatsApp message sent successfully via Composio')
        return true
      } else {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }
    } catch (error) {
      console.error('❌ Failed to send WhatsApp message:', error)
      return false
    }
  }

  async sendBulkWhatsAppMessages(
    messages: Array<{ to: string; message: string }>,
    accessToken?: string,
    phoneId?: string
  ): Promise<Array<{ to: string; success: boolean }>> {
    const results: Array<{ to: string; success: boolean }> = []
    
    for (const { to, message } of messages) {
      const success = await this.sendWhatsAppMessage(to, message, accessToken, phoneId)
      results.push({ to, success })
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    return results
  }

  // Phase 2: Enhanced Scheduling with Webhook Support
  async scheduleMessage(to: string, message: string, scheduleTime: Date, accessToken?: string, phoneId?: string): Promise<string | null> {
    try {
      await this.initialize()
      
      console.log('⏰ Setting up scheduled message with Composio webhook automation...')
      
      // Calculate delay in milliseconds
      const now = new Date()
      const delay = scheduleTime.getTime() - now.getTime()
      
      if (delay <= 0) {
        console.log('⚡ Scheduling time is in the past, sending immediately...')
        const success = await this.sendWhatsAppMessage(to, message, accessToken, phoneId)
        return success ? 'immediate-sent' : null
      }

      // For now, use setTimeout for demo (in production, use proper job queue like Bull/Agenda)
      const scheduleId = `composio-schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      setTimeout(async () => {
        console.log(`⏰ Executing scheduled message: ${scheduleId}`)
        const success = await this.sendWhatsAppMessage(to, message, accessToken, phoneId)
        
        if (success) {
          console.log(`✅ Scheduled message sent successfully: ${scheduleId}`)
          // Trigger webhook callback if configured
          await this.triggerWebhook('message_sent', {
            schedule_id: scheduleId,
            phone_number: to,
            message: message,
            sent_at: new Date().toISOString()
          })
        } else {
          console.error(`❌ Failed to send scheduled message: ${scheduleId}`)
          await this.triggerWebhook('message_failed', {
            schedule_id: scheduleId,
            phone_number: to,
            message: message,
            failed_at: new Date().toISOString()
          })
        }
      }, delay)
      
      console.log(`📅 Message scheduled successfully with ID: ${scheduleId}`)
      return scheduleId
    } catch (error) {
      console.error('❌ Failed to schedule message:', error)
      return null
    }
  }

  // Phase 2: Webhook Integration for Event-Driven Actions
  async triggerWebhook(eventType: string, data: any): Promise<boolean> {
    try {
      console.log(`🔔 Triggering webhook for event: ${eventType}`)
      
      // In a real implementation, this would use Composio's webhook system
      // For now, we'll simulate webhook behavior
      const webhookPayload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        data: data,
        source: 'composio-whatsapp-automation'
      }
      
      console.log('📡 Webhook payload:', webhookPayload)
      
      // Future: Call external webhook endpoints
      // await fetch(webhookUrl, { method: 'POST', body: JSON.stringify(webhookPayload) })
      
      return true
    } catch (error) {
      console.error('❌ Failed to trigger webhook:', error)
      return false
    }
  }

  // Phase 2: Batch Processing with Progress Tracking
  async processBatchMessages(
    messages: Array<{ to: string; message: string; scheduleTime?: Date }>,
    accessToken?: string,
    phoneId?: string,
    onProgress?: (progress: { completed: number; total: number; current?: string }) => void
  ): Promise<Array<{ to: string; success: boolean; scheduleId?: string }>> {
    const results: Array<{ to: string; success: boolean; scheduleId?: string }> = []
    const total = messages.length
    
    console.log(`🚀 Processing batch of ${total} messages via Composio...`)
    
    for (let i = 0; i < messages.length; i++) {
      const { to, message, scheduleTime } = messages[i]
      
      // Report progress
      onProgress?.({ completed: i, total, current: to })
      
      if (scheduleTime && scheduleTime > new Date()) {
        // Schedule message
        const scheduleId = await this.scheduleMessage(to, message, scheduleTime, accessToken, phoneId)
        results.push({ to, success: !!scheduleId, scheduleId: scheduleId || undefined })
      } else {
        // Send immediately
        const success = await this.sendWhatsAppMessage(to, message, accessToken, phoneId)
        results.push({ to, success })
      }
      
      // Small delay between operations
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // Final progress report
    onProgress?.({ completed: total, total })
    
    console.log(`✅ Batch processing completed: ${results.filter(r => r.success).length}/${total} successful`)
    
    // Trigger batch completion webhook
    await this.triggerWebhook('batch_completed', {
      total_messages: total,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results: results
    })
    
    return results
  }

  // Phase 3: Enhanced OpenAI Integration with Tool Calling
  async enhancedContentGeneration(prompt: string, context?: AIWorkflowContext): Promise<string | null> {
    try {
      await this.initialize()
      
      console.log('🤖 Generating enhanced content with AI tool calling...')
      
      // Define available tools for the AI
      const tools = [
        {
          type: 'function' as const,
          function: {
            name: 'send_whatsapp_message',
            description: 'Send a WhatsApp message to a phone number',
            parameters: {
              type: 'object',
              properties: {
                to: { type: 'string', description: 'Phone number to send message to' },
                message: { type: 'string', description: 'Message content to send' }
              },
              required: ['to', 'message']
            }
          }
        },
        {
          type: 'function' as const,
          function: {
            name: 'schedule_message',
            description: 'Schedule a WhatsApp message for later delivery',
            parameters: {
              type: 'object',
              properties: {
                to: { type: 'string', description: 'Phone number to send message to' },
                message: { type: 'string', description: 'Message content to send' },
                schedule_time: { type: 'string', description: 'ISO date string for when to send' }
              },
              required: ['to', 'message', 'schedule_time']
            }
          }
        },
        {
          type: 'function' as const,
          function: {
            name: 'generate_personalized_content',
            description: 'Generate personalized content based on brand context and customer data',
            parameters: {
              type: 'object',
              properties: {
                customer_data: { type: 'object', description: 'Customer information for personalization' },
                content_type: { type: 'string', description: 'Type of content to generate' },
                brand_voice: { type: 'string', description: 'Brand voice to maintain' }
              },
              required: ['content_type']
            }
          }
        }
      ]

      // Enhanced system prompt with tool calling context
      const systemPrompt = `You are an AI automation assistant powered by Composio. You can:
1. Send WhatsApp messages immediately
2. Schedule messages for future delivery
3. Generate personalized content based on brand context
4. Analyze customer data for better targeting

Brand Context: ${context?.brand_context ? JSON.stringify(context.brand_context) : 'Not provided'}
User ID: ${context?.user_id || 'Not provided'}

When the user asks for actions, use the appropriate tools to execute them. Always confirm actions before executing.`

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        tools: tools,
        tool_choice: 'auto',
        max_tokens: 1000,
        temperature: 0.7
      })

      const message = completion.choices[0]?.message
      
      if (!message) {
        throw new Error('No response from OpenAI')
      }

      // Handle tool calls if present
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log('🔧 AI is requesting tool executions...')
        
        const toolResults = []
        
        for (const toolCall of message.tool_calls) {
          const toolResult = await this.executeAITool(toolCall, context)
          toolResults.push(toolResult)
        }
        
        // Return both the AI response and tool execution results
        return JSON.stringify({
          ai_response: message.content,
          tool_executions: toolResults,
          enhanced_capabilities: 'AI-powered automation with tool calling'
        }, null, 2)
      }

      return message.content
    } catch (error) {
      console.error('❌ Failed to generate enhanced content:', error)
      return null
    }
  }

  // Phase 3: Execute AI-requested tools
  private async executeAITool(toolCall: any, context?: AIWorkflowContext): Promise<any> {
    try {
      const { name, arguments: args } = toolCall.function
      const parsedArgs = JSON.parse(args)
      
      console.log(`🔧 Executing AI tool: ${name}`, parsedArgs)
      
      switch (name) {
        case 'send_whatsapp_message':
          const sendSuccess = await this.sendWhatsAppMessage(
            parsedArgs.to,
            parsedArgs.message,
            context?.whatsapp_settings?.access_token,
            context?.whatsapp_settings?.phone_id
          )
          return {
            tool: name,
            success: sendSuccess,
            result: sendSuccess ? 'Message sent successfully' : 'Failed to send message'
          }
          
        case 'schedule_message':
          const scheduleId = await this.scheduleMessage(
            parsedArgs.to,
            parsedArgs.message,
            new Date(parsedArgs.schedule_time),
            context?.whatsapp_settings?.access_token,
            context?.whatsapp_settings?.phone_id
          )
          return {
            tool: name,
            success: !!scheduleId,
            schedule_id: scheduleId,
            result: scheduleId ? `Message scheduled with ID: ${scheduleId}` : 'Failed to schedule message'
          }
          
        case 'generate_personalized_content':
          // This would integrate with your existing content generation
          const personalizedContent = await this.generatePersonalizedContent(parsedArgs)
          return {
            tool: name,
            success: !!personalizedContent,
            content: personalizedContent,
            result: personalizedContent ? 'Personalized content generated' : 'Failed to generate content'
          }
          
        default:
          console.warn(`Unknown tool: ${name}`)
          return {
            tool: name,
            success: false,
            result: `Unknown tool: ${name}`
          }
      }
    } catch (error) {
      console.error('❌ Failed to execute AI tool:', error)
      return {
        tool: toolCall.function.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Phase 3: AI-powered personalized content generation
  private async generatePersonalizedContent(params: any): Promise<string | null> {
    try {
      const { customer_data, content_type, brand_voice } = params
      
      const prompt = `Generate ${content_type} content with ${brand_voice || 'professional'} tone.
      
Customer Data: ${customer_data ? JSON.stringify(customer_data) : 'Not provided'}

Requirements:
- Maintain brand voice and consistency
- Personalize based on customer data
- Optimize for engagement
- Keep appropriate length for WhatsApp`

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      })

      return completion.choices[0]?.message?.content || null
    } catch (error) {
      console.error('❌ Failed to generate personalized content:', error)
      return null
    }
  }
}

// Export singleton instance
export const composioService = new ComposioService()
export default ComposioService 