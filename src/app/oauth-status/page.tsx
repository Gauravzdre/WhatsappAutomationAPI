'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Info, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function OAuthStatusPage() {
  const searchParams = useSearchParams()
  const platform = searchParams.get('platform')
  const status = searchParams.get('status')
  const config = searchParams.get('config')
  const message = searchParams.get('message')

  const getStatusInfo = () => {
    switch (status) {
      case 'oauth2-available':
        if (message === 'auth-config-needed') {
          return {
            icon: <AlertCircle className="h-8 w-8 text-yellow-500" />,
            title: 'OAuth2 Configuration Found!',
            description: `Composio has OAuth2 support for ${platform}, but an auth config needs to be created first.`,
            status: 'warning'
          }
        }
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-500" />,
          title: 'OAuth2 Configuration Found!',
          description: `Composio has OAuth2 support for ${platform}, but the actual OAuth flow needs to be implemented.`,
          status: 'success'
        }
      default:
        return {
          icon: <Info className="h-8 w-8 text-blue-500" />,
          title: 'OAuth Status',
          description: 'Checking OAuth configuration status...',
          status: 'info'
        }
    }
  }

  const getMessageContent = () => {
    if (message === 'auth-config-needed') {
      return {
        title: 'Auth Config Required',
        content: `To complete the OAuth integration for ${platform}, you need to create an auth config first. This requires additional setup in the Composio dashboard.`,
        steps: [
          'Go to your Composio dashboard',
          'Navigate to the Auth Configs section',
          `Create a new auth config for ${platform}`,
          'Configure the OAuth2 settings',
          'Use the auth config ID to create connected accounts'
        ]
      }
    }
    
    return {
      title: 'Implementation Required',
      content: `Composio has the OAuth2 infrastructure for ${platform}, but you need to implement the actual OAuth flow using Composio's connected accounts API.`,
      steps: [
        'Use Composio\'s connected accounts API to create OAuth connections',
        'Implement the OAuth authorization flow',
        'Handle OAuth callbacks and token exchange',
        'Store and manage access tokens securely'
      ]
    }
  }

  const statusInfo = getStatusInfo()
  const messageContent = getMessageContent()

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/oauth-demo" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to OAuth Demo
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          OAuth Integration Status
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Current status of your OAuth integration with {platform}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="text-center">
            {statusInfo.icon}
            <CardTitle className="text-xl">{statusInfo.title}</CardTitle>
            <CardDescription>{statusInfo.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Current Status:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>✅ {platform} toolkit found in Composio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>✅ OAuth2 configuration available: {config}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span>⚠️ {message === 'auth-config-needed' ? 'Auth config creation needed' : 'OAuth flow implementation needed'}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium mb-2 text-blue-800 dark:text-blue-200">{messageContent.title}:</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {messageContent.content}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-medium mb-2 text-green-800 dark:text-green-200">Next Steps:</h3>
                <ol className="text-sm text-green-700 dark:text-green-300 space-y-1 list-decimal list-inside">
                  {messageContent.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available OAuth Platforms</CardTitle>
            <CardDescription>
              Based on our Composio toolkit exploration, these platforms support OAuth2:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">f</span>
                </div>
                <div>
                  <h4 className="font-medium">Facebook</h4>
                  <p className="text-sm text-gray-500">OAuth2 available</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">📷</span>
                </div>
                <div>
                  <h4 className="font-medium">Instagram</h4>
                  <p className="text-sm text-gray-500">OAuth2 available</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">in</span>
                </div>
                <div>
                  <h4 className="font-medium">LinkedIn</h4>
                  <p className="text-sm text-gray-500">OAuth2 available</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🐦</span>
                </div>
                <div>
                  <h4 className="font-medium">Twitter/X</h4>
                  <p className="text-sm text-gray-500">OAuth2 available</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button asChild>
            <Link href="/oauth-demo">
              Back to OAuth Demo
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/settings">
              Go to Settings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
