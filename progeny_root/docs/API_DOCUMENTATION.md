# API Documentation

## Base URL

`http://localhost:8000`

## Endpoints

### Chat

- **POST** `/chat`
  - Send message to Sallie
  - Request: `{"message": "string"}`
  - Response: `{"response": "string", "limbic_state": {...}, ...}`

### Control

- **POST** `/control/take` - Creator takes control
- **POST** `/control/release` - Creator releases control
- **POST** `/control/emergency_stop` - Emergency stop
- **POST** `/control/resume` - Resume after emergency stop
- **POST** `/control/lock` - Lock state
- **POST** `/control/unlock` - Unlock state
- **GET** `/control/status` - Get control status
- **GET** `/control/history` - Get control history

### Agency

- **GET** `/agency/advisory` - Get advisory recommendation
- **GET** `/agency/overrides` - Get override history
- **POST** `/agency/rollback` - Rollback an action
  - Request body:
    ```json
    {
      "action_id": "string (optional)",
      "commit_hash": "string (optional)",
      "explanation": "string (required)"
    }
    ```
  - Response:
    ```json
    {
      "status": "success",
      "message": "Rollback applied successfully",
      "action_id": "action_123",
      "original_commit": "abc123",
      "rollback_commit": "def456",
      "trust_penalty": 0.02,
      "new_trust": 0.83
    }
    ```
  - Notes:
    - Either `action_id` or `commit_hash` must be provided
    - `explanation` is required
    - Applies Trust penalty of 0.02 as per specification
    - Uses git revert to restore previous state

### Learning

- **GET** `/learning/summary` - Get learning summary
- **POST** `/learning/practice` - Practice a skill
- **POST** `/learning/create` - Create content
- **POST** `/learning/apply` - Apply a skill

### Avatar

- **GET** `/avatar/options` - Get avatar options
- **POST** `/avatar/choose` - Choose avatar
- **POST** `/avatar/update` - Update avatar
- **GET** `/avatar/css` - Get avatar CSS

### Convergence

- **POST** `/convergence/start` - Start convergence session
- **GET** `/convergence/question` - Get next question
- **POST** `/convergence/answer` - Submit answer

## WebSocket

- **WS** `/ws` - WebSocket connection for real-time chat

## Error Responses

All errors return:
```json
{
  "error": "Error message",
  "status_code": 400
}
```

## Authentication

Currently no authentication required. Add authentication for production.

## Rate Limiting

Not implemented. Add rate limiting for production.

