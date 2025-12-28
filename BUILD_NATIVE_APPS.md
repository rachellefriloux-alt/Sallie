# Building Native Apps - Complete Guide

**Version**: 5.4.2  
**Date**: December 28, 2025

---

## Desktop App - Native Installers

### What You Get
- **Windows**: `.exe` installer with Start Menu shortcuts
- **macOS**: `.dmg` installer with drag-to-Applications
- **Linux**: `.AppImage` (portable) + `.deb` (Ubuntu/Debian)

### Build Desktop App

#### Prerequisites
```bash
cd desktop
npm install
```

#### Build for Your Platform
```bash
# Windows (creates installer)
npm run build:win
# Output: dist/Sallie-Setup-5.4.2.exe

# macOS (creates DMG)
npm run build:mac
# Output: dist/Sallie-5.4.2-arm64.dmg (M1/M2)
#         dist/Sallie-5.4.2-x64.dmg (Intel)

# Linux (creates AppImage + deb)
npm run build:linux
# Output: dist/Sallie-5.4.2-x86_64.AppImage
#         dist/Sallie-5.4.2-amd64.deb
```

#### Build All Platforms (macOS only)
```bash
npm run build:all
# Creates Windows, macOS, and Linux builds
```

### Install Desktop App

#### Windows
1. Double-click `Sallie-Setup-5.4.2.exe`
2. Follow installer wizard
3. Choose installation directory
4. Creates desktop + Start Menu shortcuts
5. Launch from Start Menu or desktop

#### macOS
1. Open `Sallie-5.4.2-arm64.dmg`
2. Drag Sallie to Applications folder
3. Open from Applications or Spotlight
4. First launch: Right-click → Open (bypass Gatekeeper)

#### Linux
**AppImage** (recommended):
```bash
chmod +x Sallie-5.4.2-x86_64.AppImage
./Sallie-5.4.2-x86_64.AppImage
```

**Debian/Ubuntu**:
```bash
sudo dpkg -i Sallie-5.4.2-amd64.deb
sallie-desktop
```

### Desktop App Features
- ✅ Native window with system tray icon
- ✅ Minimize to tray (stays running in background)
- ✅ System notifications
- ✅ Auto-launch on startup (optional)
- ✅ Offline mode
- ✅ Local storage for settings

---

## Android App - APK Installation

### What You Get
- **APK**: Sideload on any Android device
- **AAB**: Upload to Google Play Store

### Build Android App

#### Prerequisites
1. Install Android Studio
2. Install JDK 17+
3. Set up Android SDK (API 33+)
4. Configure environment:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Build APK (for sideloading)
```bash
cd mobile
npm install

# Generate release APK
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

#### Build AAB (for Google Play)
```bash
cd mobile/android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Install Android APK

#### Method 1: USB Transfer
1. Connect Android device to computer
2. Enable USB debugging (Settings → Developer Options)
3. Copy `app-release.apk` to phone
4. Open file manager on phone
5. Tap APK file
6. Allow "Install Unknown Apps" if prompted
7. Tap "Install"

#### Method 2: ADB Install
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

#### Method 3: Email/Cloud
1. Email APK to yourself or upload to cloud
2. Download on phone
3. Open APK file
4. Install as above

### Android App Features
- ✅ Native Android UI
- ✅ Push notifications
- ✅ Biometric authentication
- ✅ Background service
- ✅ Offline mode
- ✅ Material Design 3

### App Permissions
The app will request:
- **Internet**: Connect to backend
- **Microphone**: Voice input (optional)
- **Camera**: Visual input (optional)
- **Storage**: Save files (optional)
- **Notifications**: Proactive updates

All permissions are optional except Internet.

---

## Web App - Proper Deployment

### Development Mode
```bash
cd web
npm install
npm run dev
# Open http://localhost:3000
```

### Production Build

#### Option 1: Node.js Server
```bash
cd web
npm run build
npm run start
# Runs on http://localhost:3000
```

#### Option 2: Static Export (for hosting)
1. Add to `next.config.js`:
```javascript
module.exports = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};
```

2. Build static files:
```bash
npm run build
# Output: out/ directory
```

3. Deploy to any static host:
- Vercel
- Netlify
- GitHub Pages
- S3 + CloudFront
- Nginx/Apache

#### Option 3: Docker Container
```bash
# Build image
docker build -t sallie-web:5.4.2 ./web

# Run container
docker run -p 3000:3000 sallie-web:5.4.2
```

### Deploy to Vercel (Recommended)
```bash
cd web
npm install -g vercel
vercel login
vercel --prod
# Follow prompts, get live URL
```

### Deploy to Netlify
```bash
cd web
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod --dir=.next
```

### Custom Domain
After deploying, configure your domain:
1. Add CNAME record: `sallie.yourdomain.com` → `your-vercel-url.vercel.app`
2. Configure in hosting platform settings
3. Enable HTTPS (automatic on Vercel/Netlify)

