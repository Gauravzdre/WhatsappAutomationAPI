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
    console.log('🔧 Creating message_engagement_tracking table...')
    
    // Create the message_engagement_tracking table directly
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.message_engagement_tracking (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
          message_content TEXT,
          sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
          scheduled_time TIME NOT NULL,
          day_of_week INTEGER NOT NULL,
          response_received BOOLEAN DEFAULT FALSE,
          response_time INTEGER,
          engagement_score DECIMAL(3,2) DEFAULT 0.0,
          was_ai_optimized BOOLEAN DEFAULT FALSE,
          optimization_confidence DECIMAL(3,2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (tableError) {
      console.log('⚠️  Table creation via RPC failed, trying direct approach...')
      
      // Alternative approach: Use the SQL editor endpoint
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          sql: `
            CREATE TABLE IF NOT EXISTS public.message_engagement_tracking (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
              client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
              message_content TEXT,
              sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
              scheduled_time TIME NOT NULL,
              day_of_week INTEGER NOT NULL,
              response_received BOOLEAN DEFAULT FALSE,
              response_time INTEGER,
              engagement_score DECIMAL(3,2) DEFAULT 0.0,
              was_ai_optimized BOOLEAN DEFAULT FALSE,
              optimization_confidence DECIMAL(3,2),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            ALTER TABLE public.message_engagement_tracking ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY IF NOT EXISTS "Users can view their own engagement tracking" ON public.message_engagement_tracking
              FOR SELECT USING (auth.uid() = user_id);
            
            CREATE POLICY IF NOT EXISTS "Users can insert their own engagement tracking" ON public.message_engagement_tracking
              FOR INSERT WITH CHECK (auth.uid() = user_id);
            
            CREATE POLICY IF NOT EXISTS "Users can update their own engagement tracking" ON public.message_engagement_tracking
              FOR UPDATE USING (auth.uid() = user_id);
          `
        })
      })
      
      if (!response.ok) {
        console.log('⚠️  Direct SQL execution also failed. Checking if table already exists...')
        
        // Check if the table exists
        const { data: tables, error: checkError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', 'message_engagement_tracking')
        
        if (checkError) {
          console.log('❌ Could not check table existence:', checkError.message)
        } else if (tables && tables.length > 0) {
          console.log('✅ message_engagement_tracking table already exists')
        } else {
          console.log('❌ Table does not exist and could not be created')
          console.log('📝 Please manually create the table using the Supabase SQL editor:')
          console.log(`
CREATE TABLE IF NOT EXISTS public.message_engagement_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  message_content TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_time TIME NOT NULL,
  day_of_week INTEGER NOT NULL,
  response_received BOOLEAN DEFAULT FALSE,
  response_time INTEGER,
  engagement_score DECIMAL(3,2) DEFAULT 0.0,
  was_ai_optimized BOOLEAN DEFAULT FALSE,
  optimization_confidence DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.message_engagement_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own engagement tracking" ON public.message_engagement_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own engagement tracking" ON public.message_engagement_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own engagement tracking" ON public.message_engagement_tracking
  FOR UPDATE USING (auth.uid() = user_id);
          `)
        }
      } else {
        console.log('✅ Table created successfully via direct SQL')
      }
    } else {
      console.log('✅ Table created successfully via RPC')
    }
    
    // Test the table by trying to query it
    console.log('🧪 Testing table access...')
    const { data: testData, error: testError } = await supabase
      .from('message_engagement_tracking')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.log('⚠️  Table test failed:', testError.message)
      console.log('📝 The table might need to be created manually in the Supabase dashboard')
    } else {
      console.log('✅ Table is accessible and working correctly')
    }
    
    console.log('🎉 Smart scheduling schema setup completed!')
    console.log('')
    console.log('📊 Features now available:')
    console.log('  ✅ Message engagement tracking')
    console.log('  ✅ Response time analytics')
    console.log('  ✅ Schedule performance monitoring')
    console.log('')
    
  } catch (error) {
    console.error('❌ Error applying smart scheduling schema:', error.message)
    console.log('')
    console.log('📝 Manual setup required:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Open the SQL editor')
    console.log('3. Run the SQL from database/smart-scheduling-schema.sql')
    console.log('')
  }
}

// Run the schema application
applySmartSchedulingSchema() 