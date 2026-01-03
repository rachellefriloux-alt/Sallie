# 🔄 Sallie Cross-Device Sync Guide

## ✨ Everything Syncs Automatically!

Sallie is designed to keep **everything in sync** across all your devices:
- 💜 **Emotional State** (Limbic system)
- 🧠 **All Memories** (Every conversation, every interaction)
- 🗣️ **Conversations** (Full chat history)
- 🎯 **Projects** (Goals, tasks, progress)
- ⚙️ **Preferences** (Settings, voice config, themes)
- 🌟 **Heritage DNA** (Your identity and relationship)

---

## 🔐 Privacy & Security

### End-to-End Encryption
- ✅ **AES-256-GCM encryption** on all synced data
- ✅ **Zero-knowledge architecture** - only you have the keys
- ✅ **Local-first** - your main device does all processing
- ✅ **Encrypted cloud** - backup only, never sees your data

### What This Means
- Your data is encrypted BEFORE it leaves your device
- The sync server (when enabled) only sees encrypted blobs
- Only your authorized devices can decrypt the data
- Nobody else (not even us) can read your conversations

---

## 📱 Supported Devices

### Current Support
✅ **Desktop** (Windows, macOS, Linux)
- Primary processing device
- Full feature set
- Priority 1 for sync

✅ **Mobile** (Android)
- Full access to conversations and memory
- Voice interface
- Push notifications
- Priority 2 for sync

✅ **Web** (Any browser)
- Access from anywhere
- Full UI
- Real-time sync

✅ **Tablet** (Android tablets)
- Optimized tablet UI
- Full features
- Priority 2 for sync

---

## ⚙️ Sync Configuration

### Default Settings (Already Enabled!)
```json
{
  "sync": {
    "enabled": true,
    "auto_sync": true,
    "sync_interval_seconds": 60,
    "sync_on_change": true
  }
}
```

### What Gets Synced
| Data Type | Syncs? | Frequency |
|-----------|--------|-----------|
| **Limbic State** | ✅ Yes | Real-time + every 60s |
| **Memories** | ✅ Yes | After each conversation |
| **Conversations** | ✅ Yes | Real-time |
| **Heritage DNA** | ✅ Yes | On change |
| **Projects** | ✅ Yes | On change |
| **Preferences** | ✅ Yes | On change |
| **Drafts** | ✅ Yes | Auto-save + sync |
| **Creative Works** | ✅ Yes | On save |

---

## 🚀 How Sync Works

### Architecture
```
┌─────────────────┐
│  Desktop (You)  │ ← Main processing device
│  Windows/Mac    │
└────────┬────────┘
         │
         ├─ Encrypted ─┐
         │             │
         ↓             ↓
┌─────────────┐   ┌──────────────┐
│   Mobile    │   │   Tablet     │
│  (Android)  │   │  (Android)   │
└─────────────┘   └──────────────┘
         ↓             ↓
         └──── Sync ───┘
```

### Sync Process
1. **Change Detection** - Sallie detects when data changes
2. **Encryption** - Data is encrypted with AES-256-GCM
3. **Sync Payload** - Encrypted package is created
4. **Distribution** - Synced to all authorized devices
5. **Decryption** - Each device decrypts with its key
6. **Integration** - Data is merged intelligently

### Conflict Resolution
- **Last-Write-Wins** - Most recent change takes precedence
- **Manual Merge** - For important conflicts, you can choose
- **Version History** - Previous versions are kept
- **No Data Loss** - Everything is preserved

---

## 📊 Sync Status

### Check Sync Status
From the web/desktop/mobile app:
```
Settings → Sync Status
```

You'll see:
- ✅ **Last Sync Time** - When each device last synced
- ✅ **Connected Devices** - All your devices
- ✅ **Sync Health** - Green = good, Yellow = delayed, Red = issue
- ✅ **Data Stats** - What's been synced

### API Endpoint
```bash
curl http://localhost:8000/api/sync/status
```

Response:
```json
{
  "device_id": "desktop-windows-01",
  "last_sync": 1766991234.5,
  "registered_devices": 3,
  "sync_enabled": true,
  "encryption_enabled": true,
  "synced_items": {
    "limbic_state": "2024-12-29T07:10:00Z",
    "memory": "2024-12-29T07:10:00Z",
    "conversations": "2024-12-29T07:10:05Z"
  }
}
```

---

## 🔧 Setup Multi-Device Sync

### Step 1: Install Sallie on Each Device

**Desktop:**
```bash
python install.py
python launcher.py
```

**Android Mobile/Tablet:**
1. Install APK from `mobile/android/app/build/outputs/apk/release/`
2. Open app
3. Configure backend URL (your desktop IP)

**Web (from another device):**
1. Open `http://YOUR_DESKTOP_IP:3000`
2. Login with same credentials

### Step 2: Register Each Device

**First Time on Each Device:**
1. Open Sallie
2. Go to Settings → Devices
3. Click "Register This Device"
4. Enter device name (e.g., "My Android Phone")
5. Click "Register"

**Done!** The device is now part of your sync network.

### Step 3: Verify Sync

1. Make a change on one device (e.g., chat with Sallie)
2. Wait 60 seconds (or force sync)
3. Open Sallie on another device
4. Verify the change appears

---

