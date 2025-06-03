const http = require('http');

async function testPerformanceInsights() {
  console.log('🔍 Testing Performance Insights Engine\n');
  
  // Test 1: Check insights API status
  console.log('=== Test 1: Performance Insights API Status ===');
  const statusResult = await makeRequest('GET', '/api/performance-insights?action=summary');
  console.log('🔍 API Status:', statusResult ? 'Working' : 'Failed');
  if (statusResult?.data) {
    console.log('📊 Summary:', JSON.stringify(statusResult.data, null, 2));
  }

  // Test 2: Generate insights
  console.log('\n=== Test 2: Generate Performance Insights ===');
  const insightsResult = await makeRequest('GET', '/api/performance-insights?action=insights&timeframe=30d');
  if (insightsResult?.data?.insights) {
    console.log('🔍 Generated Insights:');
    insightsResult.data.insights.forEach((insight, index) => {
      console.log(`  ${index + 1}. ${insight.title}`);
      console.log(`     Type: ${insight.type} | Impact: ${insight.impact} | Confidence: ${(insight.confidence * 100).toFixed(0)}%`);
      console.log(`     Category: ${insight.category}`);
      console.log(`     Description: ${insight.description}`);
      if (insight.recommendations?.length > 0) {
        console.log(`     Recommendations: ${insight.recommendations.slice(0, 2).join(', ')}`);
      }
      console.log('');
    });
  }

  // Test 3: Generate predictions
  console.log('\n=== Test 3: Generate Performance Predictions ===');
  const predictionsResult = await makeRequest('GET', '/api/performance-insights?action=predictions&predictionPeriod=30d');
  if (predictionsResult?.data?.predictions) {
    console.log('🔮 Generated Predictions:');
    predictionsResult.data.predictions.forEach((prediction, index) => {
      console.log(`  ${index + 1}. ${prediction.metric}`);
      console.log(`     Current: ${prediction.currentValue} → Predicted: ${prediction.predictedValue}`);
      console.log(`     Confidence: ${(prediction.confidence * 100).toFixed(0)}% | Timeframe: ${prediction.timeframe}`);
      console.log(`     Key Factors: ${prediction.factors.join(', ')}`);
      console.log('');
    });
  }

  // Test 4: Generate comprehensive report
  console.log('\n=== Test 4: Generate Performance Report ===');
  const reportResult = await makeRequest('POST', '/api/performance-insights', {
    action: 'generate_report',
    reportType: 'weekly'
  });
  
  if (reportResult?.data?.report) {
    const report = reportResult.data.report;
    console.log('📋 Generated Report:');
    console.log(`  Report ID: ${report.id}`);
    console.log(`  Type: ${report.reportType}`);
    console.log(`  Period: ${report.periodStart} to ${report.periodEnd}`);
    console.log(`  AI Generated: ${report.aiGenerated}`);
    console.log(`  Insights Count: ${report.insights.length}`);
    console.log(`  Predictions Count: ${report.predictions.length}`);
    console.log(`  Recommendations Count: ${report.recommendations.length}`);
    
    console.log('\n  📊 Key Metrics:');
    console.log(`    Response Rate: ${(report.keyMetrics.engagement.responseRate * 100).toFixed(1)}%`);
    console.log(`    Automation Success: ${(report.keyMetrics.automation.successRate * 100).toFixed(1)}%`);
    console.log(`    AI Success Rate: ${(report.keyMetrics.ai.successRate * 100).toFixed(1)}%`);
    console.log(`    User Growth: +${report.keyMetrics.growth.userGrowth}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n  💡 Top Recommendations:');
      report.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`    ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
        console.log(`       ${rec.description}`);
        console.log(`       Expected Impact: ${rec.expectedImpact}`);
      });
    }
  }

  // Test 5: Get stored reports
  console.log('\n=== Test 5: Retrieve Stored Reports ===');
  const reportsResult = await makeRequest('GET', '/api/performance-insights?action=reports&limit=5');
  if (reportsResult?.data?.reports) {
    console.log('📚 Stored Reports:');
    reportsResult.data.reports.forEach((report, index) => {
      console.log(`  ${index + 1}. ${report.reportType} Report (${report.id})`);
      console.log(`     Created: ${new Date(report.createdAt).toLocaleDateString()}`);
      console.log(`     Period: ${report.periodStart} to ${report.periodEnd}`);
      console.log(`     Insights: ${report.insights.length} | AI Generated: ${report.aiGenerated}`);
    });
  }

  // Test 6: Test different timeframes
  console.log('\n=== Test 6: Test Different Timeframes ===');
  const timeframes = ['24h', '7d', '30d'];
  
  for (const timeframe of timeframes) {
    console.log(`\n  Testing ${timeframe} timeframe:`);
    const timeframeResult = await makeRequest('GET', `/api/performance-insights?action=insights&timeframe=${timeframe}`);
    if (timeframeResult?.data?.insights) {
      const insights = timeframeResult.data.insights;
      const highImpact = insights.filter(i => i.impact === 'high').length;
      const opportunities = insights.filter(i => i.type === 'opportunity').length;
      const warnings = insights.filter(i => i.type === 'warning').length;
      
      console.log(`    Total Insights: ${insights.length}`);
      console.log(`    High Impact: ${highImpact} | Opportunities: ${opportunities} | Warnings: ${warnings}`);
    }
  }

  // Test 7: Test error handling
  console.log('\n=== Test 7: Error Handling ===');
  const errorResult = await makeRequest('GET', '/api/performance-insights?action=invalid_action');
  console.log('❌ Invalid Action Response:', errorResult?.error ? 'Properly handled' : 'Not handled');

  // Test 8: Performance metrics
  console.log('\n=== Test 8: Performance Metrics ===');
  const startTime = Date.now();
  await makeRequest('GET', '/api/performance-insights?action=insights&timeframe=7d');
  const endTime = Date.now();
  console.log(`⚡ API Response Time: ${endTime - startTime}ms`);

  console.log('\n🎉 Performance Insights Engine testing completed!');
}

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      resolve(null);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Run the test
testPerformanceInsights().catch(console.error); 