import { NextRequest, NextResponse } from 'next/server'
import { oauthService } from '@/lib/oauth-service'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Initiating Instagram OAuth connection...')
    
    // Get the OAuth connection URL from Composio
    const connectUrl = await oauthService.getInstagramConnectUrl()
    
    console.log('✅ Instagram OAuth URL generated successfully')
    
    // Return the URL for the frontend to redirect to
    return NextResponse.json({
      success: true,
      connectUrl,
      platform: 'instagram'
    })
    
  } catch (error) {
    console.error('❌ Failed to generate Instagram OAuth URL:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize Instagram OAuth',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
