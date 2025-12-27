# API Documentation

## Base URL

```
http://localhost:8000
```

## Authentication

All endpoints require authentication via session token (except `/health`).

### Headers
```
Authorization: Bearer <session_token>
X-Kinship-Actor: <actor_id>  # Optional, defaults to token's actor
```

## Endpoints

### Health & Status

#### GET /health
Get system health status.

**Response:**
```json
{
  "status": "FULL|AMNESIA|OFFLINE|DEAD",
  "services": {
    "ollama": true,
    "qdrant": true
  }
}
```

### Chat

#### POST /chat
Send a message to Sallie.

**Request:**
```json
{
  "text": "Hello, Sallie!"
}
```

**Response:**
```json
{
  "response": "Hello! How can I help you?",
  "limbic_state": {
    "trust": 0.72,
    "warmth": 0.68,
    "arousal": 0.85,
    "valence": 0.61,
    "posture": "COMPANION"
  },
  "timestamp": "2025-01-XXT12:00:00Z"
}
```

### Device Access

#### GET /device/status
Get device status (battery, network, etc.).

**Response:**
```json
{
  "platform": "Windows",
  "battery": {
    "percent": 85,
    "plugged": true
  },
  "network": {
    "connected": true,
    "interfaces": ["Wi-Fi", "Ethernet"]
  }
}
```

#### GET /device/resources
Get system resource usage.

**Response:**
```json
{
  "cpu": {
    "percent": 45.2,
    "count": 8
  },
  "memory": {
    "total": 16777216000,
    "available": 8388608000,
    "percent": 50.0
  },
  "disk": {
    "total": 1000000000000,
    "used": 500000000000,
    "free": 500000000000,
    "percent": 50.0
  }
}
```

#### GET /device/files/read?file_path=/path/to/file
Read a file from the device.

**Response:**
```json
{
  "path": "/path/to/file",
  "content": "File contents...",
  "size": 1024,
  "modified": "2025-01-XXT12:00:00Z"
}
```

#### POST /device/files/write
Write a file to the device.

**Request:**
```json
{
  "file_path": "/path/to/file",
  "content": "File contents...",
  "create_dirs": true
}
```

#### POST /device/apps/launch
Launch an application.

**Request:**
```json
{
  "app_name": "notepad.exe",
  "args": ["file.txt"]
}
```

### Smart Home

#### GET /smarthome/devices
Get all devices from all smart home platforms.

**Response:**
```json
{
  "home_assistant": [
    {
      "entity_id": "light.living_room",
      "state": "on",
      "attributes": {}
    }
  ],
  "alexa": [],
  "google_home": [],
  "homekit": [],
  "copilot": []
}
```

#### POST /smarthome/control
Control a smart home device.

**Request:**
```json
{
  "device_id": "light.living_room",
  "action": "turn_on",
  "platform": "home_assistant",
  "value": null
}
```

#### GET /smarthome/automations
Get all automations from Home Assistant.

**Response:**
```json
{
  "automations": [
    {
      "id": "automation_1",
      "name": "Morning Routine"
    }
  ]
}
```

#### POST /smarthome/automations/trigger
Trigger a smart home automation.

**Request:**
```json
{
  "automation_id": "automation_1"
}
```

### Sync

#### GET /sync/status
Get sync status.

**Response:**
```json
{
  "last_sync": "2025-01-XXT12:00:00Z",
  "devices": [
    {
      "device_id": "device_1",
      "name": "iPhone",
      "platform": "ios",
      "last_sync": "2025-01-XXT12:00:00Z"
    }
  ]
}
```

#### POST /sync/register_device
Register a new device for sync.

**Request:**
```json
{
  "device_id": "device_1",
  "platform": "ios",
  "name": "iPhone"
}
```

#### POST /sync/request_full_sync
Request a full synchronization.

**Response:**
```json
{
  "status": "success",
  "sync_id": "sync_123"
}
```

### Mobile API

#### POST /mobile/register
Register a mobile device.

**Request:**
```json
{
  "device_id": "device_1",
  "platform": "ios",
  "name": "iPhone",
  "version": "17.0"
}
```

#### POST /mobile/push
Update push notification token.

**Request:**
```json
{
  "device_id": "device_1",
  "token": "push_token_123",
  "platform": "ios"
}
```

### Control

#### POST /control/take
Creator takes full control.

**Request:**
```json
{
  "reason": "Creator intervention"
}
```

#### POST /control/emergency_stop
Immediate halt of all autonomous actions.

**Request:**
```json
{
  "reason": "Emergency stop"
}
```

#### GET /control/status
Get current control status.

**Response:**
```json
{
  "control_active": false,
  "emergency_stop": false,
  "state_locked": false
}
```

## WebSocket

### Endpoint: /ws

Real-time communication endpoint.

**Connect:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
```

**Send:**
```json
{
  "type": "message",
  "content": "Hello, Sallie!"
}
```

**Receive:**
```json
{
  "type": "response",
  "content": "Hello! How can I help?",
  "timestamp": "2025-01-XXT12:00:00Z"
}
```

**Limbic Update:**
```json
{
  "type": "limbic_update",
  "state": {
    "trust": 0.72,
    "warmth": 0.68,
    "arousal": 0.85,
    "valence": 0.61
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### Error Codes

- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- **Default**: 100 requests per minute per IP
- **Chat endpoint**: 10 requests per minute per user
- **WebSocket**: No rate limit (connection-based)

## Versioning

Current API version: `v1`

Version is specified in URL path: `/v1/...` (future)

