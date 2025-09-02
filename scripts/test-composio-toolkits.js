#!/usr/bin/env node

/**
 * Test script to explore Composio toolkits and OAuth capabilities
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const Composio = require('@composio/client')

async function testComposioToolkits() {
  console.log('🧪 Testing Composio Toolkits...\n')
  
  try {
    // Check environment variables
    if (!process.env.COMPOSIO_API_KEY) {
      console.error('❌ COMPOSIO_API_KEY environment variable is required')
      process.exit(1)
    }
    
    console.log('✅ COMPOSIO_API_KEY found')
    
    // Initialize Composio client
    const client = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY
    })
    
    console.log('✅ Composio client initialized\n')
    
    // List all available toolkits
    console.log('📱 Fetching available toolkits...')
    const toolkits = await client.toolkits.list()
    
    console.log(`✅ Found ${toolkits.items.length} toolkits:\n`)
    
    // Display toolkit information
    toolkits.items.forEach((toolkit, index) => {
      console.log(`${index + 1}. ${toolkit.name} (${toolkit.slug})`)
      console.log(`   Description: ${toolkit.meta.description}`)
      console.log(`   Categories: ${toolkit.meta.categories.map(c => c.name).join(', ')}`)
      console.log(`   Tools: ${toolkit.meta.tools_count}`)
      console.log(`   Triggers: ${toolkit.meta.triggers_count}`)
      
      if (toolkit.auth_schemes && toolkit.auth_schemes.length > 0) {
        console.log(`   Auth Schemes: ${toolkit.auth_schemes.join(', ')}`)
      }
      
      if (toolkit.composio_managed_auth_schemes && toolkit.composio_managed_auth_schemes.length > 0) {
        console.log(`   Composio Managed Auth: ${toolkit.composio_managed_auth_schemes.join(', ')}`)
      }
      
      console.log('')
    })
    
    // Look for social media related toolkits
    const socialToolkits = toolkits.items.filter(toolkit => 
      toolkit.slug.includes('facebook') || 
      toolkit.slug.includes('instagram') || 
      toolkit.slug.includes('meta') ||
      toolkit.slug.includes('social') ||
      toolkit.meta.categories.some(cat => 
        cat.name.toLowerCase().includes('social') ||
        cat.name.toLowerCase().includes('marketing')
      )
    )
    
    if (socialToolkits.length > 0) {
      console.log('🎯 Social Media Related Toolkits:\n')
      socialToolkits.forEach(toolkit => {
        console.log(`📱 ${toolkit.name} (${toolkit.slug})`)
        
        // Get detailed information about this toolkit
        client.toolkits.retrieve(toolkit.slug).then(detailedToolkit => {
          console.log(`   Auth Configs: ${detailedToolkit.auth_config_details?.length || 0}`)
          
          if (detailedToolkit.auth_config_details) {
            detailedToolkit.auth_config_details.forEach((config, idx) => {
              console.log(`     ${idx + 1}. ${config.name} (${config.mode})`)
              if (config.fields?.connected_account_initiation) {
                const required = config.fields.connected_account_initiation.required || []
                const optional = config.fields.connected_account_initiation.optional || []
                console.log(`        Required fields: ${required.map(f => f.name).join(', ')}`)
                console.log(`        Optional fields: ${optional.map(f => f.name).join(', ')}`)
              }
            })
          }
        }).catch(error => {
          console.log(`   ❌ Could not retrieve details: ${error.message}`)
        })
      })
    }
    
    // Test specific toolkits
    const testSlugs = ['facebook', 'instagram', 'meta', 'linkedin', 'twitter']
    
    console.log('\n🔍 Testing specific social media toolkits:\n')
    
    for (const slug of testSlugs) {
      try {
        const toolkit = await client.toolkits.retrieve(slug)
        console.log(`✅ ${slug}: ${toolkit.name}`)
        console.log(`   Auth Configs: ${toolkit.auth_config_details?.length || 0}`)
        
        if (toolkit.auth_config_details) {
          toolkit.auth_config_details.forEach((config, idx) => {
            console.log(`     ${idx + 1}. ${config.name} (${config.mode})`)
            if (config.fields?.connected_account_initiation) {
              const required = config.fields.connected_account_initiation.required || []
              console.log(`        Required: ${required.map(f => f.name).join(', ')}`)
            }
          })
        }
        
      } catch (error) {
        console.log(`❌ ${slug}: ${error.message}`)
      }
      console.log('')
    }
    
    console.log('🎉 Toolkit exploration complete!')
    console.log('\n📝 Next steps:')
    console.log('1. Check which toolkits have OAuth2 auth schemes')
    console.log('2. Look for toolkits with connected_account_initiation fields')
    console.log('3. Test creating connected accounts with available auth configs')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
    process.exit(1)
  }
}

testComposioToolkits()
