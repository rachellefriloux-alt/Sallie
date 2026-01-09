import request from 'supertest'
import { app } from '../src/app'

describe('Authentication Integration Tests', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)

      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('tokens')
      expect(response.body.user.email).toBe('test@example.com')
      expect(response.body.tokens).toHaveProperty('access')
      expect(response.body.tokens).toHaveProperty('refresh')
    })

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Invalid email or password')
    })

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('Invalid email format')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '',
          password: '',
        })
        .expect(400)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('Email and password are required')
    })
  })

  describe('POST /api/auth/register', () => {
    it('should register new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
        })
        .expect(201)

      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('tokens')
      expect(response.body.user.name).toBe('New User')
      expect(response.body.user.email).toBe('newuser@example.com')
    })

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(409)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Email already exists')
    })

    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Weak Password User',
          email: 'weak@example.com',
          password: '123',
        })
        .expect(400)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('Password must be at least 8 characters')
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // First login to get tokens
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })

      const refreshToken = loginResponse.body.tokens.refresh

      // Refresh tokens
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refresh: refreshToken,
        })
        .expect(200)

      expect(response.body).toHaveProperty('tokens')
      expect(response.body.tokens).toHaveProperty('access')
      expect(response.body.tokens).toHaveProperty('refresh')
      expect(response.body.tokens.access).not.toBe(loginResponse.body.tokens.access)
    })

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refresh: 'invalid-refresh-token',
        })
        .expect(401)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Invalid refresh token')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout with valid token', async () => {
      // First login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })

      const accessToken = loginResponse.body.tokens.access

      // Logout
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Logged out successfully')
    })

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Access token required')
    })
  })

  describe('POST /api/auth/2fa/enable', () => {
    it('should enable 2FA for authenticated user', async () => {
      // First login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })

      const accessToken = loginResponse.body.tokens.access

      // Enable 2FA
      const response = await request(app)
        .post('/api/auth/2fa/enable')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('qrCode')
      expect(response.body).toHaveProperty('backupCodes')
      expect(Array.isArray(response.body.backupCodes)).toBe(true)
    })

    it('should require authentication for 2FA setup', async () => {
      const response = await request(app)
        .post('/api/auth/2fa/enable')
        .expect(401)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Access token required')
    })
  })

  describe('POST /api/auth/2fa/verify', () => {
    it('should verify 2FA code', async () => {
      // First login and enable 2FA
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })

      const accessToken = loginResponse.body.tokens.access

      // Enable 2FA
      await request(app)
        .post('/api/auth/2fa/enable')
        .set('Authorization', `Bearer ${accessToken}`)

      // Verify 2FA code (mocked)
      const response = await request(app)
        .post('/api/auth/2fa/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          code: '123456',
        })
        .expect(200)

      expect(response.body).toHaveProperty('verified')
      expect(response.body.verified).toBe(true)
    })

    it('should reject invalid 2FA code', async () => {
      // First login and enable 2FA
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })

      const accessToken = loginResponse.body.tokens.access

      // Enable 2FA
      await request(app)
        .post('/api/auth/2fa/enable')
        .set('Authorization', `Bearer ${accessToken}`)

      // Verify invalid 2FA code
      const response = await request(app)
        .post('/api/auth/2fa/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          code: '000000',
        })
        .expect(400)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Invalid 2FA code')
    })
  })

  describe('POST /api/auth/biometric/register', () => {
    it('should register biometric credentials', async () => {
      // First login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })

      const accessToken = loginResponse.body.tokens.access

      // Register biometric credentials
      const response = await request(app)
        .post('/api/auth/biometric/register')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          credentialId: 'biometric-id',
          publicKey: 'public-key-data',
        })
        .expect(200)

      expect(response.body).toHaveProperty('registered')
      expect(response.body.registered).toBe(true)
    })

    it('should require authentication for biometric registration', async () => {
      const response = await request(app)
        .post('/api/auth/biometric/register')
        .send({
          credentialId: 'biometric-id',
          publicKey: 'public-key-data',
        })
        .expect(401)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Access token required')
    })
  })

  describe('POST /api/auth/password/reset', () => {
    it('should send password reset email', async () => {
      const response = await request(app)
        .post('/api/auth/password/reset')
        .send({
          email: 'test@example.com',
        })
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Password reset link sent')
    })

    it('should handle non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/password/reset')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(404)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Email not found')
    })
  })

  describe('POST /api/auth/password/confirm', () => {
    it('should reset password with valid token', async () => {
      // First request password reset
      await request(app)
        .post('/api/auth/password/reset')
        .send({
          email: 'test@example.com',
        })

      // Confirm password reset (mocked token)
      const response = await request(app)
        .post('/api/auth/password/confirm')
        .send({
          token: 'reset-token',
          newPassword: 'newpassword123',
        })
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Password reset successfully')
    })

    it('should reject invalid reset token', async () => {
      const response = await request(app)
        .post('/api/auth/password/confirm')
        .send({
          token: 'invalid-token',
          newPassword: 'newpassword123',
        })
        .expect(400)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Invalid or expired reset token')
    })
  })

  describe('Security Tests', () => {
    it('should rate limit login attempts', async () => {
      // Make multiple rapid login attempts
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword',
          })
      )

      const responses = await Promise.all(promises)
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })

    it('should sanitize input to prevent XSS', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '<script>alert("xss")</script>@example.com',
          password: 'password123',
        })
        .expect(400)

      expect(response.body.message).not.toContain('<script>')
    })

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com", "password": "password123"')
        .expect(400)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('Invalid JSON')
    })

    it('should validate content type', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'text/plain')
        .send('email=test@example.com&password=password123')
        .expect(400)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('Content-Type must be application/json')
    })
  })
})
