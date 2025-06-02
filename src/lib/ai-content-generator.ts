import { getJulepService } from './julep-client';

export interface BrandVoice {
  tone: 'professional' | 'friendly' | 'casual' | 'authoritative' | 'playful';
  personality: string[];
  values: string[];
  doNotUse: string[];
  preferredLanguage: string;
}

export interface ContentGenerationRequest {
  userMessage: string;
  chatId: string;
  userContext?: {
    name?: string;
    previousMessages?: string[];
    preferences?: Record<string, any>;
  };
  brandContext?: {
    name: string;
    industry: string;
    voice: BrandVoice;
  };
  responseType?: 'conversational' | 'informational' | 'sales' | 'support';
}

export interface ContentGenerationResponse {
  content: string;
  confidence: number;
  metadata: {
    responseType: string;
    brandAlignment: number;
    generatedAt: string;
    model: string;
  };
}

class AIContentGenerator {
  private julepService: any;
  private defaultBrandAgent: any;
  private isInitialized: boolean = false;

  constructor() {
    // Initialize with environment variables
    const apiKey = process.env.JULEP_API_KEY || 'mock-key-for-development';
    this.julepService = getJulepService();
  }

  async initialize(): Promise<void> {
    try {
      await this.julepService.initialize();
      
      // Create a default brand agent for the platform
      this.defaultBrandAgent = await this.julepService.createBrandPersonaAgent({
        name: 'ClientPing AI Assistant',
        industry: 'Business Automation',
        voice: {
          tone: 'friendly',
          personality: ['helpful', 'professional', 'knowledgeable', 'responsive'],
          values: ['efficiency', 'customer success', 'innovation', 'reliability'],
          doNotUse: ['jargon', 'overly technical terms', 'pushy sales language'],
          preferredLanguage: 'English'
        },
        guidelines: `
          You are ClientPing AI Assistant, a helpful business automation platform assistant.
          
          Core Guidelines:
          - Always be helpful, friendly, and professional
          - Provide clear, actionable responses
          - Ask clarifying questions when needed
          - Offer relevant suggestions for business automation
          - Keep responses concise but informative
          - Use emojis sparingly but effectively
          - Never make promises about features that don't exist
          - Always maintain a positive, solution-oriented tone
          
          Capabilities you can mention:
          - Message automation and scheduling
          - AI-powered content generation
          - Multi-platform messaging (Telegram, WhatsApp coming soon)
          - Analytics and insights
          - Team collaboration features
          - Template libraries
          
          When users ask about:
          - Pricing: Mention we're in beta and gathering feedback
          - Features: Focus on current capabilities and roadmap
          - Support: Offer to help with specific questions
          - Integration: Explain our platform-agnostic approach
        `
      });

      this.isInitialized = true;
      console.log('✅ AI Content Generator initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AI Content Generator:', error);
      // Don't throw error - fall back to simple responses
      this.isInitialized = false;
    }
  }

  async generateResponse(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    try {
      // If not initialized, provide a fallback response
      if (!this.isInitialized) {
        return this.getFallbackResponse(request);
      }

      // Create a session for this conversation
      const session = await this.julepService.createSession({
        agent_id: this.defaultBrandAgent.id,
        context: {
          user_message: request.userMessage,
          chat_id: request.chatId,
          user_context: request.userContext,
          brand_context: request.brandContext,
          response_type: request.responseType || 'conversational'
        }
      });

      // Generate AI response
      const aiResponse = await this.julepService.sessions.chat({
        session_id: session.id,
        message: request.userMessage,
        context: {
          previous_messages: request.userContext?.previousMessages || [],
          user_preferences: request.userContext?.preferences || {},
          response_requirements: {
            max_length: 500,
            include_emojis: true,
            tone: request.brandContext?.voice?.tone || 'friendly',
            call_to_action: request.responseType === 'sales'
          }
        }
      });

      return {
        content: aiResponse.content,
        confidence: 0.85, // Mock confidence score
        metadata: {
          responseType: request.responseType || 'conversational',
          brandAlignment: 0.9, // Mock brand alignment score
          generatedAt: new Date().toISOString(),
          model: 'julep-gpt-4'
        }
      };

    } catch (error) {
      console.error('❌ AI content generation failed:', error);
      return this.getFallbackResponse(request);
    }
  }

