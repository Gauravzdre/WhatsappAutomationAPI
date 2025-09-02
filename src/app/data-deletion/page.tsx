'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  Shield, 
  User,
  Settings,
  Globe,
  MessageSquare,
  Brain
} from 'lucide-react'

export default function DataDeletionPage() {
  const [deletionStatus, setDeletionStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle')
  const [deletedItems, setDeletedItems] = useState<string[]>([])

  const handleDataDeletion = async () => {
    setDeletionStatus('processing')
    
    try {
      // Simulate data deletion process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, you would:
      // 1. Delete user data from your database
      // 2. Revoke OAuth connections
      // 3. Delete user account
      // 4. Clean up any stored files or media
      
      setDeletedItems([
        'User profile and settings',
        'WhatsApp Business API credentials',
        'Facebook OAuth connection',
        'Instagram OAuth connection',
        'AI conversation history',
        'Social media posts and content',
        'Analytics data',
        'Webhook configurations'
      ])
      
      setDeletionStatus('completed')
    } catch (error) {
      console.error('Data deletion failed:', error)
      setDeletionStatus('error')
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Data Deletion Request
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Request complete deletion of your data from our platform
        </p>
      </div>

      <div className="grid gap-6">
        {/* Important Notice */}
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Warning:</strong> This action is irreversible. All your data, including OAuth connections, 
            settings, and content will be permanently deleted.
          </AlertDescription>
        </Alert>

        {/* What Gets Deleted */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              What Will Be Deleted
            </CardTitle>
            <CardDescription>
              Complete removal of all your data from our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <h4 className="font-medium">User Account</h4>
                  <p className="text-sm text-gray-500">Profile, preferences, authentication</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <MessageSquare className="h-5 w-5 text-gray-500" />
                <div>
                  <h4 className="font-medium">WhatsApp Settings</h4>
                  <p className="text-sm text-gray-500">API credentials, phone numbers</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Globe className="h-5 w-5 text-gray-500" />
                <div>
                  <h4 className="font-medium">OAuth Connections</h4>
                  <p className="text-sm text-gray-500">Facebook, Instagram, Google</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Brain className="h-5 w-5 text-gray-500" />
                <div>
                  <h4 className="font-medium">AI Content</h4>
                  <p className="text-sm text-gray-500">Generated posts, conversations</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Database className="h-5 w-5 text-gray-500" />
                <div>
                  <h4 className="font-medium">Stored Data</h4>
                  <p className="text-sm text-gray-500">Files, media, analytics</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Settings className="h-5 w-5 text-gray-500" />
                <div>
                  <h4 className="font-medium">Configuration</h4>
                  <p className="text-sm text-gray-500">Webhooks, automation rules</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OAuth Revocation Notice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Shield className="h-5 w-5" />
              OAuth Connection Revocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <p>
                <strong>Important:</strong> We will automatically revoke access to your connected social media accounts:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Facebook page access will be removed</li>
                <li>Instagram business account connection will be terminated</li>
                <li>All granted permissions will be revoked</li>
                <li>Access tokens will be invalidated</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                Note: You may need to manually remove our app from your Facebook/Instagram settings 
                if you want to completely disconnect.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Deletion Process */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Data Deletion Process
            </CardTitle>
            <CardDescription>
              How your data deletion request will be processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                </div>
                <span>Submit deletion request</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">2</span>
                </div>
                <span>Revoke OAuth connections and API access</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">3</span>
                </div>
                <span>Delete all user data from databases</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">4</span>
                </div>
                <span>Remove stored files and media</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">5</span>
                </div>
                <span>Send confirmation email</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deletion Button */}
        <Card>
          <CardHeader>
            <CardTitle>Request Data Deletion</CardTitle>
            <CardDescription>
              Click the button below to permanently delete all your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deletionStatus === 'idle' && (
              <Button 
                onClick={handleDataDeletion}
                variant="destructive"
                size="lg"
                className="w-full"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Delete All My Data
              </Button>
            )}

            {deletionStatus === 'processing' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Processing your deletion request...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few minutes</p>
              </div>
            )}

            {deletionStatus === 'completed' && (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-600 mb-2">Data Deletion Complete</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  All your data has been successfully deleted from our platform.
                </p>
                <div className="text-left bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Deleted Items:</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    {deletedItems.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  You will receive a confirmation email shortly. Your account has been deactivated.
                </p>
              </div>
            )}

            {deletionStatus === 'error' && (
              <div className="text-center py-8">
                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-600 mb-2">Deletion Failed</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  There was an error processing your deletion request. Please try again or contact support.
                </p>
                <Button 
                  onClick={handleDataDeletion}
                  variant="destructive"
                  size="lg"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alternative Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Alternative Data Deletion Methods</CardTitle>
            <CardDescription>
              Other ways to request data deletion if the above method doesn't work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Email Request</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Send an email to our data protection team:
                </p>
                <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  privacy@auto.netlify.app
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Support Ticket</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Create a support ticket through our help center with the subject "Data Deletion Request"
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Response Time</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We will process your request within 30 days and send you a confirmation email.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Legal Information</CardTitle>
            <CardDescription>
              Your rights under data protection regulations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <p>
                <strong>Right to Erasure:</strong> Under GDPR Article 17 and other data protection laws, 
                you have the right to request the deletion of your personal data.
              </p>
              <p>
                <strong>Scope:</strong> This deletion covers all personal data we have collected about you, 
                including data processed through third-party services.
              </p>
              <p>
                <strong>Retention:</strong> We may retain certain information for legal compliance purposes 
                (e.g., financial records, audit logs) as required by law.
              </p>
              <p>
                <strong>Third Parties:</strong> We will notify relevant third-party services to delete 
                your data, but some may require separate requests from you.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
