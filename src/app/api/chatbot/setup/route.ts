import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('🔨 Setting up chatbot database table...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create the main table
    const createTableSQL = `
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

    // Execute the SQL using a direct query
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

    if (error) {
      console.error('❌ Error creating table:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create table: ' + error.message
      }, { status: 500 });
    }

    // Test the table
    const { data: testData, error: testError } = await supabase
      .from('chatbot_configurations')
      .select('count(*)')
      .limit(1);

    if (testError) {
      console.error('❌ Table test failed:', testError);
      return NextResponse.json({
        success: false,
        error: 'Table created but test failed: ' + testError.message
      }, { status: 500 });
    }

    console.log('✅ Chatbot database table created successfully!');

    return NextResponse.json({
      success: true,
      message: 'Chatbot database table created successfully!',
      data: {
        tableCreated: true,
        testPassed: true
      }
    });

  } catch (error) {
    console.error('❌ Setup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Setup failed: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if table exists
    const { data, error } = await supabase
      .from('chatbot_configurations')
      .select('count(*)')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        tableExists: false,
        error: error.message
      });
    }

    return NextResponse.json({
      success: true,
      tableExists: true,
      message: 'Chatbot table is ready!'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      tableExists: false,
      error: (error as Error).message
    });
  }
} 