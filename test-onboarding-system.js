const https = require('https');

async function testOnboardingSystem() {
  console.log('🚀 Testing User Onboarding System\n');
  
  // Test 1: Check onboarding API status
  console.log('=== Test 1: Onboarding API Status ===');
  const statusResult = await makeRequest('GET', '/api/onboarding/complete');
  console.log('🔧 Onboarding API:', statusResult ? 'Working' : 'Failed');
  if (statusResult?.data) {
    console.log('📋 API Response:', JSON.stringify(statusResult.data, null, 2));
  }

  // Test 2: Get onboarding requirements
  console.log('\n=== Test 2: Onboarding Requirements ===');
  const requirementsResult = await makeRequest('GET', '/api/onboarding/complete?action=requirements');
  if (requirementsResult?.data?.requirements) {
    console.log('📝 Onboarding Requirements:');
    requirementsResult.data.requirements.forEach((req, index) => {
      console.log(`  ${index + 1}. ${req.title}: ${req.description} ${req.required ? '(Required)' : '(Optional)'}`);
    });
  }

  // Test 3: Get current onboarding status
  console.log('\n=== Test 3: Current Onboarding Status ===');
  const onboardingStatusResult = await makeRequest('GET', '/api/onboarding/complete?action=status');
  if (onboardingStatusResult?.data) {
    console.log('📊 Current Status:');
    console.log(`  • AI Ready: ${onboardingStatusResult.data.aiReady}`);
    console.log(`  • Contact Count: ${onboardingStatusResult.data.contactCount}`);
    console.log(`  • Analytics Enabled: ${onboardingStatusResult.data.analyticsEnabled}`);
    if (onboardingStatusResult.data.automationFlows) {
      console.log(`  • Automation Flows: ${onboardingStatusResult.data.automationFlows.length || 0}`);
    }
  }

  // Test 4: Test Telegram bot validation
  console.log('\n=== Test 4: Telegram Bot Validation ===');
  
  // Test with invalid token format
  const invalidTokenResult = await makeRequest('POST', '/api/telegram/validate', {
    token: 'invalid-token-format'
  });
  console.log('❌ Invalid Token Test:', invalidTokenResult?.success === false ? 'Passed' : 'Failed');

  // Test with empty token
  const emptyTokenResult = await makeRequest('POST', '/api/telegram/validate', {
    token: ''
  });
  console.log('❌ Empty Token Test:', emptyTokenResult?.success === false ? 'Passed' : 'Failed');

  // Test with properly formatted but fake token
  const fakeTokenResult = await makeRequest('POST', '/api/telegram/validate', {
    token: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz123456789'
  });
  console.log('❌ Fake Token Test:', fakeTokenResult?.success === false ? 'Passed' : 'Failed');

  // Test 5: Test automation testing endpoint
  console.log('\n=== Test 5: Automation Testing ===');
  const automationTestResult = await makeRequest('POST', '/api/automation/test', {
    platform: 'telegram',
    automationType: 'welcome',
    message: 'Welcome to our platform! This is a test automation message.'
  });
  console.log('🤖 Automation Test:', automationTestResult?.success ? 'Passed' : 'Failed');
  if (automationTestResult?.data) {
    console.log('📤 Test Details:', {
      platform: automationTestResult.data.platform,
      type: automationTestResult.data.automationType,
      testChatId: automationTestResult.data.testChatId
    });
  }

  // Test 6: Complete onboarding flow simulation
  console.log('\n=== Test 6: Complete Onboarding Simulation ===');
  const onboardingData = {
    platform: 'telegram',
    telegramBotToken: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz123456789', // Fake token for testing
    brandName: 'Test Company',
    brandDescription: 'A test company for demonstrating the onboarding process. We provide excellent customer service and innovative solutions.',
    brandTone: 'friendly',
    brandIndustry: 'Technology',
    automationType: 'welcome',
    automationMessage: 'Hi! Welcome to Test Company! 👋\n\nWe\'re excited to have you here. How can we help you today?'
  };

  const completeOnboardingResult = await makeRequest('POST', '/api/onboarding/complete', onboardingData);
  console.log('🎯 Onboarding Completion:', completeOnboardingResult?.success ? 'Passed' : 'Failed');
  
  if (completeOnboardingResult?.data) {
    console.log('✅ Onboarding Results:');
    console.log(`  • Message: ${completeOnboardingResult.data.message}`);
    if (completeOnboardingResult.data.configuration) {
      const config = completeOnboardingResult.data.configuration;
      console.log(`  • Platform: ${config.platform}`);
      console.log(`  • Brand: ${config.brandName} (${config.brandTone} tone)`);
      console.log(`  • Industry: ${config.brandIndustry}`);
      console.log(`  • Automation Type: ${config.automationType}`);
      console.log(`  • Setup Completed: ${config.setupCompletedAt}`);
    }
    if (completeOnboardingResult.data.nextSteps) {
      console.log('📋 Next Steps:');
      completeOnboardingResult.data.nextSteps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step}`);
      });
    }
  }

  // Test 7: Test validation errors
  console.log('\n=== Test 7: Validation Error Testing ===');
  
  // Test missing required fields
  const incompleteDataResult = await makeRequest('POST', '/api/onboarding/complete', {
    platform: 'telegram'
    // Missing other required fields
  });
  console.log('❌ Incomplete Data Test:', incompleteDataResult?.success === false ? 'Passed' : 'Failed');
  if (incompleteDataResult?.error) {
    console.log(`  • Error: ${incompleteDataResult.error}`);
  }

  // Test platform-specific validation
  const missingTokenResult = await makeRequest('POST', '/api/onboarding/complete', {
    platform: 'telegram',
    brandName: 'Test',
    brandDescription: 'Test description',
    brandTone: 'friendly',
    automationType: 'welcome',
    automationMessage: 'Test message'
    // Missing telegramBotToken
  });
  console.log('❌ Missing Token Test:', missingTokenResult?.success === false ? 'Passed' : 'Failed');

  console.log('\n🎯 User Onboarding System Test Complete!');
  console.log('🚀 The onboarding system provides:');
  console.log('  • Step-by-step setup wizard with progress tracking');
  console.log('  • Platform selection (Telegram/WhatsApp)');
  console.log('  • API configuration and validation');
  console.log('  • Brand voice setup and customization');
  console.log('  • First automation creation with guided templates');
  console.log('  • Setup verification and testing capabilities');
  console.log('  • Comprehensive error handling and validation');
  console.log('\n🌐 Access the onboarding wizard at: https://aito.netlify.app/onboarding');
}

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'aito.netlify.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = postData.length;
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`${method} ${path}: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (error) {
          console.log('📊 Raw response:', responseData.substring(0, 200) + '...');
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request error: ${error.message}`);
      resolve(null);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function main() {
  try {
    await testOnboardingSystem();
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

main(); 