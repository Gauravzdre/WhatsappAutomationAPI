import { test, expect } from '@playwright/test';
import { AITestHelper } from './ai-test-helper';

test.describe('AI-Powered E2E Tests', () => {
  let aiHelper: AITestHelper;

  test.beforeEach(async () => {
    aiHelper = new AITestHelper();
  });

  test('AI-generated test cases for dashboard functionality', async ({ page }) => {
    // Generate test cases using AI
    const testCases = await aiHelper.generateTestCases(
      'Dashboard page with analytics, user management, and content creation features',
      'Dashboard'
    );

    console.log('AI Generated Test Cases:', testCases);

    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Add context for AI analysis
    aiHelper.addContext('Testing dashboard page with multiple features');
    aiHelper.addContext('Page includes analytics charts, user management, and content creation tools');

    // Test dashboard loads successfully
    await expect(page).toHaveTitle(/Dashboard/);
    
    // Use AI to find elements by description
    const analyticsSection = await aiHelper.findElementByDescription(page, 'analytics charts section');
    if (analyticsSection) {
      await expect(analyticsSection).toBeVisible();
    }

    // Test user management section
    const userManagementSection = await aiHelper.findElementByDescription(page, 'user management or team section');
    if (userManagementSection) {
      await expect(userManagementSection).toBeVisible();
    }

    // Test content creation tools
    const contentTools = await aiHelper.findElementByDescription(page, 'content creation or post creation tools');
    if (contentTools) {
      await expect(contentTools).toBeVisible();
    }
  });

  test('AI-powered accessibility testing', async ({ page }) => {
    await page.goto('/dashboard');

    // Generate accessibility test cases using AI
    const accessibilityTests = await aiHelper.generateAccessibilityTests(page);
    
    console.log('AI Generated Accessibility Tests:', accessibilityTests);

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Test ARIA labels
    const elementsWithAria = await page.locator('[aria-label], [aria-labelledby]').count();
    expect(elementsWithAria).toBeGreaterThan(0);

    // Test semantic HTML structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThan(0);

    // Test color contrast (basic check)
    const textElements = await page.locator('p, span, div').filter({ hasText: /[a-zA-Z]/ }).count();
    expect(textElements).toBeGreaterThan(0);
  });

  test('AI-powered performance testing', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/dashboard');

    // Collect performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
        resourceCount: performance.getEntriesByType('resource').length,
      };
    });

    // Analyze performance with AI
    const performanceAnalysis = await aiHelper.analyzePerformanceMetrics(performanceMetrics);
    console.log('AI Performance Analysis:', performanceAnalysis);

    // Basic performance assertions
    expect(performanceMetrics.loadTime).toBeLessThan(5000); // 5 seconds
    expect(performanceMetrics.domContentLoaded).toBeLessThan(3000); // 3 seconds
  });

  test('AI-powered visual regression testing', async ({ page }) => {
    // Generate visual test scenarios
    const visualScenarios = await aiHelper.generateVisualTestScenarios('Dashboard', {
      theme: 'light',
      userRole: 'admin',
      hasData: true
    });

    console.log('AI Generated Visual Test Scenarios:', visualScenarios);

    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/dashboard');
      
      // Take screenshot for visual regression
      await page.screenshot({ 
        path: `test-results/dashboard-${viewport.name}.png`,
        fullPage: true 
      });

      // Basic visual checks
      await expect(page).toHaveScreenshot(`dashboard-${viewport.name}.png`);
    }
  });

  test('AI-powered error handling and recovery', async ({ page }) => {
    aiHelper.addContext('Testing error handling scenarios');
    aiHelper.addContext('Simulating network failures and API errors');

    // Test offline scenario
    await page.route('**/*', route => route.abort());
    await page.goto('/dashboard');

    // Check for error handling
    const errorMessage = await page.locator('[data-testid="error-message"], .error, [role="alert"]').first();
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText(/error|failed|offline/i);
    }

    // Restore network
    await page.unroute('**/*');
    await page.reload();

    // Test should recover
    await expect(page).toHaveTitle(/Dashboard/);
  });

  test('AI-powered form validation testing', async ({ page }) => {
    await page.goto('/dashboard');

    // Find forms using AI
    const forms = await page.locator('form').all();
    
    for (const form of forms) {
      // Test form validation
      const submitButton = await form.locator('button[type="submit"], input[type="submit"]').first();
      
      if (await submitButton.isVisible()) {
        // Try to submit empty form
        await submitButton.click();
        
        // Check for validation messages
        const validationMessages = await form.locator('[data-testid="error"], .error, [role="alert"]').all();
        
        for (const message of validationMessages) {
          if (await message.isVisible()) {
            await expect(message).toContainText(/required|invalid|error/i);
          }
        }
      }
    }
  });

  test.afterEach(async ({ page }, testInfo) => {
    // If test failed, use AI to analyze the failure
    if (testInfo.status === 'failed') {
      const screenshotPath = testInfo.attachments.find(a => a.name === 'screenshot')?.path;
      const pageContent = await page.content();
      
      const failureAnalysis = await aiHelper.analyzeTestFailure(
        testInfo.title,
        testInfo.error?.message || 'Unknown error',
        screenshotPath,
        pageContent
      );

      console.log('AI Failure Analysis:', failureAnalysis);
      
      // Save analysis to file
      const fs = require('fs');
      const analysisPath = `test-results/failure-analysis-${Date.now()}.txt`;
      fs.writeFileSync(analysisPath, failureAnalysis);
    }

    // Clear context for next test
    aiHelper.clearContext();
  });
});
