// Detox E2E test setup
import { detox } from 'detox'
import { jest } from '@jest/globals'

// Set default timeout for all tests
jest.setTimeout(120000)

// Global setup before all tests
beforeAll(async () => {
  await detox.init()
})

// Global cleanup after all tests
afterAll(async () => {
  await detox.cleanup()
})

// Setup and teardown for each test
beforeEach(async () => {
  await device.launchApp({ newInstance: true })
})

afterEach(async () => {
  await device.terminateApp()
})
