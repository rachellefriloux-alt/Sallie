# Sallie Studio Backend

A comprehensive microservices backend for the Sallie Studio ecosystem, built with Node.js/TypeScript and Python FastAPI.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   SALLIE STUDIO BACKEND                    │
├─────────────────────────────────────────────────────────────┤
│  API Gateway (Port 3000)                                   │
│  ├── Authentication & Authorization                        │
│  ├── Rate Limiting & Security                               │
│  ├── Request Routing & Load Balancing                      │
│  └── Monitoring & Tracing                                  │
├─────────────────────────────────────────────────────────────┤
│  Microservices (Ports 3001-3008)                           │
│  ├── Auth Service (3001)      ── User Management          │
│  ├── Chat Service (3002)      ── Real-time Communication   │
│  ├── Analytics Service (3003)  ── Data Analytics            │
│  ├── Notification Service (3004)── Notifications            │
│  ├── File Service (3005)       ── File Management           │
│  ├── AI Service (3006)         ── AI/ML Operations          │
│  ├── WebSocket Service (3007)  ── Real-time Events          │
│  └── Python AI Service (3008) ── Advanced AI Processing     │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure                                            │
│  ├── PostgreSQL (Database)                                 │
│  ├── Redis (Cache & Sessions)                              │
│  ├── Elasticsearch (Analytics)                             │
│  ├── MinIO (File Storage)                                  │
│  ├── Prometheus (Metrics)                                  │
│  ├── Jaeger (Tracing)                                     │
│  └── Kafka (Event Streaming)                               │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Services Overview

### **API Gateway** (Port 3000)
- **Purpose**: Central entry point, authentication, routing
- **Tech**: Express.js, Redis, JWT
- **Features**: Rate limiting, load balancing, security middleware

### **Auth Service** (Port 3001)
- **Purpose**: User authentication, authorization, session management
- **Tech**: Express.js, PostgreSQL, bcrypt, JWT
- **Features**: MFA, password management, user profiles

### **Chat Service** (Port 3002)
- **Purpose**: Real-time messaging, room management
- **Tech**: Express.js, Socket.IO, PostgreSQL
- **Features**: Chat rooms, direct messages, typing indicators

### **Analytics Service** (Port 3003)
- **Purpose**: Event tracking, analytics, reporting
- **Tech**: Express.js, PostgreSQL, Elasticsearch
- **Features**: Custom events, funnels, real-time analytics

### **Notification Service** (Port 3004)
- **Purpose**: Multi-channel notifications
- **Tech**: Express.js, PostgreSQL, SMTP, Twilio
- **Features**: Email, SMS, push notifications, templates

### **File Service** (Port 3005)
- **Purpose**: File upload, storage, management
- **Tech**: Express.js, MinIO/S3, PostgreSQL
- **Features**: Upload/download, sharing, thumbnails

### **AI Service** (Port 3006)
- **Purpose**: AI/ML operations and model management
- **Tech**: Express.js, OpenAI, Anthropic APIs
- **Features**: Chat completions, embeddings, model comparison

### **WebSocket Service** (Port 3007)
- **Purpose**: Real-time event broadcasting
- **Tech**: Express.js, Socket.IO, Redis
- **Features**: Presence, room management, live updates

### **Python AI Service** (Port 3008)
- **Purpose**: Advanced AI processing with local models
- **Tech**: FastAPI, PyTorch, Transformers
- **Features**: Local ML models, advanced analytics

## 📋 Prerequisites

- **Node.js** 18+ (for TypeScript services)
- **Python** 3.11+ (for Python AI Service)
- **PostgreSQL** 15+
- **Redis** 7+
- **Elasticsearch** 8+
- **MinIO** (or S3 compatible storage)
- **Docker** & **Docker Compose**

## 🛠️ Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd \\Sallie\b\\services
```

### 2. Environment Configuration
```bash
# Copy environment templates
for service in */.env.example; do
  cp "$service" "${service%.example}"
done

# Edit each .env file with your configuration
```

### 3. Start Infrastructure
```bash
# Start with Docker Compose
docker-compose up -d postgres redis elasticsearch minio prometheus jaeger
```

### 4. Install Dependencies
```bash
# TypeScript services
npm run install:all

# Python AI Service
cd python-ai-service
pip install -r requirements.txt
cd ..
```

### 5. Database Setup
```bash
# Run migrations (for each service)
npm run migrate

# Or use the Python AI Service migrations
cd python-ai-service
alembic upgrade head
cd ..
```

### 6. Start Services
```bash
# Start all services
npm run start:all

# Or start individual services
npm run start:auth
npm run start:chat
# ... etc
```

## 🐳 Docker Deployment

### Full Stack
```bash
docker-compose up -d
```

### Individual Services
```bash
# Auth Service
docker-compose up auth-service

