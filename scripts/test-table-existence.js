const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function testTableExistence() {
  console.log('🔍 Testing message_engagement_tracking table existence...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  try {
    // Test if we can query the table
    const { data, error } = await supabase
      .from('message_engagement_tracking')
      .select('id')
      .limit(1)
    
    if (error) {
      console.log('❌ Table does not exist or is not accessible:', error.message)
      console.log('📝 Error code:', error.code)
      
      if (error.code === '42P01') {
        console.log('🔧 The table needs to be created manually in Supabase')
        console.log('')
        console.log('📋 SQL to run in Supabase SQL Editor:')
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
      console.log('✅ Table exists and is accessible')
      console.log('📊 Current row count:', data?.length || 0)
    }
    
  } catch (error) {
    console.error('❌ Error testing table:', error.message)
  }
}

testTableExistence() 