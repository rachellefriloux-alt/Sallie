import { injectAxe, checkA11y } from 'axe-playwright'
import { test, expect } from '@playwright/test'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page)
    await page.goto('/')
  })

  test('should pass accessibility checks on main page', async ({ page }) => {
    await checkA11y(page)
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    
    // Check that there's at least one h1
    const h1s = await page.locator('h1').all()
    expect(h1s.length).toBeGreaterThan(0)
    
    // Check heading levels don't skip (e.g., h1 followed by h3 without h2)
    for (let i = 0; i < headings.length - 1; i++) {
      const currentLevel = parseInt(await headings[i].evaluate(el => el.tagName.charAt(1)))
      const nextLevel = parseInt(await headings[i + 1].evaluate(el => el.tagName.charAt(1)))
      
      // Heading levels shouldn't skip more than one level
      expect(nextLevel - currentLevel).toBeLessThanOrEqual(1)
    }
  })

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check interactive elements have accessible names
    const buttons = await page.locator('button').all()
    for (const button of buttons) {
      const accessibleName = await button.getAttribute('aria-label') || 
                           await button.getAttribute('title') || 
                           await button.textContent()
      expect(accessibleName?.trim()).toBeTruthy()
    }

    // Check form inputs have labels
    const inputs = await page.locator('input, select, textarea').all()
    for (const input of inputs) {
      const hasLabel = await input.evaluate(el => {
        const id = el.getAttribute('id')
        const ariaLabel = el.getAttribute('aria-label')
        const ariaLabelledBy = el.getAttribute('aria-labelledby')
        
        return ariaLabel || 
               ariaLabelledBy || 
               (id && document.querySelector(`label[for="${id}"]`)) ||
               el.closest('label')
      })
      expect(hasLabel).toBeTruthy()
    }
  })

  test('should have sufficient color contrast', async ({ page }) => {
    // Check specific elements for contrast
    await checkA11y(page, {
      rules: {
        'color-contrast': {
          enabled: true,
          options: {
            // No contrast ratio is provided, so default WCAG AA will be used
          }
        }
      }
    })
  })

  test('should be keyboard navigable', async ({ page }) => {
    // Test Tab navigation
    await page.keyboard.press('Tab')
    
    let focusedElement = await page.locator(':focus')
    expect(await focusedElement.isVisible()).toBeTruthy()
    
    // Test that all interactive elements are focusable
    const interactiveElements = await page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])').all()
    
    for (const element of interactiveElements) {
      await element.focus()
      const isFocused = await element.evaluate(el => document.activeElement === el)
      expect(isFocused).toBeTruthy()
    }
  })

  test('should have proper focus management', async ({ page }) => {
    // Test focus stays within modal when opened
    await page.getByRole('button', { name: /settings/i }).click()
    
    // Check that focus is trapped in modal
    const modal = await page.locator('[role="dialog"]').first()
    if (await modal.isVisible()) {
      // Test Tab key cycles within modal
      const focusableElements = await modal.locator('button, input, select, textarea, [tabindex]:not([tabindex="-1"])').all()
      
      if (focusableElements.length > 0) {
        await page.keyboard.press('Tab')
        let focusedInModal = await page.locator(':focus').evaluate(el => 
          el.closest('[role="dialog"]') !== null
        )
        expect(focusedInModal).toBeTruthy()
      }
    }
  })

  test('should have proper alt text for images', async ({ page }) => {
    const images = await page.locator('img').all()
    
    for (const image of images) {
      const alt = await image.getAttribute('alt')
      const role = await image.getAttribute('role')
      
      // Images should have alt text unless they're decorative
      if (role !== 'presentation') {
        expect(alt).toBeTruthy()
      }
    }
  })

  test('should have proper link text', async ({ page }) => {
    const links = await page.locator('a').all()
    
    for (const link of links) {
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      const title = await link.getAttribute('title')
      
      // Links should have descriptive text
      const accessibleText = text?.trim() || ariaLabel || title
      expect(accessibleText?.trim()).toBeTruthy()
      expect(accessibleText?.length).toBeGreaterThan(0)
    }
  })

  test('should have proper table accessibility', async ({ page }) => {
    const tables = await page.locator('table').all()
    
    for (const table of tables) {
      // Check for table headers
      const headers = await table.locator('th').all()
      if (headers.length > 0) {
        // Check headers have scope attribute
        for (const header of headers) {
          const scope = await header.getAttribute('scope')
          expect(['row', 'col', 'rowgroup', 'colgroup']).toContain(scope)
        }
      }
      
      // Check for table caption
      const caption = await table.locator('caption').first()
      if (await caption.isVisible()) {
        const captionText = await caption.textContent()
        expect(captionText?.trim()).toBeTruthy()
      }
    }
  })

  test('should have proper form accessibility', async ({ page }) => {
    const forms = await page.locator('form').all()
    
    for (const form of forms) {
      // Check form has submit button
      const submitButtons = await form.locator('button[type="submit"], input[type="submit"]').all()
      expect(submitButtons.length).toBeGreaterThan(0)
      
      // Check form fields have proper validation
      const requiredFields = await form.locator('[required]').all()
      for (const field of requiredFields) {
        const ariaRequired = await field.getAttribute('aria-required')
        expect(ariaRequired).toBe('true')
      }
    }
  })

  test('should have proper landmark roles', async ({ page }) => {
    // Check for main landmark
    const main = await page.locator('main, [role="main"]').first()
    expect(await main.isVisible()).toBeTruthy()
    
    // Check for navigation landmarks
    const nav = await page.locator('nav, [role="navigation"]').first()
    expect(await nav.isVisible()).toBeTruthy()
    
    // Check for banner/header
    const header = await page.locator('header, [role="banner"]').first()
    expect(await header.isVisible()).toBeTruthy()
    
    // Check for contentinfo/footer
    const footer = await page.locator('footer, [role="contentinfo"]').first()
    expect(await footer.isVisible()).toBeTruthy()
  })

  test('should handle screen reader announcements', async ({ page }) => {
    // Check for live regions
    const liveRegions = await page.locator('[aria-live]').all()
    
    for (const region of liveRegions) {
      const politeness = await region.getAttribute('aria-live')
      expect(['polite', 'assertive', 'off']).toContain(politeness)
    }
    
    // Test dynamic content announcements
    await page.getByRole('button', { name: /send/i }).click()
    
    // Check that status messages are announced
    const statusRegions = await page.locator('[role="status"], [aria-live="polite"]').all()
    for (const region of statusRegions) {
      const content = await region.textContent()
      if (content?.trim()) {
        expect(content.trim().length).toBeGreaterThan(0)
      }
    }
  })

  test('should have proper skip links', async ({ page }) => {
    // Check for skip links
    const skipLinks = await page.locator('a[href^="#"]').all()
    
    for (const link of skipLinks) {
      const text = await link.textContent()
      if (text?.toLowerCase().includes('skip')) {
        const href = await link.getAttribute('href')
        const targetId = href?.replace('#', '')
        
        if (targetId) {
          const target = await page.locator(`#${targetId}`).first()
          expect(await target.isVisible()).toBeTruthy()
        }
      }
    }
  })

  test('should have proper error handling accessibility', async ({ page }) => {
    // Navigate to a page with potential errors
    await page.goto('/login')
    
    // Try to submit form without required fields
    await page.getByRole('button', { name: /login/i }).click()
    
    // Check for error messages
    const errorMessages = await page.locator('[role="alert"], .error, [aria-invalid="true"]').all()
    
    for (const error of errorMessages) {
      const text = await error.textContent()
      expect(text?.trim()).toBeTruthy()
      
      // Check error is associated with form field
      const ariaDescribedBy = await error.getAttribute('id')
      if (ariaDescribedBy) {
        const field = await page.locator(`[aria-describedby="${ariaDescribedBy}"]`).first()
        expect(await field.isVisible()).toBeTruthy()
      }
    }
  })
})
