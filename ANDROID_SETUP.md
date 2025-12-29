# Android App Connection Setup

## Quick Start

### Find Your Computer's IP Address

**Windows:**
1. Open Command Prompt
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your WiFi adapter
4. Example: `192.168.1.100`

**Mac:**
1. Open Terminal
2. Type: `ifconfig | grep "inet " | grep -v 127.0.0.1`
3. The first result is usually your WiFi IP
4. Example: `192.168.1.100`

**Linux:**
1. Open Terminal
2. Type: `ip addr show | grep "inet " | grep -v 127.0.0.1`
3. Look for your WiFi interface (usually wlan0 or wlp3s0)
4. Example: `192.168.1.100`

### Configure Android App

1. **Install APK** on your Android device
2. **Open Sallie app**
3. **Tap Settings** (gear icon)
4. **Enter Backend URL**: `http://YOUR_IP_HERE:8000`
   - Replace `YOUR_IP_HERE` with the IP from above
   - Example: `http://192.168.1.100:8000`
5. **Tap "Test Connection"**
6. **Wait for green checkmark** ✓
7. **Tap "Save"**

### Troubleshooting

#### "Connection Failed"

**1. Check Same WiFi Network**
- Phone and computer must be on the same WiFi
- Check WiFi name on both devices

**2. Check Firewall**

**Windows:**
```batch
netsh advfirewall firewall add rule name="Sallie Backend" dir=in action=allow protocol=TCP localport=8000
```

**Mac:**
1. System Preferences → Security & Privacy
2. Firewall → Firewall Options
3. Click "+" and add Python/uvicorn
4. Allow incoming connections

**Linux:**
```bash
sudo ufw allow 8000/tcp
```

**3. Test Connection from Phone Browser**
1. Open Chrome on your phone
2. Go to: `http://YOUR_IP:8000/health`
3. Should see: `{"status":"healthy"}`
4. If this works, the app should connect too

**4. Check Backend is Running**
On your computer:
```bash
curl http://localhost:8000/health
```
Should return: `{"status":"healthy"}`

If not, start backend:
```bash
./start-sallie.sh   # Linux/Mac
start-sallie.bat    # Windows
```

#### "Timeout" or "No Response"

- **Increase timeout**: Wait 30 seconds for first connection
- **Restart backend**: Sometimes helps with firewall issues
- **Check port**: Make sure backend is on port 8000
- **Try IP directly**: Use IP address, not computer name

#### "SSL/HTTPS Error"

- Android app expects `http://` not `https://`
- Don't include `/` at the end of URL
- Format: `http://192.168.1.100:8000` ✓
- Not: `https://192.168.1.100:8000/` ✗

### Testing Checklist

Before using the app, verify:

- [ ] Phone and computer on same WiFi
- [ ] Backend running on computer (check http://localhost:8000/health)
- [ ] Firewall allows port 8000
- [ ] Can access http://YOUR_IP:8000/health from phone browser
- [ ] Using `http://` not `https://`
- [ ] No typos in IP address
- [ ] Port 8000 is included in URL

### Network Configuration

#### Home Network (Typical)
```
Computer IP: 192.168.1.100
Phone WiFi: Same network (e.g., "Home WiFi")
Backend URL: http://192.168.1.100:8000
```

#### Office Network (may have restrictions)
- May need IT to allow port 8000
- May need to use VPN
- May not work due to network isolation

#### Public WiFi (not recommended)
- Less secure
- May have client isolation (devices can't see each other)
- Use at own risk

### Advanced: Static IP

For convenience, set your computer to use a static IP:

**Windows:**
1. Control Panel → Network and Sharing Center
2. Change adapter settings
3. Right-click WiFi → Properties
4. Internet Protocol Version 4 → Properties
5. Use static IP (e.g., 192.168.1.100)

**Mac:**
1. System Preferences → Network
2. WiFi → Advanced
3. TCP/IP tab
4. Configure IPv4: Manually
5. Set static IP (e.g., 192.168.1.100)

**Linux:**
```bash
sudo nmcli con mod "WiFi-Name" ipv4.addresses 192.168.1.100/24
sudo nmcli con mod "WiFi-Name" ipv4.method manual
sudo nmcli con up "WiFi-Name"
```

This prevents your IP from changing and breaking the connection.

### Quick Reference

| Issue | Solution |
|-------|----------|
| Can't connect | Check same WiFi network |
| Timeout | Allow port 8000 in firewall |
| Wrong format | Use `http://IP:8000` format |
| Works in browser | App should work too - restart it |
| IP changed | Find new IP and update app settings |

---

## Building the APK

### Prerequisites
- Android Studio
- JDK 17+
- Android SDK (API 33+)

### Build Commands

```bash
cd mobile
npm install

# Build APK
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Transfer to Phone

**Method 1: USB**
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

**Method 2: Cloud**
1. Upload APK to Google Drive/Dropbox
2. Download on phone
3. Install from Downloads

**Method 3: Direct**
1. Start local server:
   ```bash
   python -m http.server 8080
   ```
2. On phone, navigate to: `http://YOUR_IP:8080`
3. Download APK
4. Install

---

## First Time Setup

1. **Install APK** on phone
2. **Open app**
3. **Allow permissions** (optional but recommended)
   - Internet: Required for backend connection
   - Microphone: For voice input
   - Camera: For visual input
   - Storage: For saving files
4. **Enter backend URL** (see above)
5. **Test connection**
6. **Complete Great Convergence** (14 questions)
7. **Start chatting!**

---

## Tips

- **Save IP address**: Write it down or add to Notes
- **Bookmark health page**: `http://YOUR_IP:8000/health`
- **Test before building**: Use browser first
- **Keep backend running**: Android app needs it
- **Use WiFi**: Cellular data won't work (local network only)

---

**Need help?** Check main troubleshooting guide in `START_HERE.md`
