import { Page, expect } from '@playwright/test';
import OpenAI from 'openai';

export class AITestHelper {
  private openai: OpenAI;
  private testContext: string[] = [];

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Add context about the current test for AI analysis
   */
  addContext(context: string) {
    this.testContext.push(context);
  }

  /**
   * Generate test cases based on a component or feature description
   */
  async generateTestCases(featureDescription: string, componentName?: string): Promise<string[]> {
    const prompt = `
Generate comprehensive test cases for the following feature/component:

Feature: ${featureDescription}
${componentName ? `Component: ${componentName}` : ''}

Please provide test cases that cover:
1. Happy path scenarios
2. Edge cases
3. Error handling
4. Accessibility
5. Performance considerations
6. Cross-browser compatibility

Format each test case as a clear, actionable test description.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const testCases = response.choices[0]?.message?.content?.split('\n').filter(line => 
        line.trim().length > 0 && !line.startsWith('#')
      ) || [];

      return testCases;
    } catch (error) {
      console.error('Failed to generate test cases:', error);
      return [];
    }
  }

  /**
   * Analyze test failure and suggest fixes
   */
  async analyzeTestFailure(
    testName: string, 
    errorMessage: string, 
    screenshotPath?: string,
    pageContent?: string
  ): Promise<string> {
    const prompt = `
Analyze this test failure and provide specific suggestions to fix it:

Test Name: ${testName}
Error Message: ${errorMessage}
${screenshotPath ? `Screenshot: ${screenshotPath}` : ''}
${pageContent ? `Page Content: ${pageContent.substring(0, 1000)}...` : ''}

Context from previous tests: ${this.testContext.join('\n')}

Please provide:
1. Root cause analysis
2. Specific fix suggestions
3. Prevention strategies
4. Related test cases to add
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      return response.choices[0]?.message?.content || 'Unable to analyze failure';
    } catch (error) {
      console.error('Failed to analyze test failure:', error);
      return 'Error analyzing test failure';
    }
  }

  /**
   * Generate accessibility test cases
   */
  async generateAccessibilityTests(page: Page): Promise<string[]> {
    const pageContent = await page.content();
    const url = page.url();

    const prompt = `
Analyze this web page for accessibility issues and generate specific test cases:

URL: ${url}
Page Content: ${pageContent.substring(0, 2000)}...

Generate test cases for:
1. ARIA labels and roles
2. Keyboard navigation
3. Screen reader compatibility
4. Color contrast
5. Focus management
6. Semantic HTML structure

Provide specific, actionable test cases with expected behaviors.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const testCases = response.choices[0]?.message?.content?.split('\n').filter(line => 
        line.trim().length > 0 && !line.startsWith('#')
      ) || [];

      return testCases;
    } catch (error) {
      console.error('Failed to generate accessibility tests:', error);
      return [];
    }
  }

  /**
   * Analyze performance metrics and suggest optimizations
   */
  async analyzePerformanceMetrics(metrics: any): Promise<string> {
    const prompt = `
Analyze these performance metrics and provide optimization suggestions:

Metrics: ${JSON.stringify(metrics, null, 2)}

Please provide:
1. Performance analysis
2. Bottleneck identification
3. Optimization recommendations
4. Performance test cases to add
5. Monitoring suggestions
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      return response.choices[0]?.message?.content || 'Unable to analyze performance';
    } catch (error) {
      console.error('Failed to analyze performance:', error);
      return 'Error analyzing performance metrics';
    }
  }

  /**
   * Generate visual regression test scenarios
   */
  async generateVisualTestScenarios(componentName: string, componentProps?: any): Promise<string[]> {
    const prompt = `
Generate visual regression test scenarios for this component:

Component: ${componentName}
${componentProps ? `Props: ${JSON.stringify(componentProps, null, 2)}` : ''}

Generate test scenarios that cover:
1. Different screen sizes
2. Different themes (light/dark)
3. Different states (loading, error, success)
4. Different content variations
5. Different user interactions
6. Cross-browser visual consistency

Provide specific scenarios with expected visual outcomes.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const scenarios = response.choices[0]?.message?.content?.split('\n').filter(line => 
        line.trim().length > 0 && !line.startsWith('#')
      ) || [];

      return scenarios;
    } catch (error) {
      console.error('Failed to generate visual test scenarios:', error);
      return [];
    }
  }

  /**
   * Smart element locator that uses AI to find elements
   */
  async findElementByDescription(page: Page, description: string): Promise<any> {
    const pageContent = await page.content();
    
    const prompt = `
Given this page content and element description, suggest the best selector to locate the element:

Page Content: ${pageContent.substring(0, 3000)}...
Element Description: ${description}

Please suggest:
1. The best CSS selector or XPath
2. Alternative selectors if the primary one fails
3. Why this selector is recommended
4. Potential issues to watch out for

Return only the best selector as a single line.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      const selector = response.choices[0]?.message?.content?.trim();
      
      if (selector) {
        // Try to find the element with the suggested selector
        const element = await page.$(selector);
        if (element) {
          return element;
        }
      }

      // Fallback to common selectors
      return await this.findElementFallback(page, description);
    } catch (error) {
      console.error('Failed to find element with AI:', error);
      return await this.findElementFallback(page, description);
    }
  }

  private async findElementFallback(page: Page, description: string): Promise<any> {
    // Common fallback strategies
    const selectors = [
      `[data-testid*="${description.toLowerCase()}"]`,
      `[aria-label*="${description}"]`,
      `[title*="${description}"]`,
      `text=${description}`,
      `[class*="${description.toLowerCase()}"]`,
    ];

    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) return element;
      } catch (error) {
        continue;
      }
    }

    return null;
  }

  /**
   * Clear test context
   */
  clearContext() {
    this.testContext = [];
  }
}
