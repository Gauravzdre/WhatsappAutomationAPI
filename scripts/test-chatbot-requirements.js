const fetch = require('node-fetch');

// Test data inspired by Hexabot's comprehensive feature set
const testRequirements = {
  // Basic Information
  name: 'ClientPing Demo Bot',
  description: 'An intelligent AI assistant for ClientPing platform demonstration',
  industry: 'Technology',
  businessType: 'SaaS Platform',
  
  // Multi-Channel Support (inspired by Hexabot)
  channels: ['telegram', 'whatsapp', 'website'],
  primaryChannel: 'telegram',
  
  // Multi-lingual Support (inspired by Hexabot)
  languages: ['English', 'Spanish'],
  defaultLanguage: 'English',
  
  // Use Cases & Functionality
  useCases: ['customer_support', 'lead_generation', 'sales_assistance'],
  customUseCases: ['Demo scheduling', 'Feature explanations'],
  
  // Knowledge Base (inspired by Hexabot's knowledge base)
  hasKnowledgeBase: true,
  businessData: {
    products: 'ClientPing - WhatsApp AI Automation Platform for businesses. Features include intelligent chatbots, multi-channel support, conversation analytics, and seamless integrations.',
    services: 'Chatbot creation, automation setup, analytics reporting, customer support, training and onboarding',
    policies: '24/7 customer support, 30-day free trial, flexible pricing plans, data privacy compliance, 99.9% uptime guarantee',
    faqs: 'Q: How to create a chatbot? A: Use our intuitive builder wizard. Q: What channels are supported? A: WhatsApp, Telegram, Facebook, Instagram, and website widgets. Q: Is there a free trial? A: Yes, 30 days free with full features.'
  },
  
  // User Segmentation (inspired by Hexabot's user labels)
  userSegments: [
    {
      name: 'Trial Users',
      criteria: 'Account age < 30 days',
      description: 'New users exploring the platform during trial period'
    },
    {
      name: 'Enterprise Clients',
      criteria: 'Team size > 50',
      description: 'Large organizations requiring advanced features and support'
    }
  ],
  
  // Conversation Flow (inspired by Hexabot's visual editor)
  conversationStyle: 'helpful',
  responseTime: 'fast',
  escalationRules: [
    'Complex technical issues',
    'Billing or payment problems',
    'Feature requests and feedback',
    'Integration support needed'
  ],
  
  // Integration Requirements (inspired by Hexabot's plugin system)
  integrations: ['crm', 'analytics', 'calendar'],
  customIntegrations: ['Slack notifications', 'Custom webhook for lead scoring'],
  
  // Analytics & Reporting (inspired by Hexabot's analytics dashboard)
  analyticsNeeds: [
    'Conversation volume and trends',
    'User satisfaction scores',
    'Response accuracy and effectiveness',
    'Conversion rates and sales metrics',
    'Popular topics and questions'
  ],
  reportingFrequency: 'daily',
  
  // Advanced Features (inspired by Hexabot's advanced capabilities)
  advancedFeatures: [
    'Quick reply buttons',
    'Rich media responses (carousels, cards)',
    'Typing indicators',
    'Sentiment analysis',
    'A/B testing for responses'
  ],
  customFeatures: [
    'Custom branding and white-label options',
    'Advanced conversation routing',
    'Integration with existing CRM workflows'
  ]
};

