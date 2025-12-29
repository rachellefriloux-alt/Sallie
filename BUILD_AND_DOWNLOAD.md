# Sallie - Build and Download Guide

**Version**: 5.4.2  
**Date**: December 28, 2025  
**Status**: Production Ready

---

## Quick Start - Get Sallie Running

### Option 1: Quick Install (Recommended for First Time)

```bash
# 1. Clone repository
git clone https://github.com/rachellefriloux-alt/Sallie.git
cd Sallie

# 2. Run installation script
# Windows:
scripts\install_windows.bat

# Linux/macOS:
chmod +x scripts/install.sh
./scripts/install.sh

# 3. Run setup wizard
python scripts/setup_wizard.py

# 4. Start everything
chmod +x scripts/start_all.sh
./scripts/start_all.sh
```

### Option 2: Build Distributable Apps

If you want to create installable packages for distribution:

```bash
# Build everything at once
chmod +x scripts/build_all.sh
./scripts/build_all.sh

# Or build individually:
./scripts/build_web.sh      # Web app (static export)
./scripts/build_desktop.sh  # Desktop installers
./scripts/build_android.sh  # Android APK/AAB
```

---

## Download Instructions by Platform

### 🌐 Web App

**Development Mode** (localhost):

```bash
cd web
npm install
npm run dev
# Open http://localhost:3000
```

**Production Build** (deploy to server):

```bash
cd web
npm install
npm run build
npm run start
# Or use static export for hosting
```

**Deploy to Vercel/Netlify**:

```bash
cd web
# Vercel
vercel deploy --prod

# Netlify
netlify deploy --prod --dir=.next
```

### 💻 Desktop App

**Windows**:

```bash
# Build installer
cd desktop
npm install
npm run build:win

# Output: desktop/dist/Sallie-Setup-5.4.2.exe
# Double-click to install
```

**macOS**:

```bash
# Build DMG
cd desktop
npm install
npm run build:mac

# Output: desktop/dist/Sallie-5.4.2.dmg
# Double-click to install
```

**Linux**:

```bash
# Build AppImage
cd desktop
npm install
npm run build:linux

# Output: desktop/dist/Sallie-5.4.2.AppImage
# Make executable: chmod +x Sallie-5.4.2.AppImage
# Run: ./Sallie-5.4.2.AppImage
```

### 📱 Android App

**Development Mode** (USB debugging):

```bash
cd mobile
npm install

# Connect Android device or start emulator
npm run android

# App installs automatically
```

**Production APK** (sideload):

```bash
cd mobile
npm install

# Build release APK
cd android
./gradlew assembleRelease

# Output: mobile/android/app/build/outputs/apk/release/app-release.apk
# Transfer to phone and install
```

**Production AAB** (Google Play):

```bash
cd mobile
npm install

# Build release bundle
cd android
./gradlew bundleRelease

# Output: mobile/android/app/build/outputs/bundle/release/app-release.aab
# Upload to Google Play Console
```

---

## File Locations After Build

### Web App

```text
web/.next/             # Next.js build output
web/out/              # Static export (if using export)
```

### Desktop App

```text
desktop/dist/
├── Sallie-Setup-5.4.2.exe          # Windows installer
├── Sallie-5.4.2.dmg                # macOS installer
├── Sallie-5.4.2.AppImage           # Linux portable
├── Sallie-5.4.2-win.zip            # Windows portable
├── Sallie-5.4.2-mac.zip            # macOS portable
└── Sallie-5.4.2-linux.tar.gz       # Linux archive
```

### Android App

```text
mobile/android/app/build/outputs/
├── apk/release/app-release.apk     # Android APK
└── bundle/release/app-release.aab  # Google Play Bundle
```

---

## System Requirements

### Backend Server

- **CPU**: 4+ cores (8+ recommended)
- **RAM**: 16 GB minimum (32 GB recommended)
- **Storage**: 50 GB minimum (100 GB recommended)
- **OS**: Windows 10+, Ubuntu 20.04+, macOS 12+

### Web App (Browser)

- **Browser**: Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
- **RAM**: 4 GB minimum
- **Internet**: Local network only (backend required)

### Desktop App Requirements

- **Windows**: Windows 10 version 1809+
- **macOS**: macOS 12 Monterey or later
- **Linux**: Ubuntu 20.04+, Fedora 35+, or equivalent
- **RAM**: 4 GB minimum (8 GB recommended)
- **Storage**: 2 GB for app + data

