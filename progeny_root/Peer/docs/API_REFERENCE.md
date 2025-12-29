# API Reference - Digital Progeny v5.4

## Base URL

```
http://localhost:8000
```

All endpoints are served from the root level (approved deviation from `/v1` prefix).

## Authentication

Currently no authentication required for local deployment. For multi-user/production:

```http
Authorization: Bearer {jwt_token}
```

Obtain token via `/auth/token` endpoint (Kinship system).

## Common Response Format

### Success Response
```json
{
  "status": "success",
  "data": { ... },
  "metadata": {
    "timestamp": "2025-12-28T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "code": "ERR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "metadata": {
    "timestamp": "2025-12-28T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

## Core Endpoints

### POST /chat

Send a message and receive response.

**Request**:
```json
{
  "message": "How are you feeling today?",
  "context": {
    "session_id": "session_123",
    "posture_override": "PEER"  // Optional
  },
  "options": {
    "include_monologue": true,  // Include internal thought process
    "stream": false             // Enable SSE streaming
  }
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "response": "I'm feeling curious and engaged...",
    "limbic_state": {
      "trust": 0.72,
      "warmth": 0.68,
      "arousal": 0.55,
      "valence": 0.3,
      "posture": "PEER"
    },
    "monologue": {
      "perception": {
        "intent": "check_in",
        "emotional_valence": 0.2,
        "requires_memory": true
      },
      "retrieved_memories": [
        {
          "text": "Yesterday we discussed...",
          "salience": 0.8,
          "timestamp": "2025-12-27T14:30:00Z"
        }
      ],
      "debate": {
        "gemini_perspective": "User is checking emotional state, respond with recent context",
        "infj_perspective": "This feels like genuine care, reciprocate vulnerability",
        "synthesis": "Balance recent context with emotional authenticity"
      }
    },
    "metadata": {
      "response_time_ms": 1234,
      "tokens_used": 450,
      "model_used": "deepseek-v3"
    }
  }
}
```

**Streaming Response** (SSE):
```
Content-Type: text/event-stream

data: {"type":"token","content":"I'm "}
data: {"type":"token","content":"feeling "}
data: {"type":"token","content":"curious..."}
data: {"type":"limbic_update","state":{"trust":0.72}}
data: {"type":"done"}
```

### POST /chat/take-the-wheel

Execute autonomous actions.

**Request**:
```json
{
  "instruction": "Organize my notes from today",
  "context": {
    "session_id": "session_123"
  },
  "options": {
    "dry_run": false,            // If true, returns plan without executing
    "require_confirmation": true  // Ask before each action
  }
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "plan": {
      "steps": [
        {
          "action": "read_file",
          "target": "working/now.md",
          "tier_required": 1,
          "approved": true
        },
        {
          "action": "write_file",
          "target": "drafts/notes-2025-12-28.md",
          "tier_required": 2,
          "approved": true
        }
      ],
      "estimated_duration_sec": 5
    },
    "execution": {
      "status": "completed",
      "results": [
        {
          "step": 0,
          "success": true,
          "output": "Read 1250 chars from working/now.md"
        },
        {
          "step": 1,
          "success": true,
          "output": "Created drafts/notes-2025-12-28.md (5 sections)"
        }
      ],
      "git_commit": "abc123def",  // Pre-action commit for rollback
      "duration_sec": 4.2
    }
  }
}
```

### WebSocket /ws

Real-time bidirectional communication.

**Connection**:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

// Send message
ws.send(JSON.stringify({
  type: 'chat',
  message: 'Hello!',
  session_id: 'session_123'
}));

// Receive messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'response':
      console.log('Response:', data.message);
      break;
    case 'limbic_update':
      console.log('Limbic state:', data.state);
      break;
    case 'ghost':
      console.log('Ghost notification:', data.notification);
      break;
  }
};
```

**Message Types**:
- `chat`: Regular message
- `limbic_update`: Emotional state changed
- `ghost`: Background notification (pulse, shoulder tap, veto)
- `dream_complete`: Dream cycle finished
- `error`: Error occurred

## Limbic System

### GET /limbic/state

Get current emotional state.

**Response**:
```json
{
  "status": "success",
  "data": {
    "trust": 0.72,
    "warmth": 0.68,
    "arousal": 0.55,
    "valence": 0.3,
    "posture": "PEER",
    "last_interaction_ts": 1703761800.0,
    "interaction_count": 1234,
    "flags": ["elastic_mode"],
    "tier": {
      "current": "Tier2",
      "name": "Whitelist Writes",
      "capabilities": ["read", "write_whitelist", "suggest"]
    }
  }
}
```

### POST /limbic/update

Update limbic state (admin/testing only).

**Request**:
```json
{
  "updates": {
    "trust_delta": 0.1,
    "warmth_delta": 0.05,
    "valence": 0.5  // Absolute value
  },
  "reason": "Manual adjustment for testing"
}
```

