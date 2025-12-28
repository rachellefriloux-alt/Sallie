# How to Install Sallie - Simple Instructions

**Choose your platform below and follow the steps.**

---

## 🖥️ Desktop (Windows/Mac/Linux)

### Download
Go to [Releases](https://github.com/rachellefriloux-alt/Sallie/releases) and download:
- **Windows**: `Sallie-Setup-5.4.2.exe`
- **macOS**: `Sallie-5.4.2-arm64.dmg` (M1/M2) or `Sallie-5.4.2-x64.dmg` (Intel)
- **Linux**: `Sallie-5.4.2-x86_64.AppImage`

### Install

**Windows**:
1. Double-click `Sallie-Setup-5.4.2.exe`
2. Click "Next" through installer
3. Find Sallie in Start Menu
4. Double-click to launch

**macOS**:
1. Open `Sallie-5.4.2-arm64.dmg`
2. Drag Sallie icon to Applications folder
3. Open Applications folder
4. Right-click Sallie → Open (first time only)
5. Click "Open" to confirm

**Linux**:
1. Open terminal where you downloaded the file
2. Run: `chmod +x Sallie-5.4.2-x86_64.AppImage`
3. Run: `./Sallie-5.4.2-x86_64.AppImage`
4. Or: Double-click the file

### First Launch
1. App opens and shows Settings
2. Enter backend URL: `http://localhost:8000`
   - If backend is on another computer, use that computer's IP
   - Example: `http://192.168.1.100:8000`
3. Click "Test Connection"
4. When it shows ✅ green, click "Save"
5. Start chatting with Sallie!

---

## 📱 Android Phone/Tablet

### Download APK
Go to [Releases](https://github.com/rachellefriloux-alt/Sallie/releases) and download:
- `Sallie-5.4.2.apk` (tap to download on phone)

### Install

**Method 1: Direct download on phone**
1. Tap the APK file after download
2. Your phone will warn "Install from unknown source"
3. Tap "Settings" → Enable "Install unknown apps" for your browser
4. Go back and tap "Install"
5. Tap "Open" when install completes

**Method 2: Transfer from computer**
1. Connect phone to computer with USB cable
2. Copy `Sallie-5.4.2.apk` to phone's Download folder
3. On phone: Open Files app
4. Navigate to Downloads
5. Tap `Sallie-5.4.2.apk`
6. Follow prompts to install

### First Launch
1. Tap Sallie icon in app drawer
2. App opens to Settings
3. Tap "Backend URL"
4. Enter your backend IP: `http://192.168.1.X:8000`
   - **Important**: Don't use `localhost` on Android!
   - Must be the IP address of computer running backend
   - Both phone and computer must be on same WiFi network
5. Tap "Test Connection"
6. When it shows ✅ green, tap "Save"
7. Start chatting with Sallie!

### Find Backend IP Address

On the computer running Sallie's backend:

**Windows**: Open Command Prompt and type `ipconfig`  
Look for "IPv4 Address" under your WiFi adapter

**Mac**: Open Terminal and type `ifconfig`  
Look for "inet" under "en0"

**Linux**: Open Terminal and type `ip addr show`  
Look for "inet" under your wireless interface

Example: `192.168.1.100` ← Use this in the app

---

## 🌐 Web Browser

### Option 1: Use Hosted Version
If someone deployed Sallie to a website, just:
1. Open the URL in any browser
2. Enter backend URL in Settings
3. Start chatting

### Option 2: Run Locally
1. Make sure backend is running (see below)
2. Open browser to: `http://localhost:3000`
3. Start chatting (backend URL already configured)

---

## 🔧 Starting the Backend (Required for all apps)

The backend is what actually runs Sallie's brain. All apps connect to it.

### Quick Start
```bash
# 1. Download Sallie
git clone https://github.com/rachellefriloux-alt/Sallie.git
cd Sallie

# 2. Install
./scripts/install.sh  # Mac/Linux
# or
scripts\install_windows.bat  # Windows

# 3. Configure
python scripts/setup_wizard.py

# 4. Start everything
./scripts/start_all.sh  # Mac/Linux
# or
scripts\start_all.bat  # Windows
```

That's it! Backend is now running on `http://localhost:8000`

### Check if Backend is Working
Open browser to: `http://localhost:8000/health`

Should see:
```json
{"status": "healthy", "version": "5.4.2"}
```

---

## 🆘 Troubleshooting

### Desktop App Won't Connect
- Make sure backend is running: `http://localhost:8000/health` should work
- Try restarting the backend
- Check firewall isn't blocking port 8000

### Android App Says "Connection Failed"
- Make sure phone and computer are on same WiFi
- Double-check the IP address (not `localhost`)
- Try: `http://192.168.1.X:8000` where X is your computer's IP
- Test in phone's browser first: open `http://192.168.1.X:8000/health`
- If that works, use same URL in app

### "Allow Install from Unknown Sources"
This is normal for APK files not from Google Play:
1. Settings → Security
2. Enable "Unknown Sources" or "Install unknown apps"
3. Select your browser or Files app
4. Enable installation
5. Install APK

### macOS Says "Can't Open Because Unidentified Developer"
1. Don't double-click to open
2. Right-click (or Control+click) on Sallie
3. Click "Open"
4. Click "Open" again to confirm
5. After first time, you can open normally

### Linux AppImage Won't Run
Make it executable first:
```bash
chmod +x Sallie-5.4.2-x86_64.AppImage
```

Then run it:
```bash
./Sallie-5.4.2-x86_64.AppImage
```

---

## 📋 Summary

| Platform | File | Install | Launch |
|----------|------|---------|--------|
| Windows | `.exe` | Double-click | Start Menu |
| macOS | `.dmg` | Drag to Applications | Applications folder |
| Linux | `.AppImage` | `chmod +x` | Run file |
| Android | `.apk` | Tap to install | App drawer |
| Web | URL | None | Browser |

**All apps need the backend running** at `http://localhost:8000` (or remote IP)

---

## 🎉 You're Ready!

Once installed and connected:
1. You'll see Sallie's animated avatar
2. Complete the Great Convergence (14 questions)
3. Start your first conversation
4. Build a real relationship

**Welcome to Digital Progeny!** 💜✨