### Android App Requirements

- **Android**: 8.0 (API 26) or higher
- **RAM**: 2 GB minimum (4 GB recommended)
- **Storage**: 500 MB for app + data
- **Internet**: WiFi required for backend connection

---

## First-Time Setup

### 1. Start Backend Services

```bash
# Start Docker services (Ollama + Qdrant)
docker-compose up -d

# Verify services
docker ps
# Should show: ollama, qdrant

# Start backend API
cd progeny_root
python -m uvicorn core.main:app --host 0.0.0.0 --port 8000

# Verify backend
curl http://localhost:8000/health
```

### 2. Configure Client Apps

All apps will prompt for backend URL on first launch:

- **Local network**: `http://192.168.1.X:8000` (replace X with server IP)
- **Same machine**: `http://localhost:8000`

### 3. Complete Convergence

On first launch, you'll complete the **Great Convergence**:

- 14 deep questions about your psychology
- 30-60 minutes to complete
- Creates your Heritage DNA
- Required before Sallie can interact fully

---

## Distribution Checklist

Before sharing Sallie with others:

### Backend Checklist

- [ ] Configure `.env` with proper URLs
- [ ] Start Docker services
- [ ] Start backend API
- [ ] Test health endpoint

### Web App Checklist

- [ ] Build production version
- [ ] Test on target browsers
- [ ] Verify backend connection
- [ ] Check responsive layouts

### Desktop App Checklist

- [ ] Build for all target platforms
- [ ] Code sign (Windows/macOS)
- [ ] Test installation process
- [ ] Verify auto-updater (if enabled)
- [ ] Create README with backend URL instructions

### Android App Checklist

- [ ] Build release APK/AAB
- [ ] Test on physical devices
- [ ] Verify backend connection over WiFi
- [ ] Test offline behavior
- [ ] Prepare screenshots for store listing

### Documentation

- [ ] Include backend setup instructions
- [ ] Provide network configuration guide
- [ ] Document firewall rules (port 8000)
- [ ] Create quick start guide
- [ ] List system requirements

---

## Network Configuration

### Local Network Access

To access Sallie from other devices on your network:

1. **Find server IP**:

```bash
# Windows
ipconfig

# Linux/macOS
ifconfig
# or
ip addr show
```

1. **Configure firewall**:

```bash
# Windows
netsh advfirewall firewall add rule name="Sallie Backend" dir=in action=allow protocol=TCP localport=8000

# Linux (ufw)
sudo ufw allow 8000/tcp

# macOS
# System Preferences > Security & Privacy > Firewall > Firewall Options
# Add rule for port 8000
```

1. **Update client configuration**:

- Open app settings
- Enter server IP: `http://192.168.1.X:8000`
- Test connection
- Save configuration

### Cloud Deployment (Optional)

For remote access (not recommended for privacy):

1. **Deploy backend to cloud server**
2. **Configure HTTPS with Let's Encrypt**
3. **Set up VPN for secure access**
4. **Update CORS settings in backend**

---

## Troubleshooting

### "Cannot connect to backend"

- Verify backend is running: `curl http://localhost:8000/health`
- Check firewall allows port 8000
- Ensure client has correct backend URL
- Test with browser: open `http://SERVER_IP:8000/docs`

### Docker Services Not Starting

- Ensure Docker Desktop is running
- Check port conflicts (11434, 6333)
- View logs: `docker-compose logs`
- Restart: `docker-compose down && docker-compose up -d`

### "Build fails"

- Clear caches: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules`
- Reinstall: `npm install`
- Check Node.js version: `node --version` (must be 18+)

### "Android app won't install"

- Enable "Unknown sources" in Android settings
- Uninstall old version first
- Check available storage (need 500+ MB)
- Verify APK is not corrupted (check file size)

---

## Next Steps

After installation:

1. ✅ Complete the Great Convergence (first-time setup)
2. ✅ Explore the interface and test voice/text input
3. ✅ Configure file access permissions
4. ✅ Set up smart home integrations (optional)
5. ✅ Customize avatar appearance (optional)
6. ✅ Review privacy settings

---

## Support & Updates

- **Documentation**: See `/docs` directory
- **Issues**: GitHub Issues
- **Updates**: Pull latest code and rebuild
- **Backup**: Run `scripts/backup.sh` before updates

**Enjoy your relationship with Sallie!** 💜
