# API Documentation

## Overview

Sallie Studio provides a comprehensive REST API for managing conversations, avatars, settings, and user authentication. The API is designed to be RESTful, JSON-based, and follows OpenAPI 3.0 specifications.

## Base URL

- **Development**: `http://localhost:8742/api`
- **Production**: `http://192.168.1.47:8742/api`
- **Remote**: `https://sallie.yourdomain.com/api` (via Cloudflare Tunnel)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication

#### POST /auth/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "User Name",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /auth/logout
Invalidate the current JWT token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST /auth/refresh
Refresh an expired JWT token.

**Headers:**
```
Authorization: Bearer <expired-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token"
  }
}
```

### User Management

#### GET /user/profile
Get the current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "User Name",
    "avatar": null,
    "preferences": {
      "theme": "dark",
      "notifications": true
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /user/profile
Update the current user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "preferences": {
    "theme": "light",
    "notifications": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "Updated Name",
    "preferences": {
      "theme": "light",
      "notifications": false
    }
  }
}
```

### Conversations

#### GET /conversations
Get all conversations for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of conversations to return (default: 20)
- `offset` (optional): Number of conversations to skip (default: 0)
- `search` (optional): Search term for conversation titles

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv-123",
      "title": "Test Conversation",
      "last_message": "Hello from Sallie!",
      "timestamp": "2024-01-01T12:00:00Z",
      "unread": false,
      "message_count": 5
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

#### POST /conversations
Create a new conversation.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New Conversation"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv-456",
    "title": "New Conversation",
    "messages": [],
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

#### GET /conversations/{conversation_id}
Get a specific conversation with all messages.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv-123",
    "title": "Test Conversation",
    "messages": [
      {
        "id": "msg-1",
        "role": "user",
        "content": "Hello Sallie!",
        "timestamp": "2024-01-01T12:00:00Z"
      },
      {
        "id": "msg-2",
        "role": "assistant",
        "content": "Hello! How can I help you today?",
        "timestamp": "2024-01-01T12:00:01Z"
      }
    ],
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:01Z"
  }
}
```

#### POST /conversations/{conversation_id}/messages
Add a new message to a conversation.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role": "user",
  "content": "Hello Sallie!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "msg-3",
    "role": "user",
    "content": "Hello Sallie!",
    "timestamp": "2024-01-01T12:00:02Z",
    "conversation_id": "conv-123"
  }
}
```

#### DELETE /conversations/{conversation_id}
Delete a conversation.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

### Avatar Management

#### GET /avatar/current
Get the current user's avatar.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "avatar-123",
    "name": "Sallie",
    "appearance": {
      "skin_tone": "#f4c2a1",
      "hair_color": "#8b4513",
      "eye_color": "#4a90e2",
      "outfit": "casual"
    },
    "mood": "happy",
    "personality": "friendly",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /avatar
Create a new avatar.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Sallie",
  "appearance": {
    "skin_tone": "#f4c2a1",
    "hair_color": "#8b4513",
    "eye_color": "#4a90e2",
    "outfit": "casual"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "avatar-456",
    "name": "Sallie",
    "appearance": {
      "skin_tone": "#f4c2a1",
      "hair_color": "#8b4513",
      "eye_color": "#4a90e2",
      "outfit": "casual"
    },
    "mood": "neutral",
    "personality": "friendly",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

#### PUT /avatar/{avatar_id}
Update an avatar's appearance and settings.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mood": "excited",
  "appearance": {
    "skin_tone": "#d4a574",
    "hair_color": "#654321"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "avatar-123",
    "name": "Sallie",
    "appearance": {
      "skin_tone": "#d4a574",
      "hair_color": "#654321",
      "eye_color": "#4a90e2",
      "outfit": "casual"
    },
    "mood": "excited",
    "personality": "friendly",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

#### PATCH /avatar/{avatar_id}/mood
Change only the avatar's mood.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mood": "happy"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "avatar-123",
    "mood": "happy",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

### Settings Management

#### GET /settings
Get the current user's settings.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "theme": "dark",
    "language": "en",
    "notifications": {
      "email": true,
      "push": true,
      "desktop": false
    },
    "privacy": {
      "data_collection": false,
      "analytics": true
    },
    "accessibility": {
      "font_size": "medium",
      "high_contrast": false,
      "reduced_motion": false
    }
  }
}
```

