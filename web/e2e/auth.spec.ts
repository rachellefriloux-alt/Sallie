import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should show login form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Welcome Back')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Please enter a valid email')).toBeVisible()
  })

  test('should validate password length', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', '123')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Invalid email or password')).toBeVisible()
  })

  test('should login successfully and redirect to dashboard', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Wait for navigation
    await page.waitForURL('/dashboard')
    
    // Verify user is logged in
    await expect(page.locator('text=Welcome, Test User')).toBeVisible()
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('should show registration form', async ({ page }) => {
    await page.click('text=Create Account')
    
    await expect(page.locator('h1')).toContainText('Create Account')
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible()
  })

  test('should validate password confirmation', async ({ page }) => {
    await page.click('text=Create Account')
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'differentpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Passwords do not match')).toBeVisible()
  })

  test('should register successfully', async ({ page }) => {
    await page.click('text=Create Account')
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[type="email"]', 'newuser@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'password123')
    await page.click('button[type="submit"]')

    // Wait for navigation
    await page.waitForURL('/dashboard')
    
    // Verify user is registered and logged in
    await expect(page.locator('text=Welcome, Test User')).toBeVisible()
  })

  test('should handle 2FA setup', async ({ page }) => {
    // Login with 2FA enabled account
    await page.fill('input[type="email"]', '2fa@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should show 2FA input
    await expect(page.locator('text=Enter 2FA Code')).toBeVisible()
    await expect(page.locator('input[name="2fa-code"]')).toBeVisible()
    
    // Enter valid 2FA code
    await page.fill('input[name="2fa-code"]', '123456')
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await page.waitForURL('/dashboard')
  })

  test('should handle logout', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Logout
    await page.click('[data-testid="user-menu"]')
    await page.click('text=Logout')

    // Should redirect to login
    await page.waitForURL('/login')
    await expect(page.locator('h1')).toContainText('Welcome Back')
  })

  test('should handle session expiration', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Simulate session expiration by clearing cookies
    await page.context().clearCookies()

    // Try to access protected route
    await page.goto('/dashboard')

    // Should redirect to login with session expired message
    await page.waitForURL('/login')
    await expect(page.locator('text=Your session has expired')).toBeVisible()
  })

  test('should handle biometric authentication', async ({ page }) => {
    // Mock WebAuthn API
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, 'credentials', {
        value: {
          create: async () => ({
            id: 'biometric-id',
            rawId: new Uint8Array([1, 2, 3, 4]),
            response: {
              clientDataJSON: '{}',
              attestationObject: new Uint8Array([1, 2, 3, 4]),
            },
            type: 'public-key',
          }),
          get: async () => ({
            id: 'biometric-id',
            rawId: new Uint8Array([1, 2, 3, 4]),
            response: {
              clientDataJSON: '{}',
              authenticatorData: new Uint8Array([1, 2, 3, 4]),
              signature: new Uint8Array([1, 2, 3, 4]),
              userHandle: new Uint8Array([1, 2, 3, 4]),
            },
            type: 'public-key',
          }),
        },
        writable: true,
      })
    })

    await page.goto('/login')
    await page.click('text=Use Biometric Authentication')

    // Should show biometric prompt
    await expect(page.locator('text=Use your fingerprint or face to sign in')).toBeVisible()
    
    // Simulate successful biometric authentication
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await page.waitForURL('/dashboard')
  })

  test('should handle password reset', async ({ page }) => {
    await page.click('text=Forgot Password?')
    
    await expect(page.locator('h1')).toContainText('Reset Password')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Password reset link sent')).toBeVisible()
  })

  test('should handle account lockout after failed attempts', async ({ page }) => {
    // Make multiple failed login attempts
    for (let i = 0; i < 5; i++) {
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(1000)
    }

    // Should show account locked message
    await expect(page.locator('text=Account locked due to too many failed attempts')).toBeVisible()
    await expect(page.locator('text=Please try again later')).toBeVisible()
  })
})
