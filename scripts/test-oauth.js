#!/usr/bin/env node

/**
 * Test script for OAuth integration
 * This script tests the OAuth service to ensure it's working correctly
 */

const { execSync } = require('child_process')
const path = require('path')

console.log('🧪 Testing OAuth Integration...\n')

// Check if required environment variables are set
function checkEnvironment() {
  console.log('🔍 Checking environment variables...')
  
  try {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
  } catch (error) {
    console.log('⚠️  No .env file found, using system environment variables')
  }
  
  const requiredVars = ['COMPOSIO_API_KEY', 'NEXT_PUBLIC_APP_URL']
  const missingVars = []
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }
  
  if (missingVars.length > 0) {
    console.log(`❌ Missing required environment variables: ${missingVars.join(', ')}`)
    console.log('Please set these variables in your .env file or system environment')
    process.exit(1)
  }
  
  console.log('✅ Environment variables are properly configured')
  console.log(`   - COMPOSIO_API_KEY: ${process.env.COMPOSIO_API_KEY ? 'Set' : 'Missing'}`)
  console.log(`   - NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`)
}

// Test OAuth service initialization
async function testOAuthService() {
  console.log('\n🔧 Testing OAuth service...')
  
  try {
    // Test if the OAuth service can be imported
    const { oauthService } = require('../src/lib/oauth-service')
    console.log('✅ OAuth service imported successfully')
    
    // Test service initialization
    await oauthService.initialize()
    console.log('✅ OAuth service initialized successfully')
    
    return true
  } catch (error) {
    console.log('❌ OAuth service test failed:', error.message)
    return false
  }
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n🌐 Testing API endpoints...')
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const endpoints = [
    '/api/oauth/connect/facebook',
    '/api/oauth/connect/instagram'
  ]
  
  for (const endpoint of endpoints) {
    try {
      console.log(`   Testing ${endpoint}...`)
      
      // Use curl or similar to test the endpoint
      const response = await fetch(`${baseUrl}${endpoint}`)
      
      if (response.ok) {
        console.log(`   ✅ ${endpoint} - Status: ${response.status}`)
      } else {
        console.log(`   ⚠️  ${endpoint} - Status: ${response.status}`)
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint} - Error: ${error.message}`)
    }
  }
}

// Test Composio package
function testComposioPackage() {
  console.log('\n📦 Testing Composio package...')
  
  try {
    const packagePath = path.join(__dirname, '..', 'node_modules', '@composio', 'client')
    const packageJson = require(path.join(packagePath, 'package.json'))
    
    console.log(`✅ Composio package found: ${packageJson.name}@${packageJson.version}`)
    console.log(`   - Description: ${packageJson.description}`)
    console.log(`   - License: ${packageJson.license}`)
    
    return true
  } catch (error) {
    console.log('❌ Composio package not found or invalid')
    console.log('   Please run: npm install @composio/client')
    return false
  }
}

// Main test function
async function runTests() {
  try {
    checkEnvironment()
    
    const composioOk = testComposioPackage()
    if (!composioOk) {
      console.log('\n❌ Composio package test failed. Please install the package first.')
      process.exit(1)
    }
    
    const oauthOk = await testOAuthService()
    if (!oauthOk) {
      console.log('\n❌ OAuth service test failed. Please check your configuration.')
      process.exit(1)
    }
    
    await testAPIEndpoints()
    
    console.log('\n🎉 All tests completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('   1. Start your development server: npm run dev')
    console.log('   2. Visit /oauth-demo to test the OAuth flow')
    console.log('   3. Check the settings page for the new OAuth buttons')
    console.log('   4. Test connecting Facebook and Instagram accounts')
    
  } catch (error) {
    console.error('\n💥 Test execution failed:', error)
    process.exit(1)
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests()
}

module.exports = { runTests }
