const https = require('https');
const http = require('http');

// Configuration
const LOCAL_URL = 'http://localhost:3000';
const NETLIFY_URL = 'https://your-app-name.netlify.app'; // Replace with your actual Netlify URL

// Test data for content generation
const testData = {
  productName: "Test Product",
  productDescription: "A test product for API verification",
  targetAudience: "Developers and testers",
  keyBenefits: "Easy testing and verification",
  callToAction: "Try it now!",
  platform: "Instagram",
  tone: "Professional",
  contentType: "post",
  includeHashtags: true,
  includeEmojis: false,
  additionalPrompt: "This is a test request to verify API functionality"
};

// Helper function to make HTTP requests
function makeRequest(url, path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url + path);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: response
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function testHealthCheck(url, name) {
  console.log(`\n🔍 Testing Health Check - ${name}`);
  try {
    const response = await makeRequest(url, '/api/health');
    console.log(`✅ ${name} Health Check:`, response.status === 200 ? 'PASSED' : 'FAILED');
    console.log(`   Status: ${response.status}`);
    if (response.body) {
      console.log(`   Response:`, JSON.stringify(response.body, null, 2));
    }
  } catch (error) {
    console.log(`❌ ${name} Health Check FAILED:`, error.message);
  }
}

async function testContentGeneration(url, name) {
  console.log(`\n🔍 Testing Content Generation - ${name}`);
  try {
    const response = await makeRequest(url, '/api/generate-post-text', 'POST', testData);
    console.log(`✅ ${name} Content Generation:`, response.status === 200 ? 'PASSED' : 'FAILED');
    console.log(`   Status: ${response.status}`);
    if (response.body) {
      if (response.body.error) {
        console.log(`   ❌ Error: ${response.body.error}`);
      } else if (response.body.generatedText) {
        console.log(`   ✅ Generated Text: ${response.body.generatedText.substring(0, 100)}...`);
      } else {
        console.log(`   Response:`, JSON.stringify(response.body, null, 2));
      }
    }
  } catch (error) {
    console.log(`❌ ${name} Content Generation FAILED:`, error.message);
  }
}

async function testImageGeneration(url, name) {
  console.log(`\n🔍 Testing Image Generation - ${name}`);
  try {
    const imageTestData = {
      prompt: "A professional logo design for a tech company",
      style: "minimalist",
      aspectRatio: "1:1",
      colorScheme: "blue",
      productName: "Test Product"
    };
    
    const response = await makeRequest(url, '/api/generate-image', 'POST', imageTestData);
    console.log(`✅ ${name} Image Generation:`, response.status === 200 ? 'PASSED' : 'FAILED');
    console.log(`   Status: ${response.status}`);
    if (response.body) {
      if (response.body.error) {
        console.log(`   ❌ Error: ${response.body.error}`);
      } else if (response.body.imageUrl) {
        console.log(`   ✅ Generated Image URL: ${response.body.imageUrl}`);
      } else {
        console.log(`   Response:`, JSON.stringify(response.body, null, 2));
      }
    }
  } catch (error) {
    console.log(`❌ ${name} Image Generation FAILED:`, error.message);
  }
}

async function testEnvironmentVariables(url, name) {
  console.log(`\n🔍 Testing Environment Variables - ${name}`);
  try {
    const response = await makeRequest(url, '/api/ai/status');
    console.log(`✅ ${name} Environment Check:`, response.status === 200 ? 'PASSED' : 'FAILED');
    console.log(`   Status: ${response.status}`);
    if (response.body) {
      console.log(`   Response:`, JSON.stringify(response.body, null, 2));
    }
  } catch (error) {
    console.log(`❌ ${name} Environment Check FAILED:`, error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Content Generation API Tests');
  console.log('=====================================');
  
  // Test local environment
  console.log('\n📍 Testing LOCAL Environment');
  console.log('============================');
  await testHealthCheck(LOCAL_URL, 'Local');
  await testEnvironmentVariables(LOCAL_URL, 'Local');
  await testContentGeneration(LOCAL_URL, 'Local');
  await testImageGeneration(LOCAL_URL, 'Local');
  
  // Test Netlify environment
  console.log('\n📍 Testing NETLIFY Environment');
  console.log('==============================');
  await testHealthCheck(NETLIFY_URL, 'Netlify');
  await testEnvironmentVariables(NETLIFY_URL, 'Netlify');
  await testContentGeneration(NETLIFY_URL, 'Netlify');
  await testImageGeneration(NETLIFY_URL, 'Netlify');
  
  console.log('\n✅ Test completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. If local tests pass but Netlify fails, check environment variables in Netlify dashboard');
  console.log('2. If both fail, check your OpenAI API key and Supabase configuration');
  console.log('3. Check Netlify function logs for detailed error messages');
}

// Run the tests
runTests().catch(console.error);
