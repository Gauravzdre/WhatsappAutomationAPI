import { composioService } from './composio'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface WhatsAppMessage {
  messaging_product: 'whatsapp'
  to: string
  type: 'text'
  text: {
    body: string
  }
}

interface UserWhatsAppSettings {
  whatsapp_phone_id: string
  whatsapp_access_token: string
  whatsapp_api_url: string
}

export class ComposioWhatsAppService {
  private settings: UserWhatsAppSettings | null = null
  private supabase = createClientComponentClient()

  async loadUserSettings(): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await this.supabase
        .from('settings')
        .select('whatsapp_phone_id, whatsapp_access_token, whatsapp_api_url')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Failed to load WhatsApp settings:', error)
        return false
      }

      if (!data.whatsapp_phone_id || !data.whatsapp_access_token) {
        console.error('WhatsApp settings are incomplete')
        return false
      }

      this.settings = data
      return true
    } catch (error) {
      console.error('Error loading user WhatsApp settings:', error)
      return false
    }
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    if (!this.settings) {
      const loaded = await this.loadUserSettings()
      if (!loaded) {
        console.error('Cannot send message: WhatsApp settings not configured')
        return false
      }
    }

    try {
      // Use Composio service instead of manual API calls
      const success = await composioService.sendWhatsAppMessage(
        to,
        message,
        this.settings!.whatsapp_access_token,
        this.settings!.whatsapp_phone_id
      )

      if (success) {
        console.log('✅ Message sent successfully via Composio')
        
        // Log to database for analytics
        await this.logMessage(to, message, 'sent')
      }

      return success
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error)
      await this.logMessage(to, message, 'failed')
      return false
    }
  }

  async sendBulkMessages(messages: Array<{ to: string; message: string }>): Promise<Array<{ to: string; success: boolean }>> {
    if (!this.settings) {
      const loaded = await this.loadUserSettings()
      if (!loaded) {
        console.error('Cannot send bulk messages: WhatsApp settings not configured')
        return messages.map(({ to }) => ({ to, success: false }))
      }
    }

    // Use Composio's bulk messaging with enhanced error handling
    const results = await composioService.sendBulkWhatsAppMessages(
      messages,
      this.settings!.whatsapp_access_token,
      this.settings!.whatsapp_phone_id
    )

    // Log all messages to database
    for (const { to, success } of results) {
      const messageContent = messages.find(m => m.to === to)?.message || ''
      await this.logMessage(to, messageContent, success ? 'sent' : 'failed')
    }

    return results
  }

  // Enhanced scheduling with Composio (Phase 2 preparation)
  async scheduleMessage(to: string, message: string, scheduleTime: Date): Promise<boolean> {
    if (!this.settings) {
      const loaded = await this.loadUserSettings()
      if (!loaded) {
        console.error('Cannot schedule message: WhatsApp settings not configured')
        return false
      }
    }

    try {
      // For now, save to database - Phase 2 will add Composio scheduling
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await this.supabase
        .from('scheduled_messages')
        .insert({
          user_id: user.id,
          phone_number: to,
          message: message,
          schedule_time: scheduleTime.toISOString(),
          status: 'pending',
          created_via: 'composio'
        })

      if (error) throw error

      console.log('📅 Message scheduled successfully (Phase 2 will add Composio automation)')
      return true
    } catch (error) {
      console.error('Failed to schedule message:', error)
      return false
    }
  }

  private async logMessage(to: string, message: string, status: 'sent' | 'failed'): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return

      await this.supabase
        .from('message_logs')
        .insert({
          user_id: user.id,
          phone_number: to,
          message: message,
          status: status,
          sent_at: new Date().toISOString(),
          provider: 'composio'
        })
    } catch (error) {
      console.error('Failed to log message:', error)
    }
  }

  isConfigured(): boolean {
    return this.settings !== null
  }

  // Get enhanced analytics (Phase 3 preparation)
  async getMessageAnalytics(): Promise<any> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await this.supabase
        .from('message_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'composio')
        .order('sent_at', { ascending: false })

      if (error) throw error

      return {
        total_messages: data.length,
        successful_messages: data.filter(m => m.status === 'sent').length,
        failed_messages: data.filter(m => m.status === 'failed').length,
        recent_messages: data.slice(0, 10)
      }
    } catch (error) {
      console.error('Failed to get analytics:', error)
      return null
    }
  }
}

// Export singleton instance
export const composioWhatsAppService = new ComposioWhatsAppService()
export default ComposioWhatsAppService 