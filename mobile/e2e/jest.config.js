module.exports = {
  preset: 'detox/runners/jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/e2e/jest.setup.js'],
  testMatch: ['<rootDir>/e2e/**/*.test.(js|ts|tsx)'],
  testTimeout: 120000,
  verbose: true,
}
