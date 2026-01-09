const request = require('supertest');
const { app } = require('../../services/api-gateway/src/index');
const { connectDB, closeDB } = require('../../services/auth-service/src/database');
const { generateToken, verifyToken } = require('../../services/api-gateway/src/middleware/auth');

describe('Authentication Service Integration Tests', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    await connectDB();
  });

  afterAll(async () => {
    // Close database connection
    await closeDB();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'StrongP@ssw0rd123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.tokens).toHaveProperty('access');
      expect(response.body.tokens).toHaveProperty('refresh');

      testUser = response.body.user;
      authToken = response.body.tokens.access;
    });

    it('should reject duplicate email registration', async () => {
      const userData = {
        name: 'Duplicate User',
        email: 'test@example.com', // Same email as above
        password: 'AnotherP@ssw0rd123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Email already exists');
    });

    it('should validate email format', async () => {
      const userData = {
        name: 'Invalid Email User',
        email: 'invalid-email',
        password: 'ValidP@ssw0rd123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid email format');
    });

    it('should validate password strength', async () => {
      const userData = {
        name: 'Weak Password User',
        email: 'weak@example.com',
        password: '123', // Too weak
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Password must be at least 8 characters');
    });

    it('should sanitize input to prevent XSS', async () => {
      const userData = {
        name: '<script>alert("xss")</script>',
        email: 'xss@example.com',
        password: 'ValidP@ssw0rd123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.name).not.toContain('<script>');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'StrongP@ssw0rd123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.tokens).toHaveProperty('access');
      expect(response.body.tokens).toHaveProperty('refresh');
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should handle non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Email and password are required');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // First login to get tokens
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'StrongP@ssw0rd123!',
        });

      const refreshToken = loginResponse.body.tokens.refresh;

      // Refresh tokens
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refresh: refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('access');
      expect(response.body.tokens).toHaveProperty('refresh');
      expect(response.body.tokens.access).not.toBe(loginResponse.body.tokens.access);
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refresh: 'invalid-refresh-token' })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid refresh token');
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Refresh token is required');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Logged out successfully');
    });

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Access token required');
    });

    it('should reject logout with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid access token');
    });
  });

  describe('POST /api/auth/2fa/enable', () => {
    it('should enable 2FA for authenticated user', async () => {
      const response = await request(app)
        .post('/api/auth/2fa/enable')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('qrCode');
      expect(response.body).toHaveProperty('backupCodes');
      expect(Array.isArray(response.body.backupCodes)).toBe(true);
      expect(response.body.backupCodes.length).toBe(10);
    });

    it('should require authentication for 2FA setup', async () => {
      const response = await request(app)
        .post('/api/auth/2fa/enable')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('POST /api/auth/2fa/verify', () => {
    it('should verify 2FA code', async () => {
      // First enable 2FA
      await request(app)
        .post('/api/auth/2fa/enable')
        .set('Authorization', `Bearer ${authToken}`);

      // Verify 2FA code (mocked)
      const response = await request(app)
        .post('/api/auth/2fa/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: '123456' })
        .expect(200);

      expect(response.body).toHaveProperty('verified');
      expect(response.body.verified).toBe(true);
    });

    it('should reject invalid 2FA code', async () => {
      const response = await request(app)
        .post('/api/auth/2fa/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: '000000' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid 2FA code');
    });
  });

  describe('POST /api/auth/password/reset', () => {
    it('should send password reset email', async () => {
      const response = await request(app)
        .post('/api/auth/password/reset')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Password reset link sent');
    });

    it('should handle non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/password/reset')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Email not found');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/password/reset')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid email format');
    });
  });

  describe('POST /api/auth/password/confirm', () => {
    it('should reset password with valid token', async () => {
      // First request password reset
      await request(app)
        .post('/api/auth/password/reset')
        .send({ email: 'test@example.com' });

      // Confirm password reset (mocked token)
      const response = await request(app)
        .post('/api/auth/password/confirm')
        .send({
          token: 'reset-token',
          newPassword: 'NewStrongP@ssw0rd123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Password reset successfully');
    });

    it('should reject invalid reset token', async () => {
      const response = await request(app)
        .post('/api/auth/password/confirm')
        .send({
          token: 'invalid-token',
          newPassword: 'NewStrongP@ssw0rd123!',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid or expired reset token');
    });

    it('should validate new password strength', async () => {
      const response = await request(app)
        .post('/api/auth/password/confirm')
        .send({
          token: 'reset-token',
          newPassword: '123', // Too weak
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Password must be at least 8 characters');
    });
  });

  describe('Security Tests', () => {
    it('should rate limit login attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Make multiple rapid login attempts
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send(loginData)
      );

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com", "password": "password123')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid JSON');
    });

    it('should validate content type', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'text/plain')
        .send('email=test@example.com&password=password123')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Content-Type must be application/json');
    });

    it('should prevent SQL injection', async () => {
      const maliciousInput = {
        email: "'; DROP TABLE users; --",
        password: "password123",
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(maliciousInput)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      // Should not cause server error
      expect(response.status).not.toBe(500);
    });

    it('should handle large payloads', async () => {
      const largePayload = {
        email: 'test@example.com',
        password: 'a'.repeat(10000), // Very long password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(largePayload)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Token Validation', () => {
    it('should generate valid JWT token', () => {
      const payload = {
        userId: testUser.id,
        email: testUser.email,
      };

      const token = generateToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should verify valid JWT token', () => {
      const payload = {
        userId: testUser.id,
        email: testUser.email,
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should reject invalid JWT token', () => {
      const invalidToken = 'invalid.jwt.token';
      
      expect(() => {
        verifyToken(invalidToken);
      }).toThrow();
    });

    it('should reject expired JWT token', async () => {
      const payload = {
        userId: testUser.id,
        email: testUser.email,
      };

      // Generate token that expires immediately
      const token = generateToken(payload, { expiresIn: '0s' });
      
      // Wait a moment for token to expire
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(() => {
        verifyToken(token);
      }).toThrow();
    });
  });

  describe('Device Fingerprinting', () => {
    it('should generate device fingerprint', async () => {
      const response = await request(app)
        .post('/api/auth/fingerprint')
        .send({
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          language: 'en-US',
          timezone: 'America/New_York',
          screenResolution: '1920x1080',
        })
        .expect(200);

      expect(response.body).toHaveProperty('fingerprint');
      expect(typeof response.body.fingerprint).toBe('string');
      expect(response.body.fingerprint.length).toBeGreaterThan(0);
    });

    it('should validate fingerprint data', async () => {
      const response = await request(app)
        .post('/api/auth/fingerprint')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('User agent is required');
    });
  });

  describe('Account Security', () => {
    it('should detect suspicious login patterns', async () => {
      const suspiciousLogin = {
        email: 'test@example.com',
        password: 'StrongP@ssw0rd123!',
        ipAddress: '192.168.1.100',
        userAgent: 'Unknown Bot 1.0',
        location: 'Unknown Country',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(suspiciousLogin)
        .expect(200);

      // Should still allow login but flag for review
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('securityFlag');
    });

    it('should handle account lockout after failed attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Make multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send(loginData);
      }

      // Next attempt should be locked out
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(423);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Account locked');
    });
  });
});
