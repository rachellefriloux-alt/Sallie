# Quick Start Guide - Digital Progeny

**Last Updated**: 2025-12-27

## Prerequisites

Before starting, ensure you have:
- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/)) (optional but recommended)
- **Git** ([Download](https://git-scm.com/downloads))

## Installation Steps

### 1. Check Dependencies

Run the dependency checker to verify everything is installed:

```bash
python scripts/check_dependencies.py
```

Fix any missing dependencies before proceeding.

### 2. Install Dependencies

**Windows**:
```batch
scripts\install_windows.bat
```

**Linux/macOS**:
```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

This will:
- Install Python packages from `requirements.txt`
- Install web UI dependencies (npm)
- Install mobile/desktop app dependencies (if directories exist)

### 3. Run Setup Wizard

```bash
python scripts/setup_wizard.py
```

The wizard will:
- Check all dependencies
- Ask you for configuration (ports, URLs, etc.)
- Create `.env` and `config.json` files
- Set up directory structure
- Test service connections

### 4. Start Services

**Start Docker services (if using Docker)**:

**Windows**:
```batch
scripts\start_services.bat
```

**Linux/macOS**:
```bash
./scripts/start_services.sh
```

**Or manually**:
```bash
docker-compose up -d
```

### 5. Download Models (Optional)

If you want to pre-download Ollama models:

```bash
python scripts/download_models.py
```

This downloads:
- `deepseek-v3` (primary model)
- `llama3` (fallback model)
- `nomic-embed-text` (embedding model)

### 6. Start the System

**Terminal 1 - Backend API**:
```bash
python -m uvicorn core.main:app --reload --port 8000
```

**Terminal 2 - Web UI**:
```bash
cd web
npm run dev
```

### 7. Access the System

Open your browser to:
- **Web UI**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### 8. Complete Convergence

On first launch, you'll need to complete the **Great Convergence** process:
- 14 deep psychological questions
- This creates your Heritage DNA
- Takes 30-60 minutes
- Required for system activation

## Troubleshooting

### Port Already in Use

If ports 8000, 3000, 11434, or 6333 are in use:

1. **Find the process**:
   ```bash
   # Windows
   netstat -ano | findstr :8000
   
   # Linux/macOS
   lsof -i :8000
   ```

2. **Kill the process** or change ports in `.env`

### Docker Not Running

If Docker services fail:

1. Ensure Docker Desktop is running
2. Check Docker status: `docker ps`
3. Manually start: `docker-compose up -d`

### Ollama Not Found

If Ollama models fail to load:

1. Install Ollama: https://ollama.ai/
2. Start Ollama: `ollama serve`
3. Pull models: `ollama pull deepseek-v3`

### Python Package Errors

If pip install fails:

1. Update pip: `python -m pip install --upgrade pip`
2. Install dependencies: `pip install -r requirements.txt`
3. Check Python version: `python --version` (must be 3.11+)

### Node.js Errors

If npm install fails:

1. Update npm: `npm install -g npm@latest`
2. Clear cache: `npm cache clean --force`
3. Delete `node_modules` and `package-lock.json`, then reinstall

## Next Steps

After successful installation:

1. ✅ Complete the Convergence process
2. ✅ Explore the web UI
3. ✅ Start using the system for conversations
4. ✅ Review `progeny_root/README.md` for detailed documentation

## Getting Help

- **Documentation**: See `progeny_root/README.md`
- **Configuration**: See `.env` and `progeny_root/core/config.json`
- **Logs**: Check `progeny_root/logs/` directory

## Manual Configuration

If you prefer not to use the wizard, create these files manually:

### `.env`
```env
PROGENY_ROOT=./progeny_root
API_PORT=8000
WEB_PORT=3000
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-v3
QDRANT_URL=http://localhost:6333
LOG_LEVEL=INFO
GEMINI_API_KEY=
```

### `progeny_root/core/config.json`
```json
{
  "ui": {
    "dashboard_port": 3000
  },
  "llm": {
    "gemini_api_key": "",
    "fallback_model": "deepseek-v3"
  },
  "endpoints": {
    "ollama": "http://localhost:11434",
    "qdrant": "http://localhost:6333"
  }
}
```

---

**Happy configuring!** 🚀

