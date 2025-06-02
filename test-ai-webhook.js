const https = require('https');

async function testAIWebhook() {
  console.log('🧪 Testing AI Webhook Integration\n');
  
  // Test 1: Check AI webhook status
  console.log('=== Test 1: AI Webhook Status ===');
  const statusOptions = {
    hostname: 'aito.netlify.app',
    port: 443,
    path: '/api/telegram/webhook-ai',
    method: 'GET'
  };

  const statusResult = await new Promise((resolve, reject) => {
    const req = https.request(statusOptions, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        try {
          const data = JSON.parse(responseData);
          console.log('🤖 AI Webhook Status:', JSON.stringify(data, null, 2));
          resolve(data);
        } catch (error) {
          console.log('📊 Raw response:', responseData);
          resolve(null);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });

  // Test 2: Send test messages
  const testMessages = [
    "Hello! What can you help me with?",
    "Tell me about your features",
    "What is pricing?",
    "How does automation work?"
  ];

  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`\n=== Test ${i + 2}: "${message}" ===`);
    
    const testData = {
      update_id: 123456789 + i,
      message: {
        message_id: i + 1,
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
        text: message
      }
    };

    const webhookData = JSON.stringify(testData);
    const webhookOptions = {
      hostname: 'aito.netlify.app',
      port: 443,
      path: '/api/telegram/webhook-ai',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': webhookData.length
      }
    };

    const result = await new Promise((resolve, reject) => {
      const req = https.request(webhookOptions, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          console.log(`📡 Response: ${res.statusCode}`);
          try {
            const data = JSON.parse(responseData);
            console.log('📊 Result:', JSON.stringify(data, null, 2));
            resolve(data);
          } catch (error) {
            console.log('📊 Raw response:', responseData);
            resolve(null);
          }
        });
      });
      req.on('error', reject);
      req.write(webhookData);
      req.end();
    });

    // Wait between messages
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🎯 AI Webhook Test Complete!');
  console.log('📱 If tests passed, the bot should be responding with AI-generated messages');
  console.log('📱 Check your Telegram @client_pint_bot for intelligent responses');
}

async function main() {
  try {
    await testAIWebhook();
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

main(); 