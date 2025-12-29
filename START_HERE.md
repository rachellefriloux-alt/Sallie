# 🚀 START HERE - Quick Launch Guide

**Version**: 5.4.2  
**Last Updated**: December 29, 2025

This guide gets Sallie running in 5 minutes or less!

---

## ⚡ Fastest Way to Start Sallie

### One-Command Launch

**Linux/Mac:**
```bash
chmod +x start-sallie.sh
./start-sallie.sh
```

**Windows:**
```batch
start-sallie.bat
```

That's it! The script will:
1. ✅ Check Docker is running
2. ✅ Start Ollama and Qdrant
3. ✅ Start backend API
4. ✅ Start web interface
5. ✅ Open browser to http://localhost:3000

**Press Ctrl+C (or close window) to stop everything.**

---

## 📋 Prerequisites (First Time Only)

Before running Sallie, you need:

1. **Docker Desktop** - Download from https://docker.com
   - Start Docker Desktop before running Sallie
   
2. **Python 3.11+** - Download from https://python.org
   ```bash
   python --version  # Should show 3.11 or higher
   ```

3. **Node.js 18+** - Download from https://nodejs.org
   ```bash
   node --version    # Should show 18 or higher
   ```

4. **Install Python Dependencies** (one-time setup):
   ```bash
   cd progeny_root
   pip install -r requirements.txt
   ```

5. **Install Web Dependencies** (one-time setup):
   ```bash
   cd web
   npm install
   ```

---

## 🌐 Access Sallie

Once started, access Sallie at:

### Web Browser
- **URL**: http://localhost:3000
- **Works on**: Chrome, Firefox, Safari, Edge

### Desktop App
1. Download from releases OR build yourself:
   ```bash
   cd desktop
   npm install
   npm run build:win   # Windows
   npm run build:mac   # macOS
   npm run build:linux # Linux
   ```
2. Install the generated file from `desktop/dist/`
3. Launch and configure backend URL: `http://localhost:8000`

### Android App
1. Build APK:
   ```bash
   cd mobile/android
   ./gradlew assembleRelease
   ```
2. Transfer APK to phone: `mobile/android/app/build/outputs/apk/release/app-release.apk`
3. Install on phone
4. Configure backend URL to your computer's IP: `http://192.168.1.X:8000`

---

## 🔧 Manual Start (if script doesn't work)

### Step 1: Start Docker Services
```bash
cd progeny_root
docker-compose up -d
```

### Step 2: Start Backend
```bash
cd progeny_root
python -m uvicorn core.main:app --host 0.0.0.0 --port 8000
```

### Step 3: Start Web App (in new terminal)
```bash
cd web
npm run dev
```

### Step 4: Open Browser
Open http://localhost:3000

---

## 🆘 Troubleshooting

### "Docker is not running"
- Start Docker Desktop
- Wait for it to fully start (whale icon in system tray)
- Try again

### "Port already in use"
Check if Sallie is already running:
```bash
# Check what's using port 8000
lsof -i :8000       # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process if needed
kill <PID>          # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### "Backend not responding"
1. Check backend logs: `tail -f backend.log`
2. Make sure Python dependencies are installed
3. Verify Ollama is running: `curl http://localhost:11434/api/tags`
4. Verify Qdrant is running: `curl http://localhost:6333/collections`

### "Web page is blank"
1. Clear browser cache: Ctrl+Shift+R (Cmd+Shift+R on Mac)
2. Check console for errors: F12 → Console
3. Check web logs: `tail -f web.log`
4. Try rebuilding:
   ```bash
   cd web
   rm -rf .next node_modules
   npm install
   npm run dev
   ```

### "Can't connect from mobile/desktop"
1. Find your computer's IP:
   ```bash
   ipconfig           # Windows
   ifconfig           # Mac/Linux
   ```
2. Make sure firewall allows port 8000
3. Use IP instead of localhost: `http://192.168.1.100:8000`
4. Make sure both devices are on same WiFi network

---

## 📱 Platform-Specific Instructions

### Windows Users
- Run `start-sallie.bat` as Administrator if you get permission errors
- Make sure Windows Defender isn't blocking Docker
- If Docker won't start, enable Hyper-V in Windows Features

### Mac Users
- Run `chmod +x start-sallie.sh` first (one-time only)
- Docker Desktop needs Rosetta 2 on M1/M2 Macs
- Allow Terminal/iTerm through Firewall in System Preferences

### Linux Users
- Make sure Docker is installed and user is in docker group:
  ```bash
  sudo usermod -aG docker $USER
  ```
- Log out and back in for group change to take effect
- Start Docker service: `sudo systemctl start docker`

---

## 🌟 First-Time Setup

After starting Sallie for the first time:

1. **Browser opens** to http://localhost:3000
2. **Complete Great Convergence**:
   - 14 questions about your personality
   - Takes 30-60 minutes
   - Be honest and thoughtful
   - Creates your Heritage DNA
3. **Start chatting** with Sallie!

---

## 🎯 Quick Commands

```bash
# Start everything
./start-sallie.sh                    # Linux/Mac
start-sallie.bat                     # Windows

# Check service health
curl http://localhost:8000/health    # Backend
curl http://localhost:11434/api/tags # Ollama
curl http://localhost:6333/collections # Qdrant

# View logs
tail -f backend.log                  # Backend logs
tail -f web.log                      # Web logs
docker-compose logs -f               # Docker logs

# Stop Docker services
cd progeny_root
docker-compose down

# Restart everything
docker-compose restart
```

---

## 📊 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Web UI** | http://localhost:3000 | Main interface |
| **Backend API** | http://localhost:8000 | REST API |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Ollama** | http://localhost:11434 | LLM inference |
| **Qdrant** | http://localhost:6333 | Vector database |

---

## 💡 Tips

- **Keep Docker running** - Sallie needs it for Ollama and Qdrant
- **First launch is slow** - Docker downloads models (5-10 minutes)
- **Use the startup script** - It handles everything automatically
- **Check logs** - If something fails, logs show what went wrong
- **Web app is fastest** - Start here before building desktop/mobile apps

---

## 🎉 You're Ready!

If you can see this screen, Sallie is working:

```
┌─────────────────────────────────────────┐
│  [Avatar]     |  Chat Messages      |   │
│   Animated    |                     |   │
│   Breathing   |  "Hello! I'm        |   │
│               |   Sallie..."        |   │
│               |                     |   │
│  [Posture]    |  [Input Box]        |   │
└─────────────────────────────────────────┘
```

**Welcome to Digital Progeny!** 💜✨

---

## 📚 Next Steps

- Read `README.md` for full feature list
- See `HOW_TO_INSTALL.md` for detailed setup
- Check `RUNNING.md` for daily usage tips
- Browse documentation in `/docs` folder

**Need help?** Open an issue on GitHub.
