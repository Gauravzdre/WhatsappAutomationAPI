import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ChatbotRequirements {
  // Basic Information
  name: string;
  description: string;
  industry: string;
  businessType: string;
  
  // Channels & Platforms (inspired by Hexabot's multi-channel support)
  channels: string[];
  primaryChannel: string;
  
  // Languages & Localization (inspired by Hexabot's multi-lingual support)
  languages: string[];
  defaultLanguage: string;
  
  // Use Cases & Functionality
  useCases: string[];
  customUseCases: string[];
  
  // Knowledge Base (inspired by Hexabot's knowledge base integration)
  hasKnowledgeBase: boolean;
  businessData: {
    products: string;
    services: string;
    policies: string;
    faqs: string;
  };
  
  // User Segmentation (inspired by Hexabot's user labels & segmentation)
  userSegments: Array<{
    name: string;
    criteria: string;
    description: string;
  }>;
  
  // Conversation Flow (inspired by Hexabot's visual editor)
  conversationStyle: string;
  responseTime: string;
  escalationRules: string[];
  
  // Integration Requirements
  integrations: string[];
  customIntegrations: string[];
  
  // Analytics & Reporting (inspired by Hexabot's analytics dashboard)
  analyticsNeeds: string[];
  reportingFrequency: string;
  
  // Advanced Features (inspired by Hexabot's plugin system)
  advancedFeatures: string[];
  customFeatures: string[];
}

interface ChatbotConfiguration {
  id: string;
  name: string;
  description: string;
  industry: string;
  status: 'draft' | 'configuring' | 'training' | 'ready' | 'deployed';
  requirements: ChatbotRequirements;
  generatedConfig: {
    systemPrompt: string;
    conversationFlow: any[];
    knowledgeBase: any[];
    integrationSettings: any;
    analyticsConfig: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(request: NextRequest) {
  try {
    const requirements: ChatbotRequirements = await request.json();

    // Validate required fields
    if (!requirements.name || !requirements.industry || !requirements.primaryChannel) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, industry, and primaryChannel are required'
      }, { status: 400 });
    }

    console.log('🤖 Processing chatbot requirements:', {
      name: requirements.name,
      industry: requirements.industry,
      channels: requirements.channels,
      useCases: requirements.useCases
    });

    // Generate intelligent chatbot configuration based on requirements
    const generatedConfig = await generateChatbotConfiguration(requirements);

    // Save to database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const chatbotConfig = {
      name: requirements.name,
      description: requirements.description,
      industry: requirements.industry,
      status: 'configuring',
      requirements,
      generated_config: generatedConfig  // Use snake_case for database
    };

    const { data, error } = await supabase
      .from('chatbot_configurations')
      .insert([chatbotConfig])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to save chatbot configuration. Please ensure the database tables are created.'
      }, { status: 500 });
    }

    console.log('✅ Chatbot configuration saved:', data.id);

    return NextResponse.json({
      success: true,
      data: {
        configurationId: data.id,
        status: data.status,
        generatedConfig: data.generated_config,  // Convert back to camelCase for frontend
        nextSteps: [
          'Review generated configuration',
          'Customize conversation flows',
          'Train knowledge base',
          'Test chatbot responses',
          'Deploy to selected channels'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Error processing chatbot requirements:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('id');

    if (!configId) {
      // Return list of all configurations
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data, error } = await supabase
        .from('chatbot_configurations')
        .select('id, name, description, industry, status, generated_config, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        data: data || []
      });
    }

    // Return specific configuration
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('chatbot_configurations')
      .select('*')
      .eq('id', configId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('❌ Error fetching chatbot configuration:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch configuration'
    }, { status: 500 });
  }
}

async function generateChatbotConfiguration(requirements: ChatbotRequirements) {
  console.log('🧠 Generating intelligent chatbot configuration...');

  // Generate system prompt based on requirements (inspired by Hexabot's LLM integration)
  const systemPrompt = generateSystemPrompt(requirements);
  console.log('📝 Generated system prompt length:', systemPrompt.length, 'characters');
  console.log('📝 System prompt preview:', systemPrompt.substring(0, 200) + '...');

  // Generate conversation flow (inspired by Hexabot's visual editor)
  const conversationFlow = generateConversationFlow(requirements);

  // Generate knowledge base entries (inspired by Hexabot's knowledge base)
  const knowledgeBase = generateKnowledgeBase(requirements);

  // Generate integration settings (inspired by Hexabot's plugin system)
  const integrationSettings = generateIntegrationSettings(requirements);

  // Generate analytics configuration (inspired by Hexabot's analytics dashboard)
  const analyticsConfig = generateAnalyticsConfig(requirements);

  return {
    systemPrompt,
    conversationFlow,
    knowledgeBase,
    integrationSettings,
    analyticsConfig
  };
}

