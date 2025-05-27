'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Settings, Send, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface WhatsAppSettings {
  id?: string
  whatsapp_phone_id: string
  whatsapp_access_token: string
  whatsapp_api_url: string
  test_phone_number: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<WhatsAppSettings>({
    whatsapp_phone_id: '',
    whatsapp_access_token: '',
    whatsapp_api_url: 'https://graph.facebook.com/v15.0',
    test_phone_number: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [testMessage, setTestMessage] = useState('Hello! This is a test message from your WhatsApp automation system. 🚀')

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const settingsData = {
        user_id: user.id,
        whatsapp_phone_id: settings.whatsapp_phone_id,
        whatsapp_access_token: settings.whatsapp_access_token,
        whatsapp_api_url: settings.whatsapp_api_url,
        test_phone_number: settings.test_phone_number
      }

      const { error } = await supabase
        .from('settings')
        .upsert(settingsData, { onConflict: 'user_id' })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const testWhatsAppConnection = async () => {
    if (!settings.whatsapp_phone_id || !settings.whatsapp_access_token || !settings.test_phone_number) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all WhatsApp settings and test phone number',
        variant: 'destructive',
      })
      return
    }

    setTesting(true)
    try {
      const response = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneId: settings.whatsapp_phone_id,
          accessToken: settings.whatsapp_access_token,
          apiUrl: settings.whatsapp_api_url,
          to: settings.test_phone_number,
          message: testMessage
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: 'Test Successful! ✅',
          description: 'WhatsApp message sent successfully. Check your phone!',
        })
      } else {
        throw new Error(result.error || 'Failed to send test message')
      }
    } catch (error) {
      console.error('Test failed:', error)
      toast({
        title: 'Test Failed ❌',
        description: error instanceof Error ? error.message : 'Failed to send test message',
        variant: 'destructive',
      })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="h-8 w-8" />
          WhatsApp Settings
        </h1>
        <p className="mt-2 text-gray-600">Configure your WhatsApp Business API credentials to enable message sending</p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Setup Instructions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              How to Get WhatsApp Business API Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 space-y-2">
            <p><strong>1.</strong> Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="underline">Facebook Developers</a></p>
            <p><strong>2.</strong> Create a new app and add WhatsApp Business API</p>
            <p><strong>3.</strong> Get your Phone Number ID from the WhatsApp Business API dashboard</p>
            <p><strong>4.</strong> Generate a permanent access token (not the temporary one)</p>
            <p><strong>5.</strong> Add your test phone number to the verified numbers list</p>
          </CardContent>
        </Card>

        {/* WhatsApp Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Business API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="api-url">API URL</Label>
              <Input
                id="api-url"
                value={settings.whatsapp_api_url}
                onChange={(e) => setSettings({ ...settings, whatsapp_api_url: e.target.value })}
                placeholder="https://graph.facebook.com/v15.0"
              />
            </div>

            <div>
              <Label htmlFor="phone-id">Phone Number ID</Label>
              <Input
                id="phone-id"
                value={settings.whatsapp_phone_id}
                onChange={(e) => setSettings({ ...settings, whatsapp_phone_id: e.target.value })}
                placeholder="Enter your WhatsApp Phone Number ID"
              />
            </div>

            <div>
              <Label htmlFor="access-token">Access Token</Label>
              <div className="relative">
                <Input
                  id="access-token"
                  type={showToken ? 'text' : 'password'}
                  value={settings.whatsapp_access_token}
                  onChange={(e) => setSettings({ ...settings, whatsapp_access_token: e.target.value })}
                  placeholder="Enter your WhatsApp Access Token"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button onClick={saveSettings} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* Test Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Test WhatsApp Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-phone">Test Phone Number</Label>
              <Input
                id="test-phone"
                value={settings.test_phone_number}
                onChange={(e) => setSettings({ ...settings, test_phone_number: e.target.value })}
                placeholder="Enter phone number with country code (e.g., +1234567890)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Include country code without + symbol (e.g., 1234567890 for US number)
              </p>
            </div>

            <div>
              <Label htmlFor="test-message">Test Message</Label>
              <Textarea
                id="test-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter your test message"
                rows={3}
              />
            </div>

            <Button 
              onClick={testWhatsAppConnection} 
              disabled={testing || !settings.whatsapp_phone_id || !settings.whatsapp_access_token || !settings.test_phone_number}
              className="w-full"
              variant="outline"
            >
              {testing ? (
                'Sending Test Message...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Message
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Status Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {settings.whatsapp_phone_id ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Phone Number ID</span>
              </div>
              <div className="flex items-center gap-2">
                {settings.whatsapp_access_token ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Access Token</span>
              </div>
              <div className="flex items-center gap-2">
                {settings.test_phone_number ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Test Phone Number</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 