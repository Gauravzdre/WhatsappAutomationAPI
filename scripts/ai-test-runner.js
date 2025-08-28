#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🤖 AI Testing Runner');
console.log('===================
');

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
