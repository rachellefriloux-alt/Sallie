# Sallie Python AI Service

A production-ready FastAPI service for AI/ML operations including chat completions, text embeddings, sentiment analysis, entity extraction, summarization, and translation.

## Features

- **Multiple AI Providers**: Support for OpenAI, Anthropic, and local HuggingFace models
- **Comprehensive AI Operations**: Chat, completions, embeddings, sentiment analysis, NER, summarization, translation
- **Production Ready**: Authentication, rate limiting, metrics, tracing, error handling
- **Database Integration**: PostgreSQL with SQLAlchemy ORM
- **Monitoring**: Prometheus metrics and Jaeger tracing
- **Caching**: Redis integration for performance
- **Async Processing**: Full async/await support
- **Type Safety**: Pydantic models and type hints
- **API Documentation**: OpenAPI/Swagger documentation

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL
- Redis
- Docker (optional)

### Installation

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` with your configuration
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run database migrations:
   ```bash
   alembic upgrade head
   ```
6. Start the service:
   ```bash
   uvicorn src.main:app --host 0.0.0.0 --port 3008
   ```

### Docker Setup

```bash
# Build the image
docker build -t sallie-python-ai-service .

# Run the container
docker run -p 3008:3008 --env-file .env sallie-python-ai-service
```

## API Endpoints

### AI Operations

- `POST /api/v1/ai/chat` - Chat completions
- `POST /api/v1/ai/complete` - Text completions
- `POST /api/v1/ai/embeddings` - Text embeddings
- `POST /api/v1/ai/sentiment` - Sentiment analysis
- `POST /api/v1/ai/entities` - Entity extraction
- `POST /api/v1/ai/summarize` - Text summarization
- `POST /api/v1/ai/translate` - Text translation

### Model Management

- `GET /api/v1/models` - List available models
- `GET /api/v1/models/{id}` - Get model details
- `POST /api/v1/models/{id}/test` - Test model
- `GET /api/v1/models/{id}/stats` - Model statistics
- `POST /api/v1/models/compare` - Compare models
- `POST /api/v1/models/recommendations` - Get recommendations
- `GET /api/v1/models/{id}/health` - Model health

### Conversations

- `GET /api/v1/ai/conversations` - List conversations
- `POST /api/v1/ai/conversations` - Create conversation
- `GET /api/v1/ai/conversations/{id}` - Get conversation
- `PUT /api/v1/ai/conversations/{id}` - Update conversation
- `DELETE /api/v1/ai/conversations/{id}` - Delete conversation

### Health & Monitoring

- `GET /health` - Health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check
- `GET /metrics` - Prometheus metrics

## Authentication

The service supports two authentication methods:

1. **JWT Token**: Include `Authorization: Bearer <token>` header
2. **API Key**: Include `X-API-Key: <key>` header

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/sallie_ai` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `OPENAI_API_KEY` | OpenAI API key | None |
| `ANTHROPIC_API_KEY` | Anthropic API key | None |
| `DEFAULT_CHAT_MODEL` | Default chat model | `gpt-3.5-turbo` |
| `SECRET_KEY` | JWT secret key | `your-secret-key` |
| `DEBUG` | Debug mode | `false` |

### Model Configuration

The service supports multiple AI models:

#### OpenAI Models
- `gpt-3.5-turbo` - Fast chat model
- `gpt-4` - Advanced chat model
- `text-embedding-ada-002` - Text embeddings

#### Anthropic Models
- `claude-3-sonnet` - Balanced chat model
- `claude-3-opus` - Advanced chat model

#### Local Models
- Sentiment analysis (RoBERTa)
- Named entity recognition (BERT)
- Summarization (BART)
- Translation (MarianMT)

## Usage Examples

### Chat Completion

```python
import requests

response = requests.post(
    "http://localhost:3008/api/v1/ai/chat",
    headers={"Authorization": "Bearer your-token"},
    json={
        "message": "Hello, how are you?",
        "model": "gpt-3.5-turbo",
        "temperature": 0.7
    }
)

print(response.json())
```

### Text Embedding

```python
response = requests.post(
    "http://localhost:3008/api/v1/ai/embeddings",
    headers={"Authorization": "Bearer your-token"},
    json={
        "text": "This is a sample text for embedding.",
        "model": "text-embedding-ada-002"
    }
)

print(response.json())
```

### Sentiment Analysis

```python
response = requests.post(
    "http://localhost:3008/api/v1/ai/sentiment",
    headers={"Authorization": "Bearer your-token"},
    json={
        "text": "I love this product! It's amazing."
    }
)

print(response.json())
```

## Monitoring

### Prometheus Metrics

The service exposes Prometheus metrics on `/metrics`:

- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration
- `model_requests_total` - Model requests by type
- `model_response_time_seconds` - Model response time
- `active_connections` - Active connections

### Jaeger Tracing

Configure Jaeger endpoint in `.env`:
```
JAEGER_ENDPOINT=http://localhost:14268/api/traces
```

## Development

### Running Tests

```bash
pytest tests/
```

### Code Formatting

```bash
black src/
isort src/
```

### Type Checking

```bash
mypy src/
```

### Linting

```bash
flake8 src/
```

## Deployment

### Docker Compose

```yaml
version: '3.8'
services:
  python-ai-service:
    build: .
    ports:
      - "3008:3008"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/sallie_ai
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - redis
    volumes:
      - ./uploads:/app/uploads

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: sallie_ai
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: python-ai-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: python-ai-service
  template:
    metadata:
      labels:
        app: python-ai-service
    spec:
      containers:
      - name: python-ai-service
        image: sallie-python-ai-service:latest
        ports:
        - containerPort: 3008
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## Architecture

```
┌─────────────────┐
│   FastAPI App   │
├─────────────────┤
│  Authentication  │
│  Middleware     │
│  Rate Limiting  │
│  Metrics        │
│  Tracing        │
├─────────────────┤
│  AI Service     │
│  - OpenAI       │
│  - Anthropic    │
│  - Local Models │
├─────────────────┤
│  Database       │
│  PostgreSQL     │
├─────────────────┤
│  Cache          │
│  Redis          │
└─────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