async function testChatbotRequirementsAPI() {
  console.log('🧪 Testing Chatbot Requirements API...\n');

  try {
    // Test 1: Create chatbot configuration
    console.log('📝 Test 1: Creating chatbot configuration...');
    const createResponse = await fetch('http://localhost:3000/api/chatbot/requirements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequirements),
    });

    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log('✅ Chatbot configuration created successfully!');
      console.log(`📋 Configuration ID: ${createResult.data.configurationId}`);
      console.log(`📊 Status: ${createResult.data.status}`);
      console.log('\n🤖 Generated System Prompt:');
      console.log('─'.repeat(60));
      console.log(createResult.data.generatedConfig.systemPrompt);
      console.log('─'.repeat(60));
      
      console.log('\n🔄 Conversation Flow:');
      createResult.data.generatedConfig.conversationFlow.forEach((flow, index) => {
        console.log(`${index + 1}. ${flow.name} (${flow.id})`);
        console.log(`   Trigger: ${flow.trigger}`);
        console.log(`   Steps: ${flow.steps.length} step(s)`);
      });
      
      console.log('\n📚 Knowledge Base Entries:');
      createResult.data.generatedConfig.knowledgeBase.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.title} (${entry.category})`);
        console.log(`   Tags: ${entry.tags.join(', ')}`);
      });
      
      console.log('\n🔗 Integration Settings:');
      Object.keys(createResult.data.generatedConfig.integrationSettings).forEach(integration => {
        const config = createResult.data.generatedConfig.integrationSettings[integration];
        console.log(`- ${integration}: ${config.enabled ? 'Enabled' : 'Disabled'} (${config.type})`);
      });
      
      console.log('\n📈 Analytics Configuration:');
      const analytics = createResult.data.generatedConfig.analyticsConfig;
      console.log(`- Tracking: ${analytics.trackingEnabled ? 'Enabled' : 'Disabled'}`);
      console.log(`- Metrics: ${analytics.metrics.length} tracked`);
      console.log(`- Frequency: ${analytics.reportingFrequency}`);
      
      console.log('\n🎯 Next Steps:');
      createResult.data.nextSteps.forEach((step, index) => {
        console.log(`${index + 1}. ${step}`);
      });

      // Test 2: Retrieve the created configuration
      console.log('\n📖 Test 2: Retrieving chatbot configuration...');
      const getResponse = await fetch(`http://localhost:3000/api/chatbot/requirements?id=${createResult.data.configurationId}`);
      const getResult = await getResponse.json();
      
      if (getResult.success) {
        console.log('✅ Configuration retrieved successfully!');
        console.log(`📋 Name: ${getResult.data.name}`);
        console.log(`🏭 Industry: ${getResult.data.industry}`);
        console.log(`📊 Status: ${getResult.data.status}`);
        console.log(`📅 Created: ${new Date(getResult.data.created_at).toLocaleString()}`);
      } else {
        console.log('❌ Failed to retrieve configuration:', getResult.error);
      }

      // Test 3: List all configurations
      console.log('\n📋 Test 3: Listing all chatbot configurations...');
      const listResponse = await fetch('http://localhost:3000/api/chatbot/requirements');
      const listResult = await listResponse.json();
      
      if (listResult.success) {
        console.log(`✅ Found ${listResult.data.length} configuration(s):`);
        listResult.data.forEach((config, index) => {
          console.log(`${index + 1}. ${config.name} (${config.industry}) - ${config.status}`);
        });
      } else {
        console.log('❌ Failed to list configurations:', listResult.error);
      }

    } else {
      console.log('❌ Failed to create chatbot configuration:', createResult.error);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure your Next.js server is running on http://localhost:3000');
    console.log('💡 And that the database schema has been applied');
  }
}

// Test validation scenarios
async function testValidationScenarios() {
  console.log('\n🔍 Testing validation scenarios...\n');

  // Test missing required fields
  console.log('📝 Test: Missing required fields...');
  try {
    const response = await fetch('http://localhost:3000/api/chatbot/requirements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '', // Missing name
        industry: '', // Missing industry
        primaryChannel: '' // Missing primary channel
      }),
    });

    const result = await response.json();
    if (!result.success) {
      console.log('✅ Validation working correctly:', result.error);
    } else {
      console.log('❌ Validation failed - should have rejected empty fields');
    }
  } catch (error) {
    console.log('❌ Validation test error:', error.message);
  }

  // Test minimal valid configuration
  console.log('\n📝 Test: Minimal valid configuration...');
  try {
    const minimalConfig = {
      name: 'Minimal Bot',
      industry: 'Other',
      primaryChannel: 'telegram',
      channels: ['telegram'],
      useCases: ['customer_support']
    };

    const response = await fetch('http://localhost:3000/api/chatbot/requirements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minimalConfig),
    });

    const result = await response.json();
    if (result.success) {
      console.log('✅ Minimal configuration accepted');
      console.log(`📋 Created: ${result.data.configurationId}`);
    } else {
      console.log('❌ Minimal configuration rejected:', result.error);
    }
  } catch (error) {
    console.log('❌ Minimal config test error:', error.message);
  }
}

// Run the tests
async function runAllTests() {
  console.log('🚀 Starting Chatbot Requirements API Tests');
  console.log('=' .repeat(80));
  console.log('Inspired by Hexabot\'s comprehensive chatbot framework');
  console.log('Testing multi-channel, multi-lingual, knowledge-based chatbot creation');
  console.log('=' .repeat(80));

  await testChatbotRequirementsAPI();
  await testValidationScenarios();

  console.log('\n🎉 All tests completed!');
  console.log('\n💡 Next steps:');
  console.log('1. Review the generated configurations');
  console.log('2. Test the chatbot builder UI at http://localhost:3000/chatbot-builder');
  console.log('3. Implement visual flow builder (inspired by Hexabot)');
  console.log('4. Add multi-language support');
  console.log('5. Create integration marketplace');
}

// Handle command line execution
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testChatbotRequirementsAPI,
  testValidationScenarios,
  testRequirements
}; 