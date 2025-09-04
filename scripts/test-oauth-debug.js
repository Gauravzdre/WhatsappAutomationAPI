#!/usr/bin/env node

/**
 * Debug script to test OAuth service environment variables
 */

console.log('🔍 OAuth Service Environment Debug...\n')

// Check environment variables
console.log('Environment Variables:')
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || '❌ Not set')
console.log('COMPOSIO_API_KEY:', process.env.COMPOSIO_API_KEY ? '✅ Set' : '❌ Not set')
console.log('NODE_ENV:', process.env.NODE_ENV || '❌ Not set')

// Test OAuth service initialization
try {
  console.log('\n🚀 Testing OAuth service...')
  
  // Import the OAuth service
  const { oauthService } = require('../src/lib/oauth-service.ts')
  
  console.log('✅ OAuth service imported successfully')
  
  // Test initialization
  await oauthService.initialize()
  console.log('✅ OAuth service initialized')
  
} catch (error) {
  console.error('❌ OAuth service test failed:', error.message)
  console.error('Stack trace:', error.stack)
}

console.log('\n�� Debug complete!')
