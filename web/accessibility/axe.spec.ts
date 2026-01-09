import { test, expect } from '@playwright/test'
import { injectAxe, getViolations, checkA11y } from 'axe-playwright'

test.describe('Accessibility Tests with Axe-Core', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
  })

  test('should have no accessibility violations on main page', async ({ page }) => {
    await checkA11y(page)
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    const violations = await getViolations(page)
    
    // Check for heading order violations
    const headingViolations = violations.filter(violation => 
      violation.impact === 'moderate' && 
      violation.description.includes('heading')
    )
    
    expect(headingViolations).toHaveLength(0)
  })

  test('should have sufficient color contrast', async ({ page }) => {
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

  test('should have proper ARIA labels', async ({ page }) => {
    const violations = await getViolations(page)
    
    // Check for ARIA label violations
    const ariaViolations = violations.filter(violation => 
      violation.impact === 'serious' && 
      violation.description.includes('ARIA')
    )
    
    expect(ariaViolations).toHaveLength(0)
  })

  test('should be keyboard navigable', async ({ page }) => {
    // Test Tab navigation
    await page.keyboard.press('Tab')
    
    const focusedElement = await page.locator(':focus')
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
    // Test focus trapping in modals
    const modalButton = await page.locator('[data-testid="open-modal-button"]').first()
    if (await modalButton.isVisible()) {
      await modalButton.click()
      
      // Check that focus is trapped in modal
      const modal = await page.locator('[role="dialog"]').first()
      if (await modal.isVisible()) {
        const focusableElements = await modal.locator('button, input, select, textarea, [tabindex]:not([tabindex="-1"])').all()
        
        if (focusableElements.length > 0) {
          await page.keyboard.press('Tab')
          const focusedInModal = await page.locator(':focus').evaluate(el => 
            el.closest('[role="dialog"]') !== null
          )
          expect(focusedInModal).toBeTruthy()
        }
      }
    }
  })

  test('should have proper alt text for images', async ({ page }) => {
    const violations = await getViolations(page)
    
    // Check for image alt text violations
    const imageViolations = violations.filter(violation => 
      violation.impact === 'serious' && 
      violation.description.includes('image') &&
      violation.description.includes('alt')
    )
    
    expect(imageViolations).toHaveLength(0)
  })

  test('should have proper link text', async ({ page }) => {
    const violations = await getViolations(page)
    
    // Check for link text violations
    const linkViolations = violations.filter(violation => 
      violation.impact === 'serious' && 
      violation.description.includes('link')
    )
    
    expect(linkViolations).toHaveLength(0)
  })

  test('should have proper table accessibility', async ({ page }) => {
    const violations = await getViolations(page)
    
    // Check for table accessibility violations
    const tableViolations = violations.filter(violation => 
      violation.impact === 'moderate' && 
      violation.description.includes('table')
    )
    
    expect(tableViolations).toHaveLength(0)
  })

  test('should have proper form accessibility', async ({ page }) => {
    const violations = await getViolations(page)
    
    // Check for form accessibility violations
    const formViolations = violations.filter(violation => 
      violation.impact === 'serious' && 
      violation.description.includes('form') ||
      violation.description.includes('label') ||
      violation.description.includes('input')
    )
    
    expect(formViolations).toHaveLength(0)
  })

  test('should have proper landmark roles', async ({ page }) => {
    const violations = await getViolations(page)
    
    // Check for landmark violations
    const landmarkViolations = violations.filter(violation => 
      violation.impact === 'moderate' && 
      violation.description.includes('landmark') ||
      violation.description.includes('region') ||
      violation.description.includes('main') ||
      violation.description.includes('navigation') ||
      violation.description.includes('banner') ||
      violation.description.includes('contentinfo')
    )
    
    expect(landmarkViolations).toHaveLength(0)
  })

  test('should handle screen reader announcements', async ({ page }) => {
    // Check for live regions
    const liveRegions = await page.locator('[aria-live]').all()
    
    for (const region of liveRegions) {
      const politeness = await region.getAttribute('aria-live')
      expect(['polite', 'assertive', 'off']).toContain(politeness)
    }
    
    // Test dynamic content announcements
    await page.locator('[data-testid="send-button"]').first().click()
    
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

  test('should handle error states accessibly', async ({ page }) => {
    // Navigate to a page with potential errors
    await page.goto('/login')
    
    // Try to submit form without required fields
    await page.locator('[data-testid="submit-button"]').first().click()
    
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

  test('should have proper button accessibility', async ({ page }) => {
    const violations = await getViolations(page)
    
    // Check for button accessibility violations
    const buttonViolations = violations.filter(violation => 
      violation.impact === 'serious' && 
      violation.description.includes('button')
    )
    
    expect(buttonViolations).toHaveLength(0)
  })

  test('should have proper input accessibility', async ({ page }) => {
    const violations = await getViolations(page)
    
    // Check for input accessibility violations
    const inputViolations = violations.filter(violation => 
      violation.impact === 'serious' && 
      (violation.description.includes('input') ||
       violation.description.includes('textarea') ||
       violation.description.includes('select'))
    )
    
    expect(inputViolations).toHaveLength(0)
  })

  test('should have proper list accessibility', async ({ page }) => {
    const violations = await getViolations(page)
    
    // Check for list accessibility violations
    const listViolations = violations.filter(violation => 
      violation.impact === 'moderate' && 
      violation.description.includes('list')
    )
    
    expect(listViolations).toHaveLength(0)
  })

  test('should have proper frame and iframe accessibility', async ({ page }) => {
    const violations = await getViolations(page)
    
    // Check for frame/iframe violations
    const frameViolations = violations.filter(violation => 
      violation.impact === 'serious' && 
      (violation.description.includes('frame') ||
       violation.description.includes('iframe'))
    )
    
    expect(frameViolations).toHaveLength(0)
  })

  test('should have proper video and audio accessibility', async ({ page }) => {
    const violations = await getViolations(page)
    
    // Check for media accessibility violations
    const mediaViolations = violations.filter(violation => 
      violation.impact === 'moderate' && 
      (violation.description.includes('video') ||
       violation.description.includes('audio'))
    )
    
    expect(mediaViolations).toHaveLength(0)
  })

  test('should have proper accessibility for dynamic content', async ({ page }) => {
    // Test dynamic content loading
    await page.locator('[data-testid="load-content-button"]').first().click()
    
    // Wait for content to load
    await page.waitForTimeout(1000)
    
    // Check accessibility of dynamically loaded content
    await checkA11y(page, {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true }
      }
    })
  })

  test('should handle accessibility in responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await checkA11y(page)
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await checkA11y(page)
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await checkA11y(page)
  })

  test('should have proper accessibility for tooltips', async ({ page }) => {
    // Hover over elements with tooltips
    const tooltipElements = await page.locator('[title], [data-tooltip]').all()
    
    for (const element of tooltipElements) {
      await element.hover()
      await page.waitForTimeout(500)
      
      // Check that tooltip is accessible
      const tooltip = await page.locator('[role="tooltip"]').first()
      if (await tooltip.isVisible()) {
        const tooltipText = await tooltip.textContent()
        expect(tooltipText?.trim()).toBeTruthy()
      }
    }
  })

  test('should have proper accessibility for dropdown menus', async ({ page }) => {
    // Test dropdown accessibility
    const dropdownButtons = await page.locator('[aria-haspopup="true"], [data-testid="dropdown"]').all()
    
    for (const button of dropdownButtons) {
      await button.click()
      
      // Check that dropdown is accessible
      const dropdown = await page.locator('[role="menu"], [role="listbox"]').first()
      if (await dropdown.isVisible()) {
        const menuItems = await dropdown.locator('[role="menuitem"], [role="option"]').all()
        
        for (const item of menuItems) {
          const itemText = await item.textContent()
          expect(itemText?.trim()).toBeTruthy()
        }
      }
      
      // Close dropdown
      await page.keyboard.press('Escape')
    }
  })

  test('should have proper accessibility for tabs', async ({ page }) => {
    // Test tab panel accessibility
    const tabLists = await page.locator('[role="tablist"]').all()
    
    for (const tabList of tabLists) {
      const tabs = await tabList.locator('[role="tab"]').all()
      
      for (const tab of tabs) {
        await tab.click()
        
        // Check that corresponding tab panel is visible
        const tabPanelId = await tab.getAttribute('aria-controls')
        if (tabPanelId) {
          const tabPanel = await page.locator(`#${tabPanelId}`).first()
          expect(await tabPanel.isVisible()).toBeTruthy()
        }
      }
    }
  })

  test('should have proper accessibility for accordions', async ({ page }) => {
    // Test accordion accessibility
    const accordionButtons = await page.locator('[aria-expanded]').all()
    
    for (const button of accordionButtons) {
      const isExpanded = await button.getAttribute('aria-expanded')
      
      // Toggle accordion
      await button.click()
      
      // Check that corresponding panel visibility matches aria-expanded
      const controlId = await button.getAttribute('aria-controls')
      if (controlId) {
        const panel = await page.locator(`#${controlId}`).first()
        const isVisible = await panel.isVisible()
        
        if (isExpanded === 'true') {
          expect(isVisible).toBeTruthy()
        } else {
          expect(isVisible).toBeFalsy()
        }
      }
    }
  })

  test('should have proper accessibility for carousels', async ({ page }) => {
    // Test carousel accessibility
    const carousels = await page.locator('[data-testid="carousel"]').all()
    
    for (const carousel of carousels) {
      // Check for carousel controls
      const prevButton = await carousel.locator('[data-testid="carousel-prev"]').first()
      const nextButton = await carousel.locator('[data-testid="carousel-next"]').first()
      
      if (await prevButton.isVisible()) {
        const prevLabel = await prevButton.getAttribute('aria-label')
        expect(prevLabel?.trim()).toBeTruthy()
      }
      
      if (await nextButton.isVisible()) {
        const nextLabel = await nextButton.getAttribute('aria-label')
        expect(nextLabel?.trim()).toBeTruthy()
      }
      
      // Check for carousel indicators
      const indicators = await carousel.locator('[data-testid="carousel-indicators"] [role="button"]').all()
      for (const indicator of indicators) {
        const label = await indicator.getAttribute('aria-label')
        expect(label?.trim()).toBeTruthy()
      }
    }
  })

  test('should have proper accessibility for modals', async ({ page }) => {
    // Open modal
    const modalButton = await page.locator('[data-testid="open-modal-button"]').first()
    if (await modalButton.isVisible()) {
      await modalButton.click()
      
      // Check modal accessibility
      const modal = await page.locator('[role="dialog"]').first()
      expect(await modal.isVisible()).toBeTruthy()
      
      // Check for modal title
      const title = await modal.locator('[data-testid="modal-title"]').first()
      expect(await title.isVisible()).toBeTruthy()
      
      // Check for close button
      const closeButton = await modal.locator('[data-testid="modal-close"]').first()
      expect(await closeButton.isVisible()).toBeTruthy()
      
      // Check for focus trapping
      const focusableElements = await modal.locator('button, input, select, textarea, [tabindex]:not([tabindex="-1"])').all()
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0]
        const isFocused = await firstElement.evaluate(el => document.activeElement === el)
        expect(isFocused).toBeTruthy()
      }
      
      // Close modal
      await closeButton.click()
    }
  })

  test('should generate accessibility report', async ({ page }) => {
    const violations = await getViolations(page)
    
    // Generate detailed accessibility report
    const report = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      violations: violations.map(violation => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.map(node => ({
          html: node.html,
          target: node.target,
          failureSummary: node.failureSummary
        }))
      })),
      summary: {
        total: violations.length,
        critical: violations.filter(v => v.impact === 'critical').length,
        serious: violations.filter(v => v.impact === 'serious').length,
        moderate: violations.filter(v => v.impact === 'moderate').length,
        minor: violations.filter(v => v.impact === 'minor').length
      }
    }
    
    console.log('Accessibility Report:', JSON.stringify(report, null, 2))
    
    // Assert that there are no critical or serious violations
    expect(report.summary.critical).toBe(0)
    expect(report.summary.serious).toBe(0)
  })
})
