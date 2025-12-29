# 🎯 Sallie Quick Reference Card

Print or save this for quick access to common commands!

---

## 🚀 Starting Sallie

```bash
# Start everything (one command!)
./start-sallie.sh          # Mac/Linux
start-sallie.bat           # Windows

# Then open: http://localhost:3000
```

**Press Ctrl+C to stop everything**

---

## 🔍 Check Health

```bash
./health-check.sh          # Mac/Linux
health-check.bat           # Windows
```

Shows status of all services and diagnoses issues.

---

## 💻 Desktop App

```bash
cd desktop
./launch.sh                # Mac/Linux
launch.bat                 # Windows
```

Backend must be running first!

---

## 🌐 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Web UI** | http://localhost:3000 | Main interface |
| **API** | http://localhost:8000 | Backend REST API |
| **API Docs** | http://localhost:8000/docs | Interactive docs |
| **Health** | http://localhost:8000/health | Quick status check |
| **Ollama** | http://localhost:11434 | LLM service |
| **Qdrant** | http://localhost:6333 | Vector DB |

---

## 📱 Android Setup

1. Find your computer's IP:
   ```bash
   ipconfig            # Windows
   ifconfig            # Mac/Linux
   ```

2. On Android app, enter:
   ```
   http://YOUR_IP:8000
   Example: http://192.168.1.100:8000
   ```

3. Must be on same WiFi network!

[Full guide: ANDROID_SETUP.md](ANDROID_SETUP.md)

---

## 🔧 Common Issues

### "Cannot connect"
- Check backend: `curl http://localhost:8000/health`
- Start services: `./start-sallie.sh`
- Check firewall allows port 8000

### "Docker not running"
- Start Docker Desktop
- Wait for it to fully start
- Try again

### "Port already in use"
```bash
# Find what's using the port
lsof -i :8000           # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process
kill <PID>              # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### "Web page is blank"
- Clear cache: Ctrl+Shift+R
- Check console: F12 → Console
- Check logs: `tail -f web.log`

---

## 📂 Log Files

```bash
backend.log            # Backend API logs
web.log                # Web app logs
progeny_root/logs/     # Core system logs
```

View logs:
```bash
tail -f backend.log    # Follow backend logs
tail -f web.log        # Follow web logs
```

---

## 🛠️ Manual Services

If startup script doesn't work:

**Step 1: Start Docker**
```bash
cd progeny_root
docker-compose up -d
```

**Step 2: Start Backend**
```bash
cd progeny_root
python -m uvicorn core.main:app --host 0.0.0.0 --port 8000
```

**Step 3: Start Web** (new terminal)
```bash
cd web
npm run dev
```

---

## 📚 Documentation

- **START_HERE.md** - Quick start guide
- **README.md** - Full feature list
- **ANDROID_SETUP.md** - Mobile setup
- **HOW_TO_INSTALL.md** - Detailed install
- **RUNNING.md** - Daily usage tips

---

## 🆘 Getting Help

1. Run health check: `./health-check.sh`
2. Check logs in log files
3. Read troubleshooting in START_HERE.md
4. Check GitHub issues
5. Open new issue with:
   - OS and version
   - Error messages
   - Health check output

---

## ⚡ Quick Tips

- **First launch is slow** - Docker downloads models (5-10 min)
- **Keep Docker running** - Sallie needs it
- **Use startup script** - Handles everything automatically
- **Check logs** - They show what went wrong
- **Same WiFi** - Required for Android/mobile

---

## 🎯 One-Page Summary

```bash
# Install (one time)
cd progeny_root && pip install -r requirements.txt
cd web && npm install

# Run (every time)
./start-sallie.sh

# Open browser
http://localhost:3000

# Check status
./health-check.sh

# Desktop app
cd desktop && ./launch.sh

# Android
http://YOUR_COMPUTER_IP:8000
```

**That's all you need to know!** 🎉

---

**Version**: 5.4.2  
**Updated**: December 29, 2025

Save this file or print it for quick reference!
