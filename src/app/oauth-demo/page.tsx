'use client'

import { OAuthConnectButtons } from '@/components/oauth-connect-buttons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OAuthDemoPage() {
  const handleOAuthSuccess = (platform: 'facebook' | 'instagram' | 'google', accountName: string) => {
    console.log(`✅ ${platform} connected successfully: ${accountName}`)
  }

  const handleOAuthError = (platform: 'facebook' | 'instagram' | 'google', error: string) => {
    console.error(`❌ ${platform} connection failed: ${error}`)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          OAuth Connection Demo
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Connect your Facebook and Instagram accounts with just one click
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🚀 Simple OAuth Flow</CardTitle>
            <CardDescription>
              No more copying and pasting access tokens! Our OAuth integration makes it super easy to connect your social media accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Click "Connect" button</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Get redirected to Meta's authorization page</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Grant permissions for your accounts</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Automatically redirected back with connected accounts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <OAuthConnectButtons 
          onConnectionSuccess={handleOAuthSuccess}
          onConnectionError={handleOAuthError}
        />

        <Card>
          <CardHeader>
            <CardTitle>🔒 Security & Privacy</CardTitle>
            <CardDescription>
              Your credentials are handled securely through Meta's official OAuth flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>OAuth 2.0 compliant authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>No access tokens stored in plain text</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Automatic token refresh handling</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Secure callback handling</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📱 Supported Platforms</CardTitle>
            <CardDescription>
              Connect to the platforms you use most for social media management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">f</span>
                </div>
                <div>
                  <h4 className="font-medium">Facebook</h4>
                  <p className="text-sm text-gray-500">Pages, posts, comments, insights</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">📷</span>
                </div>
                <div>
                  <h4 className="font-medium">Instagram</h4>
                  <p className="text-sm text-gray-500">Posts, stories, comments, insights</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <div>
                  <h4 className="font-medium">Google</h4>
                  <p className="text-sm text-gray-500">APIs, services, authentication</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
