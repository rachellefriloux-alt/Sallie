# Digital Progeny - Complete Deployment Guide

**Version**: 5.4.2  
**Date**: December 28, 2025  
**Status**: Production Ready

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Web App Deployment](#web-app-deployment)
4. [Desktop App Deployment](#desktop-app-deployment)
5. [Android App Deployment](#android-app-deployment)
6. [Production Configuration](#production-configuration)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Python | 3.11+ | Backend runtime |
| Node.js | 18+ | Frontend build |
| Docker | Latest | Services (Ollama, Qdrant) |
| Git | Latest | Version control |

### For Mobile Development

| Platform | Requirements |
|----------|--------------|
| Android | Android Studio, JDK 17+, Android SDK 33+ |
| iOS | macOS, Xcode 15+, CocoaPods |

### System Requirements

**Minimum**:
- 4 CPU cores
- 16 GB RAM
- 50 GB storage

**Recommended**:
- 8 CPU cores
- 32 GB RAM
- 100 GB NVMe SSD
- NVIDIA GPU (optional, for acceleration)

---

## Backend Deployment

### 1. Install Dependencies

```bash
# Clone repository
git clone https://github.com/rachellefriloux-alt/Sallie.git
cd Sallie

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python packages
pip install -r progeny_root/requirements.txt
```

### 2. Configure Environment

Create `.env` file in the root directory:

```env
# Core Configuration
PROGENY_ROOT=./progeny_root
API_PORT=8000
WEB_PORT=3000

# Services
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-v3
QDRANT_URL=http://localhost:6333

# Logging
LOG_LEVEL=INFO

# Optional: Gemini API (for hybrid mode)
GEMINI_API_KEY=

# Security
SECRET_KEY=<generate-random-secret-key>
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 3. Start Services

```bash
# Start Docker services
docker-compose up -d

# Verify services
docker ps
curl http://localhost:11434/api/tags  # Ollama
curl http://localhost:6333/collections  # Qdrant
```

### 4. Start Backend

**Development Mode**:
```bash
cd progeny_root
python -m uvicorn core.main:app --reload --port 8000
```

**Production Mode**:
```bash
cd progeny_root
gunicorn core.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### 5. Verify Backend

```bash
# Health check
curl http://localhost:8000/health

# API documentation
open http://localhost:8000/docs
```

---

## Web App Deployment

### Development Mode

```bash
cd web
npm install
npm run dev
```

Access at: http://localhost:3000

### Production Build

```bash
cd web
npm install
npm run build
npm start
```

### Docker Deployment

Create `web/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t sallie-web ./web
docker run -p 3000:3000 -e API_URL=http://localhost:8000 sallie-web
```

### Cloud Deployment (Vercel)

```bash
cd web
vercel --prod
```

Configure environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`: Your backend URL
- `NEXT_PUBLIC_WS_URL`: Your WebSocket URL

---

## Desktop App Deployment

### Development Mode

```bash
cd desktop
npm install
npm run start
```

### Build for Windows

```bash
cd desktop
npm run build -- --win
```

Output: `desktop/dist/Sallie Setup.exe`

### Build for macOS

```bash
cd desktop
npm run build -- --mac
```

Output: `desktop/dist/Sallie.dmg`

### Build for Linux

```bash
cd desktop
npm run build -- --linux
```

Output: `desktop/dist/Sallie.AppImage`

### Distribution

**Windows**:
1. Sign the executable with a code signing certificate
2. Create installer with NSIS or Inno Setup
3. Distribute via Microsoft Store or direct download

**macOS**:
1. Sign with Apple Developer ID
2. Notarize with Apple
3. Distribute via App Store or direct download

**Linux**:
1. Package as .deb, .rpm, or AppImage
2. Distribute via snap, flatpak, or direct download

---

## Android App Deployment

### Setup Android Development

1. **Install Android Studio**: https://developer.android.com/studio
2. **Install JDK 17**
3. **Configure Android SDK** (API level 33+)
4. **Set environment variables**:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Development Build

```bash
cd mobile
npm install
npx react-native run-android
```

### Production Build

1. **Generate signing key**:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore sallie-release.keystore -alias sallie-key -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure signing** in `mobile/android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('SALLIE_RELEASE_STORE_FILE')) {
                storeFile file(SALLIE_RELEASE_STORE_FILE)
                storePassword SALLIE_RELEASE_STORE_PASSWORD
                keyAlias SALLIE_RELEASE_KEY_ALIAS
                keyPassword SALLIE_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

3. **Build APK**:

```bash
cd mobile/android
./gradlew assembleRelease
```

Output: `mobile/android/app/build/outputs/apk/release/app-release.apk`

4. **Build AAB** (for Google Play):

```bash
cd mobile/android
./gradlew bundleRelease
```

Output: `mobile/android/app/build/outputs/bundle/release/app-release.aab`

### Google Play Deployment

1. **Create Google Play Console account**
2. **Create app listing**
3. **Upload AAB file**
4. **Fill out store listing**:
   - App name: "Sallie - Digital Progeny"
   - Short description: "Your privacy-first AI partner"
   - Full description: Comprehensive feature list
   - Screenshots: 2-8 phone screenshots
   - Feature graphic: 1024x500 PNG
5. **Complete content rating questionnaire**
6. **Set pricing** (Free recommended)
7. **Submit for review**

### Direct APK Distribution

If not using Google Play:

1. Enable "Unknown Sources" on device
2. Transfer APK via USB or download
3. Install APK
4. Grant necessary permissions

---

## Production Configuration

### Security Hardening

1. **Generate secure secrets**:

```python
import secrets
print(secrets.token_urlsafe(32))  # SECRET_KEY
```

2. **Configure HTTPS**:

```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Configure nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **Enable rate limiting**:

Add to `progeny_root/core/main.py`:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/chat")
@limiter.limit("100/minute")
async def chat(request: Request):
    ...
```

### Database Backups

```bash
# Create backup script: backup.sh
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/sallie"

# Backup Qdrant data
docker exec qdrant tar czf /tmp/qdrant_${TIMESTAMP}.tar.gz /qdrant/storage
docker cp qdrant:/tmp/qdrant_${TIMESTAMP}.tar.gz ${BACKUP_DIR}/

# Backup progeny_root
tar czf ${BACKUP_DIR}/progeny_${TIMESTAMP}.tar.gz progeny_root/

# Cleanup old backups (keep 30 days)
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +30 -delete

# Schedule with cron
# 0 2 * * * /path/to/backup.sh
```

### Monitoring

1. **Prometheus metrics**:

```python
# Add to core/main.py
from prometheus_client import Counter, Histogram, generate_latest

chat_counter = Counter('chat_requests_total', 'Total chat requests')
response_time = Histogram('response_time_seconds', 'Response time')

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

2. **Health checks**:

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "5.4.2",
        "services": {
            "ollama": check_ollama(),
            "qdrant": check_qdrant(),
            "disk_space": check_disk_space()
        }
    }
```

### Logging

Configure structured logging:

```python
import logging.config

LOGGING_CONFIG = {
    "version": 1,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        },
        "json": {
            "class": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(name)s %(levelname)s %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default"
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "logs/sallie.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 10,
            "formatter": "json"
        }
    },
    "root": {
        "level": "INFO",
        "handlers": ["console", "file"]
    }
}

logging.config.dictConfig(LOGGING_CONFIG)
```

---

## Monitoring & Maintenance

### System Health Checks

Run daily health checks:

```bash
python progeny_root/scripts/health_check.py
```

### Performance Monitoring

Monitor key metrics:
- Response time (target: <2s)
- Memory usage (target: <8GB)
- CPU usage (target: <70%)
- Disk usage (target: <80%)

### Update Procedure

1. **Backup current state**:
```bash
./backup.sh
```

2. **Pull updates**:
```bash
git pull origin main
```

3. **Update dependencies**:
```bash
pip install -r progeny_root/requirements.txt
cd web && npm install
```

4. **Run migrations** (if any):
```bash
python progeny_root/scripts/migrate.py
```

5. **Restart services**:
```bash
docker-compose restart
systemctl restart sallie-backend
systemctl restart sallie-web
```

6. **Verify health**:
```bash
curl http://localhost:8000/health
```

### Troubleshooting

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Ollama connection failed | Check Docker: `docker ps`, restart: `docker-compose restart ollama` |
| Qdrant connection failed | Check port 6333: `lsof -i :6333`, restart: `docker-compose restart qdrant` |
| High memory usage | Restart backend, check for memory leaks in logs |
| Slow responses | Check Ollama model loading, increase timeout values |

### Support

- **Documentation**: `/progeny_root/README.md`
- **API Docs**: http://localhost:8000/docs
- **Logs**: `progeny_root/logs/`
- **Issues**: GitHub Issues

---

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] HTTPS enabled with valid certificate
- [ ] Rate limiting configured
- [ ] Monitoring enabled (Prometheus/Grafana)
- [ ] Backup automation configured
- [ ] Logs configured and rotating
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Disaster recovery plan documented
- [ ] Update procedure tested
- [ ] Support contacts documented

---

**Deployment Status**: ✅ Ready for Production

**Last Updated**: December 28, 2025
