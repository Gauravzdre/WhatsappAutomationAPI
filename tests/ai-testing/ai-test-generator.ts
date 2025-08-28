import { AITestHelper } from './ai-test-helper';
import * as fs from 'fs';
import * as path from 'path';

export class AITestGenerator {
  private aiHelper: AITestHelper;

  constructor(apiKey?: string) {
    this.aiHelper = new AITestHelper(apiKey);
  }

  /**
   * Generate a complete test file for a component or feature
   */
  async generateTestFile(
    componentName: string,
    componentDescription: string,
    testType: 'unit' | 'integration' | 'e2e' = 'e2e',
    outputPath?: string
  ): Promise<string> {
    const prompt = `
Generate a complete ${testType} test file for the following component/feature:

Component Name: ${componentName}
Description: ${componentDescription}
Test Type: ${testType}

Please generate a complete test file that includes:
1. Proper imports and setup
2. Test cases covering happy path, edge cases, and error scenarios
3. Accessibility testing
4. Performance testing (if applicable)
5. Visual regression testing (if applicable)
6. Proper assertions and expectations
7. Cleanup and teardown

Use Playwright for e2e tests, Jest for unit/integration tests.
Include proper TypeScript types and modern testing patterns.
Make the tests robust and maintainable.

Return only the complete test file content, no explanations.
`;

    try {
      const response = await this.aiHelper['openai'].chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const testContent = response.choices[0]?.message?.content || '';
      
      if (outputPath) {
        const fullPath = path.resolve(outputPath);
        const dir = path.dirname(fullPath);
        
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(fullPath, testContent);
        console.log(`Test file generated: ${fullPath}`);
      }

      return testContent;
    } catch (error) {
      console.error('Failed to generate test file:', error);
      return '';
    }
  }

  /**
   * Generate test cases for a specific API endpoint
   */
  async generateAPITestCases(
    endpoint: string,
    method: string,
    description: string
  ): Promise<string[]> {
    const prompt = `
Generate comprehensive API test cases for this endpoint:

Endpoint: ${endpoint}
Method: ${method}
Description: ${description}

Generate test cases for:
1. Valid requests with different data
2. Invalid requests (malformed data, missing fields)
3. Authentication/authorization scenarios
4. Rate limiting
5. Error handling
6. Response validation
7. Performance testing
8. Security testing

Provide specific test cases with expected inputs and outputs.
`;

    try {
      const response = await this.aiHelper['openai'].chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const testCases = response.choices[0]?.message?.content?.split('\n').filter(line => 
        line.trim().length > 0 && !line.startsWith('#')
      ) || [];

      return testCases;
    } catch (error) {
      console.error('Failed to generate API test cases:', error);
      return [];
    }
  }

  /**
   * Generate accessibility test cases for a component
   */
  async generateAccessibilityTestCases(
    componentName: string,
    componentDescription: string
  ): Promise<string[]> {
    const prompt = `
Generate comprehensive accessibility test cases for this component:

Component: ${componentName}
Description: ${componentDescription}

Generate test cases for:
1. Keyboard navigation
2. Screen reader compatibility
3. ARIA labels and roles
4. Color contrast
5. Focus management
6. Semantic HTML structure
7. Alternative text for images
8. Form accessibility
9. Dynamic content updates
10. Mobile accessibility

Provide specific, actionable test cases with expected behaviors.
`;

    try {
      const response = await this.aiHelper['openai'].chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const testCases = response.choices[0]?.message?.content?.split('\n').filter(line => 
        line.trim().length > 0 && !line.startsWith('#')
      ) || [];

      return testCases;
    } catch (error) {
      console.error('Failed to generate accessibility test cases:', error);
      return [];
    }
  }

