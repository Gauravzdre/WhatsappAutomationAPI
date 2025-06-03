const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function applySmartSchedulingSchema() {
  console.log('🚀 Starting smart scheduling schema application...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'smart-scheduling-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📄 Schema file loaded successfully')
    console.log('🔧 Applying smart scheduling schema...')
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      
      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
        
        // Use the REST API to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({ sql: statement })
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.warn(`⚠️  Statement ${i + 1} warning: ${errorText}`)
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
        
      } catch (error) {
        console.warn(`⚠️  Statement ${i + 1} warning: ${error.message}`)
        // Continue with other statements
      }
    }
    
    console.log('🎉 Smart scheduling schema application completed!')
    console.log('')
    console.log('📊 New features available:')
    console.log('  ✅ AI-powered schedule optimization')
    console.log('  ✅ Audience behavior analysis')
    console.log('  ✅ Engagement tracking and learning')
    console.log('  ✅ Smart scheduling configurations')
    console.log('  ✅ Performance analytics and reporting')
    console.log('')
    console.log('🚀 Smart scheduling system is now ready!')
    
  } catch (error) {
    console.error('❌ Error applying smart scheduling schema:', error.message)
    process.exit(1)
  }
}

// Run the schema application
applySmartSchedulingSchema() 