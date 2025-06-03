# Test info

- Name: Performance >> should not have console errors
- Location: F:\WhatsappAutomation\tests\e2e\navigation.spec.ts:174:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at C:\Users\BlackKnight\AppData\Local\ms-playwright\chromium_headless_shell-1169\chrome-win\headless_shell.exe
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
  158 |
  159 | test.describe('Performance', () => {
  160 |   test('should load within reasonable time', async ({ page }) => {
  161 |     const startTime = Date.now()
  162 |     
  163 |     await page.goto('/')
  164 |     
  165 |     // Wait for the page to be fully loaded
  166 |     await page.waitForLoadState('networkidle')
  167 |     
  168 |     const loadTime = Date.now() - startTime
  169 |     
  170 |     // Page should load within 5 seconds
  171 |     expect(loadTime).toBeLessThan(5000)
  172 |   })
  173 |
> 174 |   test('should not have console errors', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\BlackKnight\AppData\Local\ms-playwright\chromium_headless_shell-1169\chrome-win\headless_shell.exe
  175 |     const consoleErrors: string[] = []
  176 |     
  177 |     page.on('console', (msg) => {
  178 |       if (msg.type() === 'error') {
  179 |         consoleErrors.push(msg.text())
  180 |       }
  181 |     })
  182 |     
  183 |     await page.goto('/')
  184 |     await page.waitForLoadState('networkidle')
  185 |     
  186 |     // Filter out known acceptable errors (like network errors in development)
  187 |     const criticalErrors = consoleErrors.filter(error => 
  188 |       !error.includes('Failed to load resource') &&
  189 |       !error.includes('net::ERR_') &&
  190 |       !error.includes('favicon.ico')
  191 |     )
  192 |     
  193 |     expect(criticalErrors).toHaveLength(0)
  194 |   })
  195 | }) 
```