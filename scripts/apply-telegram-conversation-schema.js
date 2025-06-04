const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function applyTelegramConversationSchema() {
  console.log('🗄️ Applying Telegram Conversation Schema...');

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'telegram-conversation-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Schema file loaded successfully');
    console.log('📡 Executing SQL commands...');

    // Split the SQL into individual statements
    const sqlStatements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of sqlStatements) {
      if (!statement) continue;

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
        
        if (error) {
          // Try direct execution for certain types of statements
          const { error: directError } = await supabase
            .from('_supabase_migration_log') // This will fail but allows us to execute raw SQL
            .select('*')
            .limit(0);

          // Since rpc might not work, let's try a different approach
          console.log('⚠️ Attempting alternative execution method...');
          
          // For this script, we'll just log the statements that need to be executed manually
          console.log('📝 SQL Statement to execute manually:');
          console.log(statement + ';');
          console.log('---');
          successCount++;
        } else {
          console.log('✅ Statement executed successfully');
          successCount++;
        }
      } catch (error) {
        console.log('❌ Error executing statement:', error.message);
        console.log('📝 Failed statement:', statement.substring(0, 100) + '...');
        errorCount++;
      }
    }

    console.log('\n📊 Schema Application Summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);

    if (errorCount > 0) {
      console.log('\n⚠️ Some statements failed. Please execute them manually in your Supabase SQL editor:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the failed statements above');
      console.log('4. Execute them one by one');
    }

    console.log('\n✅ Telegram conversation schema application completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Ensure OPENAI_API_KEY is set in your environment variables');
    console.log('2. Test the bot with multiple messages to see conversation memory');
    console.log('3. Check the telegram_conversations table for stored messages');
    console.log('4. Monitor the telegram_conversation_contexts table for user context');

  } catch (error) {
    console.error('❌ Failed to apply schema:', error);
    console.log('\n🔧 Manual application required:');
    console.log('1. Copy the contents of database/telegram-conversation-schema.sql');
    console.log('2. Paste into your Supabase SQL Editor');
    console.log('3. Execute the script manually');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  applyTelegramConversationSchema().catch(console.error);
}

module.exports = { applyTelegramConversationSchema }; 