  /**
   * Generate performance test scenarios
   */
  async generatePerformanceTestScenarios(
    featureName: string,
    description: string
  ): Promise<string[]> {
    const prompt = `
Generate performance test scenarios for this feature:

Feature: ${featureName}
Description: ${description}

Generate test scenarios for:
1. Load time testing
2. Memory usage monitoring
3. CPU usage analysis
4. Network performance
5. Database query optimization
6. Caching effectiveness
7. Resource loading optimization
8. Concurrent user testing
9. Stress testing
10. Scalability testing

Provide specific scenarios with performance metrics to measure.
`;

    try {
      const response = await this.aiHelper['openai'].chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const scenarios = response.choices[0]?.message?.content?.split('\n').filter(line => 
        line.trim().length > 0 && !line.startsWith('#')
      ) || [];

      return scenarios;
    } catch (error) {
      console.error('Failed to generate performance test scenarios:', error);
      return [];
    }
  }

  /**
   * Generate security test cases
   */
  async generateSecurityTestCases(
    featureName: string,
    description: string
  ): Promise<string[]> {
    const prompt = `
Generate security test cases for this feature:

Feature: ${featureName}
Description: ${description}

Generate test cases for:
1. Input validation and sanitization
2. SQL injection prevention
3. XSS prevention
4. CSRF protection
5. Authentication bypass attempts
6. Authorization testing
7. Data encryption
8. Secure communication (HTTPS)
9. Session management
10. File upload security
11. API security
12. Privacy compliance

Provide specific test cases with security considerations.
`;

    try {
      const response = await this.aiHelper['openai'].chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const testCases = response.choices[0]?.message?.content?.split('\n').filter(line => 
        line.trim().length > 0 && !line.startsWith('#')
      ) || [];

      return testCases;
    } catch (error) {
      console.error('Failed to generate security test cases:', error);
      return [];
    }
  }

  /**
   * Generate a complete test suite for a project
   */
  async generateTestSuite(
    projectDescription: string,
    components: Array<{ name: string; description: string }>,
    outputDir: string = 'tests/generated'
  ): Promise<void> {
    console.log('Generating complete test suite...');

    for (const component of components) {
      // Generate unit tests
      await this.generateTestFile(
        component.name,
        component.description,
        'unit',
        path.join(outputDir, 'unit', `${component.name}.unit.spec.ts`)
      );

      // Generate integration tests
      await this.generateTestFile(
        component.name,
        component.description,
        'integration',
        path.join(outputDir, 'integration', `${component.name}.integration.spec.ts`)
      );

      // Generate e2e tests
      await this.generateTestFile(
        component.name,
        component.description,
        'e2e',
        path.join(outputDir, 'e2e', `${component.name}.e2e.spec.ts`)
      );

      // Generate accessibility tests
      const accessibilityTests = await this.generateAccessibilityTestCases(
        component.name,
        component.description
      );
      
      const accessibilityTestContent = this.createTestFileContent(
        component.name,
        'accessibility',
        accessibilityTests
      );
      
      fs.writeFileSync(
        path.join(outputDir, 'accessibility', `${component.name}.accessibility.spec.ts`),
        accessibilityTestContent
      );

      // Generate performance tests
      const performanceTests = await this.generatePerformanceTestScenarios(
        component.name,
        component.description
      );
      
      const performanceTestContent = this.createTestFileContent(
        component.name,
        'performance',
        performanceTests
      );
      
      fs.writeFileSync(
        path.join(outputDir, 'performance', `${component.name}.performance.spec.ts`),
        performanceTestContent
      );

      // Generate security tests
      const securityTests = await this.generateSecurityTestCases(
        component.name,
        component.description
      );
      
      const securityTestContent = this.createTestFileContent(
        component.name,
        'security',
        securityTests
      );
      
      fs.writeFileSync(
        path.join(outputDir, 'security', `${component.name}.security.spec.ts`),
        securityTestContent
      );
    }

    console.log(`Test suite generated in: ${outputDir}`);
  }

  private createTestFileContent(
    componentName: string,
    testType: string,
    testCases: string[]
  ): string {
    return `import { test, expect } from '@playwright/test';

test.describe('${componentName} - ${testType} tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup for ${testType} tests
  });

${testCases.map((testCase, index) => `
  test('${testCase}', async ({ page }) => {
    // TODO: Implement ${testCase}
    // Generated test case ${index + 1}
    expect(true).toBe(true);
  });`).join('\n')}

  test.afterEach(async ({ page }) => {
    // Cleanup after ${testType} tests
  });
});
`;
  }
}