function generateSystemPrompt(requirements: ChatbotRequirements): string {
  const { name, industry, businessType, conversationStyle, useCases } = requirements;

  // Start with a strong base prompt
  let prompt = `You are ${name}, an intelligent AI assistant specializing in the ${industry} industry.\n\n`;

  // Add business context
  if (businessType && businessType.trim()) {
    prompt += `Business Context: You work for a ${businessType} business in the ${industry} sector.\n\n`;
  } else {
    prompt += `Business Context: You work in the ${industry} industry and are knowledgeable about this sector.\n\n`;
  }

  // Add conversation style with intelligent defaults
  const defaultStyle = 'professional and helpful';
  const actualStyle = conversationStyle && conversationStyle.trim() ? conversationStyle : defaultStyle;
  
  const styleMap = {
    'professional': 'Maintain a professional and formal tone in all interactions.',
    'friendly': 'Be friendly, warm, and approachable in your communication.',
    'helpful': 'Focus on being helpful and supportive to users.',
    'enthusiastic': 'Show enthusiasm and energy in your responses.',
    'concise': 'Keep responses concise and direct while being helpful.',
    'professional and helpful': 'Maintain a professional yet approachable tone, always focusing on being helpful and supportive.'
  };
  
  prompt += `Communication Style: ${styleMap[actualStyle as keyof typeof styleMap] || `Be ${actualStyle} in your communication style.`}\n\n`;

  // Add use cases with intelligent defaults based on industry
  if (useCases.length > 0) {
    prompt += `Your primary responsibilities include:\n`;
    const useCaseDescriptions = {
      'customer_support': '- Provide excellent customer support and answer questions promptly',
      'lead_generation': '- Generate and qualify leads for the business',
      'sales_assistance': '- Assist with sales inquiries and product recommendations',
      'appointment_booking': '- Help users schedule appointments and reservations',
      'order_tracking': '- Provide order status and tracking information',
      'product_catalog': '- Help users browse and learn about products/services',
      'feedback_collection': '- Collect user feedback and reviews professionally',
      'onboarding': '- Guide new users through onboarding processes',
      'notifications': '- Send relevant updates and notifications',
      'content_delivery': '- Share helpful content and resources'
    };

    useCases.forEach(useCase => {
      if (useCaseDescriptions[useCase as keyof typeof useCaseDescriptions]) {
        prompt += useCaseDescriptions[useCase as keyof typeof useCaseDescriptions] + '\n';
      }
    });
    prompt += '\n';
  } else {
    // Provide intelligent defaults based on industry
    prompt += `Your primary responsibilities include:\n`;
    const industryDefaults = {
      'E-commerce': ['- Help customers find products and make purchases', '- Provide order support and tracking information', '- Answer product questions and specifications'],
      'Healthcare': ['- Provide general health information and appointment scheduling', '- Answer questions about services and procedures', '- Connect patients with appropriate care providers'],
      'Education': ['- Help students with course information and enrollment', '- Provide academic support and resources', '- Answer questions about programs and requirements'],
      'Finance': ['- Assist with account inquiries and financial services', '- Provide information about products and rates', '- Help with application processes'],
      'Real Estate': ['- Help clients find properties and schedule viewings', '- Provide market information and property details', '- Connect clients with agents and services'],
      'Restaurant': ['- Help customers with menu information and reservations', '- Provide location and hours information', '- Assist with orders and special requests'],
      'Technology': ['- Provide technical support and product information', '- Help with troubleshooting and setup', '- Answer questions about features and compatibility'],
      'Marketing': ['- Provide information about marketing services and strategies', '- Help with campaign planning and execution', '- Connect clients with appropriate specialists'],
      'Consulting': ['- Provide information about consulting services', '- Help schedule consultations and meetings', '- Answer questions about expertise and approach']
    };

    const defaults = industryDefaults[industry as keyof typeof industryDefaults] || [
      '- Provide excellent customer service and support',
      '- Answer questions about products and services',
      '- Help users find the information they need'
    ];

    defaults.forEach(item => prompt += item + '\n');
    prompt += '\n';
  }

  // Add industry-specific expertise
  prompt += `Industry Expertise:\n`;
  const industryExpertise = {
    'E-commerce': 'You understand online shopping, product catalogs, shipping, returns, and customer service best practices.',
    'Healthcare': 'You understand medical terminology, patient care, appointment scheduling, and healthcare regulations.',
    'Education': 'You understand academic programs, enrollment processes, student services, and educational resources.',
    'Finance': 'You understand financial products, banking services, investment options, and regulatory compliance.',
    'Real Estate': 'You understand property markets, buying/selling processes, financing, and real estate terminology.',
    'Restaurant': 'You understand food service, menu items, dietary restrictions, reservations, and hospitality.',
    'Technology': 'You understand software, hardware, technical specifications, and troubleshooting procedures.',
    'Marketing': 'You understand marketing strategies, digital campaigns, analytics, and brand management.',
    'Consulting': 'You understand business analysis, strategic planning, and professional advisory services.'
  };

  prompt += industryExpertise[industry as keyof typeof industryExpertise] || `You have deep knowledge of the ${industry} industry and its best practices.`;
  prompt += '\n\n';

  // Add escalation rules with intelligent defaults
  if (requirements.escalationRules.length > 0) {
    prompt += `Escalation Guidelines:\n`;
    prompt += `When encountering the following situations, offer to connect the user with a human agent:\n`;
    requirements.escalationRules.forEach(rule => {
      prompt += `- ${rule}\n`;
    });
    prompt += '\n';
  } else {
    prompt += `Escalation Guidelines:\n`;
    prompt += `When encountering the following situations, offer to connect the user with a human agent:\n`;
    prompt += `- Complex technical issues that require specialized expertise\n`;
    prompt += `- Billing or payment disputes\n`;
    prompt += `- Complaints or sensitive customer service issues\n`;
    prompt += `- Requests for information you don't have access to\n`;
    prompt += `- When the user specifically asks to speak with a human\n\n`;
  }

  // Add core behavioral guidelines
  prompt += `Core Guidelines:\n`;
  prompt += `- Always be helpful, accurate, and aligned with business goals\n`;
  prompt += `- If you're unsure about something, admit you don't know and offer alternatives\n`;
  prompt += `- Keep responses conversational but informative\n`;
  prompt += `- Ask follow-up questions to better understand user needs\n`;
  prompt += `- Provide specific, actionable information when possible\n`;
  prompt += `- Maintain a positive and solution-oriented approach\n`;
  prompt += `- Remember context from the conversation to provide personalized responses\n\n`;

  // Add closing statement
  prompt += `Your goal is to provide exceptional service that reflects positively on the business while genuinely helping users achieve their objectives.`;

  return prompt;
}

