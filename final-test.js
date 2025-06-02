const https = require('https');

async function testBotResponse() {
  console.log('🧪 Final Bot Response Test\n');
  
  // Wait for deployment to complete
  console.log('⏳ Waiting 30 seconds for Netlify deployment...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  // Test 1: Check status
  console.log('=== Test 1: Platform Status ===');
  const statusOptions = {
    hostname: 'aito.netlify.app',
    port: 443,
    path: '/api/telegram/status',
    method: 'GET'
  };

  const statusResult = await new Promise((resolve, reject) => {
    const req = https.request(statusOptions, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(responseData);
          console.log('📊 Status:', JSON.stringify(data, null, 2));
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

  // Test 2: Simulate real webhook
  console.log('\n=== Test 2: Simulate Real Message ===');
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
      text: "Hello bot! This is a test message."
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

  console.log('\n🎯 Test Results:');
  if (statusResult && statusResult.summary && statusResult.summary.connectedPlatforms > 0) {
    console.log('✅ Platform is connected');
  } else {
    console.log('❌ Platform is not connected');
  }
  
  if (webhookResult.statusCode === 200) {
    console.log('✅ Webhook processed successfully');
  } else {
    console.log('❌ Webhook failed');
  }

  console.log('\n📱 Now test with real Telegram:');
  console.log('1. Open Telegram');
  console.log('2. Search for @client_pint_bot');
  console.log('3. Click START (if you haven\'t already)');
  console.log('4. Send a message like "Hello"');
  console.log('5. You should get: "🤖 Echo: Hello"');
}

async function main() {
  try {
    await testBotResponse();
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

main(); 