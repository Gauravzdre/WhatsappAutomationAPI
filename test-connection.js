const https = require('https');

async function testTelegramConnection() {
  console.log('🔍 Testing Telegram connection process...');
  
  const botToken = '7625877559:AAFs2cenDr5mjfxZPYkyT8bQfUqqegDCL28';
  
  // Test 1: Check if bot token works
  console.log('\n=== Test 1: Bot Token Validation ===');
  const botInfoOptions = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${botToken}/getMe`,
    method: 'GET'
  };

  const botInfo = await new Promise((resolve, reject) => {
    const req = https.request(botInfoOptions, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          console.log('🤖 Bot info result:', result);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });

  // Test 2: Check webhook info
  console.log('\n=== Test 2: Current Webhook Status ===');
  const webhookInfoOptions = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${botToken}/getWebhookInfo`,
    method: 'GET'
  };

  const webhookInfo = await new Promise((resolve, reject) => {
    const req = https.request(webhookInfoOptions, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          console.log('📡 Webhook info:', result);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });

  // Test 3: Send a test webhook to our endpoint
  console.log('\n=== Test 3: Simulate Real Telegram Webhook ===');
  const testWebhookData = {
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
      text: "Hello bot test!"
    }
  };

  const webhookTestData = JSON.stringify(testWebhookData);
  const webhookOptions = {
    hostname: 'aito.netlify.app',
    port: 443,
    path: '/api/telegram/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': webhookTestData.length
    }
  };

  const webhookResult = await new Promise((resolve, reject) => {
    const req = https.request(webhookOptions, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`📡 Webhook test status: ${res.statusCode}`);
        console.log(`📡 Webhook test response: ${responseData}`);
        resolve({ statusCode: res.statusCode, data: responseData });
      });
    });
    req.on('error', reject);
    req.write(webhookTestData);
    req.end();
  });

  // Test 4: Check status after webhook test
  console.log('\n=== Test 4: Status After Webhook Test ===');
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
        console.log(`📊 Status response: ${res.statusCode}`);
        try {
          const data = JSON.parse(responseData);
          console.log('📊 Current status:', JSON.stringify(data, null, 2));
        } catch (error) {
          console.log('📊 Raw status response:', responseData);
        }
        resolve({ statusCode: res.statusCode, data: responseData });
      });
    });
    req.on('error', reject);
    req.end();
  });

  console.log('\n🎯 Analysis:');
  console.log('1. Check if bot token is valid');
  console.log('2. Check if webhook is properly configured');
  console.log('3. Check if webhook endpoint processes messages');
  console.log('4. Check if platform connects after processing');
}

async function main() {
  try {
    await testTelegramConnection();
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

main(); 