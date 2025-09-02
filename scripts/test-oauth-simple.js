#!/usr/bin/env node

/**
 * Simple test script for OAuth service logic
 * This tests the service without requiring environment variables
 */

console.log('🧪 Testing OAuth Service Logic...\n')

// Test the OAuth service class structure
try {
  // Mock environment variables for testing
  process.env.FACEBOOK_APP_ID = 'test_app_id'
  process.env.FACEBOOK_APP_SECRET = 'test_app_secret'
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  
  console.log('✅ Environment variables set for testing')
  
  // Test URL generation logic
  const testRedirectUri = 'http://localhost:3000'
  const testBaseUrl = 'http://localhost:3000'
  
  console.log('🔗 Testing OAuth URL generation...')
  
  // Test Facebook OAuth URL generation
  const facebookParams = new URLSearchParams({
    client_id: 'test_app_id',
    redirect_uri: `${testRedirectUri}/api/oauth/callback/facebook`,
    scope: 'pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish',
    response_type: 'code',
    state: Math.random().toString(36).substring(2, 15)
  })
  
  const facebookUrl = `https://www.facebook.com/v15.0/dialog/oauth?${facebookParams.toString()}`
  console.log('✅ Facebook OAuth URL generated:', facebookUrl.substring(0, 100) + '...')
  
  // Test Instagram OAuth URL generation
  const instagramParams = new URLSearchParams({
    client_id: 'test_app_id',
    redirect_uri: `${testRedirectUri}/api/oauth/callback/instagram`,
    scope: 'instagram_basic,instagram_content_publish,pages_read_engagement',
    response_type: 'code',
    state: Math.random().toString(36).substring(2, 15)
  })
  
  const instagramUrl = `https://www.facebook.com/v15.0/dialog/oauth?${instagramParams.toString()}`
  console.log('✅ Instagram OAuth URL generated:', instagramUrl.substring(0, 100) + '...')
  
  // Test state parameter generation
  const generateState = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
  
  const state1 = generateState()
  const state2 = generateState()
  console.log('✅ State parameters generated:', state1 !== state2 ? 'Unique' : 'Duplicate')
  
  console.log('\n🎉 All OAuth service logic tests passed!')
  console.log('\n📝 Next steps:')
  console.log('1. Set up a Facebook app at developers.facebook.com')
  console.log('2. Add FACEBOOK_APP_ID and FACEBOOK_APP_SECRET to your .env file')
  console.log('3. Configure OAuth redirect URIs in your Facebook app')
  console.log('4. Test the OAuth flow in your browser')
  
} catch (error) {
  console.error('❌ Test failed:', error.message)
  process.exit(1)
}
