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

export class UserWhatsAppService {
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
      const payload: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''), // Remove non-digits from phone number
        type: 'text',
        text: {
          body: message,
        },
      }

      const response = await fetch(`${this.settings!.whatsapp_api_url}/${this.settings!.whatsapp_phone_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.settings!.whatsapp_access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('WhatsApp API Error:', errorData)
        throw new Error(`WhatsApp API error: ${response.status}`)
      }

      const result = await response.json()
      console.log('Message sent successfully:', result)
      return true
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error)
      return false
    }
  }

  async sendBulkMessages(messages: Array<{ to: string; message: string }>): Promise<Array<{ to: string; success: boolean }>> {
    const results: Array<{ to: string; success: boolean }> = []
    
    for (const { to, message } of messages) {
      const success = await this.sendMessage(to, message)
      results.push({ to, success })
      
      // Add a small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    return results
  }

  isConfigured(): boolean {
    return this.settings !== null
  }

  async checkConfiguration(): Promise<boolean> {
    return await this.loadUserSettings()
  }
} 