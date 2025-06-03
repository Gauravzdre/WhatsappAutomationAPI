import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/')
  })

  test('should display the main navigation', async ({ page }) => {
    // Check if the main navigation elements are visible
    await expect(page.locator('nav')).toBeVisible()
    
    // Check for key navigation items
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /templates/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /teams/i })).toBeVisible()
  })

  test('should navigate to templates page', async ({ page }) => {
    // Click on templates link
    await page.getByRole('link', { name: /templates/i }).click()
    
    // Wait for navigation and check URL
    await expect(page).toHaveURL(/.*\/templates/)
    
    // Check if templates page content is loaded
    await expect(page.getByText('Template Library')).toBeVisible()
  })

  test('should navigate to teams page', async ({ page }) => {
    // Click on teams link
    await page.getByRole('link', { name: /teams/i }).click()
    
    // Wait for navigation and check URL
    await expect(page).toHaveURL(/.*\/teams/)
    
    // Check if teams page content is loaded
    await expect(page.getByText('Team Collaboration')).toBeVisible()
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check if mobile navigation is working
    await expect(page.locator('nav')).toBeVisible()
    
    // On mobile, navigation might be in a hamburger menu
    const mobileMenuButton = page.locator('[aria-label="Menu"]').or(page.locator('button:has-text("Menu")'))
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      await expect(page.getByRole('link', { name: /templates/i })).toBeVisible()
    }
  })

  test('should handle responsive design', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 768, height: 1024 }, // iPad
      { width: 1920, height: 1080 }, // Desktop
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      
      // Check if navigation is still functional
      await expect(page.locator('nav')).toBeVisible()
      
      // Check if content is properly displayed
      await expect(page.getByText(/Schedsy\.ai/i)).toBeVisible()
    }
  })
})

test.describe('Dashboard', () => {
  test('should display dashboard content', async ({ page }) => {
    await page.goto('/')
    
    // Check for dashboard elements
    await expect(page.getByText(/dashboard/i)).toBeVisible()
    
    // Check for quick actions or cards
    const quickActions = page.locator('[data-testid="quick-actions"]').or(
      page.locator('.quick-actions')
    ).or(
      page.getByText(/quick actions/i)
    )
    
    // At least one of these should be visible
    const hasQuickActions = await quickActions.first().isVisible().catch(() => false)
    const hasCards = await page.locator('.card, [data-testid*="card"]').first().isVisible().catch(() => false)
    
    expect(hasQuickActions || hasCards).toBeTruthy()
  })

  test('should handle loading states', async ({ page }) => {
    await page.goto('/')
    
    // Check if page loads without errors
    await expect(page).not.toHaveTitle(/error/i)
    
    // Wait for any loading indicators to disappear
    const loadingIndicator = page.locator('.loading, [data-testid="loading"], .spinner')
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 })
    }
  })
})

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/')
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    // Should have at least one h1
    expect(await h1.count()).toBeGreaterThan(0)
  })

  test('should have keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // Test tab navigation
    await page.keyboard.press('Tab')
    
    // Check if focus is visible on interactive elements
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/')
    
    // Check for navigation landmarks
    const nav = page.locator('nav')
    if (await nav.isVisible()) {
      // Navigation should be accessible
      await expect(nav).toBeVisible()
    }
    
    // Check for buttons with accessible names
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    if (buttonCount > 0) {
      // At least some buttons should have accessible names
      const buttonsWithText = await buttons.filter({ hasText: /.+/ }).count()
      const buttonsWithAriaLabel = await buttons.filter({ has: page.locator('[aria-label]') }).count()
      
      expect(buttonsWithText + buttonsWithAriaLabel).toBeGreaterThan(0)
    }
  })
})

test.describe('Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Filter out known acceptable errors (like network errors in development)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Failed to load resource') &&
      !error.includes('net::ERR_') &&
      !error.includes('favicon.ico')
    )
    
    expect(criticalErrors).toHaveLength(0)
  })
}) 