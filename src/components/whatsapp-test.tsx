'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, BarChart3, Users } from 'lucide-react'

interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

interface Analytics {
  totalMessages: number
  outbound: number
  inbound: number
  aiGenerated: number
  failed: number
  successRate: number
}

export default function WhatsAppTest() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [brandId, setBrandId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  const sendMessage = async () => {
    if (!phoneNumber || !message) {
      setResult({ success: false, error: 'Phone number and message are required' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message,
          brandId: brandId || undefined,
          aiGenerated: false
        }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        setMessage('')
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    setAnalyticsLoading(true)
    
    try {
      const params = new URLSearchParams()
      if (brandId) params.append('brandId', brandId)
      params.append('days', '30')

      const response = await fetch(`/api/whatsapp/analytics?${params}`)
      const data = await response.json()

      if (data.success) {
        setAnalytics(data.data)
      } else {
        console.error('Failed to load analytics:', data.error)
      }
    } catch (error) {
      console.error('Analytics error:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">WhatsApp Integration Test</h1>
        <p className="text-muted-foreground mt-2">
          Test the enhanced WhatsApp Business API integration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Send Message Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Test Message
            </CardTitle>
            <CardDescription>
              Send a WhatsApp message to test the integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Brand ID (Optional)</label>
              <Input
                placeholder="brand-uuid"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Hello! This is a test message from our WhatsApp automation platform."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={sendMessage} 
              disabled={loading || !phoneNumber || !message}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>

            {result && (
              <div className={`p-3 rounded-md ${
                result.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  <Badge variant={result.success ? 'default' : 'destructive'}>
                    {result.success ? 'Success' : 'Error'}
                  </Badge>
                  {result.messageId && (
                    <span className="text-sm text-muted-foreground">
                      ID: {result.messageId}
                    </span>
                  )}
                </div>
                {result.error && (
                  <p className="text-sm text-red-600 mt-1">{result.error}</p>
                )}
                {result.success && (
                  <p className="text-sm text-green-600 mt-1">
                    Message sent successfully!
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Message Analytics
            </CardTitle>
            <CardDescription>
              View your WhatsApp message statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={loadAnalytics} 
              disabled={analyticsLoading}
              variant="outline"
              className="w-full"
            >
              {analyticsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Load Analytics
                </>
              )}
            </Button>

            {analytics && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-md">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.totalMessages}
                    </div>
                    <div className="text-sm text-blue-600">Total Messages</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-md">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.successRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-600">Success Rate</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Outbound:</span>
                    <Badge variant="outline">{analytics.outbound}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Inbound:</span>
                    <Badge variant="outline">{analytics.inbound}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">AI Generated:</span>
                    <Badge variant="secondary">{analytics.aiGenerated}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Failed:</span>
                    <Badge variant="destructive">{analytics.failed}</Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>1. WhatsApp Business API Setup:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Get WhatsApp Business API credentials from Meta</li>
                <li>Add your phone number ID and access token to settings</li>
                <li>Configure webhook URL: <code className="bg-gray-100 px-1 rounded">{typeof window !== 'undefined' ? window.location.origin : '[YOUR_DOMAIN]'}/api/whatsapp/webhook</code></li>
              </ul>
            </div>
            
            <div>
              <strong>2. Environment Variables:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li><code className="bg-gray-100 px-1 rounded">WHATSAPP_VERIFY_TOKEN</code> - Webhook verification token</li>
                <li><code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> - Supabase project URL</li>
                <li><code className="bg-gray-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> - Supabase service key</li>
              </ul>
            </div>

            <div>
              <strong>3. Database Setup:</strong>
              <p className="ml-4 mt-1">Run the SQL setup script in your Supabase dashboard to create all necessary tables.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 