function generateConversationFlow(requirements: ChatbotRequirements) {
  // Generate basic conversation flow structure inspired by Hexabot's visual editor
  const flows = [];

  // Welcome flow
  flows.push({
    id: 'welcome',
    name: 'Welcome Message',
    trigger: 'conversation_start',
    steps: [
      {
        type: 'message',
        content: `Hello! I'm ${requirements.name}, your AI assistant. How can I help you today?`
      },
      {
        type: 'quick_replies',
        options: requirements.useCases.slice(0, 3).map(useCase => ({
          title: useCase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          payload: useCase
        }))
      }
    ]
  });

  // Use case specific flows
  requirements.useCases.forEach(useCase => {
    flows.push({
      id: useCase,
      name: useCase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      trigger: useCase,
      steps: [
        {
          type: 'message',
          content: `I'd be happy to help you with ${useCase.replace('_', ' ')}. Let me gather some information...`
        }
      ]
    });
  });

  return flows;
}

function generateKnowledgeBase(requirements: ChatbotRequirements) {
  const knowledgeBase = [];

  if (requirements.hasKnowledgeBase) {
    const { businessData } = requirements;

    if (businessData.products) {
      knowledgeBase.push({
        category: 'products',
        title: 'Product Information',
        content: businessData.products,
        tags: ['products', 'catalog', 'inventory']
      });
    }

    if (businessData.services) {
      knowledgeBase.push({
        category: 'services',
        title: 'Service Information',
        content: businessData.services,
        tags: ['services', 'offerings']
      });
    }

    if (businessData.policies) {
      knowledgeBase.push({
        category: 'policies',
        title: 'Business Policies',
        content: businessData.policies,
        tags: ['policies', 'terms', 'conditions']
      });
    }

    if (businessData.faqs) {
      knowledgeBase.push({
        category: 'faqs',
        title: 'Frequently Asked Questions',
        content: businessData.faqs,
        tags: ['faq', 'questions', 'answers']
      });
    }
  }

  return knowledgeBase;
}

function generateIntegrationSettings(requirements: ChatbotRequirements) {
  const integrations: Record<string, any> = {};

  requirements.integrations.forEach(integration => {
    switch (integration) {
      case 'crm':
        integrations['crm'] = {
          enabled: true,
          type: 'webhook',
          events: ['lead_captured', 'contact_updated']
        };
        break;
      case 'calendar':
        integrations['calendar'] = {
          enabled: true,
          type: 'api',
          features: ['booking', 'availability_check']
        };
        break;
      case 'analytics':
        integrations['analytics'] = {
          enabled: true,
          type: 'tracking',
          events: ['conversation_started', 'goal_completed']
        };
        break;
    }
  });

  return integrations;
}

function generateAnalyticsConfig(requirements: ChatbotRequirements) {
  return {
    trackingEnabled: requirements.analyticsNeeds.length > 0,
    metrics: requirements.analyticsNeeds,
    reportingFrequency: requirements.reportingFrequency,
    dashboards: [
      'conversation_volume',
      'user_satisfaction',
      'response_accuracy',
      'conversion_rates'
    ]
  };
} 