# All services
docker-compose up
```

## 📊 Monitoring & Observability

### **Prometheus Metrics**
- **URL**: http://localhost:9090
- **Services**: Each service exposes metrics on port 909X
- **Metrics**: Request count, duration, error rates, custom metrics

### **Jaeger Tracing**
- **URL**: http://localhost:16686
- **Services**: Distributed tracing across all microservices
- **Features**: Request flow, performance analysis, error tracking

### **Health Checks**
Each service provides health endpoints:
- `/health` - Comprehensive health check
- `/health/ready` - Readiness probe
- `/health/live` - Liveness probe
- `/metrics` - Prometheus metrics

## 🔧 Development

### **Scripts**
```bash
# Development
npm run dev:all          # Start all in development mode
npm run dev:auth         # Start auth service in dev mode
npm run dev:chat         # Start chat service in dev mode

# Building
npm run build:all        # Build all services
npm run build:auth       # Build auth service

# Testing
npm run test:all         # Run all tests
npm run test:auth        # Run auth service tests

# Linting
npm run lint:all         # Lint all services
npm run lint:auth        # Lint auth service

# Database
npm run migrate:all      # Run all migrations
npm run migrate:auth     # Run auth service migrations
```

### **Code Structure**
```
services/
├── auth-service/
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── models/      # Database models
│   │   ├── middleware/  # Express middleware
│   │   ├── utils/       # Utility functions
│   │   └── database/    # Database connection
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── chat-service/
│   └── ...
└── python-ai-service/
    ├── src/
    │   ├── api/         # FastAPI endpoints
    │   ├── core/        # Configuration, security
    │   ├── models/      # SQLAlchemy models
    │   ├── schemas/     # Pydantic schemas
    │   ├── services/    # Business logic
    │   └── middleware/  # FastAPI middleware
    ├── requirements.txt
    └── Dockerfile
```

## 🔐 Security

### **Authentication**
- **JWT Tokens**: Stateless authentication
- **API Keys**: Service-to-service communication
- **MFA**: Multi-factor authentication support
- **Sessions**: Secure session management

### **Security Features**
- **Rate Limiting**: Prevent abuse
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Request validation
- **SQL Injection Prevention**: Parameterized queries

## 📈 Performance

### **Optimizations**
- **Connection Pooling**: Database connection management
- **Redis Caching**: Frequently accessed data
- **Async Processing**: Non-blocking operations
- **Load Balancing**: Distribute requests
- **Compression**: Reduce response sizes

### **Monitoring**
- **Response Times**: Track API performance
- **Error Rates**: Monitor system health
- **Resource Usage**: CPU, memory, disk usage
- **Database Performance**: Query optimization

## 🔄 API Documentation

### **OpenAPI/Swagger**
Each service exposes API documentation:
- **Auth Service**: http://localhost:3001/docs
- **Chat Service**: http://localhost:3002/docs
- **Analytics Service**: http://localhost:3003/docs
- **Notification Service**: http://localhost:3004/docs
- **File Service**: http://localhost:3005/docs
- **AI Service**: http://localhost:3006/docs
- **WebSocket Service**: http://localhost:3007/docs
- **Python AI Service**: http://localhost:3008/docs

### **API Gateway**
- **Gateway Docs**: http://localhost:3000/docs
- **Service Routes**: All services accessible through gateway

## 🚀 Production Deployment

### **Environment Setup**
1. **Configure**: Update all .env files
2. **Database**: Setup PostgreSQL with proper permissions
3. **Redis**: Configure Redis cluster if needed
4. **Storage**: Setup MinIO or S3 bucket
5. **Monitoring**: Configure Prometheus and Jaeger

### **Deployment Options**
1. **Docker Compose**: Simple deployment
2. **Kubernetes**: Scalable deployment
3. **AWS ECS**: Managed container service
4. **DigitalOcean**: App Platform or Droplets

### **Scaling**
- **Horizontal Scaling**: Add more instances
- **Vertical Scaling**: Increase resources
- **Database Scaling**: Read replicas, sharding
- **Cache Scaling**: Redis cluster

## 🐛 Troubleshooting

### **Common Issues**
1. **Database Connection**: Check DATABASE_URL
2. **Redis Connection**: Verify Redis is running
3. **Port Conflicts**: Ensure ports are available
4. **Environment Variables**: Check .env files
5. **Dependencies**: Run npm install

### **Logs**
- **Service Logs**: Each service logs to console and files
- **Gateway Logs**: Centralized logging
- **Error Tracking**: Comprehensive error logging
- **Performance**: Request/response logging

## 📝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Support

For support and questions:
- **Documentation**: Check service docs
- **Issues**: Create GitHub issues
- **Discussions**: Use GitHub discussions
- **Email**: support@sallie.studio

---

**Built with ❤️ for Sallie Studio**
