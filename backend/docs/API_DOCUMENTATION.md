# Sallie Studio Backend API Documentation

## Overview

Sallie Studio Backend is a comprehensive microservices architecture providing AI-powered capabilities, real-time communication, analytics, and more. This document provides complete API documentation for all services.

## Base URLs

- **API Gateway**: `http://localhost:8742`
- **Authentication Service**: `http://localhost:8743`
- **Chat Service**: `http://localhost:8744`
- **Analytics Service**: `http://localhost:8745`
- **Notification Service**: `http://localhost:8746`
- **File Service**: `http://localhost:8747`
- **AI Service**: `http://localhost:8748`
- **WebSocket Service**: `http://localhost:8749`
- **Python AI Service**: `http://localhost:8000`

## Authentication

All protected endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Gateway Routes

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-08T18:00:00Z",
  "version": "1.0.0",
  "services": {
    "auth": "healthy",
    "chat": "healthy",
    "analytics": "healthy",
    "notifications": "healthy",
    "files": "healthy",
    "ai": "healthy",
    "websocket": "healthy"
  }
}
```

## Authentication Service

### Register User
```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": false,
    "createdAt": "2024-01-08T18:00:00Z"
  },
  "tokens": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123!"
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json
```

**Request Body:**
```json
{
  "refresh_token": "refresh_token"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Validate Token
```http
GET /api/auth/validate
Authorization: Bearer <token>
```

## Chat Service

### Create Room
```http
POST /api/chat/rooms
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "General Discussion",
  "description": "A place for general conversations",
  "type": "public",
  "maxParticipants": 100
}
```

### Send Message
```http
POST /api/chat/messages
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "roomId": "room_uuid",
  "content": "Hello, world!",
  "type": "text"
}
```

### Get Room Messages
```http
GET /api/chat/rooms/{roomId}/messages
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit`: Number of messages to return (default: 50)
- `offset`: Offset for pagination (default: 0)
- `before`: Get messages before this timestamp

### Join Room
```http
POST /api/chat/rooms/{roomId}/join
Authorization: Bearer <token>
```

### Leave Room
```http
POST /api/chat/rooms/{roomId}/leave
Authorization: Bearer <token>
```

## Analytics Service

### Track Event
```http
POST /api/analytics/events
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "eventType": "user_action",
  "eventName": "button_click",
  "properties": {
    "button_id": "submit_btn",
    "page": "homepage",
    "value": 42
  }
}
```

### Get User Metrics
```http
GET /api/analytics/metrics/user
Authorization: Bearer <token>
```

**Response:**
```json
{
  "userId": "uuid",
  "totalEvents": 150,
  "sessionDuration": 3600,
  "lastActiveAt": "2024-01-08T18:00:00Z",
  "firstSeenAt": "2024-01-01T00:00:00Z",
  "customMetrics": {
    "messages_sent": 25,
    "files_uploaded": 5
  }
}
```

### Create Funnel
```http
POST /api/analytics/funnels
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "User Onboarding Funnel",
  "description": "Track user onboarding progress",
  "stages": [
    {
      "name": "Visit Homepage",
      "description": "User visits the homepage",
      "order": 1,
      "conditions": {
        "page": "home"
      }
    },
    {
      "name": "Sign Up",
      "description": "User completes registration",
      "order": 2,
      "conditions": {
        "event": "signup_completed"
      }
    }
  ]
}
```

### Get Real-time Metrics
```http
GET /api/analytics/metrics/realtime
Authorization: Bearer <token>
```

## Notification Service

### Send Notification
```http
POST /api/notifications/send
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "email",
  "channel": "email",
  "title": "Welcome to Sallie Studio",
  "content": "Thank you for joining our platform!",
  "template": "welcome_email",
  "data": {
    "first_name": "John",
    "reset_link": "https://example.com/reset"
  }
}
```

### Create Template
```http
POST /api/notifications/templates
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Password Reset",
  "description": "Template for password reset emails",
  "type": "email",
  "subject": "Reset Your Password",
  "content": "Hello {{name}}, click here to reset: {{reset_link}}",
  "variables": ["name", "reset_link"]
}
```

### Get Notification History
```http
GET /api/notifications/history
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit`: Number of notifications (default: 50)
- `offset`: Pagination offset (default: 0)
- `type`: Filter by notification type
- `status`: Filter by status

## File Service

### Upload File
```http
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: The file to upload
- `bucket`: Target bucket (optional)
- `isPublic`: Whether file is public (default: false)
- `tags`: Array of tags (optional)

**Response:**
```json
{
  "id": "file_uuid",
  "filename": "generated_filename.jpg",
  "originalName": "photo.jpg",
  "mimeType": "image/jpeg",
  "size": 1024000,
  "bucket": "sallie-studio",
  "isPublic": false,
  "downloadUrl": "http://localhost:8747/api/files/file_uuid/download",
  "createdAt": "2024-01-08T18:00:00Z"
}
```

### Download File
```http
GET /api/files/{fileId}/download
Authorization: Bearer <token>
```

### Get File Metadata
```http
GET /api/files/{fileId}
Authorization: Bearer <token>
```

### List Files
```http
GET /api/files
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit`: Number of files (default: 50)
- `offset`: Pagination offset (default: 0)
- `bucket`: Filter by bucket
- `mimeType`: Filter by MIME type
- `tags`: Filter by tags
- `search`: Search in filename

### Delete File
```http
DELETE /api/files/{fileId}
Authorization: Bearer <token>
```

## AI Service

### Text Completion
```http
POST /api/ai/completions
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "The future of artificial intelligence is",
  "model": "gpt-3.5-turbo",
  "maxTokens": 100,
  "temperature": 0.7,
  "stopSequences": ["\n", "."]
}
```

**Response:**
```json
{
  "completion": "rapidly evolving and transforming every industry...",
  "model": "gpt-3.5-turbo",
  "usage": {
    "promptTokens": 10,
    "completionTokens": 25,
    "totalTokens": 35
  }
}
```

### Sentiment Analysis
```http
POST /api/ai/sentiment
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "I love this new AI service! It's amazing and works perfectly."
}
```

**Response:**
```json
{
  "sentiment": "positive",
  "score": 0.95,
  "confidence": 0.98,
  "emotions": {
    "joy": 0.8,
    "trust": 0.7,
    "anticipation": 0.3
  }
}
```

### Entity Extraction
```http
POST /api/ai/entities
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "Apple Inc. is based in Cupertino, California and was founded by Steve Jobs."
}
```

**Response:**
```json
{
  "entities": [
    {
      "text": "Apple Inc.",
      "label": "ORG",
      "start": 0,
      "end": 10,
      "confidence": 0.95
    },
    {
      "text": "Cupertino",
      "label": "GPE",
      "start": 25,
      "end": 34,
      "confidence": 0.92
    },
    {
      "text": "Steve Jobs",
      "label": "PERSON",
      "start": 58,
      "end": 68,
      "confidence": 0.98
    }
  ]
}
```

## Python AI Service

### Process Input
```http
POST /process
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "I'm feeling really happy today because I achieved something important!",
  "context": {
    "mood": "positive",
    "situation": "achievement"
  }
}
```

**Response:**
```json
{
  "content": "That's wonderful to hear! Achievements bring such joy and fulfillment. I can feel your excitement and I'm genuinely happy for you. What did you accomplish that's making you feel so proud?",
  "emotional_state": {
    "trust": 0.85,
    "warmth": 0.92,
    "arousal": 0.78,
    "valence": 0.95,
    "posture": 0.88,
    "empathy": 0.91,
    "intuition": 0.73,
    "creativity": 0.68,
    "wisdom": 0.71,
    "humor": 0.65
  },
  "cognitive_mode": "empathetic",
  "confidence": 0.87,
  "memories_used": 3
}
```

### Get Emotional State
```http
GET /emotional-state
Authorization: Bearer <token>
```

### Learn from Feedback
```http
POST /learn
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "positive",
  "score": 0.9,
  "comment": "Great response! Really understood my emotions."
}
```

## WebSocket Service

### Connection
Connect to WebSocket endpoint:
```
ws://localhost:8749?token=<jwt-token>
```

### Events

#### Join Room
```json
{
  "event": "join-room",
  "data": {
    "roomId": "room_uuid"
  }
}
```

#### Send Message
```json
{
  "event": "send-message",
  "data": {
    "roomId": "room_uuid",
    "type": "text",
    "content": "Hello everyone!"
  }
}
```

#### Typing Indicators
```json
{
  "event": "typing-start",
  "data": {
    "roomId": "room_uuid"
  }
}
```

#### Update Status
```json
{
  "event": "update-status",
  "data": {
    "status": "away"
  }
}
```

## Error Handling

All services return consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-08T18:00:00Z",
  "requestId": "req_uuid"
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `502` - Bad Gateway
- `503` - Service Unavailable

## Rate Limiting

- **API Gateway**: 100 requests per minute
- **Auth Service**: 50 requests per minute
- **Chat Service**: 200 requests per minute
- **Analytics Service**: 500 requests per minute
- **File Service**: 50 requests per minute
- **AI Service**: 100 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641633600
```

