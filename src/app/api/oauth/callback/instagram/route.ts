import { NextRequest, NextResponse } from 'next/server'
import { oauthService } from '@/lib/oauth-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('❌ Instagram OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?oauth_error=instagram&error=${error}`
      )
    }

    if (!code) {
      console.error('❌ No authorization code received from Instagram')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?oauth_error=instagram&error=no_code`
      )
    }

    console.log('🔄 Processing Instagram OAuth callback...')

    // Handle the OAuth callback and get connection details
    const connection = await oauthService.handleCallback('instagram', code, state || undefined)

    if (connection.status === 'connected') {
      console.log('✅ Instagram OAuth successful:', connection.accountInfo?.name)
      
      // Redirect to settings page with success message
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?oauth_success=instagram&account_name=${encodeURIComponent(connection.accountInfo?.name || 'Instagram Account')}`
      )
    } else {
      throw new Error('Failed to establish Instagram connection')
    }

  } catch (error) {
    console.error('❌ Instagram OAuth callback error:', error)
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?oauth_error=instagram&error=callback_failed`
    )
  }
}
