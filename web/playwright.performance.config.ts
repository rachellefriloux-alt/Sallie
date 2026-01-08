import { defineConfig, devices } from '@playwright/test'

/**
 * Performance testing configuration
 */
export default defineConfig({
  testDir: './e2e/performance',
  fullyParallel: false, // Run performance tests sequentially
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for performance tests
  workers: 1, // Single worker for consistent performance measurements
  reporter: [
    ['html', { outputFolder: 'playwright-performance-report' }],
    ['json', { outputFile: 'playwright-performance-report/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'performance-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Performance-specific settings
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
          ],
        },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Performance-specific global setup
  globalSetup: './e2e/performance/global-setup.ts',
})
