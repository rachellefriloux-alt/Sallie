# Quick Start Guide

## Prerequisites

- Python 3.11+
- Node.js 18+ (for mobile/desktop apps)
- Docker (for Ollama and Qdrant)
- Git

## Backend Setup

1. **Install Python dependencies**:
```bash
cd progeny_root
pip install -r requirements.txt
```

2. **Start services** (Docker):
```bash
docker-compose up -d
```

3. **Configure API keys** (optional):
Edit `progeny_root/core/config.json`:
```json
{
  "llm": {
    "gemini_api_key": "YOUR_GEMINI_KEY",
    "gemini_model": "gemini-1.5-flash"
  },
  "smart_home": {
    "home_assistant_url": "http://localhost:8123",
    "home_assistant_token": "YOUR_TOKEN"
  }
}
```

4. **Start backend**:
```bash
cd progeny_root/core
python -m uvicorn main:app --reload --port 8000
```

## Mobile App Setup

1. **Install dependencies**:
```bash
cd mobile
npm install
```

2. **iOS**:
```bash
cd ios
pod install
cd ..
npm run ios
```

3. **Android**:
```bash
npm run android
```

## Desktop App Setup

1. **Install dependencies**:
```bash
cd desktop
npm install
```

2. **Run**:
```bash
npm start
```

## API Endpoints

- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## First Run

1. Start backend services
2. Open mobile app or desktop app
3. Complete Great Convergence (14 questions)
4. Start chatting with Sallie!

## Troubleshooting

- **Ollama not responding**: Check `docker ps` and restart containers
- **Qdrant connection failed**: Verify port 6333 is available
- **Mobile app can't connect**: Check API endpoint in settings (default: http://localhost:8000)

