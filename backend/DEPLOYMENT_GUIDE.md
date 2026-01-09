# Sallie Studio Backend Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Sallie Studio backend ecosystem in various environments.

## Prerequisites

### System Requirements

- **CPU**: 4+ cores recommended
- **RAM**: 8GB+ minimum, 16GB+ recommended
- **Storage**: 50GB+ SSD
- **Network**: Stable internet connection
- **OS**: Linux (Ubuntu 20.04+), macOS, or Windows 10+

### Software Requirements

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for local development)
- Python 3.11+ (for Python AI service)
- Git

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/sallie-studio/backend.git
cd backend
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Services
```bash
# Start all services
docker-compose up -d

# Or start only core services
docker-compose -f docker-compose.minimal.yml up -d
```

### 4. Verify Deployment
```bash
# Check service health
curl http://localhost:8742/health

# View logs
docker-compose logs -f
```

## Environment Configuration

### Required Environment Variables

```bash
# Database Configuration
POSTGRES_DB=sallie_studio
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://postgres:your_secure_password@localhost:5432/sallie_studio

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRATION_HOURS=24

# AI Services
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# File Storage
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=your_minio_password
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=your_minio_password

# Notification Services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Monitoring
PROMETHEUS_RETENTION=200h
GRAFANA_ADMIN_PASSWORD=your_grafana_password
```

### Optional Environment Variables

```bash
# Development
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug

# Production
NODE_ENV=production
DEBUG=false
LOG_LEVEL=info

# External Services
ELASTICSEARCH_URL=http://localhost:9200
KAFKA_BROKERS=localhost:9092
QDRANT_URL=http://localhost:6333

# Performance
API_RATE_LIMIT=1000
MAX_FILE_SIZE=104857600
WORKER_TIMEOUT=30
```

## Deployment Options

### Option 1: Local Development

#### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- Python 3.11+

#### Steps
1. **Setup Environment**
```bash
# Clone and configure
git clone https://github.com/sallie-studio/backend.git
cd backend
cp .env.example .env
# Edit .env file
```

2. **Start Infrastructure**
```bash
# Start databases and infrastructure
docker-compose up -d postgres redis elasticsearch kafka minio

# Wait for services to be ready
sleep 30
```

3. **Run Database Migrations**
```bash
# Run PostgreSQL migrations
docker-compose exec postgres psql -U postgres -d sallie_studio -f /docker-entrypoint-initdb.d/001_initial_schema.sql
```

4. **Start Application Services**
```bash
# Start all services
docker-compose up -d

# Or start minimal setup
docker-compose -f docker-compose.minimal.yml up -d
```

5. **Verify Deployment**
```bash
# Health checks
curl http://localhost:8742/health
curl http://localhost:8743/health
curl http://localhost:8744/health
curl http://localhost:8748/health
curl http://localhost:8000/health
```

### Option 2: Production Deployment

#### Prerequisites
- Production server with Docker
- SSL certificates
- Domain name
- Load balancer (optional)

#### Steps
1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application user
sudo useradd -m -s /bin/bash sallie
sudo usermod -aG docker sallie
```

2. **Application Setup**
```bash
# Switch to application user
sudo su - sallie

# Clone repository
git clone https://github.com/sallie-studio/backend.git
cd backend

# Configure environment
cp .env.example .env
nano .env  # Edit with production values
```

3. **SSL Configuration**
```bash
# Generate SSL certificates (Let's Encrypt recommended)
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates to application directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/
```

4. **Production Docker Compose**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Application services (same as development but with production settings)
  api-gateway:
    build: ./services/api-gateway
    environment:
      - NODE_ENV=production
      - PORT=8742
    ports:
      - "0.0.0.0:8742:8742"
    restart: unless-stopped
    # Add SSL and security configurations
```

5. **Start Services**
```bash
# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Setup reverse proxy (nginx example)
sudo apt install nginx
sudo cp nginx.conf /etc/nginx/sites-available/sallie-studio
sudo ln -s /etc/nginx/sites-available/sallie-studio /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Option 3: Cloud Deployment

#### AWS ECS Deployment

1. **Create ECS Cluster**
```bash
# Using AWS CLI
aws ecs create-cluster --cluster-name sallie-studio --instance-type t3.medium
```

2. **Build and Push Images**
```bash
# Build images
docker build -t sallie-studio/api-gateway ./services/api-gateway
docker build -t sallie-studio/auth-service ./services/auth-service
# ... build all services

# Tag for ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-west-2.amazonaws.com

