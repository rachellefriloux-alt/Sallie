import { setupServer } from 'msw/node'
import { rest } from 'msw'

// Mock API handlers
export const handlers = [
  // Authentication endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@sallie.com',
            name: 'Test User',
          },
          token: 'mock-jwt-token',
        },
      })
    )
  }),

  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true })
    )
  }),

  // User profile endpoints
  rest.get('/api/user/profile', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          id: 'test-user-id',
          email: 'test@sallie.com',
          name: 'Test User',
          avatar: null,
          preferences: {
            theme: 'light',
            notifications: true,
          },
        },
      })
    )
  }),

  // Dashboard endpoints
  rest.get('/api/dashboard/stats', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          totalConversations: 42,
          totalProjects: 8,
          storageUsed: '2.3 GB',
          lastActive: new Date().toISOString(),
        },
      })
    )
  }),

  // Conversation endpoints
  rest.get('/api/conversations', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: [
          {
            id: 'conv-1',
            title: 'Test Conversation 1',
            lastMessage: 'Hello from Sallie!',
            timestamp: new Date().toISOString(),
            unread: false,
          },
          {
            id: 'conv-2',
            title: 'Test Conversation 2',
            lastMessage: 'How can I help you today?',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            unread: true,
          },
        ],
      })
    )
  }),

  rest.post('/api/conversations', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          id: 'conv-new',
          title: 'New Conversation',
          lastMessage: '',
          timestamp: new Date().toISOString(),
          unread: false,
        },
      })
    )
  }),

  // Avatar endpoints
  rest.get('/api/avatar/current', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          id: 'avatar-1',
          name: 'Sallie',
          appearance: {
            skinTone: '#f4c2a1',
            hairColor: '#8b4513',
            eyeColor: '#4a90e2',
            outfit: 'casual',
          },
          mood: 'happy',
          personality: 'friendly',
        },
      })
    )
  }),

  // Settings endpoints
  rest.get('/api/settings', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            desktop: false,
          },
          privacy: {
            dataCollection: false,
            analytics: true,
          },
        },
      })
    )
  }),

  rest.put('/api/settings', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Settings updated successfully',
      })
    )
  }),

  // Error simulation handlers
  rest.get('/api/error/500', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        error: 'Internal Server Error',
      })
    )
  }),

  rest.get('/api/error/404', (req, res, ctx) => {
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        error: 'Not Found',
      })
    )
  }),
]

// Setup MSW server
export const server = setupServer(...handlers)
