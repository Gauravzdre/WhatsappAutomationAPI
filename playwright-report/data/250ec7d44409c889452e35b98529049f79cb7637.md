# Test info

- Name: Navigation >> should handle responsive design
- Location: F:\WhatsappAutomation\tests\e2e\navigation.spec.ts:57:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at C:\Users\BlackKnight\AppData\Local\ms-playwright\firefox-1482\firefox\firefox.exe
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test'
   2 |
   3 | test.describe('Navigation', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Navigate to the home page before each test
   6 |     await page.goto('/')
   7 |   })
   8 |
   9 |   test('should display the main navigation', async ({ page }) => {
   10 |     // Check if the main navigation elements are visible
   11 |     await expect(page.locator('nav')).toBeVisible()
   12 |     
   13 |     // Check for key navigation items
   14 |     await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
   15 |     await expect(page.getByRole('link', { name: /templates/i })).toBeVisible()
   16 |     await expect(page.getByRole('link', { name: /teams/i })).toBeVisible()
   17 |   })
   18 |
   19 |   test('should navigate to templates page', async ({ page }) => {
   20 |     // Click on templates link
   21 |     await page.getByRole('link', { name: /templates/i }).click()
   22 |     
   23 |     // Wait for navigation and check URL
   24 |     await expect(page).toHaveURL(/.*\/templates/)
   25 |     
   26 |     // Check if templates page content is loaded
   27 |     await expect(page.getByText('Template Library')).toBeVisible()
   28 |   })
   29 |
   30 |   test('should navigate to teams page', async ({ page }) => {
   31 |     // Click on teams link
   32 |     await page.getByRole('link', { name: /teams/i }).click()
   33 |     
   34 |     // Wait for navigation and check URL
   35 |     await expect(page).toHaveURL(/.*\/teams/)
   36 |     
   37 |     // Check if teams page content is loaded
   38 |     await expect(page.getByText('Team Collaboration')).toBeVisible()
   39 |   })
   40 |
   41 |   test('should work on mobile viewport', async ({ page }) => {
   42 |     // Set mobile viewport
   43 |     await page.setViewportSize({ width: 375, height: 667 })
   44 |     
   45 |     // Check if mobile navigation is working
   46 |     await expect(page.locator('nav')).toBeVisible()
   47 |     
   48 |     // On mobile, navigation might be in a hamburger menu
   49 |     const mobileMenuButton = page.locator('[aria-label="Menu"]').or(page.locator('button:has-text("Menu")'))
   50 |     
   51 |     if (await mobileMenuButton.isVisible()) {
   52 |       await mobileMenuButton.click()
   53 |       await expect(page.getByRole('link', { name: /templates/i })).toBeVisible()
   54 |     }
   55 |   })
   56 |
>  57 |   test('should handle responsive design', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\BlackKnight\AppData\Local\ms-playwright\firefox-1482\firefox\firefox.exe
   58 |     // Test different viewport sizes
   59 |     const viewports = [
   60 |       { width: 320, height: 568 }, // iPhone SE
   61 |       { width: 768, height: 1024 }, // iPad
   62 |       { width: 1920, height: 1080 }, // Desktop
   63 |     ]
   64 |
   65 |     for (const viewport of viewports) {
   66 |       await page.setViewportSize(viewport)
   67 |       
   68 |       // Check if navigation is still functional
   69 |       await expect(page.locator('nav')).toBeVisible()
   70 |       
   71 |       // Check if content is properly displayed
   72 |       await expect(page.getByText(/WhatsApp AI Automation/i)).toBeVisible()
   73 |     }
   74 |   })
   75 | })
   76 |
   77 | test.describe('Dashboard', () => {
   78 |   test('should display dashboard content', async ({ page }) => {
   79 |     await page.goto('/')
   80 |     
   81 |     // Check for dashboard elements
   82 |     await expect(page.getByText(/dashboard/i)).toBeVisible()
   83 |     
   84 |     // Check for quick actions or cards
   85 |     const quickActions = page.locator('[data-testid="quick-actions"]').or(
   86 |       page.locator('.quick-actions')
   87 |     ).or(
   88 |       page.getByText(/quick actions/i)
   89 |     )
   90 |     
   91 |     // At least one of these should be visible
   92 |     const hasQuickActions = await quickActions.first().isVisible().catch(() => false)
   93 |     const hasCards = await page.locator('.card, [data-testid*="card"]').first().isVisible().catch(() => false)
   94 |     
   95 |     expect(hasQuickActions || hasCards).toBeTruthy()
   96 |   })
   97 |
   98 |   test('should handle loading states', async ({ page }) => {
   99 |     await page.goto('/')
  100 |     
  101 |     // Check if page loads without errors
  102 |     await expect(page).not.toHaveTitle(/error/i)
  103 |     
  104 |     // Wait for any loading indicators to disappear
  105 |     const loadingIndicator = page.locator('.loading, [data-testid="loading"], .spinner')
  106 |     if (await loadingIndicator.isVisible()) {
  107 |       await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 })
  108 |     }
  109 |   })
  110 | })
  111 |
  112 | test.describe('Accessibility', () => {
  113 |   test('should have proper heading structure', async ({ page }) => {
  114 |     await page.goto('/')
  115 |     
  116 |     // Check for proper heading hierarchy
  117 |     const h1 = page.locator('h1')
  118 |     await expect(h1).toBeVisible()
  119 |     
  120 |     // Should have at least one h1
  121 |     expect(await h1.count()).toBeGreaterThan(0)
  122 |   })
  123 |
  124 |   test('should have keyboard navigation', async ({ page }) => {
  125 |     await page.goto('/')
  126 |     
  127 |     // Test tab navigation
  128 |     await page.keyboard.press('Tab')
  129 |     
  130 |     // Check if focus is visible on interactive elements
  131 |     const focusedElement = page.locator(':focus')
  132 |     await expect(focusedElement).toBeVisible()
  133 |   })
  134 |
  135 |   test('should have proper ARIA labels', async ({ page }) => {
  136 |     await page.goto('/')
  137 |     
  138 |     // Check for navigation landmarks
  139 |     const nav = page.locator('nav')
  140 |     if (await nav.isVisible()) {
  141 |       // Navigation should be accessible
  142 |       await expect(nav).toBeVisible()
  143 |     }
  144 |     
  145 |     // Check for buttons with accessible names
  146 |     const buttons = page.locator('button')
  147 |     const buttonCount = await buttons.count()
  148 |     
  149 |     if (buttonCount > 0) {
  150 |       // At least some buttons should have accessible names
  151 |       const buttonsWithText = await buttons.filter({ hasText: /.+/ }).count()
  152 |       const buttonsWithAriaLabel = await buttons.filter({ has: page.locator('[aria-label]') }).count()
  153 |       
  154 |       expect(buttonsWithText + buttonsWithAriaLabel).toBeGreaterThan(0)
  155 |     }
  156 |   })
  157 | })
```