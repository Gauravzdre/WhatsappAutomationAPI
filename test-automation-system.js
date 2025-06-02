const https = require('https');

async function testAutomationSystem() {
  console.log('🧪 Testing Message Automation System\n');
  
  // Test 1: Check automation API status
  console.log('=== Test 1: Automation API Status ===');
  const statusResult = await makeRequest('GET', '/api/automation/flows');
  console.log('📊 API Status:', statusResult ? 'Working' : 'Failed');
  if (statusResult) {
    console.log('📈 Overview:', JSON.stringify(statusResult.data?.overview, null, 2));
  }

  // Test 2: Get automation flows
  console.log('\n=== Test 2: Automation Flows ===');
  const flowsResult = await makeRequest('GET', '/api/automation/flows?action=flows');
  if (flowsResult?.data?.flows) {
    console.log(`📋 Found ${flowsResult.data.flows.length} automation flows:`);
    flowsResult.data.flows.forEach(flow => {
      console.log(`  • ${flow.name} (${flow.active ? 'Active' : 'Inactive'}) - Triggered: ${flow.stats.triggered}`);
    });
  }

  // Test 3: Get automation statistics
  console.log('\n=== Test 3: Automation Statistics ===');
  const statsResult = await makeRequest('GET', '/api/automation/flows?action=stats');
  if (statsResult?.data) {
    console.log('📊 Flow Stats:', JSON.stringify(statsResult.data.flows, null, 2));
    console.log('👥 User Stats:', JSON.stringify(statsResult.data.users, null, 2));
    console.log('📞 Contact Stats:', JSON.stringify(statsResult.data.contacts, null, 2));
  }

  // Test 4: Test welcome flow with new user
  console.log('\n=== Test 4: Welcome Flow Test ===');
  const welcomeMessage = {
    update_id: Date.now(),
    message: {
      message_id: 1,
      from: {
        id: 999888777,
        is_bot: false,
        first_name: "NewUser",
        username: "newuser_test",
        language_code: "en"
      },
      chat: {
        id: 999888777,
        first_name: "NewUser",
        username: "newuser_test",
        type: "private"
      },
      date: Math.floor(Date.now() / 1000),
      text: "Hello, I'm new here!"
    }
  };

  const welcomeResult = await makeRequest('POST', '/api/telegram/webhook', welcomeMessage);
  console.log('👋 Welcome flow result:', welcomeResult ? 'Triggered' : 'Failed');

  // Test 5: Test help flow
  console.log('\n=== Test 5: Help Flow Test ===');
  const helpMessage = {
    update_id: Date.now() + 1,
    message: {
      message_id: 2,
      from: {
        id: 999888777,
        is_bot: false,
        first_name: "NewUser",
        username: "newuser_test",
        language_code: "en"
      },
      chat: {
        id: 999888777,
        first_name: "NewUser",
        username: "newuser_test",
        type: "private"
      },
      date: Math.floor(Date.now() / 1000),
      text: "I need help with this platform"
    }
  };

  const helpResult = await makeRequest('POST', '/api/telegram/webhook', helpMessage);
  console.log('🆘 Help flow result:', helpResult ? 'Triggered' : 'Failed');

  // Test 6: Test features flow
  console.log('\n=== Test 6: Features Flow Test ===');
  const featuresMessage = {
    update_id: Date.now() + 2,
    message: {
      message_id: 3,
      from: {
        id: 999888777,
        is_bot: false,
        first_name: "NewUser",
        username: "newuser_test",
        language_code: "en"
      },
      chat: {
        id: 999888777,
        first_name: "NewUser",
        username: "newuser_test",
        type: "private"
      },
      date: Math.floor(Date.now() / 1000),
      text: "What features do you have?"
    }
  };

  const featuresResult = await makeRequest('POST', '/api/telegram/webhook', featuresMessage);
  console.log('🚀 Features flow result:', featuresResult ? 'Triggered' : 'Failed');

  // Test 7: Check contacts after automation
  console.log('\n=== Test 7: Contact Management ===');
  const contactsResult = await makeRequest('GET', '/api/automation/flows?action=contacts');
  if (contactsResult?.data?.contacts) {
    console.log(`👥 Found ${contactsResult.data.contacts.length} contacts:`);
    contactsResult.data.contacts.forEach(contact => {
      console.log(`  • ${contact.name || 'Unknown'} (${contact.chatId}) - Messages: ${contact.messageCount}, Segment: ${contact.segment}`);
      if (contact.tags.length > 0) {
        console.log(`    Tags: ${contact.tags.join(', ')}`);
      }
    });
  }

  // Test 8: Check segments
  console.log('\n=== Test 8: Contact Segments ===');
  const segmentsResult = await makeRequest('GET', '/api/automation/flows?action=segments');
  if (segmentsResult?.data?.segments) {
    console.log(`📊 Found ${segmentsResult.data.segments.length} segments:`);
    segmentsResult.data.segments.forEach(segment => {
      console.log(`  • ${segment.name}: ${segment.contactCount} contacts`);
    });
  }

  // Test 9: Test AI fallback (non-matching message)
  console.log('\n=== Test 9: AI Fallback Test ===');
  const aiMessage = {
    update_id: Date.now() + 3,
    message: {
      message_id: 4,
      from: {
        id: 999888777,
        is_bot: false,
        first_name: "NewUser",
        username: "newuser_test",
        language_code: "en"
      },
      chat: {
        id: 999888777,
        first_name: "NewUser",
        username: "newuser_test",
        type: "private"
      },
      date: Math.floor(Date.now() / 1000),
      text: "Tell me about your pricing plans"
    }
  };

  const aiResult = await makeRequest('POST', '/api/telegram/webhook', aiMessage);
  console.log('🤖 AI fallback result:', aiResult ? 'Triggered' : 'Failed');

  // Final statistics check
  console.log('\n=== Final Statistics ===');
  const finalStats = await makeRequest('GET', '/api/automation/flows?action=stats');
  if (finalStats?.data) {
    console.log('📈 Final Flow Stats:');
    finalStats.data.flows.forEach(flow => {
      console.log(`  • ${flow.name}: ${flow.triggered} triggered, ${flow.completed} completed (${flow.successRate.toFixed(1)}% success)`);
    });
    
    console.log('\n👥 Final User Stats:', JSON.stringify(finalStats.data.users, null, 2));
  }

  console.log('\n🎯 Automation System Test Complete!');
  console.log('📱 Check your Telegram @client_pint_bot for automated responses');
  console.log('📊 The system should now handle:');
  console.log('  • Welcome messages for new users');
  console.log('  • Help requests with intelligent responses');
  console.log('  • Feature inquiries with structured information');
  console.log('  • AI-powered responses for other messages');
  console.log('  • Contact management and segmentation');
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
    await testAutomationSystem();
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

main(); 