# 🔌 Sallie API Documentation v5.4.1

Complete API reference for Sallie's backend services.

---

## 📍 Base URLs

- **Backend API**: `http://localhost:8742`
- **WebSocket**: `ws://localhost:8742/ws`
- **Frontend**: `http://localhost:3000`

---

## 🔐 Authentication

All API endpoints require JWT authentication (except health check).

### Get JWT Token
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "creator",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### Use Token
Include in Authorization header:
```http
Authorization: Bearer eyJ...
```

---

## 📡 WebSocket Endpoints

### Convergence WebSocket
**Endpoint**: `ws://localhost:8742/ws/convergence`

**Connect**:
```javascript
const ws = new WebSocket('ws://localhost:8742/ws/convergence');
```

**Message Format**:
```json
{
  "type": "answer",
  "question_number": 1,
  "answer": "My answer text...",
  "word_count": 150
}
```

**Server Responses**:
```json
{
  "type": "processing",
  "status": "analyzing"
}

{
  "type": "limbic_update",
  "trust": 0.65,
  "warmth": 0.72,
  "arousal": 0.58,
  "valence": 0.75,
  "posture": "companion"
}

{
  "type": "sallie_response",
  "message": "I hear the depth in your words..."
}

{
  "type": "extraction_complete",
  "extracted_data": { ... }
}
```

### General WebSocket
**Endpoint**: `ws://localhost:8742/ws`

Used for general real-time communication.

---

## 🎯 Convergence API

### Start Convergence
```http
POST /api/convergence/start
Authorization: Bearer {token}
```

**Response:**
```json
{
  "session_id": "conv_123...",
  "status": "started",
  "total_questions": 30
}
```

### Submit Answer
```http
POST /api/convergence/answer
Authorization: Bearer {token}
Content-Type: application/json

{
  "question_number": 1,
  "answer": "My detailed answer...",
  "voice_input": false
}
```

**Response:**
```json
{
  "accepted": true,
  "extracted_data": { ... },
  "limbic_impact": {
    "trust_delta": 0.05,
    "warmth_delta": 0.08
  },
  "next_question": 2
}
```

### Get Convergence Status
```http
GET /api/convergence/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "completed": false,
  "current_question": 5,
  "total_questions": 30,
  "answers_submitted": 4,
  "heritage_dna_compiled": false
}
```

### Complete Convergence
```http
POST /api/convergence/complete
Authorization: Bearer {token}
```

**Response:**
```json
{
  "heritage_dna": { ... },
  "final_limbic_state": { ... },
  "completion_timestamp": "2026-01-10T18:00:00Z"
}
```

---

## 🧬 Heritage DNA API

### Get Heritage DNA
```http
GET /api/heritage/dna
Authorization: Bearer {token}
```

**Response:**
```json
{
  "user_id": "creator_123",
  "version": "1.0",
  "convergence_complete": true,
  "shadows": { ... },
  "aspirations": { ... },
  "ethics": { ... },
  "resonance": { ... },
  "mirror_test": { ... },
  "creative_force": { ... },
  "energy_architecture": { ... },
  "decision_architecture": { ... },
  "transformation": { ... },
  "final_integration": { ... }
}
```

### Update Heritage DNA
```http
PATCH /api/heritage/dna
Authorization: Bearer {token}
Content-Type: application/json

{
  "section": "aspirations",
  "updates": { ... }
}
```

---

## 🧠 Limbic State API

### Get Current State
```http
GET /api/limbic/state
Authorization: Bearer {token}
```

**Response:**
```json
{
  "trust": 0.75,
  "warmth": 0.82,
  "arousal": 0.65,
  "valence": 0.78,
  "posture": "companion",
  "timestamp": "2026-01-10T18:00:00Z"
}
```

### Update State
```http
POST /api/limbic/update
Authorization: Bearer {token}
Content-Type: application/json

{
  "trust_delta": 0.05,
  "warmth_delta": 0.03,
  "reason": "Deep conversation"
}
```

---

## 🎭 Posture Modes API

### Get Current Posture
```http
GET /api/posture/current
Authorization: Bearer {token}
```

**Response:**
```json
{
  "posture": "companion",
  "characteristics": {
    "name": "Companion",
    "description": "Warm, grounding presence",
    "style": "Gentle, empathetic",
    "goal": "Emotional support"
  },
  "confidence": 0.95
}
```

### Set Posture
```http
POST /api/posture/set
Authorization: Bearer {token}
Content-Type: application/json

{
  "posture": "copilot",
  "reason": "Starting work session"
}
```

### Auto-Select Posture
```http
POST /api/posture/auto-select
Authorization: Bearer {token}
Content-Type: application/json

{
  "creator_state": {
    "energy_level": 0.4,
    "stress_level": 0.7,
    "cognitive_load": 0.8
  },
  "context": {
    "activity_type": "work"
  }
}
```

---

## 🎖️ Trust Tiers API

### Get Current Tier
```http
GET /api/trust/tier
Authorization: Bearer {token}
```

**Response:**
```json
{
  "tier": "TIER_2",
  "trust_level": 0.85,
  "allowed_capabilities": [
    "file_read",
    "file_write_drafts",
    "file_write",
    "shell_exec"
  ],
  "next_tier_at": 0.9
}
```

