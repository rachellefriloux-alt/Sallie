# 🚀 QUICK START - Get Sallie Running in 2 Minutes!

**Choose Your Platform:**

## 🌐 Web App (Easiest - Recommended First!)

### One Command:

**Linux/Mac:**
```bash
./quick-start.sh
```

**Windows:**
```bash
quick-start.bat
```

That's it! Opens automatically at http://localhost:3000

---

## 🖥️ Desktop App

### Step 1: Start Backend (if not running)
```bash
./quick-start.sh     # Linux/Mac
quick-start.bat      # Windows
```

### Step 2: Launch Desktop
```bash
cd desktop
./launch.sh          # Linux/Mac
launch.bat           # Windows
```

Or just double-click `launch.sh` or `launch.bat`!

---

## 📱 Mobile App

### Step 1: Start Backend
```bash
./quick-start.sh     # Linux/Mac
quick-start.bat      # Windows
```

### Step 2: Build & Install

**Easy Way:**
```bash
cd mobile
./launch.sh          # Follow the menu
```

**Manual Way:**
```bash
cd mobile
./gradlew assembleRelease    # Builds APK
```

**Transfer APK to phone:**
- Location: `mobile/android/app/build/outputs/apk/release/app-release.apk`
- Install on Android device
- Configure backend: `http://YOUR_COMPUTER_IP:8000`

---

## 🎯 What Each Script Does

### `quick-start.sh` / `quick-start.bat`
- **First run**: Installs ALL dependencies automatically
- **Every run**: Starts backend + web app
- **Detects**: If setup needed
- **Opens**: Browser automatically
- **One command does everything!**

### `desktop/launch.sh` / `desktop/launch.bat`
- Checks if backend is running
- Offers to start it if not
- Installs desktop dependencies if needed
- Launches Electron app

### `mobile/launch.sh`
- Interactive menu for mobile tasks
- Build APK
- Run on device/emulator
- Get connection instructions
- All in one place!

---

## 📋 Prerequisites (Install Once)

### Required:
- **Docker Desktop** - https://docker.com
- **Python 3.11+** - https://python.org
- **Node.js 18+** - https://nodejs.org

### For Mobile (Optional):
- **Android Studio** - For building APK
- **Java JDK 17+** - For Android builds

---

## 🎬 Complete First-Time Flow

### Option A: Web Only (Fastest)
```bash
# 1. Clone repository
git clone https://github.com/rachellefriloux-alt/Sallie.git
cd Sallie

# 2. One command!
./quick-start.sh

# ✓ Done! Browser opens automatically
```

### Option B: Desktop App
```bash
# 1. Clone repository
git clone https://github.com/rachellefriloux-alt/Sallie.git
cd Sallie

# 2. Install & start backend
./quick-start.sh

# 3. In new terminal - launch desktop
cd desktop
./launch.sh

# ✓ Desktop app opens!
```

### Option C: Mobile App
```bash
# 1. Clone repository
git clone https://github.com/rachellefriloux-alt/Sallie.git
cd Sallie

# 2. Install & start backend
./quick-start.sh

# 3. In new terminal - build mobile
cd mobile
./launch.sh
# Choose option 1 to build APK

# 4. Transfer APK to phone and install

# 5. Open app, configure:
#    Backend URL: http://192.168.1.X:8000
#    (Use your computer's IP address)

# ✓ Mobile app connected!
```

---

## 🔍 Troubleshooting

### "Docker is not running"
**Fix:** Start Docker Desktop, wait for it to fully start, then retry

### "Cannot connect to backend"
**Check:**
```bash
curl http://localhost:8000/health
```
Should return: `{"status":"healthy"}`

**Fix:** Make sure backend is running via `quick-start.sh`

### "Port already in use"
**Find process:**
```bash
lsof -i :8000      # Linux/Mac
netstat -ano | findstr :8000   # Windows
```
**Kill it and restart**

### Mobile can't connect
1. Make sure phone and computer on same WiFi
2. Use computer's IP, not `localhost`
3. Find IP:
   ```bash
   hostname -I        # Linux
   ipconfig           # Windows
   ifconfig           # Mac
   ```
4. Use format: `http://192.168.1.X:8000`

---

## 📊 What Gets Installed?

### First Run:
- Python packages (FastAPI, Ollama client, etc.)
- Web packages (Next.js, React, etc.)
- Desktop packages (Electron, etc.)
- Mobile packages (React Native, etc.)
- Docker images (Ollama, Qdrant)

### Install Size:
- Python packages: ~500 MB
- Web packages: ~400 MB
- Desktop packages: ~200 MB
- Mobile packages: ~800 MB
- Docker images: ~5 GB
- **Total: ~7 GB**

### Install Time:
- Fast connection: 5-7 minutes
- Average connection: 10-15 minutes
- Slow connection: 20-30 minutes

---

## 🎨 All Apps Match!

All three apps (Web, Desktop, Mobile) now have:
- ✅ Same features
- ✅ Same UI/UX
- ✅ Connection status indicator
- ✅ First-run wizard
- ✅ Settings panel
- ✅ Keyboard shortcuts (Web/Desktop)
- ✅ Touch gestures (Mobile)
- ✅ Notifications
- ✅ Error handling
- ✅ Help system

---

## 🎯 Quick Commands Reference

### Backend Only
```bash
cd progeny_root
docker-compose up -d
python -m uvicorn core.main:app --reload
```

### Web Only
```bash
cd web
npm run dev
```

### Desktop Only
```bash
cd desktop
npm start
```

### Mobile Build
```bash
cd mobile/android
./gradlew assembleRelease
```

---

## 📚 More Information

- **Full Documentation**: See `README.md`
- **User Guide**: See `USER_EXPERIENCE.md`
- **Installation Help**: See `HOW_TO_INSTALL.md`
- **Running Guide**: See `RUNNING.md`

---

## 💡 Pro Tips

1. **Keep Docker running** - Backend needs it
2. **Use Web first** - Easiest to test
3. **Desktop for daily use** - Best experience
4. **Mobile for on-the-go** - Full features anywhere
5. **All three can run simultaneously!**

---

## 🎉 That's It!

**Most users only need:**
```bash
./quick-start.sh
```

**Everything else is optional!**

Questions? Check the full documentation or open an issue on GitHub.

**Welcome to Digital Progeny! 💜✨**
