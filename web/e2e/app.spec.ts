import { test, expect } from '@playwright/test'

test.describe('Sallie Studio Web Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the main page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Sallie Studio/)
    
    // Check main elements are visible
    await expect(page.getByRole('region', { name: 'Sallie avatar' })).toBeVisible()
    await expect(page.getByText('Sallie')).toBeVisible()
  })

  test('should show connection status', async ({ page }) => {
    // Check initial connection status
    await expect(page.getByText('Connecting...')).toBeVisible()
    
    // Wait for connection to establish (mocked)
    await expect(page.getByText('Online')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to different sections', async ({ page }) => {
    // Test navigation to dashboard
    await page.getByRole('link', { name: /dashboard/i }).click()
    await expect(page).toHaveURL(/dashboard/)
    
    // Test navigation to conversations
    await page.getByRole('link', { name: /conversations/i }).click()
    await expect(page).toHaveURL(/conversations/)
    
    // Test navigation to settings
    await page.getByRole('link', { name: /settings/i }).click()
    await expect(page).toHaveURL(/settings/)
  })

  test('should handle user authentication flow', async ({ page }) => {
    // Click login button
    await page.getByRole('button', { name: /login/i }).click()
    
    // Fill login form
    await page.getByLabel(/email/i).fill('test@sallie.com')
    await page.getByLabel(/password/i).fill('testpassword123')
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/)
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('should create and manage conversations', async ({ page }) => {
    // Navigate to conversations
    await page.getByRole('link', { name: /conversations/i }).click()
    
    // Create new conversation
    await page.getByRole('button', { name: /new conversation/i }).click()
    
    // Type a message
    await page.getByPlaceholder(/type your message/i).fill('Hello Sallie!')
    
    // Send message
    await page.getByRole('button', { name: /send/i }).click()
    
    // Verify message appears
    await expect(page.getByText('Hello Sallie!')).toBeVisible()
    
    // Wait for Sallie's response (mocked)
    await expect(page.getByText(/hello/i)).toBeVisible({ timeout: 3000 })
  })

  test('should handle avatar customization', async ({ page }) => {
    // Navigate to avatar section
    await page.getByRole('link', { name: /avatar/i }).click()
    
    // Customize avatar appearance
    await page.getByRole('button', { name: /customize/i }).click()
    
    // Change skin tone
    await page.getByLabel(/skin tone/i).selectOption('medium')
    
    // Change hair color
    await page.getByLabel(/hair color/i).selectOption('brown')
    
    // Save changes
    await page.getByRole('button', { name: /save/i }).click()
    
    // Verify success message
    await expect(page.getByText(/avatar updated/i)).toBeVisible()
  })

  test('should handle settings management', async ({ page }) => {
    // Navigate to settings
    await page.getByRole('link', { name: /settings/i }).click()
    
    // Toggle theme
    await page.getByLabel(/dark mode/i).check()
    
    // Enable notifications
    await page.getByLabel(/notifications/i).check()
    
    // Save settings
    await page.getByRole('button', { name: /save settings/i }).click()
    
    // Verify settings saved
    await expect(page.getByText(/settings saved/i)).toBeVisible()
    
    // Verify theme change
    await expect(page.locator('body')).toHaveClass(/dark/)
  })

  test('should handle accessibility features', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
    
    // Test accessibility menu
    await page.getByRole('button', { name: /accessibility/i }).click()
    
    // Enable high contrast
    await page.getByLabel(/high contrast/i).check()
    
    // Verify high contrast mode
    await expect(page.locator('html')).toHaveClass(/high-contrast/)
    
    // Test screen reader announcements
    const announcements = page.locator('[aria-live="polite"]')
    await expect(announcements).toBeAttached()
  })

  test('should handle error states gracefully', async ({ page }) => {
    // Navigate to error page
    await page.goto('/error')
    
    // Should show error message
    await expect(page.getByText(/something went wrong/i)).toBeVisible()
    
    // Should provide recovery options
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /go home/i })).toBeVisible()
  })

  test('should be responsive on different viewports', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByRole('region', { name: 'Sallie avatar' })).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByRole('region', { name: 'Sallie avatar' })).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.getByRole('region', { name: 'Sallie avatar' })).toBeVisible()
  })
})

test.describe('Performance Tests', () => {
  test('should load within performance budgets', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const vitals = {
            lcp: 0,
            fid: 0,
            cls: 0,
          }
          
          entries.forEach((entry) => {
            if (entry.name === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime
            }
            if (entry.name === 'first-input') {
              vitals.fid = entry.processingStart - entry.startTime
            }
            if (entry.name === 'layout-shift') {
              vitals.cls += entry.value
            }
          })
          
          resolve(vitals)
        })
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
      })
    })
    
    // Check LCP (Largest Contentful Paint) < 2.5s
    expect(metrics.lcp).toBeLessThan(2500)
    
    // Check FID (First Input Delay) < 100ms
    expect(metrics.fid).toBeLessThan(100)
    
    // Check CLS (Cumulative Layout Shift) < 0.1
    expect(metrics.cls).toBeLessThan(0.1)
  })
})
