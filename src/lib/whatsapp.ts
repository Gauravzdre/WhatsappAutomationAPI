interface WhatsAppMessage {
  messaging_product: 'whatsapp'
  to: string
  type: 'text'
  text: {
    body: string
  }
}

export class WhatsAppService {
  private apiUrl: string
  private phoneId: string
  private accessToken: string

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v15.0'
    this.phoneId = process.env.WHATSAPP_PHONE_ID!
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!

    if (!this.phoneId || !this.accessToken) {
      throw new Error('WhatsApp configuration is missing. Please check your environment variables.')
    }
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const payload: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''), // Remove non-digits from phone number
        type: 'text',
        text: {
          body: message,
        },
      }

      const response = await fetch(`${this.apiUrl}/${this.phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
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
} 