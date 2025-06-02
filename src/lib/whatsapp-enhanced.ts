import { createClient } from '@supabase/supabase-js'
import { getPlatformCredentials } from './credentials'

interface WhatsAppMessage {
  messaging_product: 'whatsapp'
  to: string
  type: 'text' | 'template'
  text?: {
    body: string
  }
  template?: {
    name: string
    language: {
      code: string
    }
    components?: any[]
  }
}

interface MessageStatus {
  id: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  error?: string
}

interface SendMessageOptions {
  userId: string
  brandId?: string
  clientId?: string
  messageType?: 'text' | 'template'
  template?: {
    name: string
    language: string
    components?: any[]
  }
  aiGenerated?: boolean
  aiAgentId?: string
}

export class EnhancedWhatsAppService {
  private supabase
  private rateLimiter: Map<string, number[]> = new Map()
  private readonly RATE_LIMIT_PER_MINUTE = 60 // WhatsApp Business API limit

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Send a WhatsApp message with enhanced tracking and storage
   */
  async sendMessage(
    to: string, 
    message: string, 
    options: SendMessageOptions
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Get user-specific WhatsApp credentials
      const credentials = await getPlatformCredentials(options.userId, 'whatsapp')
      
      if (!credentials || !credentials.whatsapp_access_token || !credentials.whatsapp_phone_id) {
        return {
          success: false,
          error: 'WhatsApp credentials not configured. Please update your settings.'
        }
      }

      // Check rate limiting
      const rateLimitKey = `${options.userId}-whatsapp`
      if (!this.checkRateLimit(rateLimitKey)) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please wait before sending more messages.'
        }
      }

      // Clean phone number
      const cleanPhoneNumber = to.replace(/\D/g, '')

      // Prepare message payload
      const payload: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: cleanPhoneNumber,
        type: options.messageType || 'text'
      }

      if (options.messageType === 'template' && options.template) {
        payload.template = {
          name: options.template.name,
          language: { code: options.template.language },
          components: options.template.components || []
        }
      } else {
        payload.text = { body: message }
      }

      // Send message via WhatsApp API
      const apiUrl = credentials.whatsapp_api_url || 'https://graph.facebook.com/v18.0'
      const response = await fetch(`${apiUrl}/${credentials.whatsapp_phone_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.whatsapp_access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('WhatsApp API Error:', responseData)
        
        // Store failed message
        await this.storeMessage({
          userId: options.userId,
          brandId: options.brandId,
          clientId: options.clientId,
          phoneNumber: cleanPhoneNumber,
          content: message,
          direction: 'outbound',
          status: 'failed',
          aiGenerated: options.aiGenerated || false,
          aiAgentId: options.aiAgentId,
          whatsappMessageId: null,
          error: responseData.error?.message || 'Failed to send message'
        })

        return {
          success: false,
          error: responseData.error?.message || 'Failed to send WhatsApp message'
        }
      }

      // Store successful message
      const messageId = responseData.messages?.[0]?.id
      await this.storeMessage({
        userId: options.userId,
        brandId: options.brandId,
        clientId: options.clientId,
        phoneNumber: cleanPhoneNumber,
        content: message,
        direction: 'outbound',
        status: 'sent',
        aiGenerated: options.aiGenerated || false,
        aiAgentId: options.aiAgentId,
        whatsappMessageId: messageId
      })

      // Update rate limiter
      this.updateRateLimit(rateLimitKey)

      return {
        success: true,
        messageId
      }

    } catch (error) {
      console.error('Enhanced WhatsApp service error:', error)
      
      // Store failed message
      await this.storeMessage({
        userId: options.userId,
        brandId: options.brandId,
        clientId: options.clientId,
        phoneNumber: to.replace(/\D/g, ''),
        content: message,
        direction: 'outbound',
        status: 'failed',
        aiGenerated: options.aiGenerated || false,
        aiAgentId: options.aiAgentId,
        whatsappMessageId: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Handle incoming WhatsApp webhook messages
   */
  async handleIncomingMessage(webhookData: any): Promise<{ success: boolean; error?: string }> {
    try {
      if (!webhookData.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        return { success: true } // No message to process
      }

      const message = webhookData.entry[0].changes[0].value.messages[0]
      const phoneNumberId = webhookData.entry[0].changes[0].value.metadata.phone_number_id
      const from = message.from
      const messageText = message.text?.body
      const messageType = message.type

      if (!messageText && messageType !== 'text') {
        console.log('Non-text message received, skipping for now')
        return { success: true }
      }

      // Find brand and user by phone number ID
      const { brandId, userId } = await this.findBrandByPhoneNumberId(phoneNumberId)
      
      if (!brandId || !userId) {
        console.error('Could not find brand for phone number ID:', phoneNumberId)
        return { success: true } // Don't fail the webhook
      }

      // Find or create client
      const clientId = await this.findOrCreateClient(userId, brandId, from)

      // Store incoming message
      await this.storeMessage({
        userId,
        brandId,
        clientId,
        phoneNumber: from,
        content: messageText || `[${messageType} message]`,
        direction: 'inbound',
        status: 'received',
        aiGenerated: false,
        whatsappMessageId: message.id
      })

      // Trigger AI response if configured
      await this.triggerAIResponse(brandId, userId, clientId, from, messageText || '')

      return { success: true }

    } catch (error) {
      console.error('Error handling incoming message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Send bulk messages with rate limiting and error handling
   */
  async sendBulkMessages(
    messages: Array<{ to: string; message: string }>,
    options: SendMessageOptions
  ): Promise<Array<{ to: string; success: boolean; messageId?: string; error?: string }>> {
    const results: Array<{ to: string; success: boolean; messageId?: string; error?: string }> = []
    
    for (const { to, message } of messages) {
      const result = await this.sendMessage(to, message, options)
      results.push({
        to,
        success: result.success,
        messageId: result.messageId,
        error: result.error
      })
      
      // Add delay between messages to respect rate limits
      if (messages.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return results
  }

  /**
   * Get message analytics for a user/brand
   */
  async getMessageAnalytics(userId: string, brandId?: string, days: number = 30) {
    try {
      let query = this.supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())

      if (brandId) {
        query = query.eq('brand_id', brandId)
      }

      const { data: messages, error } = await query

      if (error) throw error

      const analytics = {
        totalMessages: messages?.length || 0,
        outbound: messages?.filter(m => m.direction === 'outbound').length || 0,
        inbound: messages?.filter(m => m.direction === 'inbound').length || 0,
        aiGenerated: messages?.filter(m => m.ai_generated).length || 0,
        failed: messages?.filter(m => m.status === 'failed').length || 0,
        successRate: 0,
        responseTime: 0 // Could calculate average response time
      }

      analytics.successRate = analytics.outbound > 0 
        ? ((analytics.outbound - analytics.failed) / analytics.outbound) * 100 
        : 0

      return analytics

    } catch (error) {
      console.error('Error getting message analytics:', error)
      return null
    }
  }

  // Private helper methods

  private checkRateLimit(key: string): boolean {
    const now = Date.now()
    const windowStart = now - 60000 // 1 minute window
    
    if (!this.rateLimiter.has(key)) {
      this.rateLimiter.set(key, [])
    }
    
    const requests = this.rateLimiter.get(key)!
    const recentRequests = requests.filter(timestamp => timestamp > windowStart)
    
    return recentRequests.length < this.RATE_LIMIT_PER_MINUTE
  }

  private updateRateLimit(key: string): void {
    const now = Date.now()
    
    if (!this.rateLimiter.has(key)) {
      this.rateLimiter.set(key, [])
    }
    
    const requests = this.rateLimiter.get(key)!
    requests.push(now)
    
    // Keep only requests from the last minute
    const windowStart = now - 60000
    const recentRequests = requests.filter(timestamp => timestamp > windowStart)
    this.rateLimiter.set(key, recentRequests)
  }

  private async storeMessage(data: {
    userId: string
    brandId?: string
    clientId?: string
    phoneNumber: string
    content: string
    direction: 'inbound' | 'outbound'
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'received'
    aiGenerated: boolean
    aiAgentId?: string
    whatsappMessageId?: string | null
    error?: string
  }): Promise<void> {
    try {
      // Find or create conversation
      let conversationId = null
      
      if (data.clientId) {
        const { data: conversation } = await this.supabase
          .from('conversations')
          .select('id')
          .eq('client_id', data.clientId)
          .eq('status', 'active')
          .single()
        
        if (conversation) {
          conversationId = conversation.id
        } else {
          const { data: newConversation } = await this.supabase
            .from('conversations')
            .insert({
              user_id: data.userId,
              client_id: data.clientId,
              brand_id: data.brandId,
              status: 'active'
            })
            .select('id')
            .single()
          
          conversationId = newConversation?.id
        }
      }

      // Store message
      const messageData: any = {
        user_id: data.userId,
        client_id: data.clientId,
        direction: data.direction,
        content: data.content,
        status: data.status,
        ai_generated: data.aiGenerated,
        whatsapp_message_id: data.whatsappMessageId,
        metadata: data.error ? { error: data.error } : {}
      }

      if (conversationId) {
        messageData.conversation_id = conversationId
      }

      if (data.aiAgentId) {
        messageData.ai_agent_id = data.aiAgentId
      }

      await this.supabase
        .from('messages')
        .insert(messageData)

    } catch (error) {
      console.error('Error storing message:', error)
    }
  }

  private async findBrandByPhoneNumberId(phoneNumberId: string): Promise<{ brandId?: string; userId?: string }> {
    try {
      // This would need to be implemented based on how you store phone number IDs
      // For now, returning empty - you'll need to add a mapping table or field
      const { data: settings } = await this.supabase
        .from('settings')
        .select('user_id, brand_id')
        .eq('platform', 'whatsapp')
        .eq('value->phone_number_id', phoneNumberId)
        .single()

      return {
        brandId: settings?.brand_id,
        userId: settings?.user_id
      }
    } catch (error) {
      console.error('Error finding brand by phone number ID:', error)
      return {}
    }
  }

  private async findOrCreateClient(userId: string, brandId: string, phoneNumber: string): Promise<string> {
    try {
      // Try to find existing client
      const { data: existingClient } = await this.supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .eq('brand_id', brandId)
        .eq('phone_number', phoneNumber)
        .single()

      if (existingClient) {
        return existingClient.id
      }

      // Create new client
      const { data: newClient } = await this.supabase
        .from('clients')
        .insert({
          user_id: userId,
          brand_id: brandId,
          name: `WhatsApp Contact ${phoneNumber}`,
          phone_number: phoneNumber,
          status: 'active'
        })
        .select('id')
        .single()

      return newClient?.id || ''

    } catch (error) {
      console.error('Error finding/creating client:', error)
      return ''
    }
  }

  private async triggerAIResponse(
    brandId: string, 
    userId: string, 
    clientId: string, 
    phoneNumber: string, 
    message: string
  ): Promise<void> {
    try {
      // Import AI agent manager dynamically to avoid circular imports
      const { getAIAgentManager } = await import('./ai-agent-manager')
      const aiAgentManager = getAIAgentManager()

      // Get AI response
      const response = await aiAgentManager.handleCustomerMessage(
        brandId,
        clientId,
        message,
        { phoneNumber, platform: 'whatsapp' }
      )

      if (response?.response?.content) {
        // Send AI response back to customer
        await this.sendMessage(phoneNumber, response.response.content, {
          userId,
          brandId,
          clientId,
          aiGenerated: true,
          aiAgentId: response.session?.agentId || undefined
        })
      }

    } catch (error) {
      console.error('Error triggering AI response:', error)
    }
  }
}

// Singleton instance
let enhancedWhatsAppService: EnhancedWhatsAppService | null = null

export const getEnhancedWhatsAppService = (): EnhancedWhatsAppService => {
  if (!enhancedWhatsAppService) {
    enhancedWhatsAppService = new EnhancedWhatsAppService()
  }
  return enhancedWhatsAppService
} 