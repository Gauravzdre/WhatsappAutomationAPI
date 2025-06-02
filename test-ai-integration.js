const https = require('https');

async function testAIIntegration() {
  console.log('🧪 Testing AI Content Generation Integration\n');
  
  // Test 1: Check AI status
  console.log('=== Test 1: AI Status Check ===');
  const statusOptions = {
    hostname: 'aito.netlify.app',
    port: 443,
    path: '/api/ai/status',
    method: 'GET'
  };

  const statusResult = await new Promise((resolve, reject) => {
    const req = https.request(statusOptions, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(responseData);
          console.log('🤖 AI Status:', JSON.stringify(data, null, 2));
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

  // Test 2: Initialize AI if needed
  console.log('\n=== Test 2: Initialize AI ===');
  const initData = JSON.stringify({ action: 'initialize' });
  const initOptions = {
    hostname: 'aito.netlify.app',
    port: 443,
    path: '/api/ai/status',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': initData.length
    }
  };

  const initResult = await new Promise((resolve, reject) => {
    const req = https.request(initOptions, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`🚀 Init response: ${res.statusCode}`);
        try {
          const data = JSON.parse(responseData);
          console.log('🤖 Init result:', JSON.stringify(data, null, 2));
          resolve(data);
        } catch (error) {
          console.log('📊 Raw response:', responseData);
          resolve(null);
        }
      });
    });
    req.on('error', reject);
    req.write(initData);
    req.end();
  });

  // Test 3: Test AI response generation
  console.log('\n=== Test 3: Test AI Response ===');
  const testData = JSON.stringify({ 
    action: 'test', 
    message: 'Hello! What can you help me with?' 
  });
  const testOptions = {
    hostname: 'aito.netlify.app',
    port: 443,
    path: '/api/ai/status',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': testData.length
    }
  };

  const testResult = await new Promise((resolve, reject) => {
    const req = https.request(testOptions, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`🧪 Test response: ${res.statusCode}`);
        try {
          const data = JSON.parse(responseData);
          console.log('🤖 Test result:', JSON.stringify(data, null, 2));
          resolve(data);
        } catch (error) {
          console.log('📊 Raw response:', responseData);
          resolve(null);
        }
      });
    });
    req.on('error', reject);
    req.write(testData);
    req.end();
  });

  // Test 4: Send real message to bot
  console.log('\n=== Test 4: Real Bot Message ===');
  const realMessage = {
    update_id: 123456790,
    message: {
      message_id: 2,
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
      text: "Hello! Can you tell me about your features?"
    }
  };

  const webhookData = JSON.stringify(realMessage);
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

  console.log('\n🎯 Test Results Summary:');
  console.log('1. AI Status:', statusResult?.success ? '✅ Available' : '❌ Not Available');
  console.log('2. AI Init:', initResult?.success ? '✅ Successful' : '❌ Failed');
  console.log('3. AI Test:', testResult?.success ? '✅ Working' : '❌ Failed');
  console.log('4. Webhook:', webhookResult.statusCode === 200 ? '✅ Processed' : '❌ Failed');

  console.log('\n📱 Now test with real Telegram:');
  console.log('1. Open Telegram');
  console.log('2. Search for @client_pint_bot');
  console.log('3. Send: "Hello! What can you help me with?"');
  console.log('4. You should get an intelligent AI response (not echo)');
  console.log('5. Try: "What features do you have?"');
  console.log('6. Try: "Tell me about pricing"');
}

async function main() {
  try {
    await testAIIntegration();
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

main(); 