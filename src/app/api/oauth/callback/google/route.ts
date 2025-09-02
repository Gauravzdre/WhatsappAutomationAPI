import { NextRequest, NextResponse } from 'next/server'
import { oauthService } from '@/lib/oauth-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('❌ Google OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?oauth_error=google&error=${error}`
      )
    }

    if (!code) {
      console.error('❌ No authorization code received from Google')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?oauth_error=google&error=no_code`
      )
    }

    console.log('🔄 Processing Google OAuth callback...')

    // Handle the OAuth callback and get connection details
    const connection = await oauthService.handleCallback('google', code, state || undefined)

    if (connection.status === 'connected') {
      console.log('✅ Google OAuth successful:', connection.accountInfo?.name)
      
      // Redirect to settings page with success message
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?oauth_success=google&account_name=${encodeURIComponent(connection.accountInfo?.name || 'Google Account')}`
      )
    } else {
      throw new Error('Failed to establish Google connection')
    }

  } catch (error) {
    console.error('❌ Google OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?oauth_error=google&error=callback_failed`
    )
  }
}