  private getFallbackResponse(request: ContentGenerationRequest): ContentGenerationResponse {
    // Intelligent fallback responses based on message content
    const userMessage = request.userMessage.toLowerCase();
    let response = '';

    if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('hey')) {
      response = `👋 Hello! I'm ClientPing AI Assistant. I'm here to help you with business automation and messaging. How can I assist you today?`;
    } else if (userMessage.includes('help') || userMessage.includes('support')) {
      response = `🤝 I'm here to help! I can assist you with:
• Message automation and scheduling
• AI content generation
• Platform integrations
• Analytics and insights

What specific area would you like help with?`;
    } else if (userMessage.includes('price') || userMessage.includes('cost') || userMessage.includes('plan')) {
      response = `💰 We're currently in beta and gathering user feedback! This means you can explore our features at no cost while we perfect the platform. 

Would you like to learn more about our automation capabilities?`;
    } else if (userMessage.includes('feature') || userMessage.includes('what can') || userMessage.includes('capabilities')) {
      response = `🚀 ClientPing offers powerful automation features:

✅ Multi-platform messaging (Telegram, WhatsApp coming soon)
✅ AI-powered content generation
✅ Smart scheduling and automation
✅ Analytics and performance insights
✅ Team collaboration tools
✅ Template libraries

Which feature interests you most?`;
    } else if (userMessage.includes('whatsapp')) {
      response = `📱 WhatsApp integration is coming soon! We're currently perfecting our platform with Telegram, then we'll add WhatsApp Business API support.

In the meantime, you can experience all our automation features through Telegram. Would you like a demo?`;
    } else if (userMessage.includes('telegram')) {
      response = `📱 Great! You're already using our Telegram integration. This bot demonstrates our AI capabilities and platform features.

You can test automation, content generation, and see how our platform works. What would you like to try?`;
    } else {
      // Generic intelligent response
      response = `🤖 Thanks for your message! I'm ClientPing AI Assistant, and I'm designed to help with business automation and messaging.

I noticed you mentioned: "${request.userMessage}"

I can help you with automation strategies, content creation, or answer questions about our platform. What specific assistance do you need?`;
    }

    return {
      content: response,
      confidence: 0.7,
      metadata: {
        responseType: 'fallback',
        brandAlignment: 0.8,
        generatedAt: new Date().toISOString(),
        model: 'fallback-rules'
      }
    };
  }

  async generateBrandedContent(
    prompt: string, 
    brandVoice: BrandVoice, 
    contentType: 'message' | 'email' | 'social' = 'message'
  ): Promise<string> {
    try {
      if (!this.isInitialized) {
        return `Generated content for: ${prompt}`;
      }

      // Create a content generation task
      const task = await this.julepService.createTask(this.defaultBrandAgent.id, {
        name: 'brand-content-generation',
        description: 'Generate branded content based on prompt and brand voice',
        main: [
          {
            prompt: `Generate ${contentType} content for: ${prompt}`,
            brand_voice: brandVoice,
            requirements: {
              tone: brandVoice.tone,
              personality: brandVoice.personality,
              values: brandVoice.values,
              avoid: brandVoice.doNotUse,
              language: brandVoice.preferredLanguage
            }
          }
        ]
      });

      // Execute the task (mock for now)
      return `🎯 Branded ${contentType} content: ${prompt}`;

    } catch (error) {
      console.error('❌ Branded content generation failed:', error);
      return `Generated content for: ${prompt}`;
    }
  }

  async analyzeMessageSentiment(message: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotions: string[];
  }> {
    // Simple sentiment analysis (would be replaced with actual AI analysis)
    const positiveWords = ['good', 'great', 'awesome', 'love', 'excellent', 'amazing', 'perfect', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointed', 'frustrated'];
    
    const words = message.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let confidence = 0.5;
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = Math.min(0.9, 0.5 + (positiveCount * 0.1));
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = Math.min(0.9, 0.5 + (negativeCount * 0.1));
    }
    
    return {
      sentiment,
      confidence,
      emotions: sentiment === 'positive' ? ['happy', 'satisfied'] : 
               sentiment === 'negative' ? ['frustrated', 'disappointed'] : 
               ['neutral']
    };
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  getStatus(): Record<string, any> {
    return {
      initialized: this.isInitialized,
      defaultAgent: this.defaultBrandAgent?.id || null,
      capabilities: [
        'conversational_responses',
        'branded_content_generation',
        'sentiment_analysis',
        'fallback_responses'
      ]
    };
  }
}

// Singleton instance
export const aiContentGenerator = new AIContentGenerator(); 