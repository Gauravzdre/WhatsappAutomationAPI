'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { 
  Settings, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Bot,
  Palette,
  MessageSquare,
  Shield,
  Zap,
  Brain,
  Target,
  Activity,
  Globe,
  Smartphone,
  Key,
  Database,
  Sparkles
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { OAuthConnectButtons } from '@/components/oauth-connect-buttons'

interface WhatsAppSettings {
  id?: string
  whatsapp_phone_id: string
  whatsapp_access_token: string
  whatsapp_api_url: string
  whatsapp_verify_token: string
  test_phone_number: string
}

interface AISettings {
  model: string
  temperature: number
  max_tokens: number
  response_style: string
  language: string
}

interface SocialMediaSettings {
  facebook_access_token: string
  facebook_page_id: string
  instagram_access_token: string
  instagram_account_id: string
  twitter_api_key: string
  twitter_api_secret: string
  twitter_access_token: string
  twitter_access_token_secret: string
  linkedin_access_token: string
  linkedin_page_id: string
  tiktok_access_token: string
  youtube_api_key: string
  youtube_channel_id: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<WhatsAppSettings>({
    whatsapp_phone_id: '',
    whatsapp_access_token: '',
    whatsapp_api_url: 'https://graph.facebook.com/v15.0',
    whatsapp_verify_token: '',
    test_phone_number: ''
  })
  
  const [aiSettings, setAiSettings] = useState<AISettings>({
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 1000,
    response_style: 'professional',
    language: 'en'
  })

