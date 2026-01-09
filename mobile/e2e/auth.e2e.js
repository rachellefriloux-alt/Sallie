describe('Authentication', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
    await expect(element(by.id('login-button'))).toBeVisible();
    await expect(element(by.id('register-link'))).toBeVisible();
  });

  it('should validate email format', async () => {
    await element(by.id('email-input')).typeText('invalid-email');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await expect(element(by.text('Please enter a valid email'))).toBeVisible();
  });

  it('should validate password length', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('123');
    await element(by.id('login-button')).tap();

    await expect(element(by.text('Password must be at least 8 characters'))).toBeVisible();
  });

  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.text('Invalid email or password')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should login successfully and navigate to dashboard', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(10000);

    await expect(element(by.text('Welcome, Test User'))).toBeVisible();
    await expect(element(by.id('user-menu'))).toBeVisible();
  });

  it('should navigate to registration screen', async () => {
    await element(by.id('register-link')).tap();

    await expect(element(by.id('register-screen'))).toBeVisible();
    await expect(element(by.id('name-input'))).toBeVisible();
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
    await expect(element(by.id('confirm-password-input'))).toBeVisible();
    await expect(element(by.id('register-button'))).toBeVisible();
  });

  it('should validate password confirmation', async () => {
    await element(by.id('register-link')).tap();
    
    await element(by.id('name-input')).typeText('Test User');
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('confirm-password-input')).typeText('differentpassword');
    await element(by.id('register-button')).tap();

    await expect(element(by.text('Passwords do not match'))).toBeVisible();
  });

  it('should register successfully', async () => {
    await element(by.id('register-link')).tap();
    
    await element(by.id('name-input')).typeText('New User');
    await element(by.id('email-input')).typeText('newuser@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('confirm-password-input')).typeText('password123');
    await element(by.id('register-button')).tap();

    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(10000);

    await expect(element(by.text('Welcome, New User'))).toBeVisible();
  });

  it('should handle biometric authentication', async () => {
    // Mock biometric availability
    await device.setBiometricEnrollment(true);
    
    await element(by.id('biometric-login-button')).tap();

    await expect(element(by.text('Use your fingerprint or face to sign in'))).toBeVisible();
    
    // Mock successful biometric authentication
    await device.matchBiometric();
    
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should handle biometric unavailability', async () => {
    // Mock biometric unavailability
    await device.setBiometricEnrollment(false);
    
    await element(by.id('biometric-login-button')).tap();

    await expect(element(by.text('Biometric authentication is not available on this device'))).toBeVisible();
  });

  it('should handle logout', async () => {
    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Logout
    await element(by.id('user-menu')).tap();
    await element(by.id('logout-button')).tap();

    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle password reset', async () => {
    await element(by.id('forgot-password-link')).tap();

    await expect(element(by.id('reset-password-screen'))).toBeVisible();
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('send-reset-button'))).toBeVisible();

    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('send-reset-button')).tap();

    await expect(element(by.text('Password reset link sent'))).toBeVisible();
  });

  it('should handle session expiration', async () => {
    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Simulate session expiration by clearing app data
    await device.clearKeychain();

    // Try to access protected screen
    await element(by.id('profile-tab')).tap();

    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);

    await expect(element(by.text('Your session has expired'))).toBeVisible();
  });

  it('should handle network connectivity issues', async () => {
    // Simulate network disconnection
    await device.setNetworkConnection('none');

    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await expect(element(by.text('Network error. Please check your connection.'))).toBeVisible();

    // Restore network connection
    await device.setNetworkConnection('wifi');

    // Retry login
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should handle app backgrounding and foregrounding', async () => {
    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Background the app
    await device.sendToHome();

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return to app
    await device.launchApp({ newInstance: false });

    // Should still be logged in
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });

  it('should handle deep linking with authentication', async () => {
    // Test deep link to login with pre-filled email
    await device.openURL({
      url: 'sallie://login?email=test@example.com',
    });

    await expect(element(by.id('login-screen'))).toBeVisible();
    await expect(element(by.id('email-input'))).toHaveText('test@example.com');
  });

  it('should handle account lockout after failed attempts', async () => {
    // Make multiple failed login attempts
    for (let i = 0; i < 5; i++) {
      await element(by.id('email-input')).clearText();
      await element(by.id('password-input')).clearText();
      
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('wrongpassword');
      await element(by.id('login-button')).tap();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await expect(element(by.text('Account locked due to too many failed attempts'))).toBeVisible();
    await expect(element(by.text('Please try again later'))).toBeVisible();
  });

  it('should handle two-factor authentication', async () => {
    // Login with 2FA enabled account
    await element(by.id('email-input')).typeText('2fa@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('2fa-screen')))
      .toBeVisible()
      .withTimeout(5000);

    await expect(element(by.text('Enter 2FA Code'))).toBeVisible();
    await expect(element(by.id('2fa-input'))).toBeVisible();

    // Enter valid 2FA code
    await element(by.id('2fa-input')).typeText('123456');
    await element(by.id('verify-2fa-button')).tap();

    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should handle accessibility features', async () => {
    // Enable screen reader
    await device.setAccessibilityMode(true);

    await element(by.id('email-input')).tap();
    
    // Should announce field purpose
    await expect(element(by.label('Email address'))).toBeVisible();

    await element(by.id('password-input')).tap();
    
    // Should announce field purpose
    await expect(element(by.label('Password'))).toBeVisible();

    // Disable screen reader
    await device.setAccessibilityMode(false);
  });

  it('should handle different screen sizes', async () => {
    // Test on tablet
    await device.setOrientation('landscape');
    
    await expect(element(by.id('login-screen'))).toBeVisible();
    await expect(element(by.id('login-form'))).toBeVisible();

    // Test on phone
    await device.setOrientation('portrait');
    
    await expect(element(by.id('login-screen'))).toBeVisible();
    await expect(element(by.id('login-form'))).toBeVisible();
  });

  it('should handle form validation edge cases', async () => {
    // Test empty fields
    await element(by.id('login-button')).tap();
    await expect(element(by.text('Email and password are required'))).toBeVisible();

    // Test email with special characters
    await element(by.id('email-input')).typeText('test+tag@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Should accept valid email with special characters
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should handle security features', async () => {
    // Test device fingerprinting
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Should include device fingerprint in request
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Test jailbreak/root detection
    const isJailbroken = await device.getJailbroken();
    if (isJailbroken) {
      await expect(element(by.text('Device security warning'))).toBeVisible();
    }
  });

  it('should handle performance under load', async () => {
    const startTime = Date.now();

    // Perform rapid login attempts
    for (let i = 0; i < 10; i++) {
      await element(by.id('email-input')).clearText();
      await element(by.id('password-input')).clearText();
      
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete within reasonable time
    expect(duration).toBeLessThan(10000); // 10 seconds
  });
});
