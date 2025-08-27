const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function setupChatbotDatabase() {
  console.log('🚀 Setting up Chatbot Database Tables...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.log('Please ensure these are set in your .env.local file:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    return false;
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Connected to Supabase');

    // Read the schema file
    const schemaPath = path.join(__dirname, '../database/chatbot-configurations-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Loaded database schema');

    // Execute the schema
    console.log('🔨 Creating database tables...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });

    if (error) {
      console.error('❌ Error creating tables:', error);
      
      // Try alternative approach - create main table only
      console.log('🔄 Trying to create main table only...');
      const mainTableSQL = `
        CREATE TABLE IF NOT EXISTS public.chatbot_configurations (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          industry TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('draft', 'configuring', 'training', 'ready', 'deployed')) DEFAULT 'draft',
          requirements JSONB NOT NULL DEFAULT '{}',
          generated_config JSONB NOT NULL DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT chatbot_configurations_name_check CHECK (char_length(name) >= 1)
        );
      `;

      const { error: mainError } = await supabase.rpc('exec_sql', { sql: mainTableSQL });
      
      if (mainError) {
        console.error('❌ Failed to create main table:', mainError);
        return false;
      }
    }

    console.log('✅ Database tables created successfully!');

    // Test the setup
    console.log('🧪 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('chatbot_configurations')
      .select('count(*)')
      .limit(1);

    if (testError) {
      console.error('❌ Test query failed:', testError);
      return false;
    }

    console.log('✅ Database test successful!');
    console.log('\n🎉 Chatbot database setup complete!');
    console.log('🌐 You can now use the chatbot builder at: http://localhost:3001/chatbot-builder');
    
    return true;

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
}

// Run the setup
if (require.main === module) {
  setupChatbotDatabase()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { setupChatbotDatabase }; 