import { createClient } from '@supabase/supabase-js';

export interface ConversationMessage {
  id: string;
  chatId: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ConversationContext {
  chatId: string;
  userId: string;
  userName?: string;
  platform: string;
  messageCount: number;
  firstMessageAt: Date;
  lastMessageAt: Date;
  summary?: string;
  userPreferences?: Record<string, any>;
}

export class ConversationManager {
  private supabase;
  private conversationContexts = new Map<string, ConversationContext>();

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async storeMessage(message: ConversationMessage): Promise<void> {
    try {
      // Store in conversations table for persistent storage
      const { error } = await this.supabase
        .from('telegram_conversations')
        .upsert({
          chat_id: message.chatId,
          sender: message.sender,
          content: message.content,
          timestamp: message.timestamp.toISOString(),
          metadata: message.metadata || {}
        });

      if (error) {
        console.error('❌ Failed to store conversation message:', error);
      } else {
        console.log('✅ Message stored successfully:', message.id);
      }

      // Update conversation context
      await this.updateConversationContext(message.chatId, message.sender, message.content);
      
    } catch (error) {
      console.error('❌ Error storing conversation message:', error);
    }
  }

  async getConversationHistory(chatId: string, limit: number = 10): Promise<ConversationMessage[]> {
    try {
      const { data, error } = await this.supabase
        .from('telegram_conversations')
        .select('*')
        .eq('chat_id', chatId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Failed to retrieve conversation history:', error);
        return [];
      }

      return data.map(row => ({
        id: row.id,
        chatId: row.chat_id,
        sender: row.sender,
        content: row.content,
        timestamp: new Date(row.timestamp),
        metadata: row.metadata
      })).reverse(); // Return in chronological order

    } catch (error) {
      console.error('❌ Error retrieving conversation history:', error);
      return [];
    }
  }

  async getConversationContext(chatId: string): Promise<ConversationContext | null> {
    // Check in-memory cache first
    if (this.conversationContexts.has(chatId)) {
      return this.conversationContexts.get(chatId)!;
    }

    try {
      // Get context from database
      const { data, error } = await this.supabase
        .from('telegram_conversation_contexts')
        .select('*')
        .eq('chat_id', chatId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is OK
        console.error('❌ Failed to retrieve conversation context:', error);
        return null;
      }

      if (data) {
        const context: ConversationContext = {
          chatId: data.chat_id,
          userId: data.user_id,
          userName: data.user_name,
          platform: data.platform,
          messageCount: data.message_count,
          firstMessageAt: new Date(data.first_message_at),
          lastMessageAt: new Date(data.last_message_at),
          summary: data.summary,
          userPreferences: data.user_preferences || {}
        };

        this.conversationContexts.set(chatId, context);
        return context;
      }

      return null;
    } catch (error) {
      console.error('❌ Error retrieving conversation context:', error);
      return null;
    }
  }

  private async updateConversationContext(chatId: string, sender: string, content: string): Promise<void> {
    try {
      const now = new Date();
      let context = await this.getConversationContext(chatId);

      if (!context) {
        // Create new context
        context = {
          chatId,
          userId: chatId, // For Telegram, we use chatId as userId initially
          platform: 'telegram',
          messageCount: 0,
          firstMessageAt: now,
          lastMessageAt: now
        };
      }

      // Update context
      if (sender === 'user') {
        context.messageCount++;
      }
      context.lastMessageAt = now;

      // Update in database
      const { error } = await this.supabase
        .from('telegram_conversation_contexts')
        .upsert({
          chat_id: context.chatId,
          user_id: context.userId,
          user_name: context.userName,
          platform: context.platform,
          message_count: context.messageCount,
          first_message_at: context.firstMessageAt.toISOString(),
          last_message_at: context.lastMessageAt.toISOString(),
          summary: context.summary,
          user_preferences: context.userPreferences || {}
        });

      if (error) {
        console.error('❌ Failed to update conversation context:', error);
      }

      // Update cache
      this.conversationContexts.set(chatId, context);

    } catch (error) {
      console.error('❌ Error updating conversation context:', error);
    }
  }

  async generateConversationSummary(chatId: string): Promise<string | null> {
    try {
      const history = await this.getConversationHistory(chatId, 20);
      if (history.length === 0) return null;

      // Create a summary of the conversation
      const userMessages = history.filter(m => m.sender === 'user').map(m => m.content);
      const assistantMessages = history.filter(m => m.sender === 'assistant').map(m => m.content);

      const summary = `User has sent ${userMessages.length} messages, topics discussed: ${
        userMessages.slice(-5).join(', ').substring(0, 200)
      }...`;

      return summary;
    } catch (error) {
      console.error('❌ Error generating conversation summary:', error);
      return null;
    }
  }

  async clearConversationHistory(chatId: string): Promise<void> {
    try {
      await this.supabase
        .from('telegram_conversations')
        .delete()
        .eq('chat_id', chatId);

      await this.supabase
        .from('telegram_conversation_contexts')
        .delete()
        .eq('chat_id', chatId);

      this.conversationContexts.delete(chatId);
      
      console.log('✅ Conversation history cleared for:', chatId);
    } catch (error) {
      console.error('❌ Error clearing conversation history:', error);
    }
  }

  getStats(): Record<string, any> {
    return {
      activeConversations: this.conversationContexts.size,
      memoryUsage: `${this.conversationContexts.size} contexts in memory`
    };
  }
}

// Singleton instance
export const conversationManager = new ConversationManager(); 