### Check Capability
```http
POST /api/trust/check-capability
Authorization: Bearer {token}
Content-Type: application/json

{
  "capability": "file_write"
}
```

**Response:**
```json
{
  "allowed": true,
  "tier": "TIER_2",
  "constraints": [
    "Whitelist paths only",
    "Git commit before modification",
    "Rollback available"
  ]
}
```

---

## 🛡️ Git Safety Net API

### Create Pre-Action Commit
```http
POST /api/git/pre-action-commit
Authorization: Bearer {token}
Content-Type: application/json

{
  "files": ["path/to/file.txt"],
  "action_description": "Modifying configuration"
}
```

**Response:**
```json
{
  "success": true,
  "commit_hash": "abc123...",
  "can_rollback": true,
  "expires_at": "2026-01-10T19:00:00Z"
}
```

### Rollback to Commit
```http
POST /api/git/rollback
Authorization: Bearer {token}
Content-Type: application/json

{
  "commit_hash": "abc123...",
  "files": ["path/to/file.txt"]
}
```

### Get Undo Window
```http
GET /api/git/undo-window
Authorization: Bearer {token}
```

**Response:**
```json
{
  "commits": [
    {
      "commit_hash": "abc123...",
      "timestamp": "2026-01-10T17:30:00Z",
      "description": "Modifying configuration",
      "can_rollback": true,
      "expires_at": "2026-01-10T18:30:00Z"
    }
  ]
}
```

---

## 🧹 Working Memory Hygiene API

### Trigger Daily Reset
```http
POST /api/hygiene/daily-reset
Authorization: Bearer {token}
```

### Trigger Weekly Review
```http
POST /api/hygiene/weekly-review
Authorization: Bearer {token}
```

### Get Hygiene Status
```http
GET /api/hygiene/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "last_daily_reset": "2026-01-10T06:00:00Z",
  "last_weekly_review": "2026-01-07T18:00:00Z",
  "stale_items": 3
}
```

---

## 👻 Ghost Interface API

### Update Limbic Pulse
```http
POST /api/ghost/update-pulse
Authorization: Bearer {token}
Content-Type: application/json

{
  "trust": 0.75,
  "warmth": 0.82,
  "arousal": 0.65,
  "valence": 0.78
}
```

### Send Shoulder Tap
```http
POST /api/ghost/shoulder-tap
Authorization: Bearer {token}
Content-Type: application/json

{
  "tap_type": "workload_offer",
  "title": "High Activity Detected",
  "message": "Want me to help organize?",
  "priority": "normal"
}
```

### Get Recent Taps
```http
GET /api/ghost/recent-taps
Authorization: Bearer {token}
```

---

## 📊 Sensor Array API

### Get Detected Patterns
```http
GET /api/sensor/patterns
Authorization: Bearer {token}
```

**Response:**
```json
{
  "patterns": [
    {
      "pattern_type": "daily_routine",
      "confidence": 0.85,
      "description": "Consistent activity around 9:00",
      "frequency": 12
    }
  ]
}
```

### Get Behavioral Insights
```http
GET /api/sensor/insights
Authorization: Bearer {token}
```

---

## 🌙 Dream Cycle API

### Trigger Dream Cycle
```http
POST /api/dream/cycle
Authorization: Bearer {token}
```

### Get Morning Report
```http
GET /api/dream/morning-report
Authorization: Bearer {token}
```

**Response:**
```json
{
  "date": "2026-01-10",
  "insights_generated": [ ... ],
  "dna_evolution": { ... },
  "emotional_summary": { ... },
  "wisdom_synthesis": "..."
}
```

---

## 🏥 Health & Status API

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "5.4.1",
  "uptime": 3600,
  "services": {
    "websocket": "ready",
    "database": "ready",
    "convergence": "ready"
  }
}
```

### System Status
```http
GET /api/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "cpu_usage": 15.2,
  "memory_usage": 45.8,
  "active_sessions": 1,
  "uptime_hours": 12.5
}
```

---

## 🔧 Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  }
}
```

### Common Error Codes

- `AUTH_REQUIRED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions (trust tier)
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (422): Invalid request data
- `RATE_LIMIT` (429): Too many requests
- `SERVER_ERROR` (500): Internal server error

---

## 📝 Rate Limits

- **General API**: 100 requests/minute
- **Convergence**: 30 requests/minute  
- **WebSocket**: Unlimited (connection-based)
- **Auth**: 10 requests/minute

---

## 🎯 Example Usage (JavaScript)

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8742/ws/convergence');

ws.onopen = () => {
  console.log('Connected to Convergence');
  
  // Send answer
  ws.send(JSON.stringify({
    type: 'answer',
    question_number: 1,
    answer: 'My detailed answer...',
    word_count: 150
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'limbic_update':
      console.log('Limbic state:', data);
      break;
    case 'sallie_response':
      console.log('Sallie says:', data.message);
      break;
  }
};

// REST API call
async function getHeritageDNA() {
  const response = await fetch('http://localhost:8742/api/heritage/dna', {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  
  const data = await response.json();
  return data;
}
```

---

**Version**: 5.4.1 Complete  
**Last Updated**: 2026-01-10  
**Support**: Full production API ready for use
