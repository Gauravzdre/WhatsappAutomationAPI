const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

async function runMigration() {
  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
    console.error('   SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY:', supabaseServiceKey ? '✅' : '❌')
    console.error('\nPlease ensure these are set in your .env file')
    process.exit(1)
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('🚀 Starting strategy system migration...')
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/005_strategy_system.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📖 Migration file loaded:', migrationPath)
    
    // Execute the migration
    console.log('⚡ Executing migration...')
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      // If exec_sql doesn't exist, try direct SQL execution
      console.log('🔄 Trying alternative execution method...')
      
      // Split the SQL into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0)
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';'
        console.log(`📝 Executing statement ${i + 1}/${statements.length}...`)
        
        try {
          const { error: stmtError } = await supabase.from('_migration_test').select('1').limit(1)
          // This is a hack - we'll use the supabase client but need to find another way
          console.log('⚠️  Direct SQL execution not available via client library')
          console.log('📋 Please run the migration manually in your Supabase dashboard:')
          console.log('   1. Go to your Supabase project dashboard')
          console.log('   2. Navigate to SQL Editor')
          console.log('   3. Copy and paste the contents of supabase/migrations/005_strategy_system.sql')
          console.log('   4. Run the SQL')
          return
        } catch (err) {
          // Expected - we're just testing the connection
        }
      }
    } else {
      console.log('✅ Migration completed successfully!')
      console.log('📊 Result:', data)
    }
    
    // Test the migration by checking if tables exist
    console.log('🔍 Verifying migration...')
    
    const tables = ['strategies', 'templates', 'audience_segments', 'content_pillar_analytics']
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true })
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`)
        } else {
          console.log(`✅ Table ${table}: exists`)
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  }
}

// Handle CLI execution
if (require.main === module) {
  runMigration().catch(console.error)
}

module.exports = { runMigration } 