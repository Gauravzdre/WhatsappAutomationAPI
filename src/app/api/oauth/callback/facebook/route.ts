import { NextRequest, NextResponse } from 'next/server'
import { oauthService } from '@/lib/oauth-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('❌ Facebook OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?oauth_error=facebook&error=${error}`
      )
    }

    if (!code) {
      console.error('❌ No authorization code received from Facebook')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?oauth_error=facebook&error=no_code`
      )
    }

    console.log('🔄 Processing Facebook OAuth callback...')

    // Handle the OAuth callback and get connection details
    const connection = await oauthService.handleCallback('facebook', code, state || undefined)

    if (connection.status === 'connected') {
      console.log('✅ Facebook OAuth successful:', connection.accountInfo?.name)
      
      // Redirect to settings page with success message
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?oauth_success=facebook&account_name=${encodeURIComponent(connection.accountInfo?.name || 'Facebook Account')}`
      )
    } else {
      throw new Error('Failed to establish Facebook connection')
    }

  } catch (error) {
    console.error('❌ Facebook OAuth callback error:', error)
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?oauth_error=facebook&error=callback_failed`
    )
  }
}
