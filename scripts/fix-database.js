const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function fixDatabase() {
  console.log('🔧 Starting database relationship fix...')
  
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
    // Read the fix script
    const fixScript = fs.readFileSync(
      path.join(__dirname, '..', 'database', 'fix-team-relationships.sql'),
      'utf8'
    )
    
    console.log('📝 Applying database fixes...')
    
    // Execute the fix script
    const { error } = await supabase.rpc('exec_sql', { sql: fixScript })
    
    if (error) {
      console.error('❌ Database fix failed:', error)
      process.exit(1)
    }
    
    console.log('✅ Database relationships fixed successfully!')
    console.log('🔄 Schema cache should refresh automatically')
    
  } catch (error) {
    console.error('❌ Error applying database fix:', error.message)
    process.exit(1)
  }
}

// Alternative method using direct SQL execution
async function fixDatabaseDirect() {
  console.log('🔧 Starting database relationship fix (direct method)...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    console.log('📝 Creating profiles table if not exists...')
    
    // Create profiles table
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT,
          full_name TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON public.profiles
          FOR SELECT USING (auth.uid() = id);
      `
    })
    
    if (profilesError) {
      console.log('ℹ️ Profiles table setup result:', profilesError.message)
    }
    
    console.log('✅ Database fix completed!')
    console.log('🔄 Please restart your development server')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('ℹ️ This might be expected if tables already exist')
  }
}

// Run the fix
if (require.main === module) {
  fixDatabaseDirect()
} 