# 🚀 Desktop App Quick Start

Get Sallie's desktop app running in 5 minutes!

## Step 1: Start the Backend (Required)

The desktop app needs the Sallie backend to function. Start it first:

### Windows:
```batch
start-sallie.bat
```

### macOS/Linux:
```bash
./start-sallie.sh
```

**Wait 30-60 seconds** for all services to start. You should see:
- ✓ Ollama started
- ✓ Qdrant started  
- ✓ Backend API started
- ✓ Web interface started

## Step 2: Launch Desktop App

### Option A: Run from Source (Development)

```bash
cd desktop
npm install        # First time only
npm start          # or ./launch.sh (Mac/Linux) or launch.bat (Windows)
```

### Option B: Build and Install (Production)

#### Windows
```batch
cd desktop
npm install
npm run build:win
```
Then install: `dist/Sallie-Setup-5.4.2.exe`

#### macOS
```bash
cd desktop
npm install
npm run build:mac
```
Then open: `dist/Sallie-5.4.2-arm64.dmg` (M1/M2/M3) or `dist/Sallie-5.4.2-x64.dmg` (Intel)

#### Linux
```bash
cd desktop
npm install
npm run build:linux
chmod +x dist/Sallie-5.4.2-x86_64.AppImage
./dist/Sallie-5.4.2-x86_64.AppImage
```

## Step 3: Complete Setup Wizard

When the desktop app opens for the first time, you'll see the setup wizard:

### ✅ If Everything Works:
1. **Backend Connection** - ✓ Complete
2. **AI Models** - ✓ Complete
3. **Memory System** - ✓ Complete
4. **Great Convergence** - Pending

Click **Continue** to proceed to the Great Convergence (14 questions about you).

### ⚠️ If Connection Fails:

You'll see error messages like:
```
⚠️ Connection failed. Please check your setup.

Quick Fix:
1. Make sure Docker Desktop is running
2. Open terminal in Sallie directory
3. Run: ./start-sallie.sh
4. Wait for services to start (30-60 seconds)
5. Refresh this page
```

**Follow these steps**, then click "↻ Retry Checks" in the app.

## Troubleshooting

### Backend Not Running

**Symptoms:**
- "Connection failed" error
- "Cannot check - backend down" messages

**Fix:**
1. Open terminal in main Sallie directory
2. Run: `./start-sallie.sh` (Mac/Linux) or `start-sallie.bat` (Windows)
3. Wait for services to initialize (30-60 seconds)
4. Click "↻ Retry Checks" in the desktop app

### Docker Not Running

**Symptoms:**
- Services fail to start
- "Docker not found" errors

**Fix:**
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Start Docker Desktop
3. Wait for Docker to be ready (icon turns green)
4. Try starting Sallie again

### Port Already in Use

**Symptoms:**
- "Port 8000 already in use" error
- "Port 3000 already in use" error

**Fix:**
1. Stop any other services using these ports
2. Or change the ports in `.env` file:
   ```
   API_PORT=8001
   WEB_PORT=3001
   ```
3. Restart services

### Desktop App Won't Open

**Symptoms:**
- App icon bounces but doesn't open (macOS)
- Security warning (macOS)

**Fix macOS:**
1. Right-click the app → "Open"
2. Click "Open" in the security dialog
3. Or: System Preferences → Security & Privacy → "Open Anyway"

**Fix Windows:**
- Click "More info" → "Run anyway" if SmartScreen appears

**Fix Linux:**
- Make sure AppImage is executable: `chmod +x Sallie-*.AppImage`

## System Requirements

### For Running Desktop App:
- **OS:** Windows 10+, macOS 10.15+, or Ubuntu 20.04+
- **RAM:** 512 MB (app only, backend needs 8+ GB)
- **Disk:** 200 MB

### For Backend:
- **OS:** Windows 10+, macOS 10.15+, or Linux
- **CPU:** 4+ cores (8+ recommended)
- **RAM:** 8 GB (16 GB recommended)
- **Disk:** 20 GB free
- **Docker:** Docker Desktop installed

## What's Next?

After setup is complete:

1. **Complete Great Convergence** - 14 questions to help Sallie understand you (30-60 minutes)
2. **Start Chatting** - Begin your relationship with Sallie
3. **Explore Features** - Try creative tools, project management, teaching mode
4. **Customize** - Adjust settings, themes, and permissions

## Features You'll Love

- 🎯 **System Tray** - Minimize to tray, quick access menu
- 🔔 **Native Notifications** - OS-level alerts
- ⌨️ **Keyboard Shortcuts** - Fast navigation
- 💾 **Offline Mode** - Works without internet (after initial setup)
- 🔒 **100% Private** - Everything runs locally

## Need More Help?

- 📖 **Full Documentation:** [README.md](../README.md)
- 📚 **Desktop App Guide:** [desktop/README.md](README.md)
- 🔧 **Troubleshooting:** [README.md#troubleshooting](../README.md#troubleshooting)
- 💬 **GitHub Issues:** Report bugs or ask questions

---

**Ready?** Let's get started! 🚀

```bash
# Start backend
./start-sallie.sh

# Then launch desktop app
cd desktop && npm start
```

Enjoy your journey with Sallie! 🌟
