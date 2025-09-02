'use client'

import { useState } from 'react'
import { Facebook, Instagram, ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface OAuthConnectButtonsProps {
  onConnectionSuccess?: (platform: 'facebook' | 'instagram' | 'google', accountName: string) => void
  onConnectionError?: (platform: 'facebook' | 'instagram' | 'google', error: string) => void
}

interface ConnectionStatus {
  facebook: 'disconnected' | 'connecting' | 'connected' | 'error'
  instagram: 'disconnected' | 'connecting' | 'connected' | 'error'
  google: 'disconnected' | 'connecting' | 'connected' | 'error'
}

export function OAuthConnectButtons({ 
  onConnectionSuccess, 
  onConnectionError 
}: OAuthConnectButtonsProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    facebook: 'disconnected',
    instagram: 'disconnected',
    google: 'disconnected'
  })
  const [connectedAccounts, setConnectedAccounts] = useState<{
    facebook?: string
    instagram?: string
    google?: string
  }>({})
  
  const { toast } = useToast()

  const handleConnect = async (platform: 'facebook' | 'instagram' | 'google') => {
    try {
      setConnectionStatus(prev => ({ ...prev, [platform]: 'connecting' }))
      
      // Get the OAuth connection URL
      const response = await fetch(`/api/oauth/connect/${platform}`)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize OAuth')
      }
      
      // Redirect user to the OAuth authorization page
      window.location.href = data.connectUrl
      
    } catch (error) {
      console.error(`❌ Failed to connect ${platform}:`, error)
      
      setConnectionStatus(prev => ({ ...prev, [platform]: 'error' }))
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      onConnectionError?.(platform, errorMessage)
      
      toast({
        title: `Failed to connect ${platform}`,
        description: errorMessage,
        variant: 'destructive'
      })
      
      // Reset status after error
      setTimeout(() => {
        setConnectionStatus(prev => ({ ...prev, [platform]: 'disconnected' }))
      }, 3000)
    }
  }

  const connectInstagram = async () => {
    try {
      setConnectionStatus(prev => ({ ...prev, instagram: 'connecting' }))
      
      const response = await fetch('/api/oauth/connect/instagram')
      const data = await response.json()
      
      if (data.success && data.connectUrl) {
        // Redirect to the OAuth URL
        window.location.href = data.connectUrl
      } else {
        throw new Error(data.error || 'Failed to get Instagram OAuth URL')
      }
    } catch (error) {
      console.error('❌ Instagram OAuth connection failed:', error)
      setConnectionStatus(prev => ({ ...prev, instagram: 'error' }))
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      onConnectionError?.('instagram', errorMessage)
      
      // Reset status after a delay
      setTimeout(() => {
        setConnectionStatus(prev => ({ ...prev, instagram: 'disconnected' }))
      }, 3000)
    }
  }

  const connectGoogle = async () => {
    try {
      setConnectionStatus(prev => ({ ...prev, google: 'connecting' }))
      
      const response = await fetch('/api/oauth/connect/google')
      const data = await response.json()
      
      if (data.success && data.connectUrl) {
        // Redirect to the OAuth URL
        window.location.href = data.connectUrl
      } else {
        throw new Error(data.error || 'Failed to get Google OAuth URL')
      }
    } catch (error) {
      console.error('❌ Google OAuth connection failed:', error)
      setConnectionStatus(prev => ({ ...prev, google: 'error' }))
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      onConnectionError?.('google', errorMessage)
      
      // Reset status after a delay
      setTimeout(() => {
        setConnectionStatus(prev => ({ ...prev, google: 'disconnected' }))
      }, 3000)
    }
  }

  const getStatusIcon = (platform: 'facebook' | 'instagram' | 'google') => {
    const status = connectionStatus[platform]
    
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'connecting':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (platform: 'facebook' | 'instagram' | 'google') => {
    const status = connectionStatus[platform]
    
    switch (status) {
      case 'connected':
        return connectedAccounts[platform] ? `Connected to ${connectedAccounts[platform]}` : 'Connected'
      case 'connecting':
        return 'Connecting...'
      case 'error':
        return 'Connection failed'
      default:
        return 'Not connected'
    }
  }

  const getButtonVariant = (platform: 'facebook' | 'instagram' | 'google') => {
    const status = connectionStatus[platform]
    
    switch (status) {
      case 'connected':
        return 'outline'
      case 'connecting':
        return 'secondary'
      case 'error':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getButtonText = (platform: 'facebook' | 'instagram' | 'google') => {
    const status = connectionStatus[platform]
    
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'connecting':
        return 'Connecting...'
      case 'error':
        return 'Retry'
      default:
        return 'Connect'
    }
  }

  const isButtonDisabled = (platform: 'facebook' | 'instagram' | 'google') => {
    return connectionStatus[platform] === 'connecting'
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5 text-blue-600" />
            Facebook
          </CardTitle>
          <CardDescription>
            Connect your Facebook page to manage posts, comments, and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon('facebook')}
              <span className="text-sm text-gray-600">
                {getStatusText('facebook')}
              </span>
            </div>
            <Button
              variant={getButtonVariant('facebook')}
              onClick={() => handleConnect('facebook')}
              disabled={isButtonDisabled('facebook')}
              className="min-w-[100px]"
            >
              {getButtonText('facebook')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-600" />
            Instagram
          </CardTitle>
          <CardDescription>
            Connect your Instagram business account to manage posts and stories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon('instagram')}
              <span className="text-sm text-gray-600">
                {getStatusText('instagram')}
              </span>
            </div>
            <Button
              variant={getButtonVariant('instagram')}
              onClick={() => handleConnect('instagram')}
              disabled={isButtonDisabled('instagram')}
              className="min-w-[100px]"
            >
              {getButtonText('instagram')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-green-600" />
            Google
          </CardTitle>
          <CardDescription>
            Connect your Google account to access Google services and APIs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon('google')}
              <span className="text-sm text-gray-600">
                {getStatusText('google')}
              </span>
            </div>
            <Button
              variant="outline"
              disabled={true}
              className="min-w-[100px] opacity-50 cursor-not-allowed"
              title="Google OAuth not currently supported"
            >
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 <strong>How it works:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Click "Connect" to start the OAuth flow</li>
          <li>You'll be redirected to Meta's authorization page</li>
          <li>Grant permissions for your Facebook page and Instagram account</li>
          <li>You'll be redirected back to the app automatically</li>
          <li>No need to copy/paste access tokens - it's all handled securely</li>
        </ul>
      </div>
    </div>
  )
}
