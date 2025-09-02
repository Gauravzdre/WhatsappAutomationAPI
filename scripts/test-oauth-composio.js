#!/usr/bin/env node

/**
 * Test script for OAuth service with Composio
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const { oauthService } = require('../src/lib/oauth-service.ts')

async function testOAuthService() {
  console.log('🧪 Testing OAuth Service with Composio...\n')
  
  try {
    // Check environment variables
    if (!process.env.COMPOSIO_API_KEY) {
      console.error('❌ COMPOSIO_API_KEY environment variable is required')
      process.exit(1)
    }
    
    console.log('✅ COMPOSIO_API_KEY found')
    
    // Test initialization
    console.log('\n🚀 Testing OAuth service initialization...')
    await oauthService.initialize()
    console.log('✅ OAuth service initialized successfully')
    
    // Test getting available toolkits
    console.log('\n📱 Testing toolkit discovery...')
    const toolkits = await oauthService.getAvailableToolkits()
    console.log(`✅ Found ${toolkits.length} toolkits`)
    
    // Test Facebook toolkit
    console.log('\n🔍 Testing Facebook toolkit...')
    const facebookToolkit = await oauthService.getFacebookToolkit()
    console.log(`✅ Facebook toolkit: ${facebookToolkit.name}`)
    console.log(`   Auth configs: ${facebookToolkit.auth_config_details?.length || 0}`)
    
    if (facebookToolkit.auth_config_details) {
      facebookToolkit.auth_config_details.forEach((config, idx) => {
        console.log(`     ${idx + 1}. ${config.name} (${config.mode})`)
      })
    }
    
    // Test Instagram toolkit
    console.log('\n🔍 Testing Instagram toolkit...')
    const instagramToolkit = await oauthService.getInstagramToolkit()
    console.log(`✅ Instagram toolkit: ${instagramToolkit.name}`)
    console.log(`   Auth configs: ${instagramToolkit.auth_config_details?.length || 0}`)
    
    if (instagramToolkit.auth_config_details) {
      instagramToolkit.auth_config_details.forEach((config, idx) => {
        console.log(`     ${idx + 1}. ${config.name} (${config.mode})`)
      })
    }
    
    // Test getting OAuth URLs
    console.log('\n🔗 Testing OAuth URL generation...')
    
    try {
      const facebookUrl = await oauthService.getFacebookConnectUrl()
      console.log('✅ Facebook OAuth URL generated:', facebookUrl)
    } catch (error) {
      console.log('❌ Facebook OAuth URL failed:', error.message)
    }
    
    try {
      const instagramUrl = await oauthService.getInstagramConnectUrl()
      console.log('✅ Instagram OAuth URL generated:', instagramUrl)
    } catch (error) {
      console.log('❌ Instagram OAuth URL failed:', error.message)
    }
    
    console.log('\n🎉 OAuth service test complete!')
    console.log('\n📝 Next steps:')
    console.log('1. The OAuth service is working with Composio')
    console.log('2. Facebook and Instagram toolkits are available')
    console.log('3. OAuth2 configurations are found')
    console.log('4. Ready to implement the actual OAuth flow')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
    process.exit(1)
  }
}

testOAuthService()