---

## Backend Connection Configuration

### Desktop App
1. Launch app
2. Click "Settings" (gear icon)
3. Enter backend URL: `http://localhost:8000`
4. Or remote: `http://192.168.1.X:8000`
5. Click "Test Connection"
6. Save when green checkmark appears

### Android App
1. Open app
2. Tap menu → Settings
3. Enter backend URL
4. Important: Use local network IP, not `localhost`
   - Find with: `ip addr show` (Linux) or `ipconfig` (Windows)
   - Example: `http://192.168.1.100:8000`
5. Tap "Test Connection"
6. Save when successful

### Web App
Set backend URL in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Or configure at runtime in Settings page.

---

## Complete Deployment Workflow

### 1. Start Backend
```bash
cd progeny_root
python -m uvicorn core.main:app --host 0.0.0.0 --port 8000
```

### 2. Build All Apps
```bash
# Desktop
cd desktop && npm run build

# Android
cd mobile/android && ./gradlew assembleRelease

# Web
cd web && npm run build
```

### 3. Distribute

**Desktop**:
- Upload installers to GitHub Releases
- Users download and install

**Android**:
- Upload APK to website/cloud
- Users download and install
- Or: Upload AAB to Google Play Console

**Web**:
- Deploy to Vercel/Netlify
- Share URL with users
- No installation needed

---

## Distribution Checklist

### Before Distribution

**Desktop**:
- [ ] Build for all target platforms
- [ ] Test installation on clean machine
- [ ] Verify system tray functionality
- [ ] Test backend connection
- [ ] Sign code (Windows/macOS)
- [ ] Create release notes

**Android**:
- [ ] Build release APK with proper signing
- [ ] Test on multiple devices (phones/tablets)
- [ ] Verify permissions work correctly
- [ ] Test offline mode
- [ ] Create app listing
- [ ] Prepare screenshots

**Web**:
- [ ] Test production build locally
- [ ] Verify all routes work
- [ ] Test on multiple browsers
- [ ] Check responsive design
- [ ] Configure CDN/caching
- [ ] Set up monitoring

### Security

**Code Signing**:
- Windows: Purchase code signing certificate
- macOS: Enroll in Apple Developer Program
- Android: Generate keystore for signing

**HTTPS**:
- Web app must use HTTPS in production
- Backend should use HTTPS for remote access
- Use Let's Encrypt for free certificates

---

## File Sizes

Approximate download sizes:

**Desktop**:
- Windows installer: ~80-120 MB
- macOS DMG: ~100-140 MB
- Linux AppImage: ~100-130 MB

**Android**:
- APK: ~40-60 MB
- Installed size: ~120-150 MB

**Web**:
- Initial bundle: ~2-3 MB
- With caching: <500 KB subsequent loads

---

## User Experience

### Desktop App Launch
1. Double-click desktop icon OR
2. Start Menu → Sallie OR
3. System tray → Click icon
4. Window opens instantly
5. Connects to backend automatically
6. Ready to use

### Android App Launch
1. Tap app icon in drawer
2. Splash screen (1-2 seconds)
3. Main screen loads
4. Connects to backend over WiFi
5. Ready to use
6. Runs in background when minimized

### Web App Access
1. Open bookmark or type URL
2. Page loads (cached, instant)
3. Connects to backend via WebSocket
4. Ready to use
5. Works like a native app (PWA)

---

## Distribution Recommendations

**For Personal Use**:
- Desktop: Build for your platform only
- Android: Build APK, sideload
- Web: Run locally (`npm run dev`)

**For Small Team (1-10 people)**:
- Desktop: Share installers via private GitHub release
- Android: Share APK via cloud storage
- Web: Deploy to Vercel with password protection

**For Public Release**:
- Desktop: GitHub Releases with auto-updater
- Android: Google Play Store
- Web: Public Vercel/Netlify deployment

---

## Support & Updates

### Auto-Updates (Desktop)
Add to `package.json`:
```json
"build": {
  "publish": {
    "provider": "github",
    "owner": "rachellefriloux-alt",
    "repo": "Sallie"
  }
}
```

### Manual Updates
Users download new version and reinstall.

### Backend Updates
```bash
git pull
pip install -r requirements.txt
restart backend
```

---

## Quick Reference

| Platform | Build Command | Output | Install Method |
|----------|--------------|--------|----------------|
| Windows | `npm run build:win` | `.exe` | Double-click |
| macOS | `npm run build:mac` | `.dmg` | Drag to Applications |
| Linux | `npm run build:linux` | `.AppImage` | `chmod +x` then run |
| Android | `./gradlew assembleRelease` | `.apk` | Transfer & install |
| Web | `npm run build` | `out/` | Deploy to host |

---

**All apps are ready to build and distribute!** 🚀
