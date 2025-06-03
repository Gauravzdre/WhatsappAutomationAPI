const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  displayName: 'Integration Tests',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
  testMatch: ['<rootDir>/tests/integration/**/*.test.{js,jsx,ts,tsx}'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/app/api/**/*.{js,jsx,ts,tsx}',
    'src/lib/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000, // 30 seconds for integration tests
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig) 