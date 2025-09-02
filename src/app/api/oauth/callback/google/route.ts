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

    console.log('✅ Google OAuth callback received with code:', code)

    // TODO: Exchange the authorization code for access tokens
    // This would typically involve calling Composio's API to complete the connection
    // For now, we'll redirect back to settings with success status

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?oauth_success=google&message=Authorization successful! Please complete setup in Composio.`
    )

  } catch (error) {
    console.error('❌ Google OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?oauth_error=google&error=callback_failed`
    )
  }
}
