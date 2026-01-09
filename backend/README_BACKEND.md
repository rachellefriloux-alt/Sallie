# Sallie Studio Backend

A comprehensive microservices backend for the Sallie Studio ecosystem, combining Node.js/TypeScript services with Python AI processing.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   SALLIE STUDIO BACKEND                    │
├─────────────────────────────────────────────────────────────┤
│  API Gateway (Port 8742)                                   │
│  ├── Authentication & Authorization                        │
│  ├── Rate Limiting & Security                               │
│  ├── Request Routing & Load Balancing                      │
│  └── Monitoring & Tracing                                  │
├─────────────────────────────────────────────────────────────┤
│  Microservices (Ports 8743-8749)                           │
│  ├── Auth Service (8743)      ── User Management          │
│  ├── Chat Service (8744)      ── Real-time Communication   │
│  ├── Analytics Service (8745) ── Data Analytics            │
│  ├── Notification Service (8746)── Notifications            │
│  ├── File Service (8747)       ── File Management           │
│  ├── AI Service (8748)         ── AI/ML Operations          │
│  ├── WebSocket Service (8749) ── Real-time Events          │
│  └── Python AI Service (8000) ── Advanced AI Processing     │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure                                            │
│  ├── PostgreSQL (Database)                                 │
│  ├── Redis (Cache & Sessions)                              │
│  ├── Elasticsearch (Analytics)                             │
│  ├── MinIO (File Storage)                                  │
│  ├── Kafka (Event Streaming)                               │
│  └── Prometheus (Metrics)                                  │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for AI service)

### Running the Backend

1. **Start all services:**
```bash
docker-compose up -d
```

2. **Start only core services:**
```bash
docker-compose -f docker-compose.minimal.yml up -d
```

3. **Check service status:**
```bash
docker-compose ps
```

4. **View logs:**
```bash
docker-compose logs -f
```

## 📁 Project Structure

```
\\Sallie\b\
├── docker-compose.yml              # Full stack configuration
├── docker-compose.minimal.yml      # Core services only
├── .env                           # Environment variables
├── services/                      # Microservices
│   ├── api-gateway/              # Port 8742 - Main entry point
│   ├── auth-service/             # Port 8743 - Authentication
│   ├── chat-service/             # Port 8744 - Real-time chat
│   ├── analytics-service/        # Port 8745 - Data analytics
│   ├── notification-service/     # Port 8746 - Notifications
│   ├── file-service/             # Port 8747 - File storage
│   ├── ai-service/               # Port 8748 - AI/ML operations
│   ├── websocket-service/        # Port 8749 - WebSocket events
│   └── python-ai-service/        # Port 8000 - Advanced AI
├── tests/                        # Backend tests
├── scripts/                      # Utility scripts
└── docs/                         # Documentation
```

## 🔧 Services Overview

### **API Gateway** (Port 8742)
- **Purpose**: Central entry point, authentication, routing
- **Tech**: Express.js, Redis, JWT
- **Features**: Rate limiting, load balancing, security middleware

### **Auth Service** (Port 8743)
- **Purpose**: User authentication, authorization, session management
- **Tech**: Express.js, PostgreSQL, bcrypt, JWT
- **Features**: MFA, password management, user profiles

### **Chat Service** (Port 8744)
- **Purpose**: Real-time messaging with AI integration
- **Tech**: Express.js, Socket.IO, PostgreSQL
- **Features**: WebSocket support, message history, AI responses

### **Analytics Service** (Port 8745)
- **Purpose**: Data analytics and reporting
- **Tech**: Express.js, PostgreSQL, Elasticsearch
- **Features**: User analytics, performance metrics, custom reports

### **Notification Service** (Port 8746)
- **Purpose**: Push notifications and email alerts
- **Tech**: Express.js, Redis, SMTP
- **Features**: Email templates, push notifications, scheduling

### **File Service** (Port 8747)
- **Purpose**: File storage and management
- **Tech**: Express.js, MinIO, PostgreSQL
- **Features**: File upload/download, metadata management, CDN

### **AI Service** (Port 8748)
- **Purpose**: AI/ML operations and model management
- **Tech**: Express.js, Redis, OpenAI/Anthropic APIs
- **Features**: Text generation, sentiment analysis, model caching

### **WebSocket Service** (Port 8749)
- **Purpose**: Real-time event streaming
- **Tech**: Express.js, Socket.IO, Kafka
- **Features**: Event broadcasting, connection management, scaling

### **Python AI Service** (Port 8000)
- **Purpose**: Advanced AI processing with Sallie Brain
- **Tech**: FastAPI, Python, custom AI models
- **Features**: Emotional processing, memory management, cross-platform sync

## 🔌 API Documentation

### Health Checks
- **API Gateway**: `GET http://localhost:8742/health`
- **Auth Service**: `GET http://localhost:8743/health`
- **Chat Service**: `GET http://localhost:8744/health`
- **AI Service**: `GET http://localhost:8748/health`
- **Python AI**: `GET http://localhost:8000/health`

### Authentication
All protected endpoints require JWT authentication:
```bash
# Get token
POST http://localhost:8742/api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Use token
Authorization: Bearer <jwt_token>
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run specific service tests
cd services/auth-service && npm test

# Run integration tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

### Test Coverage
```bash
# Generate coverage report
npm run test:coverage
```

## 📊 Monitoring

### Metrics
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3001` (if configured)

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api-gateway
```

### Health Monitoring
All services expose `/health` endpoints with detailed status information.

## 🔒 Security

### Environment Variables
- `JWT_SECRET`: JWT signing secret (change in production)
- `POSTGRES_PASSWORD`: Database password
- `REDIS_PASSWORD`: Redis password

### Best Practices
- All services run as non-root users
- Secrets are injected via environment variables
- Rate limiting is enabled on all endpoints
- CORS is properly configured

## 🚀 Deployment

### Production Deployment
```bash
# Set production environment
export NODE_ENV=production

# Deploy with production configurations
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling Services
```bash
# Scale specific services
docker-compose up -d --scale chat-service=3 --scale ai-service=2
```

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run with hot reload
docker-compose -f docker-compose.dev.yml up
```

### Code Style
- ESLint for linting
- Prettier for formatting
- TypeScript for type safety
- Husky for git hooks

## 📝 Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Database
POSTGRES_DB=sallie_studio
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Redis
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_super_secret_jwt_key

# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `.env` file
2. **Database connection**: Check PostgreSQL is running
3. **Redis connection**: Verify Redis configuration
4. **Memory issues**: Increase Docker memory allocation

### Reset Services
```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Restart
docker-compose up -d
```

### Health Check All Services
```bash
# Check all service health
for service in api-gateway auth-service chat-service ai-service; do
  echo "Checking $service..."
  curl -f http://localhost:${PORTS[$service]}/health || echo "$service is down"
done
```
