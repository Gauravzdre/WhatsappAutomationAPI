const https = require('https');

async function testDirectMessage() {
  console.log('🧪 Testing Direct Message to Bot\n');
  
  // Test message to webhook
  const testMessage = {
    update_id: 123456789,
    message: {
      message_id: 1,
      from: {
        id: 987654321,
        is_bot: false,
        first_name: "TestUser",
        username: "testuser",
        language_code: "en"
      },
      chat: {
        id: 987654321,
        first_name: "TestUser",
        username: "testuser",
        type: "private"
      },
      date: Math.floor(Date.now() / 1000),
      text: "Hello! What features do you have?"
    }
  };

  const webhookData = JSON.stringify(testMessage);
  const webhookOptions = {
    hostname: 'aito.netlify.app',
    port: 443,
    path: '/api/telegram/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': webhookData.length
    }
  };

  console.log('📤 Sending test message:', testMessage.message.text);
  
  const webhookResult = await new Promise((resolve, reject) => {
    const req = https.request(webhookOptions, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`📡 Webhook response: ${res.statusCode}`);
        console.log(`📡 Response data: ${responseData}`);
        resolve({ statusCode: res.statusCode, data: responseData });
      });
    });
    req.on('error', reject);
    req.write(webhookData);
    req.end();
  });

  // Test with different messages
  const testMessages = [
    "Hello! What can you help me with?",
    "Tell me about pricing",
    "What features do you have?",
    "How does this work?"
  ];

  for (const message of testMessages) {
    console.log(`\n📤 Testing: "${message}"`);
    
    const testData = {
      ...testMessage,
      message: {
        ...testMessage.message,
        message_id: testMessage.message.message_id + 1,
        text: message,
        date: Math.floor(Date.now() / 1000)
      }
    };

    const data = JSON.stringify(testData);
    const options = {
      hostname: 'aito.netlify.app',
      port: 443,
      path: '/api/telegram/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const result = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          console.log(`   Status: ${res.statusCode} | Response: ${responseData}`);
          resolve({ statusCode: res.statusCode, data: responseData });
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });

    // Wait a bit between messages
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎯 Test Complete!');
  console.log('📱 Now check your Telegram bot @client_pint_bot');
  console.log('   You should see intelligent AI responses instead of echo messages');
  console.log('   If you see fallback responses, the AI integration is working!');
}

async function main() {
  try {
    await testDirectMessage();
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

main(); 