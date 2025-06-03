# Testing Guide

This document provides comprehensive information about testing in the WhatsApp AI Automation Platform.

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Test Types](#test-types)
- [Setup & Installation](#setup--installation)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Coverage Reports](#coverage-reports)
- [Best Practices](#best-practices)

## Testing Strategy

Our testing strategy follows the testing pyramid approach:

```
    /\
   /  \     E2E Tests (Few)
  /____\    - Critical user journeys
 /      \   - Cross-browser testing
/________\  - Mobile responsiveness

Integration Tests (Some)
- API endpoint testing
- Database interactions
- External service mocking

Unit Tests (Many)
- Component testing
- Utility function testing
- Business logic testing
```

## Test Types

### 1. Unit Tests
- **Framework**: Jest + React Testing Library
- **Location**: `tests/unit/`
- **Purpose**: Test individual components and functions in isolation
- **Coverage**: Components, utilities, hooks, business logic

### 2. Integration Tests
- **Framework**: Jest (Node.js environment)
- **Location**: `tests/integration/`
- **Purpose**: Test API endpoints and database interactions
- **Coverage**: API routes, database operations, external integrations

### 3. End-to-End (E2E) Tests
- **Framework**: Playwright
- **Location**: `tests/e2e/`
- **Purpose**: Test complete user workflows
- **Coverage**: Critical user journeys, cross-browser compatibility, mobile responsiveness

### 4. Performance Tests
- **Framework**: Lighthouse CI
- **Purpose**: Monitor performance metrics and accessibility
- **Coverage**: Page load times, Core Web Vitals, accessibility scores

### 5. Security Tests
- **Framework**: Custom security audit script
- **Purpose**: Identify security vulnerabilities
- **Coverage**: Code analysis, dependency scanning, configuration review

## Setup & Installation

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### Environment Setup
```bash
# Copy environment variables for testing
cp .env.example .env.test

# Set test-specific environment variables
echo "NODE_ENV=test" >> .env.test
echo "NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co" >> .env.test
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key" >> .env.test
```

## Running Tests

### All Tests
```bash
# Run all test suites
npm run test:all

# Run tests with coverage
npm run test:coverage
```

### Unit Tests
```bash
# Run unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run integration tests with coverage
npm run test:integration -- --coverage
```

### E2E Tests
```bash
# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests for specific browser
npx playwright test --project=chromium
```

### Performance Tests
```bash
# Run Lighthouse CI
npm run test:performance

# Run Lighthouse on specific URL
npx lighthouse http://localhost:3001 --output=html
```

### Security Tests
```bash
# Run security audit
npm run test:security

# Run npm audit
npm audit

# Run custom security checks
npm run test:security:custom
```

## Writing Tests

### Unit Test Example
```typescript
// tests/unit/components/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Test Example
```typescript
// tests/integration/api/teams.test.ts
describe('Teams API', () => {
  it('should create a new team', async () => {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Team' })
    })
    
    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.team.name).toBe('Test Team')
  })
})
```

### E2E Test Example
```typescript
// tests/e2e/team-creation.spec.ts
import { test, expect } from '@playwright/test'

test('should create a new team', async ({ page }) => {
  await page.goto('/teams')
  await page.getByRole('button', { name: 'Create Team' }).click()
  await page.getByLabel('Team Name').fill('My New Team')
  await page.getByRole('button', { name: 'Create' }).click()
  
  await expect(page.getByText('My New Team')).toBeVisible()
})
```

## Test Configuration

### Jest Configuration
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/tests/unit/**/*.test.{js,jsx,ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
})
```

## CI/CD Integration

### GitHub Actions Example
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:integration
      - run: npm run test:security
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## Coverage Reports

### Viewing Coverage
```bash
# Generate coverage report
npm run test:coverage

# Open coverage report in browser
open coverage/lcov-report/index.html
```

### Coverage Thresholds
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Coverage Exclusions
- Type definition files (`.d.ts`)
- Story files (`.stories.tsx`)
- Configuration files
- Test files themselves

## Best Practices

### General Testing Principles
1. **Write tests first** (TDD approach when possible)
2. **Test behavior, not implementation**
3. **Keep tests simple and focused**
4. **Use descriptive test names**
5. **Arrange, Act, Assert pattern**

### Unit Testing Best Practices
1. **Test components in isolation**
2. **Mock external dependencies**
3. **Test edge cases and error conditions**
4. **Use data-testid for complex selectors**
5. **Test accessibility features**

### Integration Testing Best Practices
1. **Test API contracts**
2. **Use realistic test data**
3. **Test error scenarios**
4. **Clean up after tests**
5. **Test authentication and authorization**

### E2E Testing Best Practices
1. **Test critical user journeys**
2. **Use page object model**
3. **Test on multiple browsers**
4. **Test mobile responsiveness**
5. **Keep tests independent**

### Performance Testing Best Practices
1. **Set realistic performance budgets**
2. **Test on different network conditions**
3. **Monitor Core Web Vitals**
4. **Test accessibility scores**
5. **Regular performance audits**

## Debugging Tests

### Unit Tests
```bash
# Debug specific test
npm run test -- --testNamePattern="Button Component"

# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Tests
```bash
# Run tests in headed mode
npx playwright test --headed

# Debug specific test
npx playwright test --debug navigation.spec.ts

# Record new tests
npx playwright codegen localhost:3001
```

## Test Data Management

### Fixtures
```typescript
// tests/fixtures/teams.ts
export const mockTeam = {
  id: 'team-1',
  name: 'Test Team',
  description: 'A test team',
  plan_type: 'free',
  max_members: 5,
  created_at: '2025-01-01T00:00:00Z',
}

export const mockTeamMember = {
  id: 'member-1',
  role: 'owner',
  status: 'active',
  joined_at: '2025-01-01T00:00:00Z',
}
```

### Test Utilities
```typescript
// tests/utils/render.tsx
import { render } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider attribute="class" defaultTheme="system">
      {ui}
    </ThemeProvider>
  )
}
```

## Troubleshooting

### Common Issues

1. **Tests failing in CI but passing locally**
   - Check environment variables
   - Verify Node.js version consistency
   - Check for timing issues

2. **Flaky E2E tests**
   - Add proper wait conditions
   - Use `waitForLoadState`
   - Increase timeouts if necessary

3. **Low test coverage**
   - Identify untested code paths
   - Add tests for edge cases
   - Review coverage reports

4. **Slow test execution**
   - Run tests in parallel
   - Mock heavy operations
   - Optimize test setup/teardown

### Getting Help

- Check the [Jest documentation](https://jestjs.io/docs/getting-started)
- Check the [Playwright documentation](https://playwright.dev/docs/intro)
- Review existing tests for patterns
- Ask team members for guidance

## Continuous Improvement

### Regular Tasks
- [ ] Review and update test coverage
- [ ] Update test dependencies
- [ ] Review and optimize slow tests
- [ ] Update test documentation
- [ ] Review security audit results

### Metrics to Monitor
- Test coverage percentage
- Test execution time
- Flaky test rate
- Performance scores
- Security audit results

---

For more information about specific testing frameworks and tools, refer to their official documentation. 