const https = require('https');

const botToken = '7625877559:AAFs2cenDr5mjfxZPYkyT8bQfUqqegDCL28';
const webhookUrl = 'https://aito.netlify.app/api/telegram/webhook';

async function setWebhook() {
  console.log('🔄 Setting up webhook...');
  
  const data = JSON.stringify({
    url: webhookUrl,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true
  });

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${botToken}/setWebhook`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function getWebhookInfo() {
  console.log('🔍 Getting webhook info...');
  
  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${botToken}/getWebhookInfo`,
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function main() {
  try {
    // Set webhook
    const setResult = await setWebhook();
    console.log('📡 Set webhook result:', setResult);
    
    if (setResult.ok) {
      console.log('✅ Webhook set successfully!');
    } else {
      console.log('❌ Failed to set webhook:', setResult.description);
    }
    
    // Wait a moment then check status
    console.log('\n⏳ Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get webhook info
    const infoResult = await getWebhookInfo();
    console.log('📊 Webhook info:', infoResult);
    
    if (infoResult.ok) {
      console.log('\n✅ Current webhook status:');
      console.log(`   URL: ${infoResult.result.url}`);
      console.log(`   Pending updates: ${infoResult.result.pending_update_count || 0}`);
      
      if (infoResult.result.last_error_date) {
        console.log(`   ⚠️  Last error: ${infoResult.result.last_error_message}`);
      } else {
        console.log('   ✅ No errors');
      }
    }
    
    console.log('\n🧪 Testing instructions:');
    console.log('1. Find your bot on Telegram by searching for its username');
    console.log('2. Send a message to your bot');
    console.log('3. Check your Netlify function logs for webhook activity');
    console.log('4. Your bot should echo back your message');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main(); 