import { NextRequest, NextResponse } from 'next/server'
import { oauthService } from '@/lib/oauth-service'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Initiating Facebook OAuth connection...')
    console.log('🔍 Environment Debug:')
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
    console.log('COMPOSIO_API_KEY:', process.env.COMPOSIO_API_KEY ? '✅ Set' : '❌ Not set')
    
    // Get the OAuth connection URL from Composio
    const connectUrl = await oauthService.getFacebookConnectUrl()
    
    console.log('✅ Facebook OAuth URL generated successfully')
    console.log('🔗 Connect URL:', connectUrl)
    
    // Return the URL for the frontend to redirect to
    return NextResponse.json({
      success: true,
      connectUrl,
      platform: 'facebook'
    })
    
  } catch (error) {
    console.error('❌ Failed to generate Facebook OAuth URL:', error)
    console.error('❌ Error details:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize Facebook OAuth',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