## 🔄 Manual Sync

### Force Sync Now
If you don't want to wait for auto-sync:

**From UI:**
```
Settings → Sync → Force Sync Now
```

**From API:**
```bash
curl -X POST http://localhost:8000/api/sync/force
```

**From Python:**
```python
from core.sync import SyncClient

client = SyncClient(device_id="my-device")
result = client.sync_all()
print(result)
```

---

## 📱 Mobile App Sync Setup

### Android Configuration

1. **Find Your Desktop IP:**
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
   
   Look for IPv4 address (e.g., `192.168.1.100`)

2. **Configure Mobile App:**
   - Open Sallie Android app
   - Tap Settings ⚙️
   - Tap "Backend URL"
   - Enter: `http://192.168.1.100:8000`
   - Tap "Test Connection" ✅
   - Tap "Save"

3. **Enable Sync:**
   - Go to Settings → Sync
   - Toggle "Auto Sync" ON
   - Select sync interval (default: 60 seconds)

**Important:** Desktop and mobile must be on the same WiFi network!

---

## 🌐 Remote Access (Future)

### Cloud Sync Server (Coming Soon)
- Host your own sync server
- Or use official Sallie Cloud (opt-in)
- Access from anywhere
- Same encryption

### Current Status
- ✅ Local network sync working
- ✅ Encryption implemented
- ⏳ Cloud sync server (planned)
- ⏳ Remote access (planned)

**For Now:** All devices must be on the same local network

---

## 🛠️ Troubleshooting

### Sync Not Working

**Problem:** "Last sync: Never"

**Solutions:**
1. Check network connectivity
   ```bash
   ping YOUR_DESKTOP_IP
   ```
2. Verify backend is running
   ```bash
   curl http://YOUR_DESKTOP_IP:8000/health
   ```
3. Check firewall (allow port 8000)
4. Restart Sallie on all devices

### Devices Not Appearing

**Problem:** "Registered devices: 1" (should be more)

**Solutions:**
1. Register each device: Settings → Devices → Register
2. Check device IDs are unique
3. Verify sync is enabled in config.json

### Conflict Errors

**Problem:** "Sync conflict detected"

**Solutions:**
1. Let Sallie auto-resolve (last-write-wins)
2. Or manually merge: Settings → Sync → Resolve Conflicts
3. Choose which version to keep

### Slow Sync

**Problem:** Sync takes too long

**Solutions:**
1. Reduce sync interval in config
2. Check network speed
3. Clear old sync payloads:
   ```bash
   rm -rf progeny_root/core/sync/payloads/*
   ```

---

## 📊 Sync Architecture Details

### Data Flow
```
User Action (Device A)
    ↓
Change Detected
    ↓
Encrypt Data (AES-256-GCM)
    ↓
Create Sync Payload
    ↓
Store Locally (progeny_root/core/sync/payloads/)
    ↓
[Future: Send to Cloud]
    ↓
Distribute to Other Devices
    ↓
Each Device Decrypts
    ↓
Merge with Local Data
    ↓
Update UI
```

### File Structure
```
progeny_root/
├── core/
│   └── sync/
│       ├── sync_client.py       # Main sync logic
│       ├── sync_encryption.py   # AES-256-GCM encryption
│       ├── sync_conflict.py     # Conflict resolution
│       ├── sync_state.py        # Device tracking
│       └── payloads/            # Encrypted sync data
│           ├── limbic_*.json
│           ├── memory_*.json
│           └── conversation_*.json
└── limbic/
    └── heritage/
        └── sync_state.json      # Sync metadata
```

---

## 🔐 Security Best Practices

### Recommendations
1. ✅ **Keep master key secure** (generated on first run)
2. ✅ **Use strong device passwords**
3. ✅ **Only register devices you own**
4. ✅ **Enable device authentication**
5. ✅ **Review registered devices regularly**

### Encryption Keys
- **Master Key:** Generated automatically
- **Device Keys:** Derived from master key
- **Storage:** Encrypted in `progeny_root/core/sync/keys/`
- **Backup:** Save master key in secure location

### Deregister Lost Device
If you lose a device:
```bash
# From any device
Settings → Devices → [Select device] → Deregister
```

This immediately revokes that device's access.

---

## ✅ Summary

### What You Get
- ✅ **Automatic Sync** - Everything syncs in real-time
- ✅ **All Devices** - Desktop, mobile, tablet, web
- ✅ **Encrypted** - AES-256-GCM end-to-end encryption
- ✅ **Private** - Zero-knowledge architecture
- ✅ **Smart Conflicts** - Automatic + manual resolution
- ✅ **No Data Loss** - Everything is preserved

### What You Do
1. ✅ Install Sallie on each device
2. ✅ Register each device in Settings
3. ✅ Make sure they're on same network
4. ✅ Done! Everything syncs automatically

**That's it! Sallie remembers everything across all your devices!** 💜✨

---

## 📞 Support

If sync isn't working:
1. Check this guide's troubleshooting section
2. Run diagnostics: `Settings → Sync → Run Diagnostics`
3. Check logs: `progeny_root/logs/sync.log`
4. File an issue on GitHub with log output

---

*Last Updated: December 29, 2025*  
*Version: 5.4.2*  
*Sync Status: ✅ ENABLED & WORKING*