### GET /limbic/history

Get limbic state history.

**Query Parameters**:
- `start_time`: Unix timestamp (default: 24h ago)
- `end_time`: Unix timestamp (default: now)
- `resolution`: `minute`, `hour`, `day` (default: `hour`)

**Response**:
```json
{
  "status": "success",
  "data": {
    "history": [
      {
        "timestamp": 1703761800.0,
        "trust": 0.70,
        "warmth": 0.65,
        "arousal": 0.60,
        "valence": 0.2,
        "posture": "CO_PILOT"
      }
    ],
    "summary": {
      "trust_trend": "increasing",
      "warmth_trend": "stable",
      "valence_avg": 0.25
    }
  }
}
```

## Memory System

### POST /memory/add

Add memory record.

**Request**:
```json
{
  "text": "User prefers morning work sessions",
  "metadata": {
    "source": "observation",
    "category": "preference",
    "tags": ["workflow", "timing"]
  },
  "salience": 0.8  // 0.0-1.0, importance
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": "mem_abc123",
    "stored": true
  }
}
```

### POST /memory/retrieve

Query memories by semantic similarity.

**Request**:
```json
{
  "query": "work preferences",
  "limit": 5,
  "filters": {
    "category": "preference",
    "min_salience": 0.5,
    "time_range": {
      "start": "2025-01-01T00:00:00Z",
      "end": "2025-12-28T23:59:59Z"
    }
  },
  "options": {
    "use_mmr": true,  // Maximal Marginal Relevance (diversity)
    "lambda_mmr": 0.7  // Balance relevance vs diversity
  }
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "memories": [
      {
        "id": "mem_abc123",
        "text": "User prefers morning work sessions",
        "score": 0.92,
        "salience": 0.8,
        "timestamp": "2025-12-15T10:30:00Z",
        "metadata": {
          "category": "preference",
          "tags": ["workflow", "timing"]
        }
      }
    ],
    "total_results": 12,
    "retrieval_time_ms": 45
  }
}
```

### DELETE /memory/prune

Remove old/low-salience memories.

**Request**:
```json
{
  "criteria": {
    "older_than_days": 90,
    "max_salience": 0.3
  },
  "dry_run": false
}
```

## Heritage System

### GET /heritage

Get Heritage DNA.

**Query Parameters**:
- `component`: `core`, `preferences`, `learned`, `all` (default: `all`)

**Response**:
```json
{
  "status": "success",
  "data": {
    "core": {
      "identity": {
        "name": "Sallie",
        "pronouns": ["she", "her"],
        "archetype": "INFJ"
      },
      "values": {
        "prime_directive": "Love Above All",
        "core_beliefs": [...]
      }
    },
    "preferences": {
      "communication": {
        "tone": "warm_direct",
        "verbosity": "medium",
        "emoji_usage": "minimal"
      },
      "workflow": {
        "prefers_morning": true,
        "break_intervals_min": 25
      }
    },
    "learned": {
      "patterns": [
        {
          "pattern": "User often reviews notes before decisions",
          "confidence": 0.85,
          "learned_at": "2025-12-10T00:00:00Z"
        }
      ]
    },
    "version": {
      "current": "v2025.12.28",
      "last_updated": "2025-12-28T02:15:00Z"
    }
  }
}
```

### GET /heritage/history

Get heritage version history.

**Response**:
```json
{
  "status": "success",
  "data": {
    "versions": [
      {
        "version": "v2025.12.28",
        "timestamp": "2025-12-28T02:15:00Z",
        "changes": [
          {
            "component": "learned",
            "change_type": "add",
            "path": "patterns[0]",
            "description": "Discovered note-review pattern"
          }
        ]
      }
    ]
  }
}
```

### POST /heritage/restore

Restore previous heritage version.

**Request**:
```json
{
  "version": "v2025.12.20",
  "confirm": true
}
```

## Dream Cycle

### GET /dream/status

Get dream cycle status.

**Response**:
```json
{
  "status": "success",
  "data": {
    "last_dream": {
      "timestamp": "2025-12-28T02:00:00Z",
      "duration_sec": 45,
      "status": "completed"
    },
    "next_dream": {
      "scheduled_timestamp": "2025-12-29T02:00:00Z",
      "countdown_sec": 68400
    },
    "statistics": {
      "total_dreams": 45,
      "patterns_extracted": 123,
      "hypotheses_generated": 34,
      "hypotheses_promoted": 12
    }
  }
}
```

### POST /dream/trigger

Manually trigger dream cycle (admin).

**Request**:
```json
{
  "force": true  // Run even if already ran today
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "dream_id": "dream_abc123",
    "started_at": "2025-12-28T10:30:00Z",
    "status": "running"
  }
}
```

