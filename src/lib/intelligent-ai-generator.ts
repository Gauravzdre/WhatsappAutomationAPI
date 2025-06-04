import OpenAI from 'openai';
import { conversationManager, ConversationMessage } from './conversation-manager';

export interface IntelligentAIRequest {
  userMessage: string;
  chatId: string;
  userName?: string;
  platform?: string;
}

export interface IntelligentAIResponse {
  content: string;
  confidence: number;
  hasContext: boolean;
  conversationLength: number;
  metadata: {
    model: string;
    tokensUsed?: number;
    responseTime: number;
    contextUsed: boolean;
  };
}

export class IntelligentAIGenerator {
  private openai: OpenAI;
  private isInitialized: boolean = false;

  constructor() {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async initialize(): Promise<void> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not found');
      }

      // Test the connection
      await this.openai.models.list();
      this.isInitialized = true;
      console.log('✅ Intelligent AI Generator initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Intelligent AI Generator:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  async generateIntelligentResponse(request: IntelligentAIRequest): Promise<IntelligentAIResponse> {
    const startTime = Date.now();

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Store the user's message
      const userMessage: ConversationMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        chatId: request.chatId,
        sender: 'user',
        content: request.userMessage,
        timestamp: new Date(),
        metadata: { platform: request.platform || 'telegram' }
      };

      await conversationManager.storeMessage(userMessage);

      // Get conversation history for context
      const conversationHistory = await conversationManager.getConversationHistory(request.chatId, 10);
      const conversationContext = await conversationManager.getConversationContext(request.chatId);

      // Build conversation messages for OpenAI
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: this.getSystemPrompt(request.userName, conversationContext)
        }
      ];

      // Add conversation history
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });

      // Add current message if not already in history
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      if (!lastMessage || lastMessage.content !== request.userMessage) {
        messages.push({
          role: 'user',
          content: request.userMessage
        });
      }

      console.log(`🤖 Generating AI response with ${conversationHistory.length} context messages...`);

      // Generate response using OpenAI
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Fast and cost-effective
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const aiResponse = completion.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response from OpenAI');
      }

      // Store the AI's response
      const assistantMessage: ConversationMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        chatId: request.chatId,
        sender: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        metadata: { 
          platform: request.platform || 'telegram',
          model: 'gpt-4o-mini',
          tokensUsed: completion.usage?.total_tokens
        }
      };

      await conversationManager.storeMessage(assistantMessage);

      const responseTime = Date.now() - startTime;

      return {
        content: aiResponse,
        confidence: 0.9, // High confidence for real AI
        hasContext: conversationHistory.length > 0,
        conversationLength: conversationHistory.length + 1,
        metadata: {
          model: 'gpt-4o-mini',
          tokensUsed: completion.usage?.total_tokens,
          responseTime,
          contextUsed: conversationHistory.length > 0
        }
      };

    } catch (error) {
      console.error('❌ AI generation failed:', error);
      
      // Fallback to simple response if AI fails
      const fallbackResponse = this.getFallbackResponse(request);
      const responseTime = Date.now() - startTime;

      return {
        content: fallbackResponse,
        confidence: 0.3,
        hasContext: false,
        conversationLength: 0,
        metadata: {
          model: 'fallback',
          responseTime,
          contextUsed: false
        }
      };
    }
  }

  private getSystemPrompt(userName?: string, context?: any): string {
    const userGreeting = userName ? `The user's name is ${userName}. ` : '';
    const contextInfo = context ? `This conversation started ${context.firstMessageAt ? new Date(context.firstMessageAt).toLocaleDateString() : 'recently'} and has ${context.messageCount || 0} user messages. ` : '';

    return `You are ClientPing AI Assistant, an intelligent business automation specialist. You help businesses with WhatsApp automation, content generation, and growth strategies.

${userGreeting}${contextInfo}

Key traits:
- Professional yet friendly and approachable
- Knowledgeable about business automation, marketing, and AI
- Helpful and solution-oriented
- Remember previous conversation context
- Ask follow-up questions to understand user needs better
- Provide specific, actionable advice

Your capabilities include:
✅ WhatsApp & Telegram automation
✅ AI-powered content generation
✅ Smart scheduling and campaign management
✅ Analytics and performance insights
✅ Team collaboration tools
✅ Template libraries and workflows

When users ask about:
- Features: Explain specific capabilities with examples
- Pricing: Mention you're in beta (free access while gathering feedback)
- Setup: Offer to guide them through getting started
- Problems: Ask clarifying questions and provide solutions
- Integration: Explain how different platforms work together

Always be conversational, remember what was discussed before, and provide value in every response. If the user seems interested in a specific feature, dive deeper and offer to show them how it works.`;
  }

  private getFallbackResponse(request: IntelligentAIRequest): string {
    const userMessage = request.userMessage.toLowerCase();
    const name = request.userName ? ` ${request.userName}` : '';

    if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('hey')) {
      return `👋 Hello${name}! I'm ClientPing AI Assistant. I'm here to help you with business automation and messaging. How can I assist you today?`;
    } else if (userMessage.includes('help') || userMessage.includes('support')) {
      return `🤝 I'm here to help${name}! I can assist you with:
• WhatsApp & Telegram automation
• AI content generation  
• Smart scheduling
• Analytics and insights
• Team collaboration

What specific area interests you most?`;
    } else if (userMessage.includes('feature') || userMessage.includes('what can') || userMessage.includes('capabilities')) {
      return `🚀 ClientPing offers powerful automation features${name}:

✅ Multi-platform messaging (Telegram, WhatsApp)
✅ AI-powered content generation
✅ Smart scheduling and automation
✅ Analytics and performance insights  
✅ Team collaboration tools
✅ Template libraries

Which feature would you like to explore?`;
    } else {
      return `🤖 Thanks for your message${name}! I'm ClientPing AI Assistant, and I'm designed to help with business automation and messaging.

I can help you with automation strategies, content creation, or answer questions about our platform. What specific assistance do you need?`;
    }
  }

  isReady(): boolean {
    return this.isInitialized && !!process.env.OPENAI_API_KEY;
  }

  getStatus(): Record<string, any> {
    return {
      initialized: this.isInitialized,
      hasApiKey: !!process.env.OPENAI_API_KEY,
      model: 'gpt-4o-mini',
      capabilities: [
        'contextual_conversations',
        'conversation_memory',
        'intelligent_responses',
        'business_automation_expertise',
        'real_ai_processing'
      ],
      conversationStats: conversationManager.getStats()
    };
  }
}

// Singleton instance
export const intelligentAI = new IntelligentAIGenerator(); 