  const [socialSettings, setSocialSettings] = useState<SocialMediaSettings>({
    facebook_access_token: '',
    facebook_page_id: '',
    instagram_access_token: '',
    instagram_account_id: '',
    twitter_api_key: '',
    twitter_api_secret: '',
    twitter_access_token: '',
    twitter_access_token_secret: '',
    linkedin_access_token: '',
    linkedin_page_id: '',
    tiktok_access_token: '',
    youtube_api_key: '',
    youtube_channel_id: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [testMessage, setTestMessage] = useState('Hello! This is a test message from your AI-powered automation system. 🚀')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected')

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
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setSettings(data)
        setSocialSettings({
          facebook_access_token: data.facebook_access_token || '',
          facebook_page_id: data.facebook_page_id || '',
          instagram_access_token: data.instagram_access_token || '',
          instagram_account_id: data.instagram_account_id || '',
          twitter_api_key: data.twitter_api_key || '',
          twitter_api_secret: data.twitter_api_secret || '',
          twitter_access_token: data.twitter_access_token || '',
          twitter_access_token_secret: data.twitter_access_token_secret || '',
          linkedin_access_token: data.linkedin_access_token || '',
          linkedin_page_id: data.linkedin_page_id || '',
          tiktok_access_token: data.tiktok_access_token || '',
          youtube_api_key: data.youtube_api_key || '',
          youtube_channel_id: data.youtube_channel_id || ''
        })
        setConnectionStatus('connected')
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
        whatsapp_verify_token: settings.whatsapp_verify_token,
        test_phone_number: settings.test_phone_number
      }

      const { error } = await supabase
        .from('settings')
        .upsert(settingsData, { onConflict: 'user_id' })

      if (error) throw error

      setConnectionStatus('connected')
      toast({
        title: 'Success ✅',
        description: 'WhatsApp settings saved successfully',
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

  const saveSocialSettings = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const settingsData = {
        user_id: user.id,
        ...socialSettings
      }

      const { error } = await supabase
        .from('settings')
        .upsert(settingsData, { onConflict: 'user_id' })

      if (error) throw error

      toast({
        title: 'Success ✅',
        description: 'Social media settings saved successfully',
      })
    } catch (error) {
      console.error('Error saving social settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save social media settings',
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
    setConnectionStatus('testing')
    try {
      const response = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: settings.test_phone_number,
          message: testMessage
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setConnectionStatus('connected')
        toast({
          title: 'Test Successful! 🎉',
          description: 'WhatsApp message sent successfully. Check your phone!',
        })
      } else {
        setConnectionStatus('disconnected')
        throw new Error(result.error || 'Failed to send test message')
      }
    } catch (error) {
      setConnectionStatus('disconnected')
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

  const getStatusIcon = (status: typeof connectionStatus) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-5 w-5" />
      case 'disconnected': return <AlertCircle className="h-5 w-5" />
      case 'testing': return <Activity className="h-5 w-5 animate-spin" />
      default: return <AlertCircle className="h-5 w-5" />
    }
  }

  const handleOAuthSuccess = (platform: 'facebook' | 'instagram' | 'google', accountName: string) => {
    toast({
      title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Connected!`,
      description: `Successfully connected to ${accountName}`,
    })
  }

  const handleOAuthError = (platform: 'facebook' | 'instagram' | 'google', error: string) => {
    toast({
      title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Connection Failed`,
      description: error,
      variant: 'destructive'
    })
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Settings"
        description="Configure your automation platform"
        icon={<Settings className="h-8 w-8" />}
        gradient="purple"
      >
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 animate-spin text-purple-600" />
            <span className="text-gray-600 dark:text-gray-300 text-lg">Loading settings...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Settings"
      description="Configure your automation platform"
      icon={<Settings className="h-8 w-8" />}
      gradient="purple"
    >
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <EnhancedCard variant="gradient" gradient="purple">
          <EnhancedCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <EnhancedCardTitle className="text-lg text-white">Messaging Status</EnhancedCardTitle>
              <Smartphone className="h-6 w-6 text-purple-200" />
            </div>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(connectionStatus)}
              <span className="text-white font-medium capitalize">{connectionStatus}</span>
            </div>
            <p className="text-purple-100 text-sm mt-1">Business API connection</p>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard variant="gradient" gradient="blue">
          <EnhancedCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <EnhancedCardTitle className="text-lg text-white">AI Models</EnhancedCardTitle>
              <Brain className="h-6 w-6 text-blue-200" />
            </div>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="text-2xl font-bold text-white">{aiSettings.model}</div>
            <p className="text-blue-100 text-sm mt-1">Active model</p>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard variant="gradient" gradient="green">
          <EnhancedCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <EnhancedCardTitle className="text-lg text-white">System Health</EnhancedCardTitle>
              <Shield className="h-6 w-6 text-green-200" />
            </div>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-100" />
              <span className="text-white font-medium">Operational</span>
            </div>
            <p className="text-green-100 text-sm mt-1">All systems online</p>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>

      <Tabs defaultValue="whatsapp" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
          <TabsTrigger value="whatsapp" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-600 data-[state=active]:text-white">
            <Globe className="h-4 w-4 mr-2" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
            <Brain className="h-4 w-4 mr-2" />
            AI Models
          </TabsTrigger>
          <TabsTrigger value="branding" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            <Palette className="h-4 w-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white">
            <Database className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp" className="space-y-6">
          {/* Setup Instructions */}
          <EnhancedCard variant="glass">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                WhatsApp Business API Setup Guide
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent className="text-blue-700 dark:text-blue-300 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="font-medium">📱 Step 1: Facebook Developer Account</p>
                  <p className="text-sm">Create an app at developers.facebook.com</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">🔑 Step 2: WhatsApp Business API</p>
                  <p className="text-sm">Add WhatsApp Business to your app</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">📞 Step 3: Phone Number ID</p>
                  <p className="text-sm">Get your Phone Number ID from dashboard</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">🎫 Step 4: Access Token</p>
                  <p className="text-sm">Generate a permanent access token</p>
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          {/* OAuth Demo Link */}
          <EnhancedCard variant="glass">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="text-green-800 dark:text-green-300 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Try the New OAuth Integration!
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent className="text-green-700 dark:text-green-300">
              <p className="mb-3">
                🎉 We've simplified social media connections! Instead of copying and pasting access tokens, 
                you can now connect your Facebook and Instagram accounts with just one click.
              </p>
              <Button 
                onClick={() => window.open('/oauth-demo', '_blank')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                🚀 Try OAuth Demo
              </Button>
            </EnhancedCardContent>
          </EnhancedCard>

          {/* WhatsApp Configuration */}
          <EnhancedCard variant="glass">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <MessageSquare className="h-6 w-6 text-green-600" />
                <span>WhatsApp Business API Configuration</span>
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="api-url" className="text-gray-700 dark:text-gray-300 flex items-center space-x-2 font-medium">
                      <Database className="h-4 w-4" />
                      <span>API URL</span>
                    </Label>
                    <Input
                      id="api-url"
                      value={settings.whatsapp_api_url}
                      onChange={(e) => setSettings({...settings, whatsapp_api_url: e.target.value})}
                      placeholder="https://graph.facebook.com/v15.0"
                      className="mt-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone-id" className="text-gray-700 dark:text-gray-300 flex items-center space-x-2 font-medium">
                      <Smartphone className="h-4 w-4" />
                      <span>Phone Number ID</span>
                    </Label>
                    <Input
                      id="phone-id"
                      value={settings.whatsapp_phone_id}
                      onChange={(e) => setSettings({...settings, whatsapp_phone_id: e.target.value})}
                      placeholder="1234567890123456"
                      className="mt-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="access-token" className="text-gray-700 dark:text-gray-300 flex items-center space-x-2 font-medium">
                      <Key className="h-4 w-4" />
                      <span>Access Token</span>
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="access-token"
                        type={showToken ? "text" : "password"}
                        value={settings.whatsapp_access_token}
                        onChange={(e) => setSettings({...settings, whatsapp_access_token: e.target.value})}
                        placeholder="EAAxxxxxxxxxxxxxxx"
                        className="pr-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="test-phone" className="text-gray-700 dark:text-gray-300 flex items-center space-x-2 font-medium">
                      <Target className="h-4 w-4" />
                      <span>Test Phone Number</span>
                    </Label>
                    <Input
                      id="test-phone"
                      value={settings.test_phone_number}
                      onChange={(e) => setSettings({...settings, test_phone_number: e.target.value})}
                      placeholder="+1234567890"
                      className="mt-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="verify-token" className="text-gray-700 dark:text-gray-300 flex items-center space-x-2 font-medium">
                      <Shield className="h-4 w-4" />
                      <span>Webhook Verify Token</span>
                    </Label>
                    <Input
                      id="verify-token"
                      value={settings.whatsapp_verify_token}
                      onChange={(e) => setSettings({...settings, whatsapp_verify_token: e.target.value})}
                      placeholder="your_verify_token"
                      className="mt-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Test Message */}
              <div>
                <Label htmlFor="test-message" className="text-gray-700 dark:text-gray-300 flex items-center space-x-2 font-medium">
                  <Send className="h-4 w-4" />
                  <span>Test Message</span>
                </Label>
                <Textarea
                  id="test-message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter your test message..."
                  className="mt-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  onClick={saveSettings}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {saving ? (
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
                <Button
                  onClick={testWhatsAppConnection}
                  disabled={testing}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {testing ? (
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {testing ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <EnhancedCard variant="glass">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="text-pink-800 dark:text-pink-300 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media API Setup Guide
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent className="text-pink-700 dark:text-pink-300 space-y-3">
              <p className="font-medium">🔑 Enter your own API credentials for each platform you want to use:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>• Facebook: Get access token from Meta Developer Console</div>
                <div>• Instagram: Use Facebook Graph API credentials</div>
                <div>• Twitter: Create app on developer.twitter.com</div>
                <div>• LinkedIn: Register app on LinkedIn Developer</div>
                <div>• TikTok: Apply for TikTok for Business API</div>
                <div>• YouTube: Enable YouTube Data API in Google Cloud</div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Facebook & Instagram - OAuth Integration */}
            <EnhancedCard variant="glass">
              <EnhancedCardHeader>
                <EnhancedCardTitle className="text-blue-600 dark:text-blue-400">Facebook & Instagram</EnhancedCardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Connect your accounts securely with one click - no more copying access tokens!
                </p>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                                 <OAuthConnectButtons 
                   onConnectionSuccess={handleOAuthSuccess}
                   onConnectionError={handleOAuthError}
                 />
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Twitter */}
            <EnhancedCard variant="glass">
              <EnhancedCardHeader>
                <EnhancedCardTitle className="text-sky-600 dark:text-sky-400">Twitter / X</EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent className="space-y-4">
                <div>
                  <Label htmlFor="twitter-api-key">API Key</Label>
                  <Input
                    id="twitter-api-key"
                    type="password"
                    value={socialSettings.twitter_api_key}
                    onChange={(e) => setSocialSettings({...socialSettings, twitter_api_key: e.target.value})}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter-api-secret">API Secret Key</Label>
                  <Input
                    id="twitter-api-secret"
                    type="password"
                    value={socialSettings.twitter_api_secret}
                    onChange={(e) => setSocialSettings({...socialSettings, twitter_api_secret: e.target.value})}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter-access-token">Access Token</Label>
                  <Input
                    id="twitter-access-token"
                    type="password"
                    value={socialSettings.twitter_access_token}
                    onChange={(e) => setSocialSettings({...socialSettings, twitter_access_token: e.target.value})}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter-access-secret">Access Token Secret</Label>
                  <Input
                    id="twitter-access-secret"
                    type="password"
                    value={socialSettings.twitter_access_token_secret}
                    onChange={(e) => setSocialSettings({...socialSettings, twitter_access_token_secret: e.target.value})}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="mt-2"
                  />
                </div>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* LinkedIn */}
            <EnhancedCard variant="glass">
              <EnhancedCardHeader>
                <EnhancedCardTitle className="text-blue-700 dark:text-blue-400">LinkedIn</EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent className="space-y-4">
                <div>
                  <Label htmlFor="linkedin-token">Access Token</Label>
                  <Input
                    id="linkedin-token"
                    type="password"
                    value={socialSettings.linkedin_access_token}
                    onChange={(e) => setSocialSettings({...socialSettings, linkedin_access_token: e.target.value})}
                    placeholder="AQXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin-page">Page ID</Label>
                  <Input
                    id="linkedin-page"
                    value={socialSettings.linkedin_page_id}
                    onChange={(e) => setSocialSettings({...socialSettings, linkedin_page_id: e.target.value})}
                    placeholder="123456789"
                    className="mt-2"
                  />
                </div>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* TikTok & YouTube */}
            <EnhancedCard variant="glass">
              <EnhancedCardHeader>
                <EnhancedCardTitle className="text-purple-600 dark:text-purple-400">TikTok & YouTube</EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent className="space-y-4">
                <div>
                  <Label htmlFor="tiktok-token">TikTok Access Token</Label>
                  <Input
                    id="tiktok-token"
                    type="password"
                    value={socialSettings.tiktok_access_token}
                    onChange={(e) => setSocialSettings({...socialSettings, tiktok_access_token: e.target.value})}
                    placeholder="act.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube-api">YouTube API Key</Label>
                  <Input
                    id="youtube-api"
                    type="password"
                    value={socialSettings.youtube_api_key}
                    onChange={(e) => setSocialSettings({...socialSettings, youtube_api_key: e.target.value})}
                    placeholder="AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube-channel">YouTube Channel ID</Label>
                  <Input
                    id="youtube-channel"
                    value={socialSettings.youtube_channel_id}
                    onChange={(e) => setSocialSettings({...socialSettings, youtube_channel_id: e.target.value})}
                    placeholder="UCxxxxxxxxxxxxxxxxxxxxxxx"
                    className="mt-2"
                  />
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={saveSocialSettings}
              disabled={saving}
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
            >
              {saving ? (
                <Activity className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Social Media Settings'}
            </Button>
          </div>
        </TabsContent>

        {/* AI Models Tab */}
        <TabsContent value="ai" className="space-y-6">
          <EnhancedCard variant="glass">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <Brain className="h-6 w-6 text-blue-600" />
                <span>AI Model Configuration</span>
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300 font-medium">Model Selection</Label>
                    <div className="mt-2 space-y-2">
                      {['gpt-4', 'gpt-3.5-turbo', 'claude-3'].map((model) => (
                        <label key={model} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="model"
                            value={model}
                            checked={aiSettings.model === model}
                            onChange={(e) => setAiSettings({...aiSettings, model: e.target.value})}
                            className="text-blue-600"
                          />
                          <span className="text-gray-700 dark:text-gray-300">{model}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300 font-medium">Temperature: {aiSettings.temperature}</Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiSettings.temperature}
                      onChange={(e) => setAiSettings({...aiSettings, temperature: parseFloat(e.target.value)})}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Conservative</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <EnhancedCard variant="glass">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <Palette className="h-6 w-6 text-purple-600" />
                <span>Brand Customization</span>
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="text-center py-8">
                <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Brand Settings</h3>
                <p className="text-gray-600 dark:text-gray-400">Configure your brand voice and style preferences.</p>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <EnhancedCard variant="glass">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <Database className="h-6 w-6 text-gray-600" />
                <span>Advanced Configuration</span>
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="text-center py-8">
                <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Advanced Settings</h3>
                <p className="text-gray-600 dark:text-gray-400">Database connections, webhooks, and integrations.</p>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
} 