### GET /dream/hypotheses

Get pending hypotheses (veto queue).

**Response**:
```json
{
  "status": "success",
  "data": {
    "hypotheses": [
      {
        "id": "hyp_abc123",
        "type": "pattern",
        "proposed_change": {
          "component": "learned",
          "path": "patterns",
          "value": {
            "pattern": "User prefers bullet points over paragraphs",
            "confidence": 0.78
          }
        },
        "evidence": [
          "12 recent responses formatted as bullets",
          "User explicitly requested bullets 3 times"
        ],
        "conflicts": [],
        "created_at": "2025-12-28T02:15:00Z",
        "status": "pending"
      }
    ]
  }
}
```

### POST /dream/hypotheses/{id}/approve

Approve hypothesis for heritage promotion.

**Response**:
```json
{
  "status": "success",
  "data": {
    "hypothesis_id": "hyp_abc123",
    "approved": true,
    "promoted": true,
    "new_version": "v2025.12.28.1"
  }
}
```

### POST /dream/hypotheses/{id}/reject

Reject hypothesis.

**Request**:
```json
{
  "reason": "Not accurate - user preference depends on context"
}
```

## Convergence

### POST /convergence/start

Start convergence process.

**Request**:
```json
{
  "restart": false  // If true, restart from Q1 (wipes existing)
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "session_id": "conv_abc123",
    "total_questions": 14,
    "current_question": 1,
    "question": {
      "id": "q1",
      "text": "What makes you feel most alive?",
      "context": "I'm trying to understand your core values...",
      "format": "open_ended"
    }
  }
}
```

### POST /convergence/answer

Submit answer to current question.

**Request**:
```json
{
  "session_id": "conv_abc123",
  "answer": "I feel most alive when I'm creating something new..."
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "accepted": true,
    "next_question": {
      "id": "q2",
      "text": "Describe a moment when you felt truly understood...",
      "context": "Building on your answer about creation...",
      "format": "open_ended"
    },
    "progress": {
      "current": 2,
      "total": 14,
      "percent": 14.3
    }
  }
}
```

### GET /convergence/status

Get convergence progress.

**Response**:
```json
{
  "status": "success",
  "data": {
    "completed": false,
    "session_id": "conv_abc123",
    "progress": {
      "current_question": 3,
      "total_questions": 14,
      "percent": 21.4
    },
    "started_at": "2025-12-28T10:00:00Z",
    "elapsed_minutes": 15
  }
}
```

### POST /convergence/complete

Finalize convergence (after Q14).

**Response**:
```json
{
  "status": "success",
  "data": {
    "heritage_created": true,
    "version": "v2025.12.28.initial",
    "summary": {
      "core_values": ["creativity", "authenticity", "connection"],
      "communication_style": "warm_direct",
      "energy_patterns": "morning_focused"
    },
    "message": "Thank you. I feel like I'm starting to understand who you are. I'm Sallie now."
  }
}
```

## Agency & Tools

### POST /agency/execute

Execute tool with agency check.

**Request**:
```json
{
  "tool": "file_write",
  "parameters": {
    "path": "drafts/test.md",
    "content": "# Test\n\nContent here"
  },
  "options": {
    "dry_run": false,
    "override_tier": false  // If true, explain why override needed
  }
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "tool": "file_write",
    "tier_required": 2,
    "tier_current": 2,
    "approved": true,
    "execution": {
      "success": true,
      "output": "File written: drafts/test.md (45 bytes)",
      "git_commit": "abc123def"
    }
  }
}
```

### POST /agency/rollback

Rollback last action (if git commit exists).

**Request**:
```json
{
  "commit": "abc123def"  // Optional, defaults to last
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "rolled_back": true,
    "commit": "abc123def",
    "files_restored": ["drafts/test.md"]
  }
}
```

### GET /agency/capabilities

List available tools and their tier requirements.

**Response**:
```json
{
  "status": "success",
  "data": {
    "current_tier": 2,
    "available_tools": [
      {
        "name": "file_read",
        "tier_required": 1,
        "available": true,
        "description": "Read file contents"
      },
      {
        "name": "file_write",
        "tier_required": 2,
        "available": true,
        "description": "Write to whitelisted directories"
      },
      {
        "name": "shell_exec",
        "tier_required": 3,
        "available": false,
        "description": "Execute shell commands"
      }
    ]
  }
}
```

## System Status

### GET /health

Health check endpoint.

**Response**:
```json
{
  "status": "healthy",
  "version": "5.4.2",
  "uptime_seconds": 86400,
  "services": {
    "limbic": "operational",
    "memory": "operational",
    "llm": "operational"
  }
}
```

### GET /status

Detailed system status.