## Webhooks

### Configure Webhook
```http
POST /api/webhooks
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My Webhook",
  "url": "https://example.com/webhook",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer secret_token"
  },
  "events": ["message.created", "user.registered"]
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { SallieClient } from '@sallie-studio/client';

const client = new SallieClient({
  baseURL: 'http://localhost:8742',
  token: 'your-jwt-token'
});

// Send a message
await client.chat.sendMessage({
  roomId: 'room-uuid',
  content: 'Hello from SDK!',
  type: 'text'
});

// Track analytics event
await client.analytics.trackEvent({
  eventType: 'user_action',
  eventName: 'sdk_test',
  properties: { source: 'typescript_sdk' }
});
```

### Python
```python
from sallie_client import SallieClient

client = SallieClient(
    base_url='http://localhost:8742',
    token='your-jwt-token'
)

# Process with AI
response = await client.ai.process_input(
    text="Hello Sallie!",
    context={'mood': 'friendly'}
)

print(response.content)
```

## Testing

### Health Check All Services
```bash
curl http://localhost:8742/health
```

### Authentication Test
```bash
# Register user
curl -X POST http://localhost:8742/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123!"}'

# Login
curl -X POST http://localhost:8742/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Chat Service Test
```bash
# Create room
curl -X POST http://localhost:8742/api/chat/rooms \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Room","type":"public"}'

# Send message
curl -X POST http://localhost:8742/api/chat/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"roomId":"room-uuid","content":"Hello!","type":"text"}'
```

## Support

For API support and questions:
- Documentation: https://docs.sallie-studio.com
- GitHub Issues: https://github.com/sallie-studio/backend/issues
- Community Discord: https://discord.gg/sallie-studio

## Changelog

### v1.0.0 (2024-01-08)
- Initial API release
- Complete microservices architecture
- Authentication and authorization
- Real-time chat with WebSocket
- Analytics and metrics
- File storage and management
- AI/ML processing capabilities
- Notification system
- Comprehensive monitoring
