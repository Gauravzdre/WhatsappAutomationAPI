-- =============================================================================
-- TELEGRAM CONVERSATION SYSTEM DATABASE SCHEMA
-- =============================================================================
-- This schema adds conversation memory and context for intelligent AI chatbots

-- Create telegram_conversations table for storing message history
CREATE TABLE IF NOT EXISTS public.telegram_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create telegram_conversation_contexts table for storing conversation context
CREATE TABLE IF NOT EXISTS public.telegram_conversation_contexts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    user_name TEXT,
    platform TEXT DEFAULT 'telegram',
    message_count INTEGER DEFAULT 0,
    first_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    summary TEXT,
    user_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - Optional for this use case but good practice
ALTER TABLE public.telegram_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_conversation_contexts ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (allowing all operations for now since this is for a bot)
CREATE POLICY "Allow all operations on telegram_conversations" ON public.telegram_conversations
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on telegram_conversation_contexts" ON public.telegram_conversation_contexts
    FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_telegram_conversations_chat_id 
    ON public.telegram_conversations(chat_id);

CREATE INDEX IF NOT EXISTS idx_telegram_conversations_timestamp 
    ON public.telegram_conversations(timestamp);

CREATE INDEX IF NOT EXISTS idx_telegram_conversations_chat_timestamp 
    ON public.telegram_conversations(chat_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_telegram_conversation_contexts_chat_id 
    ON public.telegram_conversation_contexts(chat_id);

CREATE INDEX IF NOT EXISTS idx_telegram_conversation_contexts_last_message 
    ON public.telegram_conversation_contexts(last_message_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_telegram_context_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for automatic updated_at updates
CREATE TRIGGER trigger_update_telegram_context_updated_at
    BEFORE UPDATE ON public.telegram_conversation_contexts
    FOR EACH ROW
    EXECUTE FUNCTION update_telegram_context_updated_at();

-- Create a view for conversation analytics
CREATE OR REPLACE VIEW public.telegram_conversation_analytics AS
SELECT 
    tcc.chat_id,
    tcc.user_name,
    tcc.message_count,
    tcc.first_message_at,
    tcc.last_message_at,
    COUNT(tc.id) as total_stored_messages,
    COUNT(CASE WHEN tc.sender = 'user' THEN 1 END) as user_messages,
    COUNT(CASE WHEN tc.sender = 'assistant' THEN 1 END) as assistant_messages,
    EXTRACT(EPOCH FROM (tcc.last_message_at - tcc.first_message_at))/3600 as conversation_duration_hours,
    CASE 
        WHEN tcc.last_message_at > NOW() - INTERVAL '1 hour' THEN 'active'
        WHEN tcc.last_message_at > NOW() - INTERVAL '24 hours' THEN 'recent'
        WHEN tcc.last_message_at > NOW() - INTERVAL '7 days' THEN 'inactive'
        ELSE 'dormant'
    END as conversation_status
FROM public.telegram_conversation_contexts tcc
LEFT JOIN public.telegram_conversations tc ON tcc.chat_id = tc.chat_id
GROUP BY tcc.chat_id, tcc.user_name, tcc.message_count, tcc.first_message_at, tcc.last_message_at;

-- Grant permissions for the view
GRANT SELECT ON public.telegram_conversation_analytics TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE public.telegram_conversations IS 'Stores individual messages from Telegram conversations for AI context and history';
COMMENT ON TABLE public.telegram_conversation_contexts IS 'Stores conversation metadata and context for intelligent responses';
COMMENT ON VIEW public.telegram_conversation_analytics IS 'Analytics view for conversation insights and user engagement patterns';

-- Sample data for testing (optional - remove in production)
-- INSERT INTO public.telegram_conversations (chat_id, sender, content) VALUES
-- ('test_chat_123', 'user', 'Hello, this is a test message'),
-- ('test_chat_123', 'assistant', 'Hello! How can I help you today?'),
-- ('test_chat_123', 'user', 'Can you tell me about your features?');

-- INSERT INTO public.telegram_conversation_contexts (chat_id, user_id, user_name, message_count) VALUES
-- ('test_chat_123', 'test_user_123', 'Test User', 2);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Telegram conversation schema created successfully!';
    RAISE NOTICE 'Tables: telegram_conversations, telegram_conversation_contexts';
    RAISE NOTICE 'Indexes: Optimized for chat_id and timestamp queries';
    RAISE NOTICE 'View: telegram_conversation_analytics for insights';
END $$; 