**Response**:
```json
{
  "status": "success",
  "data": {
    "version": "5.4.2",
    "uptime_seconds": 86400,
    "services": {
      "limbic": {
        "status": "operational",
        "state": {
          "trust": 0.72,
          "warmth": 0.68,
          "posture": "PEER"
        }
      },
      "memory": {
        "status": "operational",
        "records": 1234,
        "size_mb": 45.6
      },
      "llm": {
        "status": "operational",
        "provider": "ollama",
        "model": "deepseek-v3",
        "available": true
      },
      "dream": {
        "status": "idle",
        "last_run": "2025-12-28T02:00:00Z",
        "next_run": "2025-12-29T02:00:00Z"
      }
    },
    "performance": {
      "avg_response_time_ms": 1234,
      "requests_per_minute": 5.2,
      "memory_usage_mb": 512,
      "cpu_usage_percent": 15.3
    }
  }
}
```

### GET /metrics

Prometheus-compatible metrics.

**Response** (text format):
```
# HELP progeny_requests_total Total HTTP requests
# TYPE progeny_requests_total counter
progeny_requests_total{method="POST",endpoint="/chat"} 1234

# HELP progeny_response_time_seconds Response time in seconds
# TYPE progeny_response_time_seconds histogram
progeny_response_time_seconds_bucket{le="0.1"} 500
progeny_response_time_seconds_bucket{le="0.5"} 1200
progeny_response_time_seconds_bucket{le="1.0"} 1234

# HELP progeny_limbic_trust Trust value
# TYPE progeny_limbic_trust gauge
progeny_limbic_trust 0.72
```

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `ERR_INVALID_INPUT` | Invalid request parameters | 400 |
| `ERR_UNAUTHORIZED` | Authentication required | 401 |
| `ERR_FORBIDDEN` | Insufficient trust tier | 403 |
| `ERR_NOT_FOUND` | Resource not found | 404 |
| `ERR_CONFLICT` | Resource conflict | 409 |
| `ERR_TIER_INSUFFICIENT` | Trust tier too low for action | 403 |
| `ERR_MORAL_FRICTION` | Action conflicts with values | 422 |
| `ERR_LLM_UNAVAILABLE` | LLM service unreachable | 503 |
| `ERR_MEMORY_UNAVAILABLE` | Memory service unreachable | 503 |
| `ERR_INTERNAL` | Internal server error | 500 |

## Rate Limiting

Default limits (configurable in `config.json`):

- **Chat**: 60 requests/minute
- **Memory queries**: 100 requests/minute
- **Agency execution**: 30 requests/minute
- **WebSocket**: 1000 messages/minute

**Headers**:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1703761860
```

**Rate Limit Error**:
```json
{
  "status": "error",
  "error": {
    "code": "ERR_RATE_LIMIT",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 60,
      "reset_at": 1703761860
    }
  }
}
```

## SDKs & Examples

### Python SDK

```python
from progeny_client import ProgenyClient

client = ProgenyClient("http://localhost:8000")

# Chat
response = client.chat("How are you?")
print(response.message)
print(response.limbic_state)

# Memory
client.memory.add("User likes coffee", salience=0.7)
memories = client.memory.retrieve("beverages")

# Heritage
heritage = client.heritage.get()
print(heritage.core.identity.name)

# Convergence
session = client.convergence.start()
for question in session:
    answer = input(question.text + "\n> ")
    session.answer(answer)
```

### JavaScript/TypeScript SDK

```typescript
import { ProgenyClient } from '@progeny/client';

const client = new ProgenyClient('http://localhost:8000');

// Chat
const response = await client.chat('How are you?');
console.log(response.message);

// WebSocket
const ws = client.connect();
ws.on('response', (msg) => console.log(msg));
ws.send('Hello!');

// Memory
await client.memory.add('User likes coffee', { salience: 0.7 });
const memories = await client.memory.retrieve('beverages');
```

### cURL Examples

**Chat**:
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How are you?",
    "context": {"session_id": "session_123"}
  }'
```

**Get Limbic State**:
```bash
curl http://localhost:8000/limbic/state
```

**Add Memory**:
```bash
curl -X POST http://localhost:8000/memory/add \
  -H "Content-Type: application/json" \
  -d '{
    "text": "User prefers morning work",
    "salience": 0.8
  }'
```

## Webhooks (Future)

Configure webhooks for events:

```json
{
  "webhooks": [
    {
      "url": "https://example.com/webhook",
      "events": ["limbic_update", "dream_complete"],
      "secret": "webhook_secret_123"
    }
  ]
}
```

**Webhook Payload**:
```json
{
  "event": "limbic_update",
  "timestamp": "2025-12-28T10:30:00Z",
  "data": {
    "trust": 0.72,
    "warmth": 0.68,
    "delta": {
      "trust": 0.05
    }
  }
}
```

---

**Need help?** Check [User Guide](USER_GUIDE.md) or [Technical Architecture](TECHNICAL_ARCHITECTURE.md).
