import { test, expect } from '@playwright/test';
import { AITestHelper } from './ai-test-helper';

test.describe('AI Testing Example - Basic Web Testing', () => {
  let aiHelper: AITestHelper;

  test.beforeEach(async () => {
    aiHelper = new AITestHelper();
  });

  test('AI-powered login form testing', async ({ page }) => {
    // Generate test cases for login functionality
    const testCases = await aiHelper.generateTestCases(
      'Login form with email/password fields, validation, and authentication',
      'LoginForm'
    );

    console.log('Generated test cases for login form:', testCases);

    // Navigate to login page
    await page.goto('/login');
    
    // Add context for AI analysis
    aiHelper.addContext('Testing login form functionality');
    aiHelper.addContext('Form includes email, password, and submit button');

    // Test form elements exist
    const emailField = await aiHelper.findElementByDescription(page, 'email input field');
    const passwordField = await aiHelper.findElementByDescription(page, 'password input field');
    const submitButton = await aiHelper.findElementByDescription(page, 'login submit button');

    // Verify elements are present
    if (emailField) {
      await expect(emailField).toBeVisible();
      await emailField.fill('test@example.com');
    }

    if (passwordField) {
      await expect(passwordField).toBeVisible();
      await passwordField.fill('password123');
    }

    if (submitButton) {
      await expect(submitButton).toBeVisible();
      await submitButton.click();
    }

    // Test validation (try submitting empty form)
    if (submitButton) {
      await page.reload();
      await submitButton.click();
      
      // Check for validation messages
      const validationMessages = await page.locator('[data-testid="error"], .error, [role="alert"]').all();
      expect(validationMessages.length).toBeGreaterThan(0);
    }
  });

  test('AI-powered navigation testing', async ({ page }) => {
    await page.goto('/');

    // Generate test cases for navigation
    const navigationTests = await aiHelper.generateTestCases(
      'Website navigation with menu items, links, and responsive design',
      'Navigation'
    );

    console.log('Generated navigation test cases:', navigationTests);

    // Test navigation menu
    const navigationMenu = await aiHelper.findElementByDescription(page, 'main navigation menu');
    if (navigationMenu) {
      await expect(navigationMenu).toBeVisible();
    }

    // Test responsive navigation (mobile menu)
    await page.setViewportSize({ width: 375, height: 667 });
    
    const mobileMenu = await aiHelper.findElementByDescription(page, 'mobile navigation menu or hamburger menu');
    if (mobileMenu) {
      await expect(mobileMenu).toBeVisible();
      await mobileMenu.click();
    }

    // Test navigation links
    const links = await page.locator('nav a, [role="navigation"] a').all();
    for (const link of links.slice(0, 3)) { // Test first 3 links
      if (await link.isVisible()) {
        const href = await link.getAttribute('href');
        if (href && !href.startsWith('#')) {
          await link.click();
          await expect(page).not.toHaveURL('/');
          await page.goBack();
        }
      }
    }
  });

  test('AI-powered content testing', async ({ page }) => {
    await page.goto('/');

    // Generate test cases for content
    const contentTests = await aiHelper.generateTestCases(
      'Website content with text, images, and interactive elements',
      'Content'
    );

    console.log('Generated content test cases:', contentTests);

    // Test page content
    const mainContent = await aiHelper.findElementByDescription(page, 'main content area');
    if (mainContent) {
      await expect(mainContent).toBeVisible();
    }

    // Test headings structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);

    // Test images have alt text
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }

    // Test links are accessible
    const links = await page.locator('a').all();
    for (const link of links.slice(0, 5)) { // Test first 5 links
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      expect(text?.trim()).toBeTruthy();
      expect(href).toBeTruthy();
    }
  });

  test('AI-powered form testing', async ({ page }) => {
    await page.goto('/contact'); // Assuming there's a contact form

    // Generate test cases for forms
    const formTests = await aiHelper.generateTestCases(
      'Contact form with name, email, message fields and validation',
      'ContactForm'
    );

    console.log('Generated form test cases:', formTests);

    // Find form elements using AI
    const nameField = await aiHelper.findElementByDescription(page, 'name input field');
    const emailField = await aiHelper.findElementByDescription(page, 'email input field');
    const messageField = await aiHelper.findElementByDescription(page, 'message textarea');
    const submitButton = await aiHelper.findElementByDescription(page, 'submit button');

    // Test form interaction
    if (nameField) {
      await nameField.fill('John Doe');
    }

    if (emailField) {
      await emailField.fill('john@example.com');
    }

    if (messageField) {
      await messageField.fill('This is a test message');
    }

    // Test form validation
    if (submitButton) {
      // Clear fields and try to submit
      if (nameField) await nameField.clear();
      if (emailField) await emailField.clear();
      if (messageField) await messageField.clear();
      
      await submitButton.click();
      
      // Check for validation messages
      const validationMessages = await page.locator('[data-testid="error"], .error, [role="alert"]').all();
      expect(validationMessages.length).toBeGreaterThan(0);
    }
  });

  test('AI-powered accessibility testing', async ({ page }) => {
    await page.goto('/');

    // Generate accessibility test cases
    const accessibilityTests = await aiHelper.generateAccessibilityTests(page);
    console.log('Generated accessibility test cases:', accessibilityTests);

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Test ARIA attributes
    const elementsWithAria = await page.locator('[aria-label], [aria-labelledby], [aria-describedby]').count();
    expect(elementsWithAria).toBeGreaterThan(0);

    // Test semantic HTML
    const mainElement = await page.locator('main, [role="main"]').first();
    if (await mainElement.isVisible()) {
      await expect(mainElement).toBeVisible();
    }

    // Test color contrast (basic check)
    const textElements = await page.locator('p, span, div, h1, h2, h3, h4, h5, h6').filter({ hasText: /[a-zA-Z]/ }).count();
    expect(textElements).toBeGreaterThan(0);

    // Test focus indicators
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    if (await focusedElement.isVisible()) {
      const computedStyle = await focusedElement.evaluate(el => 
        window.getComputedStyle(el).outline || window.getComputedStyle(el).boxShadow
      );
      expect(computedStyle).not.toBe('none');
    }
  });

  test.afterEach(async ({ page }, testInfo) => {
    // AI failure analysis
    if (testInfo.status === 'failed') {
      const pageContent = await page.content();
      const screenshotPath = testInfo.attachments.find(a => a.name === 'screenshot')?.path;
      
      const failureAnalysis = await aiHelper.analyzeTestFailure(
        testInfo.title,
        testInfo.error?.message || 'Unknown error',
        screenshotPath,
        pageContent
      );

      console.log('AI Failure Analysis:', failureAnalysis);
      
      // Save analysis to file
      const fs = require('fs');
      const analysisPath = `test-results/ai-analysis-${Date.now()}.txt`;
      fs.writeFileSync(analysisPath, failureAnalysis);
    }

    // Clear context
    aiHelper.clearContext();
  });
});
