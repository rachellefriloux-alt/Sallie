# Running Digital Progeny

## Prerequisites

- Python 3.11+
- Node.js 18+ (for mobile/desktop apps)
- Docker (for Ollama and Qdrant)
- Git

## Quick Start

### 1. Install Dependencies

```bash
# Python dependencies
cd progeny_root
pip install -r requirements.txt

# Mobile app dependencies
cd ../mobile
npm install

# Desktop app dependencies
cd ../desktop
npm install
```

### 2. Start Services

```bash
# Start Ollama and Qdrant (Docker)
docker-compose up -d

# Verify services are running
curl http://localhost:11434/api/tags  # Ollama
curl http://localhost:6333/collections  # Qdrant
```

### 3. Pull Required Models

```bash
# Pull Ollama models
ollama pull llama3
ollama pull phi3:mini
ollama pull nomic-embed-text
```

### 4. Configure

Edit `progeny_root/core/config.json`:

```json
{
  "llm": {
    "gemini_api_key": "YOUR_GEMINI_KEY",
    "gemini_model": "gemini-1.5-flash",
    "fallback_model": "llama3:latest"
  },
  "paths": {
    "whitelist": ["./work", "./projects"],
    "blacklist": ["./secrets", "./.ssh"]
  },
  "smart_home": {
    "home_assistant_url": "http://localhost:8123",
    "home_assistant_token": "YOUR_TOKEN"
  }
}
```

### 5. Start Backend

```bash
cd progeny_root/core
python -m uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### 6. Start Mobile App (Optional)

```bash
cd mobile
npm run ios    # iOS
npm run android  # Android
```

### 7. Start Desktop App (Optional)

```bash
cd desktop
npm start
```

## Environment Variables

Optional environment variables:

```bash
export PROGENY_ROOT=/path/to/progeny_root
export OLLAMA_URL=http://localhost:11434
export QDRANT_URL=http://localhost:6333
export LOG_LEVEL=INFO
```

## First Run

1. **Complete Great Convergence**: The system will prompt you with 14 questions to establish your Heritage DNA
2. **Verify Health**: Run health check script:
   ```bash
   python progeny_root/scripts/health_check.py
   ```
3. **Start Chatting**: Open the web UI or mobile app and start interacting with Sallie

## Health Check

Run health check:

```bash
python progeny_root/scripts/health_check.py
```

This checks:
- Ollama service
- Qdrant service
- Disk space
- File integrity

## Backup and Restore

### Create Backup

```bash
python progeny_root/scripts/backup.py create
```

### List Backups

```bash
python progeny_root/scripts/backup.py list
```

### Restore Backup

```bash
python progeny_root/scripts/backup.py restore --backup-file progeny_root/backups/progeny_backup_20250101_120000.tar.gz
```

### Cleanup Old Backups

```bash
python progeny_root/scripts/backup.py cleanup --keep-days 30
```

## Troubleshooting

### Ollama Not Responding

```bash
# Check if container is running
docker ps | grep ollama

# Restart container
docker-compose restart ollama

# Check logs
docker-compose logs ollama
```

### Qdrant Connection Failed

```bash
# Check if container is running
docker ps | grep qdrant

# Restart container
docker-compose restart qdrant

# Verify port 6333 is available
netstat -an | grep 6333
```

### Mobile App Can't Connect

1. Check API endpoint in settings (default: `http://localhost:8000`)
2. For iOS simulator, use `http://localhost:8000`
3. For Android emulator, use `http://10.0.2.2:8000`
4. For physical device, use your computer's IP address

### Permission Errors

```bash
# Ensure directories are writable
chmod -R 755 progeny_root/
chmod -R 755 mobile/
chmod -R 755 desktop/
```

## Development Mode

### Enable Test Mode

Edit `progeny_root/core/config.json`:

```json
{
  "system": {
    "test_mode": true
  }
}
```

### Run Tests

```bash
cd progeny_root
pytest tests/ -v --cov=core
```

### Linting

```bash
cd progeny_root
black core/ tests/
ruff check core/ tests/
mypy core/
```

## Production Deployment

### 1. Set Production Environment

```bash
export PROGENY_ENV=production
export LOG_LEVEL=WARNING
```

### 2. Use Production Config

Create `progeny_root/core/config.production.json` with production settings.

### 3. Run with Production Server

```bash
cd progeny_root/core
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 4. Set Up Process Manager

Use systemd, supervisor, or PM2 to manage the process.

## API Endpoints

- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Status**: http://localhost:8000/status
- **Chat**: http://localhost:8000/chat (POST)

## Logs

Logs are stored in:
- `progeny_root/logs/thoughts.log` - Cognitive processing
- `progeny_root/logs/error.log` - Errors
- `progeny_root/logs/agency.log` - Autonomous actions
- `progeny_root/logs/dream_cycles.log` - Dream Cycle runs

## Support

For issues or questions:
1. Check logs in `progeny_root/logs/`
2. Run health check script
3. Review API documentation at `/docs`
4. Check GitHub issues
