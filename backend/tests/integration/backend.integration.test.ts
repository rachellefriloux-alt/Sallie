/**
 * Comprehensive Backend Integration Tests
 * Tests all microservices working together
 */

import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';

// Test configuration
const GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8742';
const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8743';
const CHAT_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:8744';
const ANALYTICS_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8745';
const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8746';
const FILE_URL = process.env.FILE_SERVICE_URL || 'http://localhost:8747';
const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8748';
const WEBSOCKET_URL = process.env.WEBSOCKET_SERVICE_URL || 'http://localhost:8749';
const PYTHON_AI_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000';

describe('Backend Integration Tests', () => {
  let testUser: any;
  let authToken: string;
  let refreshToken: string;
  let testRoom: any;
  let testFile: any;

  beforeAll(async () => {
    // Wait for all services to be ready
    await waitForServices();
  });

  beforeEach(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  afterAll(async () => {
    // Final cleanup
    await cleanupTestData();
  });

  describe('Service Health Checks', () => {
    it('should have all services healthy', async () => {
      const services = [
        { name: 'API Gateway', url: GATEWAY_URL },
        { name: 'Auth Service', url: AUTH_URL },
        { name: 'Chat Service', url: CHAT_URL },
        { name: 'Analytics Service', url: ANALYTICS_URL },
        { name: 'Notification Service', url: NOTIFICATION_URL },
        { name: 'File Service', url: FILE_URL },
        { name: 'AI Service', url: AI_URL },
        { name: 'WebSocket Service', url: WEBSOCKET_URL },
        { name: 'Python AI Service', url: PYTHON_AI_URL }
      ];

      for (const service of services) {
        const response = await request(service.url)
          .get('/health')
          .expect(200);

        expect(response.body.status).toBe('healthy');
        expect(response.body.service).toBeDefined();
      }
    });
  });

  describe('Authentication Flow', () => {
    it('should register a new user', async () => {
      const userData = {
        email: `test-${uuidv4()}@example.com`,
        username: `testuser-${uuidv4()}`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(GATEWAY_URL)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.id).toBeDefined();
      expect(response.body.tokens.access_token).toBeDefined();

      testUser = response.body.user;
      authToken = response.body.tokens.access_token;
      refreshToken = response.body.tokens.refresh_token;
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: 'TestPassword123!'
      };

      const response = await request(GATEWAY_URL)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.tokens.access_token).toBeDefined();
      expect(response.body.tokens.refresh_token).toBeDefined();

      authToken = response.body.tokens.access_token;
    });

    it('should refresh tokens', async () => {
      const response = await request(GATEWAY_URL)
        .post('/api/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.refresh_token).toBeDefined();

      authToken = response.body.access_token;
      refreshToken = response.body.refresh_token;
    });

    it('should validate token', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.valid).toBe(true);
      expect(response.body.user.id).toBe(testUser.id);
    });

    it('should logout successfully', async () => {
      await request(GATEWAY_URL)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Token should no longer be valid
      await request(GATEWAY_URL)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);
    });
  });

  describe('Chat Service Integration', () => {
    beforeEach(async () => {
      // Login again for chat tests
      const loginResponse = await request(GATEWAY_URL)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      authToken = loginResponse.body.tokens.access_token;
    });

    it('should create a chat room', async () => {
      const roomData = {
        name: 'Test Room',
        description: 'A test room for integration testing',
        type: 'public',
        maxParticipants: 10
      };

      const response = await request(GATEWAY_URL)
        .post('/api/chat/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(roomData)
        .expect(201);

      expect(response.body.name).toBe(roomData.name);
      expect(response.body.createdBy).toBe(testUser.id);
      expect(response.body.participants).toContain(testUser.id);

      testRoom = response.body;
    });

    it('should send a message', async () => {
      const messageData = {
        roomId: testRoom.id,
        content: 'Hello, this is a test message!',
        type: 'text'
      };

      const response = await request(GATEWAY_URL)
        .post('/api/chat/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body.content).toBe(messageData.content);
      expect(response.body.userId).toBe(testUser.id);
      expect(response.body.roomId).toBe(testRoom.id);
    });

    it('should get room messages', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/api/chat/rooms/${testRoom.id}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.messages)).toBe(true);
      expect(response.body.messages.length).toBeGreaterThan(0);
    });

    it('should join a room', async () => {
      // Create another user
      const secondUser = await createTestUser();
      const secondToken = await loginTestUser(secondUser.email);

      const response = await request(GATEWAY_URL)
        .post(`/api/chat/rooms/${testRoom.id}/join`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(200);

      expect(response.body.participants).toContain(secondUser.id);
      expect(response.body.participants).toContain(testUser.id);
    });
  });

  describe('Analytics Service Integration', () => {
    beforeEach(async () => {
      const loginResponse = await request(GATEWAY_URL)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      authToken = loginResponse.body.tokens.access_token;
    });

    it('should track analytics event', async () => {
      const eventData = {
        eventType: 'user_action',
        eventName: 'button_click',
        properties: {
          button_id: 'test_button',
          page: 'test_page',
          value: 42
        }
      };

      const response = await request(GATEWAY_URL)
        .post('/api/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.eventType).toBe(eventData.eventType);
    });

    it('should get user metrics', async () => {
      // Track some events first
      await request(GATEWAY_URL)
        .post('/api/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventType: 'page_view',
          eventName: 'homepage',
          properties: { page: 'home' }
        });

      const response = await request(GATEWAY_URL)
        .get('/api/analytics/metrics/user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.totalEvents).toBeGreaterThan(0);
      expect(response.body.userId).toBe(testUser.id);
    });

    it('should create a funnel', async () => {
      const funnelData = {
        name: 'Test Funnel',
        description: 'A test funnel for integration testing',
        stages: [
          {
            name: 'Stage 1',
            description: 'First stage',
            order: 1,
            conditions: { page: 'home' }
          },
          {
            name: 'Stage 2',
            description: 'Second stage',
            order: 2,
            conditions: { action: 'signup' }
          }
        ]
      };

      const response = await request(GATEWAY_URL)
        .post('/api/analytics/funnels')
        .set('Authorization', `Bearer ${authToken}`)
        .send(funnelData)
        .expect(201);

      expect(response.body.name).toBe(funnelData.name);
      expect(response.body.stages).toHaveLength(2);
    });
  });

  describe('Notification Service Integration', () => {
    beforeEach(async () => {
      const loginResponse = await request(GATEWAY_URL)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      authToken = loginResponse.body.tokens.access_token;
    });

    it('should send an email notification', async () => {
      const notificationData = {
        type: 'email',
        channel: 'email',
        title: 'Test Email',
        content: 'This is a test email notification',
        template: 'welcome_email',
        data: {
          first_name: testUser.firstName,
          reset_link: 'https://example.com/reset'
        }
      };

      const response = await request(GATEWAY_URL)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationData)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBe('pending');
    });

    it('should create notification template', async () => {
      const templateData = {
        name: 'Test Template',
        description: 'A test template',
        type: 'email',
        subject: 'Test Subject',
        content: 'Hello {{name}}, this is a test template.',
        variables: ['name']
      };

      const response = await request(GATEWAY_URL)
        .post('/api/notifications/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData)
        .expect(201);

      expect(response.body.name).toBe(templateData.name);
      expect(response.body.variables).toContain('name');
    });

    it('should get notification history', async () => {
      // Send a notification first
      await request(GATEWAY_URL)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'in_app',
          channel: 'in_app',
          title: 'Test Notification',
          content: 'Test content'
        });

      const response = await request(GATEWAY_URL)
        .get('/api/notifications/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.notifications)).toBe(true);
      expect(response.body.notifications.length).toBeGreaterThan(0);
    });
  });

  describe('File Service Integration', () => {
    beforeEach(async () => {
      const loginResponse = await request(GATEWAY_URL)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      authToken = loginResponse.body.tokens.access_token;
    });

    it('should upload a file', async () => {
      const fileContent = Buffer.from('This is a test file content');
      
      const response = await request(GATEWAY_URL)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', fileContent, 'test.txt')
        .expect(201);

      expect(response.body.filename).toBeDefined();
      expect(response.body.originalName).toBe('test.txt');
      expect(response.body.size).toBe(fileContent.length);

      testFile = response.body;
    });

    it('should download a file', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/api/files/${testFile.id}/download`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toBeDefined();
      expect(response.body.length).toBe(testFile.size);
    });

    it('should get file metadata', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/api/files/${testFile.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testFile.id);
      expect(response.body.filename).toBe(testFile.filename);
      expect(response.body.downloadCount).toBeDefined();
    });

    it('should list user files', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/files')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.files)).toBe(true);
      expect(response.body.files.length).toBeGreaterThan(0);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('should delete a file', async () => {
      await request(GATEWAY_URL)
        .delete(`/api/files/${testFile.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // File should no longer be accessible
      await request(GATEWAY_URL)
        .get(`/api/files/${testFile.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('AI Service Integration', () => {
    beforeEach(async () => {
      const loginResponse = await request(GATEWAY_URL)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      authToken = loginResponse.body.tokens.access_token;
    });

    it('should generate text completion', async () => {
      const promptData = {
        prompt: 'The future of artificial intelligence is',
        model: 'gpt-3.5-turbo',
        maxTokens: 100,
        temperature: 0.7
      };

      const response = await request(GATEWAY_URL)
        .post('/api/ai/completions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(promptData)
        .expect(200);

      expect(response.body.completion).toBeDefined();
      expect(response.body.completion.length).toBeGreaterThan(0);
      expect(response.body.model).toBe(promptData.model);
    });

    it('should analyze sentiment', async () => {
      const textData = {
        text: 'I love this new AI service! It\'s amazing and works perfectly.'
      };

      const response = await request(GATEWAY_URL)
        .post('/api/ai/sentiment')
        .set('Authorization', `Bearer ${authToken}`)
        .send(textData)
        .expect(200);

      expect(response.body.sentiment).toBeDefined();
      expect(response.body.score).toBeDefined();
      expect(response.body.confidence).toBeDefined();
    });

    it('should extract entities', async () => {
      const textData = {
        text: 'Apple Inc. is based in Cupertino, California and was founded by Steve Jobs.'
      };

      const response = await request(GATEWAY_URL)
        .post('/api/ai/entities')
        .set('Authorization', `Bearer ${authToken}`)
        .send(textData)
        .expect(200);

      expect(Array.isArray(response.body.entities)).toBe(true);
      expect(response.body.entities.length).toBeGreaterThan(0);
    });
  });

  describe('Python AI Service Integration', () => {
    beforeEach(async () => {
      const loginResponse = await request(GATEWAY_URL)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      authToken = loginResponse.body.tokens.access_token;
    });

    it('should process emotional input', async () => {
      const inputData = {
        text: 'I\'m feeling really happy today because I achieved something important!',
        context: {
          mood: 'positive',
          situation: 'achievement'
        }
      };

      const response = await request(PYTHON_AI_URL)
        .post('/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send(inputData)
        .expect(200);

      expect(response.body.content).toBeDefined();
      expect(response.body.emotional_state).toBeDefined();
      expect(response.body.confidence).toBeDefined();
      expect(response.body.cognitive_mode).toBeDefined();
    });

    it('should get emotional state', async () => {
      const response = await request(PYTHON_AI_URL)
        .get('/emotional-state')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.limbic_variables).toBeDefined();
      expect(response.body.cognitive_mode).toBeDefined();
      expect(response.body.personality_traits).toBeDefined();
    });

    it('should learn from feedback', async () => {
      const feedbackData = {
        type: 'positive',
        score: 0.9,
        comment: 'Great response!'
      };

      const response = await request(PYTHON_AI_URL)
        .post('/learn')
        .set('Authorization', `Bearer ${authToken}`)
        .send(feedbackData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Cross-Service Integration', () => {
    beforeEach(async () => {
      const loginResponse = await request(GATEWAY_URL)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      authToken = loginResponse.body.tokens.access_token;
    });

    it('should track chat messages in analytics', async () => {
      // Create a room and send a message
      const roomResponse = await request(GATEWAY_URL)
        .post('/api/chat/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Analytics Test Room',
          type: 'public'
        });

      const room = roomResponse.body;

      await request(GATEWAY_URL)
        .post('/api/chat/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: room.id,
          content: 'Test message for analytics',
          type: 'text'
        });

      // Check if the event was tracked
      const analyticsResponse = await request(GATEWAY_URL)
        .get('/api/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const chatEvents = analyticsResponse.body.events.filter(
        (event: any) => event.eventType === 'chat_message'
      );

      expect(chatEvents.length).toBeGreaterThan(0);
    });

    it('should trigger notifications for chat mentions', async () => {
      // Create another user
      const secondUser = await createTestUser();
      const secondToken = await loginTestUser(secondUser.email);

      // Create a room with both users
      const roomResponse = await request(GATEWAY_URL)
        .post('/api/chat/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Mention Test Room',
          type: 'public'
        });

      const room = roomResponse.body;

      await request(GATEWAY_URL)
        .post(`/api/chat/rooms/${room.id}/join`)
        .set('Authorization', `Bearer ${secondToken}`);

      // Send a message mentioning the second user
      await request(GATEWAY_URL)
        .post('/api/chat/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: room.id,
          content: `@${secondUser.username} check this out!`,
          type: 'text'
        });

      // Check if notification was created
      const notificationResponse = await request(GATEWAY_URL)
        .get('/api/notifications/history')
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(200);

      const mentionNotifications = notificationResponse.body.notifications.filter(
        (notif: any) => notif.type === 'mention'
      );

      expect(mentionNotifications.length).toBeGreaterThan(0);
    });

    it('should maintain data consistency across services', async () => {
      // Upload a file
      const fileContent = Buffer.from('Consistency test file');
      const fileResponse = await request(GATEWAY_URL)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', fileContent, 'consistency.txt');

      const file = fileResponse.body;

      // Track the upload in analytics
      await request(GATEWAY_URL)
        .post('/api/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventType: 'file_upload',
          eventName: 'file_uploaded',
          properties: {
            file_id: file.id,
            file_size: file.size,
            file_type: file.mimeType
          }
        });

      // Send notification about the file
      await request(GATEWAY_URL)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'in_app',
          channel: 'in_app',
          title: 'File Uploaded',
          content: `Your file ${file.originalName} was uploaded successfully`
        });

      // Verify all services have consistent data
      const fileCheck = await request(GATEWAY_URL)
        .get(`/api/files/${file.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(fileCheck.body.id).toBe(file.id);

      const analyticsCheck = await request(GATEWAY_URL)
        .get('/api/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const fileEvents = analyticsCheck.body.events.filter(
        (event: any) => event.properties.file_id === file.id
      );

      expect(fileEvents.length).toBe(1);

      const notificationCheck = await request(GATEWAY_URL)
        .get('/api/notifications/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const fileNotifications = notificationCheck.body.notifications.filter(
        (notif: any) => notif.content.includes(file.originalName)
      );

      expect(fileNotifications.length).toBe(1);
    });
  });

  // Helper functions
  async function waitForServices(): Promise<void> {
    const services = [
      GATEWAY_URL, AUTH_URL, CHAT_URL, ANALYTICS_URL,
      NOTIFICATION_URL, FILE_URL, AI_URL, WEBSOCKET_URL, PYTHON_AI_URL
    ];

    for (const service of services) {
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        try {
          await request(service).get('/health').expect(200);
          break;
        } catch (error) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw new Error(`Service ${service} not ready after ${maxAttempts} attempts`);
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }

  async function createTestUser(): Promise<any> {
    const userData = {
      email: `test-${uuidv4()}@example.com`,
      username: `testuser-${uuidv4()}`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    };

    const response = await request(GATEWAY_URL)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    return response.body.user;
  }

  async function loginTestUser(email: string): Promise<string> {
    const response = await request(GATEWAY_URL)
      .post('/api/auth/login')
      .send({
        email,
        password: 'TestPassword123!'
      })
      .expect(200);

    return response.body.tokens.access_token;
  }

  async function cleanupTestData(): Promise<void> {
    // This would clean up test data from all services
    // For now, we'll just log that cleanup is needed
    console.log('Test data cleanup needed');
  }
});
