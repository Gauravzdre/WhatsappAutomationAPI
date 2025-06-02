#!/usr/bin/env node

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupTelegramWebhook() {
  console.log('🤖 Telegram Webhook Setup Tool\n');

  try {
    // Get bot token
    const botToken = await question('Enter your Telegram bot token: ');
    if (!botToken) {
      console.log('❌ Bot token is required');
      process.exit(1);
    }

    // Get webhook URL
    const defaultWebhookUrl = 'https://your-domain.com/api/telegram/webhook';
    const webhookUrl = await question(`Enter your webhook URL (${defaultWebhookUrl}): `) || defaultWebhookUrl;

    console.log('\n🔄 Setting up webhook...');

    // Set up webhook
    const result = await setWebhook(botToken, webhookUrl);
    
    if (result.ok) {
      console.log('✅ Webhook set up successfully!');
      console.log(`📡 Webhook URL: ${webhookUrl}`);
      
      // Get webhook info to verify
      console.log('\n🔍 Verifying webhook...');
      const info = await getWebhookInfo(botToken);
      
      if (info.ok) {
        console.log('✅ Webhook verification successful!');
        console.log('📊 Webhook Info:');
        console.log(`   URL: ${info.result.url}`);
        console.log(`   Pending updates: ${info.result.pending_update_count || 0}`);
        
        if (info.result.last_error_date) {
          console.log(`   ⚠️  Last error: ${info.result.last_error_message}`);
        }
      }

      console.log('\n📝 Environment Variables:');
      console.log('Add these to your .env.local file:');
      console.log(`TELEGRAM_BOT_TOKEN=${botToken}`);
      console.log(`TELEGRAM_WEBHOOK_URL=${webhookUrl}`);
      console.log('TELEGRAM_WEBHOOK_TOKEN=your_verification_token_here');

      console.log('\n🧪 Testing:');
      console.log('1. Find your bot on Telegram');
      console.log('2. Send a message to test the webhook');
      console.log('3. Check your application logs');

    } else {
      console.log('❌ Failed to set up webhook:');
      console.log(result.description);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

function setWebhook(botToken, webhookUrl) {
  return new Promise((resolve, reject) => {
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

function getWebhookInfo(botToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/getWebhookInfo`,
      method: 'GET'
    };

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

// Run the setup
setupTelegramWebhook(); 