docker tag sallie-studio/api-gateway:latest <account-id>.dkr.ecr.us-west-2.amazonaws.com/sallie-studio/api-gateway:latest
docker push <account-id>.dkr.ecr.us-west-2.amazonaws.com/sallie-studio/api-gateway:latest
```

3. **Create Task Definitions**
```json
{
  "family": "sallie-studio",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "api-gateway",
      "image": "<account-id>.dkr.ecr.us-west-2.amazonaws.com/sallie-studio/api-gateway:latest",
      "portMappings": [
        {
          "containerPort": 8742,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/sallie-studio",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Kubernetes Deployment

1. **Create Namespace**
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: sallie-studio
```

2. **Deploy Services**
```yaml
# api-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: sallie-studio
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: sallie-studio/api-gateway:latest
        ports:
        - containerPort: 8742
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: sallie-studio
spec:
  selector:
    app: api-gateway
  ports:
  - port: 8742
    targetPort: 8742
  type: LoadBalancer
```

## Monitoring Setup

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'sallie-services'
    static_configs:
      - targets: ['api-gateway:8742', 'auth-service:8743', 'chat-service:8744']
```

### Grafana Dashboards
```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana
# URL: http://localhost:3001
# Username: admin
# Password: admin123
```

## Security Configuration

### 1. Network Security
```bash
# Firewall configuration
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8742:8750/tcp  # Application ports
sudo ufw enable
```

### 2. Application Security
```bash
# Generate secure secrets
openssl rand -base64 32  # JWT secret
openssl rand -base64 32  # Database password
openssl rand -base64 32  # Redis password
```

### 3. SSL/TLS Configuration
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8742;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Backup and Recovery

### Database Backup
```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups/sallie-studio"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
docker-compose exec postgres pg_dump -U postgres sallie_studio > $BACKUP_DIR/postgres_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/postgres_$DATE.sql

# Cleanup old backups (keep 7 days)
find $BACKUP_DIR -name "postgres_*.sql.gz" -mtime +7 -delete
```

### File Storage Backup
```bash
# MinIO backup
mc mirror minio/sallie-studio /backup/minio/$(date +%Y%m%d)/
```

## Performance Optimization

### 1. Database Optimization
```sql
-- PostgreSQL performance tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
```

### 2. Redis Optimization
```bash
# redis.conf
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 3. Application Optimization
```bash
# Node.js performance
NODE_OPTIONS="--max-old-space-size=2048"

# Worker processes
WORKER_PROCESSES=4
```

## Troubleshooting

### Common Issues

#### 1. Services Won't Start
```bash
# Check logs
docker-compose logs <service-name>

# Check port conflicts
netstat -tulpn | grep :8742

# Check resource usage
docker stats
```

#### 2. Database Connection Issues
```bash
# Test database connection
docker-compose exec postgres psql -U postgres -d sallie_studio -c "SELECT 1;"

# Check network connectivity
docker network ls
docker network inspect sallie-studio_default
```

#### 3. High Memory Usage
```bash
# Monitor memory usage
docker stats --no-stream

# Restart services
docker-compose restart <service-name>

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

### Health Check Scripts
```bash
#!/bin/bash
# health-check.sh

SERVICES=("api-gateway:8742" "auth-service:8743" "chat-service:8744" "ai-service:8748")

for service in "${SERVICES[@]}"; do
    IFS=':' read -r name port <<< "$service"
    
    if curl -f http://localhost:$port/health > /dev/null 2>&1; then
        echo "✅ $name is healthy"
    else
        echo "❌ $name is unhealthy"
        exit 1
    fi
done

echo "All services are healthy! 🎉"
```

## Scaling

### Horizontal Scaling
```bash
# Scale individual services
docker-compose up -d --scale api-gateway=3 --scale chat-service=2

# Auto-scaling with Kubernetes
kubectl autoscale deployment api-gateway --cpu-percent=70 --min=2 --max=10
```

### Vertical Scaling
```yaml
# docker-compose.prod.yml
services:
  api-gateway:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Maintenance

### Rolling Updates
```bash
# Update without downtime
docker-compose up -d --no-deps api-gateway
docker-compose up -d --no-deps auth-service
```

### Zero-Downtime Deployment
```bash
# Blue-green deployment
docker-compose -f docker-compose.blue.yml up -d
# Test and switch
docker-compose -f docker-compose.green.yml up -d
```

## Support

### Getting Help
- Documentation: https://docs.sallie-studio.com
- GitHub Issues: https://github.com/sallie-studio/backend/issues
- Community: https://discord.gg/sallie-studio
- Email: support@sallie-studio.com

### Monitoring Alerts
- CPU usage > 80%
- Memory usage > 85%
- Disk usage > 90%
- Error rate > 5%
- Response time > 2s

### Emergency Procedures
1. **Service Down**: Check logs, restart service
2. **Database Issue**: Check connections, restart database
3. **High Load**: Scale services, check resource usage
4. **Security Issue**: Review logs, rotate secrets

---

This deployment guide covers all aspects of deploying and maintaining the Sallie Studio backend ecosystem. For specific deployment scenarios or additional help, refer to the documentation or contact support.
