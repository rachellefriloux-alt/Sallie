# Sallie Desktop App

The native desktop application for Sallie, your AI cognitive partner.

## 🚀 Quick Start

### Prerequisites

Before running the desktop app, you need to have the backend running:

```bash
# From the main Sallie directory
./start-sallie.sh      # Linux/Mac
start-sallie.bat       # Windows
```

Wait 30-60 seconds for all services to start.

### Running in Development Mode

```bash
cd desktop
npm install          # First time only
npm start           # or use ./launch.sh (Mac/Linux) or launch.bat (Windows)
```

The app will open and connect to `http://localhost:3000` (the web app).

## 📦 Building Installers

### Windows

Build the Windows installer (.exe):

```bash
cd desktop
npm install
npm run build:win
```

**Output:** `desktop/dist/Sallie-Setup-5.4.2.exe`

**Installer includes:**
- NSIS installer with custom installation options
- Desktop shortcut creation
- Start Menu integration
- System tray support
- Auto-update capability

### macOS

Build the macOS installer (.dmg):

```bash
cd desktop
npm install
npm run build:mac
```

**Output:** 
- `desktop/dist/Sallie-5.4.2-arm64.dmg` (Apple Silicon M1/M2/M3)
- `desktop/dist/Sallie-5.4.2-x64.dmg` (Intel Macs)

**Installer includes:**
- Drag-to-Applications installer
- Hardened runtime for security
- System tray integration

### Linux

Build the Linux packages:

```bash
cd desktop
npm install
npm run build:linux
```

**Output:**
- `desktop/dist/Sallie-5.4.2-x86_64.AppImage` - Universal Linux package
- `desktop/dist/Sallie-5.4.2-amd64.deb` - Debian/Ubuntu package
- `desktop/dist/Sallie-5.4.2-x64.tar.gz` - Tarball

**To run AppImage:**
```bash
chmod +x desktop/dist/Sallie-5.4.2-x86_64.AppImage
./desktop/dist/Sallie-5.4.2-x86_64.AppImage
```

### Build All Platforms

```bash
npm run build:all
```

## 🎯 Features

### System Tray Integration
- Minimize to system tray
- Quick access menu
- Connection status check
- Background operation

### Native Features
- Native window controls
- OS-level notifications
- Keyboard shortcuts
- Multi-window support
- Auto-launch on startup (optional)

### Connection Management
- Automatic backend detection
- Graceful fallback on connection failure
- Retry mechanism
- Clear error messages with troubleshooting steps

## 🔧 Configuration

The desktop app looks for the backend at:
- Default: `http://localhost:8000`
- Web interface: `http://localhost:3000`

To change these, set environment variables:
```bash
export SALLIE_BACKEND_URL=http://localhost:8000
export SALLIE_WEB_URL=http://localhost:3000
```

## 📁 Project Structure

```
desktop/
├── main.js              # Electron main process
├── preload.js           # Preload scripts for security
├── package.json         # Dependencies and build config
├── assets/              # Icons and resources
│   ├── icon.png         # Main app icon (512x512)
│   ├── tray-icon.png    # System tray icon (16x16)
│   └── icon.icns        # macOS icon bundle
├── public/              # Fallback web pages
│   └── index.html       # Connection error page
├── launch.sh            # Linux/Mac launcher
└── launch.bat           # Windows launcher
```

## 🐛 Troubleshooting

### "Connection Error" on Launch

**Problem:** Desktop app shows connection error screen.

**Solution:**
1. Start the backend server first:
   ```bash
   ./start-sallie.sh
   ```
2. Wait 30-60 seconds for services to initialize
3. Restart the desktop app

### "Failed to Load" Error

**Problem:** App window shows "Failed to load" message.

**Solution:**
1. Verify web app is running at http://localhost:3000
2. Check backend is running at http://localhost:8000/health
3. Try accessing http://localhost:3000 in your browser first
4. Check firewall isn't blocking the connections

### Tray Icon Not Showing

**Problem:** System tray icon doesn't appear.

**Solution:**
- **Windows:** Check system tray overflow area (click arrow in taskbar)
- **macOS:** Check menu bar on the right side
- **Linux:** Some desktop environments need additional configuration

### Build Errors

**Problem:** `npm run build:win/mac/linux` fails.

**Solution:**
1. Install required build tools:
   - **Windows:** `npm install --global windows-build-tools`
   - **macOS:** Xcode Command Line Tools
   - **Linux:** `build-essential` package
2. Clear node_modules and rebuild:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

## 🔐 Security

The desktop app follows Electron security best practices:
- Context isolation enabled
- Node integration disabled in renderer
- Secure preload scripts
- Content Security Policy
- No eval() usage
- Hardened runtime (macOS)

## 📋 System Requirements

### Development
- Node.js 18 or higher
- npm 9 or higher
- Operating System: Windows 10+, macOS 10.15+, or Linux

### Running Built App
- Operating System: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- RAM: 512 MB (app only, backend requires more)
- Disk: 200 MB

## 🆘 Support

If you encounter issues:

1. Check the main [README.md](../README.md) for general troubleshooting
2. Verify backend is running: http://localhost:8000/health
3. Check web app works: http://localhost:3000
4. Review console output for errors
5. Open an issue on GitHub with:
   - Operating system and version
   - Error messages
   - Steps to reproduce

## 📝 Development Notes

### Running with Web Dev Server

For development, run both the web dev server and desktop app:

```bash
# Terminal 1: Web app
cd web
npm run dev

# Terminal 2: Desktop app
cd desktop
npm start
```

The desktop app will connect to the live-reloading web dev server.

### Debugging

Open DevTools in the app:
- Press `Ctrl+Shift+I` (Windows/Linux)
- Press `Cmd+Option+I` (macOS)
- Or set `--dev` flag: `npm run dev`

### Custom Build Configuration

Edit `package.json` build section to customize:
- App ID and name
- Icon files
- Target platforms
- Installation options
- File associations

## 📄 License

See main [LICENSE](../LICENSE) file.

---

**Version:** 5.4.2  
**Last Updated:** December 2025  
**Status:** Production Ready ✅
