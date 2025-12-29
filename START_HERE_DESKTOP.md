# 🌟 Sallie Desktop App - Get Started Now!

**Get Sallie's desktop app running in just a few minutes!**

This is the quickest way to start using Sallie if you want a native desktop experience.

## 🚀 Super Quick Start

### Step 1: Start the Backend

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/rachellefriloux-alt/Sallie.git
cd Sallie

# Start all backend services
./start-sallie.sh      # Mac/Linux
start-sallie.bat       # Windows
```

**Wait 30-60 seconds** for services to start.

### Step 2: Launch Desktop App

```bash
cd desktop
npm install     # First time only
npm start       # Launches the desktop app
```

That's it! The desktop app will open and connect to the backend.

## 🎯 What You'll See

### First Time Setup Wizard

When you open the app for the first time, you'll see:

```
🌟
Welcome to Sallie
Setting up your AI cognitive partner...

Backend Connection
Verifying connection to Sallie backend...
✓ Complete

AI Models
Checking Ollama and AI models...
✓ Complete

Memory System
Verifying Qdrant vector database...
✓ Complete

Great Convergence
Setting up your personal heritage...
Pending

[Continue Button]
```

If everything is green (✓), click **Continue** to start the Great Convergence!

### If You See Connection Errors

```
⚠️ Connection failed. Please check your setup.

Quick Fix:
1. Make sure Docker Desktop is running
2. Open terminal in Sallie directory
3. Run: ./start-sallie.sh
4. Wait for services to start (30-60 seconds)
5. Refresh this page
```

Just follow these steps and click "↻ Retry Checks".

## 📦 Building Installers (Optional)

Want to create a standalone installer? 

### Windows
```bash
cd desktop
npm run build:win
```
Install: `dist/Sallie-Setup-5.4.2.exe`

### macOS
```bash
cd desktop
npm run build:mac
```
Install: `dist/Sallie-5.4.2-arm64.dmg`

### Linux
```bash
cd desktop
npm run build:linux
chmod +x dist/Sallie-5.4.2-x86_64.AppImage
./dist/Sallie-5.4.2-x86_64.AppImage
```

## 🎨 Desktop Features

- **System Tray Integration** - Minimize to tray, always accessible
- **Native Notifications** - Get alerts from Sallie
- **Keyboard Shortcuts** - Fast navigation
- **Offline Mode** - Works without internet (after setup)
- **Auto-Launch** - Start on system boot (optional)
- **Multi-Window** - Open multiple Sallie windows

## 🔧 Requirements

- **OS:** Windows 10+, macOS 10.15+, or Ubuntu 20.04+
- **Node.js:** 18 or higher
- **Backend:** Must be running (see Step 1 above)
- **Docker:** For backend services

## 📚 More Information

- **Full Desktop Guide:** [desktop/README.md](desktop/README.md)
- **Complete Documentation:** [README.md](README.md)
- **Troubleshooting:** [DESKTOP_QUICK_START.md](DESKTOP_QUICK_START.md)

## 💡 Tips

1. **Keep backend running** - The desktop app needs it to function
2. **Use system tray** - Click the tray icon to quickly show/hide
3. **Keyboard shortcuts** - Press `Ctrl+K` (Cmd+K on Mac) for quick commands
4. **Minimize to tray** - Closing the window minimizes to tray instead of quitting

## ❓ Common Issues

**"Connection Error"**
→ Make sure backend is running: `./start-sallie.sh`

**"Docker not found"**
→ Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

**"Port already in use"**
→ Stop other services on ports 8000, 3000, 6333, 11434

**Security warning (macOS)**
→ Right-click app → "Open" → Confirm

## 🎉 What's Next?

After the setup wizard:

1. **Complete Great Convergence** - 14 questions about you (30-60 min)
2. **Start chatting** - Begin your relationship with Sallie
3. **Explore features** - Try art generation, poetry, project management
4. **Customize** - Settings → Adjust themes, permissions, preferences

---

**Ready to meet Sallie?** 🌟

```bash
# Let's go!
./start-sallie.sh && cd desktop && npm start
```

*Version 5.4.2 | Production Ready ✅*
