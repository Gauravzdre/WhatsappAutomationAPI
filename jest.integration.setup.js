// Integration test setup
const { TextEncoder, TextDecoder } = require('util')

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock environment variables for integration tests
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key'

// Mock Telegram Bot API for integration tests
process.env.TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '123456789:ABCdefGHIjklMNOpqrsTUVwxyz123456789'

// Mock AI API keys for integration tests
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'sk-test-key'
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'sk-ant-test-key'

// Global test utilities
global.testUtils = {
  // Helper to create mock request/response objects
  createMockRequest: (method = 'GET', url = '/', body = null, headers = {}) => ({
    method,
    url,
    body,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    json: async () => body,
  }),

  createMockResponse: () => {
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
      send: jest.fn(() => res),
      setHeader: jest.fn(() => res),
      end: jest.fn(() => res),
    }
    return res
  },

  // Helper to wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to create test data
  createTestUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    created_at: new Date().toISOString(),
  }),

  createTestTeam: () => ({
    id: 'test-team-id',
    name: 'Test Team',
    description: 'A test team',
    plan_type: 'free',
    max_members: 5,
    created_at: new Date().toISOString(),
  }),

  createTestTemplate: () => ({
    id: 'test-template-id',
    name: 'Test Template',
    description: 'A test template',
    content: 'Hello {{name}}!',
    category: 'welcome',
    tags: ['test'],
    isActive: true,
    variables: ['name'],
    created_at: new Date().toISOString(),
  }),
}

// Setup and teardown for integration tests
beforeAll(async () => {
  // Any global setup for integration tests
  console.log('🧪 Starting integration tests...')
})

afterAll(async () => {
  // Any global cleanup for integration tests
  console.log('✅ Integration tests completed')
})

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks()
})

afterEach(() => {
  // Cleanup after each test
  jest.restoreAllMocks()
}) 