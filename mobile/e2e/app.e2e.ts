import { device, element, by, expect } from 'detox'

describe('Sallie Mobile App E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('should show welcome screen on launch', async () => {
    await expect(element(by.id('welcome-screen'))).toBeVisible()
    await expect(element(by.text('Welcome to Sallie'))).toBeVisible()
  })

  it('should navigate to login screen', async () => {
    await element(by.id('login-button')).tap()
    await expect(element(by.id('login-screen'))).toBeVisible()
    await expect(element(by.id('email-input'))).toBeVisible()
    await expect(element(by.id('password-input'))).toBeVisible()
  })

  it('should handle user login', async () => {
    // Navigate to login
    await element(by.id('login-button')).tap()
    
    // Fill in credentials
    await element(by.id('email-input')).typeText('test@sallie.com')
    await element(by.id('password-input')).typeText('password123')
    
    // Submit login
    await element(by.id('submit-login')).tap()
    
    // Should navigate to main app
    await waitFor(element(by.id('main-screen')))
      .toBeVisible()
      .withTimeout(5000)
  })

  it('should display avatar on main screen', async () => {
    // Login first
    await element(by.id('login-button')).tap()
    await element(by.id('email-input')).typeText('test@sallie.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.id('submit-login')).tap()
    
    // Wait for main screen
    await waitFor(element(by.id('main-screen')))
      .toBeVisible()
      .withTimeout(5000)
    
    // Check avatar is visible
    await expect(element(by.id('sallie-avatar'))).toBeVisible()
    await expect(element(by.text('Sallie'))).toBeVisible()
  })

  it('should navigate to conversations', async () => {
    // Login and navigate to main screen
    await element(by.id('login-button')).tap()
    await element(by.id('email-input')).typeText('test@sallie.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.id('submit-login')).tap()
    
    await waitFor(element(by.id('main-screen')))
      .toBeVisible()
      .withTimeout(5000)
    
    // Navigate to conversations
    await element(by.id('conversations-tab')).tap()
    await expect(element(by.id('conversations-screen'))).toBeVisible()
  })

  it('should create new conversation', async () => {
    // Login and navigate to conversations
    await element(by.id('login-button')).tap()
    await element(by.id('email-input')).typeText('test@sallie.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.id('submit-login')).tap()
    
    await waitFor(element(by.id('main-screen')))
      .toBeVisible()
      .withTimeout(5000)
    
    await element(by.id('conversations-tab')).tap()
    await expect(element(by.id('conversations-screen'))).toBeVisible()
    
    // Create new conversation
    await element(by.id('new-conversation-button')).tap()
    await expect(element(by.id('conversation-screen'))).toBeVisible()
  })

  it('should send and receive messages', async () => {
    // Login and start conversation
    await element(by.id('login-button')).tap()
    await element(by.id('email-input')).typeText('test@sallie.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.id('submit-login')).tap()
    
    await waitFor(element(by.id('main-screen')))
      .toBeVisible()
      .withTimeout(5000)
    
    await element(by.id('conversations-tab')).tap()
    await element(by.id('new-conversation-button')).tap()
    
    // Type and send message
    await element(by.id('message-input')).typeText('Hello Sallie!')
    await element(by.id('send-button')).tap()
    
    // Check message appears
    await waitFor(element(by.text('Hello Sallie!')))
      .toBeVisible()
      .withTimeout(3000)
    
    // Wait for Sallie's response
    await waitFor(element(by.text(/hello/i)))
      .toBeVisible()
      .withTimeout(5000)
  })

  it('should navigate to settings', async () => {
    // Login
    await element(by.id('login-button')).tap()
    await element(by.id('email-input')).typeText('test@sallie.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.id('submit-login')).tap()
    
    await waitFor(element(by.id('main-screen')))
      .toBeVisible()
      .withTimeout(5000)
    
    // Navigate to settings
    await element(by.id('settings-tab')).tap()
    await expect(element(by.id('settings-screen'))).toBeVisible()
  })

  it('should toggle dark mode', async () => {
    // Login and navigate to settings
    await element(by.id('login-button')).tap()
    await element(by.id('email-input')).typeText('test@sallie.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.id('submit-login')).tap()
    
    await waitFor(element(by.id('main-screen')))
      .toBeVisible()
      .withTimeout(5000)
    
    await element(by.id('settings-tab')).tap()
    
    // Toggle dark mode
    await element(by.id('dark-mode-toggle')).tap()
    
    // Check that toggle is activated
    await expect(element(by.id('dark-mode-toggle'))).toHaveValue('1')
  })

  it('should handle avatar customization', async () => {
    // Login and navigate to avatar
    await element(by.id('login-button')).tap()
    await element(by.id('email-input')).typeText('test@sallie.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.id('submit-login')).tap()
    
    await waitFor(element(by.id('main-screen')))
      .toBeVisible()
      .withTimeout(5000)
    
    await element(by.id('avatar-tab')).tap()
    await expect(element(by.id('avatar-screen'))).toBeVisible()
    
    // Customize avatar
    await element(by.id('customize-button')).tap()
    await expect(element(by.id('avatar-customization'))).toBeVisible()
    
    // Change skin tone
    await element(by.id('skin-tone-picker')).tap()
    await element(by.text('Medium')).tap()
    
    // Save changes
    await element(by.id('save-avatar')).tap()
    
    // Check success message
    await waitFor(element(by.text('Avatar updated')))
      .toBeVisible()
      .withTimeout(3000)
  })

  it('should handle network connectivity changes', async () => {
    // Login
    await element(by.id('login-button')).tap()
    await element(by.id('email-input')).typeText('test@sallie.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.id('submit-login')).tap()
    
    await waitFor(element(by.id('main-screen')))
      .toBeVisible()
      .withTimeout(5000)
    
    // Simulate network disconnection
    await device.setNetworkConnection('offline')
    
    // Should show offline status
    await waitFor(element(by.text('Offline')))
      .toBeVisible()
      .withTimeout(3000)
    
    // Reconnect
    await device.setNetworkConnection('wifi')
    
    // Should show online status
    await waitFor(element(by.text('Online')))
      .toBeVisible()
      .withTimeout(3000)
  })

  it('should handle biometric authentication', async () => {
    // Enable biometric authentication in settings
    await element(by.id('login-button')).tap()
    await element(by.id('email-input')).typeText('test@sallie.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.id('submit-login')).tap()
    
    await waitFor(element(by.id('main-screen')))
      .toBeVisible()
      .withTimeout(5000)
    
    await element(by.id('settings-tab')).tap()
    await element(by.id('biometric-toggle')).tap()
    
    // Logout and test biometric login
    await element(by.id('logout-button')).tap()
    
    // Should show biometric prompt
    await expect(element(by.id('biometric-prompt'))).toBeVisible()
    
    // Mock successful biometric authentication
    await device.matchBiometric()
    
    // Should login successfully
    await waitFor(element(by.id('main-screen')))
      .toBeVisible()
      .withTimeout(5000)
  })

  it('should handle push notifications', async () => {
    // Login
    await element(by.id('login-button')).tap()
    await element(by.id('email-input')).typeText('test@sallie.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.id('submit-login')).tap()
    
    await waitFor(element(by.id('main-screen')))
      .toBeVisible()
      .withTimeout(5000)
    
    // Mock incoming push notification
    await device.pushNotification({
      title: 'New message from Sallie',
      body: 'How can I help you today?',
      userInfo: {
        conversationId: 'conv-1',
        type: 'message',
      },
    })
    
    // Should show notification indicator
    await waitFor(element(by.id('notification-indicator')))
      .toBeVisible()
      .withTimeout(3000)
  })

  it('should handle app backgrounding and foregrounding', async () => {
    // Login
    await element(by.id('login-button')).tap()
    await element(by.id('email-input')).typeText('test@sallie.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.id('submit-login')).tap()
    
    await waitFor(element(by.id('main-screen')))
      .toBeVisible()
      .withTimeout(5000)
    
    // Background the app
    await device.sendToHome()
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Bring app to foreground
    await device.launchApp({ newInstance: false })
    
    // Should still be logged in
    await expect(element(by.id('main-screen'))).toBeVisible()
  })

  it('should handle deep linking', async () => {
    // Mock deep link to conversation
    await device.openURL({
      url: 'sallie://conversation/conv-123',
    })
    
    // Should open directly to conversation
    await waitFor(element(by.id('conversation-screen')))
      .toBeVisible()
      .withTimeout(5000)
  })
})
