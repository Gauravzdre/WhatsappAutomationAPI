#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🤖 Setting up AI-Powered Testing System...\n');

// Check if OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  console.log('⚠️  Warning: OPENAI_API_KEY environment variable is not set.');
  console.log('   Please set your OpenAI API key to use AI-powered testing features.');
  console.log('   You can set it in your .env file or environment variables.\n');
}

// Create necessary directories
const directories = [
  'tests/ai-testing',
  'tests/ai-generated',
  'tests/ai-generated/unit',
  'tests/ai-generated/integration',
  'tests/ai-generated/e2e',
  'tests/ai-generated/accessibility',
  'tests/ai-generated/performance',
  'tests/ai-generated/security',
  'test-results'
];

console.log('📁 Creating directories...');
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`   ✅ Created: ${dir}`);
  } else {
    console.log(`   ℹ️  Already exists: ${dir}`);
  }
});

// Create .gitignore entries for test results
const gitignorePath = '.gitignore';
const gitignoreEntries = [
  '',
  '# AI Testing',
  'test-results/',
  'tests/ai-generated/',
  'ai-analysis-*.txt',
  'failure-analysis-*.txt'
];

if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  
  gitignoreEntries.forEach(entry => {
    if (!gitignoreContent.includes(entry)) {
      fs.appendFileSync(gitignorePath, entry + '\n');
      console.log(`   ✅ Added to .gitignore: ${entry}`);
    }
  });
} else {
  fs.writeFileSync(gitignorePath, gitignoreEntries.join('\n'));
  console.log('   ✅ Created .gitignore file');
}

// Create environment template
const envTemplate = `# AI Testing Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Optional AI Testing Settings
OPENAI_MODEL=gpt-4
AI_TEST_TEMPERATURE=0.3

# Playwright Configuration
PLAYWRIGHT_BASE_URL=http://localhost:3001
`;

const envPath = '.env.example';
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envTemplate);
  console.log('   ✅ Created .env.example template');
}

// Create a simple test runner script
const testRunnerScript = `#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🤖 AI Testing Runner');
console.log('===================\n');

const args = process.argv.slice(2);
const command = args[0] || 'help';

switch (command) {
  case 'generate':
    console.log('Generating AI tests...');
    execSync('npm run generate:ai-tests', { stdio: 'inherit' });
    break;
    
  case 'run':
    console.log('Running AI tests...');
    execSync('npm run test:ai-all', { stdio: 'inherit' });
    break;
    
  case 'example':
    console.log('Running example AI tests...');
    execSync('npm run test:ai', { stdio: 'inherit' });
    break;
    
  case 'help':
  default:
    console.log('Available commands:');
    console.log('  generate  - Generate AI-powered test suites');
    console.log('  run       - Run all AI tests');
    console.log('  example   - Run example AI tests');
    console.log('  help      - Show this help message');
    break;
}
`;

const runnerPath = 'scripts/ai-test-runner.js';
fs.writeFileSync(runnerPath, testRunnerScript);
fs.chmodSync(runnerPath, '755');
console.log('   ✅ Created AI test runner script');

// Add npm scripts to package.json
const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const newScripts = {
    'test:ai': 'playwright test tests/ai-testing/',
    'test:ai-generated': 'playwright test tests/ai-generated/',
    'test:ai-all': 'npm run test:ai && npm run test:ai-generated',
    'generate:ai-tests': 'node scripts/generate-ai-tests.js',
    'ai-test': 'node scripts/ai-test-runner.js'
  };
  
  let updated = false;
  Object.entries(newScripts).forEach(([key, value]) => {
    if (!packageJson.scripts[key]) {
      packageJson.scripts[key] = value;
      updated = true;
      console.log(`   ✅ Added npm script: ${key}`);
    }
  });
  
  if (updated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}

console.log('\n✅ AI Testing System Setup Complete!\n');

console.log('🚀 Next Steps:');
console.log('1. Set your OpenAI API key in .env file:');
console.log('   OPENAI_API_KEY=your-api-key-here');
console.log('');
console.log('2. Generate AI tests:');
console.log('   npm run generate:ai-tests');
console.log('');
console.log('3. Run example AI tests:');
console.log('   npm run test:ai');
console.log('');
console.log('4. Run all AI tests:');
console.log('   npm run test:ai-all');
console.log('');
console.log('5. Use the AI test runner:');
console.log('   npm run ai-test generate  # Generate tests');
console.log('   npm run ai-test run       # Run all tests');
console.log('   npm run ai-test example   # Run examples');
console.log('');
console.log('📚 Documentation: tests/ai-testing/README.md');
console.log('');
console.log('💡 Tips:');
console.log('- Review generated tests before running them');
console.log('- Customize AI prompts for your specific needs');
console.log('- Monitor API usage to manage costs');
console.log('- Combine AI testing with traditional testing methods');