#### POST /settings
Create initial settings for a user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "theme": "dark",
  "language": "en",
  "notifications": {
    "email": true,
    "push": true,
    "desktop": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "settings-123",
    "theme": "dark",
    "language": "en",
    "notifications": {
      "email": true,
      "push": true,
      "desktop": false
    },
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

#### PUT /settings/{settings_id}
Update user settings.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "theme": "light",
  "language": "fr",
  "notifications": {
    "email": false,
    "push": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "settings-123",
    "theme": "light",
    "language": "fr",
    "notifications": {
      "email": false,
      "push": true,
      "desktop": false
    },
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

#### PATCH /settings/{settings_id}/theme
Toggle between light and dark theme.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "theme": "light",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

### System Endpoints

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "websocket": "healthy",
    "storage": "healthy"
  }
}
```

#### GET /info
Server information.

**Response:**
```json
{
  "name": "Sallie Studio API",
  "version": "1.0.0",
  "description": "API for Sallie Studio digital progeny platform",
  "endpoints": {
    "auth": "/auth",
    "conversations": "/conversations",
    "avatar": "/avatar",
    "settings": "/settings"
  }
}
```

## WebSocket API

### Connection

Connect to the WebSocket endpoint for real-time updates:

```
ws://localhost:8742/ws
```

Include JWT token in the connection query parameter:

```
ws://localhost:8742/ws?token=<your-jwt-token>
```

### Message Format

All WebSocket messages follow this format:

```json
{
  "type": "message_type",
  "data": {
    // Message-specific data
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Message Types

#### conversation_update
Sent when a conversation is updated.

```json
{
  "type": "conversation_update",
  "data": {
    "conversation_id": "conv-123",
    "title": "Updated Title",
    "last_message": "New message"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### new_message
Sent when a new message is added to a conversation.

```json
{
  "type": "new_message",
  "data": {
    "conversation_id": "conv-123",
    "message": {
      "id": "msg-456",
      "role": "assistant",
      "content": "Hello!",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### avatar_update
Sent when the avatar is updated.

```json
{
  "type": "avatar_update",
  "data": {
    "avatar_id": "avatar-123",
    "mood": "excited",
    "appearance": {
      "skin_tone": "#d4a574"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### settings_update
Sent when user settings are updated.

```json
{
  "type": "settings_update",
  "data": {
    "theme": "light",
    "language": "fr"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Error Handling

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details
    }
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Invalid or missing authentication token
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request data
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

### Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Conversation endpoints**: 100 requests per minute
- **Avatar endpoints**: 50 requests per minute
- **Settings endpoints**: 25 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Data Models

### User
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "avatar": "Avatar|null",
  "preferences": {
    "theme": "light|dark",
    "notifications": "boolean"
  },
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Conversation
```json
{
  "id": "string",
  "user_id": "string",
  "title": "string",
  "messages": ["Message"],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Message
```json
{
  "id": "string",
  "conversation_id": "string",
  "role": "user|assistant|system",
  "content": "string",
  "timestamp": "datetime"
}
```

### Avatar
```json
{
  "id": "string",
  "user_id": "string",
  "name": "string",
  "appearance": {
    "skin_tone": "string",
    "hair_color": "string",
    "eye_color": "string",
    "outfit": "string"
  },
  "mood": "string",
  "personality": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Settings
```json
{
  "id": "string",
  "user_id": "string",
  "theme": "light|dark",
  "language": "string",
  "notifications": {
    "email": "boolean",
    "push": "boolean",
    "desktop": "boolean"
  },
  "privacy": {
    "data_collection": "boolean",
    "analytics": "boolean"
  },
  "accessibility": {
    "font_size": "small|medium|large|extra-large",
    "high_contrast": "boolean",
    "reduced_motion": "boolean"
  },
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @sallie-studio/api-client
```

```typescript
import { SallieAPI } from '@sallie-studio/api-client';

const api = new SallieAPI({
  baseURL: 'http://localhost:8742/api',
  token: 'your-jwt-token'
});

const conversations = await api.conversations.getAll();
```

### Python
```bash
pip install sallie-studio-api
```

```python
from sallie_studio_api import SallieAPI

api = SallieAPI(
    base_url='http://localhost:8742/api',
    token='your-jwt-token'
)

conversations = api.conversations.get_all()
```

### C#
```bash
dotnet add package SallieStudio.ApiClient
```

```csharp
using SallieStudio.ApiClient;

var api = new SallieAPI("http://localhost:8742/api", "your-jwt-token");
var conversations = await api.Conversations.GetAllAsync();
```

## Testing

### API Testing Examples

#### Using curl
```bash
# Login
curl -X POST http://localhost:8742/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get conversations
curl -X GET http://localhost:8742/api/conversations \
  -H "Authorization: Bearer your-jwt-token"
```

#### Using Postman
Import the OpenAPI specification from `/api/openapi.json` into Postman for easy testing.

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:
- **JSON**: `/api/openapi.json`
- **YAML**: `/api/openapi.yaml`
- **Swagger UI**: `/api/docs`

## Changelog

### Version 1.0.0
- Initial API release
- Authentication endpoints
- Conversation management
- Avatar management
- Settings management
- WebSocket support
- Rate limiting
- Comprehensive error handling

## Support

For API support and questions:
- **Documentation**: `/docs/api/`
- **Issues**: GitHub Issues
- **Email**: api-support@sallie.studio
- **Discord**: `#api-support` channel
