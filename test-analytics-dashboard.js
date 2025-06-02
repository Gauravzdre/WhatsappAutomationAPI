const https = require('https');

async function testAnalyticsDashboard() {
  console.log('📊 Testing Analytics Dashboard System\n');
  
  // Test 1: Check analytics API status
  console.log('=== Test 1: Analytics API Status ===');
  const statusResult = await makeRequest('GET', '/api/analytics');
  console.log('📊 API Status:', statusResult ? 'Working' : 'Failed');
  if (statusResult) {
    console.log('📈 Overview:', JSON.stringify(statusResult.data?.overview, null, 2));
  }

  // Test 2: Get dashboard data
  console.log('\n=== Test 2: Dashboard Data ===');
  const dashboardResult = await makeRequest('GET', '/api/analytics?action=dashboard&timeRange=24h');
  if (dashboardResult?.data) {
    console.log('📊 Dashboard Metrics:');
    console.log(`  • Total Messages: ${dashboardResult.data.metrics.totalMessages}`);
    console.log(`  • Active Users: ${dashboardResult.data.metrics.activeUsers}`);
    console.log(`  • AI Responses: ${dashboardResult.data.metrics.aiResponses}`);
    console.log(`  • Automation Triggers: ${dashboardResult.data.metrics.automationTriggers}`);
    console.log(`  • Average Response Time: ${Math.round(dashboardResult.data.metrics.averageResponseTime)}ms`);
    console.log(`  • AI Success Rate: ${Math.round(dashboardResult.data.metrics.aiSuccessRate)}%`);
  }

  // Test 3: Get real-time stats
  console.log('\n=== Test 3: Real-time Statistics ===');
  const realtimeResult = await makeRequest('GET', '/api/analytics?action=realtime');
  if (realtimeResult?.data?.realtime) {
    console.log('⚡ Real-time Stats:', JSON.stringify(realtimeResult.data.realtime, null, 2));
  }

  // Test 4: Get performance metrics
  console.log('\n=== Test 4: Performance Metrics ===');
  const performanceResult = await makeRequest('GET', '/api/analytics?action=performance&timeRange=24h');
  if (performanceResult?.data?.performance) {
    console.log('🚀 Performance Metrics:');
    console.log(`  • Average Response Time: ${Math.round(performanceResult.data.performance.averageResponseTime)}ms`);
    console.log(`  • AI Success Rate: ${Math.round(performanceResult.data.performance.aiSuccessRate)}%`);
    console.log(`  • Automation Success Rate: ${Math.round(performanceResult.data.performance.automationSuccessRate)}%`);
    console.log(`  • User Retention: ${Math.round(performanceResult.data.performance.userRetention)}%`);
  }

  // Test 5: Get activity data
  console.log('\n=== Test 5: Activity Data ===');
  const activityResult = await makeRequest('GET', '/api/analytics?action=activity&type=hourly&timeRange=24h');
  if (activityResult?.data?.activity) {
    console.log('📈 Hourly Activity (last 6 hours):');
    const currentHour = new Date().getHours();
    const recentActivity = activityResult.data.activity
      .filter(h => h.hour <= currentHour && h.hour >= currentHour - 5)
      .slice(-6);
    
    recentActivity.forEach(hour => {
      console.log(`  • Hour ${hour.hour}: ${hour.messages} messages, ${hour.users} users`);
    });
  }

  // Test 6: Generate some test data by sending messages
  console.log('\n=== Test 6: Generate Test Analytics Data ===');
  
  // Send test messages to generate analytics data
  const testMessages = [
    { text: "Hello, I'm testing analytics!", userId: 'test_user_1' },
    { text: "What features do you have?", userId: 'test_user_2' },
    { text: "I need help with automation", userId: 'test_user_3' },
    { text: "Tell me about your pricing", userId: 'test_user_1' }
  ];

  for (let i = 0; i < testMessages.length; i++) {
    const msg = testMessages[i];
    const testMessage = {
      update_id: Date.now() + i,
      message: {
        message_id: i + 100,
        from: {
          id: parseInt(msg.userId.replace('test_user_', '')) + 888000,
          is_bot: false,
          first_name: `TestUser${i + 1}`,
          username: msg.userId,
          language_code: "en"
        },
        chat: {
          id: parseInt(msg.userId.replace('test_user_', '')) + 888000,
          first_name: `TestUser${i + 1}`,
          username: msg.userId,
          type: "private"
        },
        date: Math.floor(Date.now() / 1000),
        text: msg.text
      }
    };

    console.log(`📤 Sending test message ${i + 1}: "${msg.text}"`);
    const messageResult = await makeRequest('POST', '/api/telegram/webhook', testMessage);
    console.log(`📥 Message ${i + 1} result:`, messageResult ? 'Processed' : 'Failed');
    
    // Small delay between messages
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Test 7: Check updated analytics after test messages
  console.log('\n=== Test 7: Updated Analytics After Test Messages ===');
  const updatedDashboard = await makeRequest('GET', '/api/analytics?action=dashboard&timeRange=1h');
  if (updatedDashboard?.data) {
    console.log('📊 Updated Dashboard Metrics:');
    console.log(`  • Total Messages: ${updatedDashboard.data.metrics.totalMessages}`);
    console.log(`  • Active Users: ${updatedDashboard.data.metrics.activeUsers}`);
    console.log(`  • AI Responses: ${updatedDashboard.data.metrics.aiResponses}`);
    console.log(`  • Automation Triggers: ${updatedDashboard.data.metrics.automationTriggers}`);
    
    if (updatedDashboard.data.metrics.topFlows.length > 0) {
      console.log('🔄 Top Automation Flows:');
      updatedDashboard.data.metrics.topFlows.forEach(flow => {
        console.log(`  • ${flow.name}: ${flow.triggers} triggers`);
      });
    }
  }

  // Test 8: Test summary endpoint
  console.log('\n=== Test 8: Analytics Summary ===');
  const summaryResult = await makeRequest('GET', '/api/analytics?action=summary');
  if (summaryResult?.data) {
    console.log('📋 Analytics Summary:');
    console.log('Today:', JSON.stringify(summaryResult.data.today, null, 2));
    console.log('This Week:', JSON.stringify(summaryResult.data.thisWeek, null, 2));
  }

  // Test 9: Test export functionality
  console.log('\n=== Test 9: Export Analytics Data ===');
  const exportResult = await makeRequest('GET', '/api/analytics?action=export&timeRange=1h&format=json');
  if (exportResult?.data) {
    console.log('📤 Export Data:');
    console.log(`  • Total Events: ${exportResult.data.totalEvents}`);
    console.log(`  • Events in Response: ${exportResult.data.events.length}`);
    console.log(`  • Sample Event Types: ${[...new Set(exportResult.data.events.map(e => e.type))].join(', ')}`);
  }

  // Test 10: Test report generation
  console.log('\n=== Test 10: Generate Analytics Report ===');
  const reportResult = await makeRequest('POST', '/api/analytics', {
    action: 'generate_report',
    data: { timeRange: '24h' }
  });
  if (reportResult?.data?.report) {
    console.log('📊 Generated Report Summary:');
    console.log(`  • Period: ${reportResult.data.report.period}`);
    console.log(`  • Total Messages: ${reportResult.data.report.summary.totalMessages}`);
    console.log(`  • Total Users: ${reportResult.data.report.summary.totalUsers}`);
    console.log(`  • AI Success Rate: ${Math.round(reportResult.data.report.summary.aiSuccessRate)}%`);
    console.log(`  • Automation Success Rate: ${Math.round(reportResult.data.report.summary.automationSuccessRate)}%`);
  }

  console.log('\n🎯 Analytics Dashboard Test Complete!');
  console.log('📊 The analytics system should now be tracking:');
  console.log('  • Message delivery and response times');
  console.log('  • User activity and engagement metrics');
  console.log('  • Automation flow performance');
  console.log('  • AI response success rates');
  console.log('  • Real-time activity monitoring');
  console.log('  • Contact segmentation analytics');
  console.log('\n🌐 Visit your dashboard at: https://aito.netlify.app/analytics');
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
    await testAnalyticsDashboard();
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

main(); 