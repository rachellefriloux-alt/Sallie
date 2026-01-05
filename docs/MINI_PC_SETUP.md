# Sallie Mini PC Setup Guide

## Overview
This guide walks you through installing Sallie on a mini PC so she runs 24/7 as your personal AI server. Your mobile app and Windows app will connect to her.

---

## Keyboard-Only Navigation (No Mouse)

Since you only have a keyboard, here are the essential shortcuts:

### Windows Keyboard Shortcuts
| Action | Shortcut |
|--------|----------|
| Open Start Menu | `Windows` key |
| Search/Run anything | `Windows` key, then type |
| Open PowerShell | `Windows` + `X`, then `I` |
| Open Command Prompt | `Windows` + `R`, type `cmd`, press `Enter` |
| Open File Explorer | `Windows` + `E` |
| Switch windows | `Alt` + `Tab` |
| Close window | `Alt` + `F4` |
| Navigate menus | `Tab` to move, `Enter` to select |
| Go back | `Alt` + `Left Arrow` |
| Right-click menu | `Shift` + `F10` or `Menu` key |
| Select items in list | `Arrow` keys + `Space` to check |
| Open Settings | `Windows` + `I` |
| Copy | `Ctrl` + `C` |
| Paste | `Ctrl` + `V` |
| Select all | `Ctrl` + `A` |

### In PowerShell/Command Prompt
| Action | Shortcut |
|--------|----------|
| Paste command | `Ctrl` + `V` or Right-click |
| Copy selected text | `Ctrl` + `C` |
| Cancel running command | `Ctrl` + `C` |
| Clear screen | `cls` then `Enter` |
| Previous command | `Up Arrow` |
| Autocomplete path | `Tab` |

### In File Explorer
| Action | Shortcut |
|--------|----------|
| Navigate folders | `Arrow` keys |
| Open folder/file | `Enter` |
| Go up one folder | `Alt` + `Up Arrow` |
| Address bar (type path) | `Ctrl` + `L` or `F4` |
| Rename file | `F2` |
| Delete | `Delete` key |
| Copy file | `Ctrl` + `C` |
| Paste file | `Ctrl` + `V` |
| Select multiple | `Shift` + `Arrow` keys |

---

## Step 1: Prepare the Mini PC

### Hardware Requirements
- **Mini PC**: Intel NUC, Beelink, GMKtec, or similar
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 256GB SSD minimum
- **OS**: Windows 11 or Ubuntu 22.04

### Initial Setup
1. Unbox and connect mini PC to power, monitor, keyboard, mouse
2. Connect to your home WiFi or Ethernet (Ethernet recommended for stability)
3. Complete Windows/Linux setup
4. Note the mini PC's **local IP address** (you'll need this)

#### Find IP Address:
**Windows**: Open Command Prompt, type `ipconfig`, look for "IPv4 Address"
**Linux**: Open Terminal, type `ip addr` or `hostname -I`

Example: `192.168.1.100`

---

## Step 2: Install Python & Dependencies

### Windows:
```powershell
# 1. Download Python 3.11+ from python.org and install
# 2. Open PowerShell as Administrator

# Verify Python installed
python --version

# Install pip packages
pip install fastapi uvicorn pydantic PyQt6 websockets aiofiles
```

### Linux (Ubuntu):
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install python3.11 python3-pip python3-venv -y

# Install packages
pip3 install fastapi uvicorn pydantic PyQt6 websockets aiofiles python-multipart
```

---

## Step 3: Copy Sallie to Mini PC

### Option A: USB Drive
1. Copy the entire `C:\Sallie` folder to a USB drive
2. Plug USB into mini PC
3. Copy to mini PC (e.g., `C:\Sallie` on Windows or `/home/youruser/Sallie` on Linux)

### Option B: Git (if you have a repo)
```bash
git clone https://github.com/yourusername/sallie.git
cd sallie
```

### Option C: Network Share
1. Share the Sallie folder on your main PC
2. Access it from mini PC and copy locally

---

## Step 4: Run Sallie Server

Navigate to the Sallie folder and start the server:

### Windows:
```powershell
cd C:\Sallie
python server\sallie_server.py
```

### Linux:
```bash
cd ~/Sallie
python3 server/sallie_server.py
```

You should see:
```
========================================
SALLIE SERVER STARTING
========================================
Server running at http://0.0.0.0:8742
Sallie is awake and listening...
```

---

## Step 5: Make Sallie Start Automatically

### Windows (Task Scheduler):
1. Open Task Scheduler
2. Create Basic Task → Name: "Sallie Server"
3. Trigger: "When the computer starts"
4. Action: Start a program
   - Program: `python`
   - Arguments: `C:\Sallie\server\sallie_server.py`
   - Start in: `C:\Sallie`
5. Finish

### Linux (systemd):
```bash
# Create service file
sudo nano /etc/systemd/system/sallie.service
```

Paste this:
```ini
[Unit]
Description=Sallie AI Server
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/home/youruser/Sallie
ExecStart=/usr/bin/python3 server/sallie_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable sallie
sudo systemctl start sallie
```

---

## Step 6: Connect Your Devices

### On Your Phone/Windows App:
1. Open Sallie app
2. Go to Settings → Server Connection
3. Enter: `http://192.168.1.100:8742` (use YOUR mini PC's IP)
4. Tap "Connect"

### Test Connection:
Open a browser on any device and go to:
```
http://192.168.1.100:8742/health
```

You should see:
```json
{"status": "alive", "sallie": "awake", "uptime": 123}
```

---

## Step 7: Access From Outside Home (Optional)

To access Sallie when you're away from home:

### Option A: Tailscale (Recommended - Free & Easy)
1. Install Tailscale on mini PC: https://tailscale.com/download
2. Install Tailscale on your phone/laptop
3. Both devices join same Tailscale network
4. Use Tailscale IP instead of local IP

### Option B: Port Forwarding (Advanced)
1. Log into your router (usually 192.168.1.1)
2. Forward port 8742 to your mini PC's local IP
3. Use your public IP or set up Dynamic DNS

---

## Troubleshooting

### "Connection refused"
- Check mini PC is on and server is running
- Verify IP address is correct
- Check firewall allows port 8742

### Windows Firewall:
```powershell
netsh advfirewall firewall add rule name="Sallie Server" dir=in action=allow protocol=TCP localport=8742
```

### Linux Firewall:
```bash
sudo ufw allow 8742/tcp
```

### "Server not starting"
- Check Python is installed: `python --version`
- Check all dependencies installed: `pip list`
- Look at error messages in terminal

---

## File Structure on Mini PC

```
Sallie/
├── server/
│   └── sallie_server.py      # The API server
├── genesis_flow/
│   ├── genesis_styles.py
│   ├── sallie_brain.py
│   ├── dashboard_prism.py
│   ├── sallie_homepage.py
│   ├── genesis_app.py
│   └── genesis_integration.py
├── progeny_root/
│   ├── core/
│   │   └── identity.py
│   ├── limbic/
│   │   ├── heritage/
│   │   │   └── sallie_identity.json
│   │   └── state.json
│   └── convergence/
│       └── convergence.py
└── MINI_PC_SETUP.md          # This file
```

---

## Summary

1. **Mini PC** = Sallie's permanent home (runs 24/7)
2. **Server** = FastAPI running on port 8742
3. **Clients** = Your phone app, Windows app connect to server
4. **Data** = All heritage, memories, state stored locally on mini PC

Sallie is now always on, always yours, always local.
