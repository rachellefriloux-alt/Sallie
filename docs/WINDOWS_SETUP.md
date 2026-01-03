# Windows 11 Setup Guide for Sallie

This guide provides step-by-step instructions for setting up Sallie on Windows 11.

## Prerequisites

Before installing Sallie, ensure you have the following installed:

### 1. Python 3.11 or Higher
- Download from: https://www.python.org/downloads/
- **Important**: During installation, check "Add Python to PATH"
- Verify installation: Open PowerShell and run:
  ```powershell
  python --version
  ```

### 2. Node.js 18 or Higher
- Download from: https://nodejs.org/
- Choose the LTS (Long Term Support) version
- Verify installation:
  ```powershell
  node --version
  npm --version
  ```

### 3. Docker Desktop
- Download from: https://www.docker.com/products/docker-desktop/
- Install and start Docker Desktop
- Verify installation:
  ```powershell
  docker --version
  docker ps
  ```

### 4. Git (Optional but recommended)
- Download from: https://git-scm.com/download/win
- Or use GitHub Desktop: https://desktop.github.com/

## Installation Steps

### Method 1: One-Click Installation (Recommended)

1. **Download or Clone Sallie**
   ```powershell
   git clone https://github.com/rachellefriloux-alt/Sallie.git
   cd Sallie
   ```

2. **Run the Installer**
   - Double-click `INSTALL.bat`
   - Or run in PowerShell:
     ```powershell
     .\INSTALL.bat
     ```

3. **Wait for Installation**
   - The installer will:
     - Install Python dependencies (including GUI libraries)
     - Install Node.js dependencies
     - Download Docker images
     - Configure the system
   - This takes 5-10 minutes

4. **Launch Sallie**
   - After installation, choose "Y" to launch
   - Or later, double-click `start-sallie.bat`

### Method 2: Manual Installation

If the one-click installer doesn't work, follow these steps:

1. **Install Python Dependencies**
   ```powershell
   cd progeny_root
   pip install -r requirements.txt
   ```

2. **Install Web Dependencies**
   ```powershell
   cd ..\web
   npm install
   ```

3. **Install Desktop Dependencies** (Optional)
   ```powershell
   cd ..\desktop
   npm install
   ```

4. **Start Docker Services**
   ```powershell
   cd ..\progeny_root
   docker-compose up -d
   ```

5. **Start the Backend**
   ```powershell
   cd Peer
   python -m uvicorn core.main:app --host 127.0.0.1 --port 8000
   ```

6. **Start the Web Interface** (in a new terminal)
   ```powershell
   cd ..\..\web
   npm run dev
   ```

## GUI Dependencies

Sallie includes desktop integration features that require GUI libraries:

### Automatically Installed
The following are installed via `requirements.txt`:
- **pystray** - System tray integration
- **plyer** - Desktop notifications
- **Pillow** - Image processing for icons

### Windows-Specific Notes
- **pystray** uses Windows native APIs (no GTK required on Windows)
- System tray icon appears in the taskbar notification area
- Desktop notifications use Windows 10/11 notification system

## Troubleshooting

### "Python not found"
- Reinstall Python and ensure "Add to PATH" is checked
- Or add Python manually to PATH:
  1. Search for "Environment Variables" in Windows
  2. Edit PATH
  3. Add: `C:\Users\YourUsername\AppData\Local\Programs\Python\Python311`

### "Docker is not running"
- Start Docker Desktop application
- Wait for it to fully start (whale icon in system tray)
- Restart your computer if needed

### "pip install fails"
- Try running PowerShell as Administrator
- Update pip: `python -m pip install --upgrade pip`
- Install dependencies one by one if bulk install fails

### "Module not found" errors
- Ensure you're in the correct directory
- Verify virtual environment is activated (if using one)
- Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`

### System Tray Icon Not Appearing
- pystray may need Windows permissions
- Check Windows notification settings
- Run the application as Administrator once

### Port Already in Use
- Check if another application is using port 8000:
  ```powershell
  netstat -ano | findstr :8000
  ```
- Kill the process:
  ```powershell
  taskkill /PID <process_id> /F
  ```

## Running Sallie

### Option 1: Start Script (Easiest)
Double-click `start-sallie.bat` or run:
```powershell
.\start-sallie.bat
```

### Option 2: GUI Launcher
Double-click `launcher.py` or run:
```powershell
python launcher.py
```

### Option 3: Web Browser Only
If you just want the web interface:
```powershell
.\start-sallie.bat
```
Then open: http://localhost:3000

### Option 4: Desktop App
After installing desktop dependencies:
```powershell
cd desktop
npm start
```

## Accessing Sallie

Once started:
- **Web Interface**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## First-Time Setup

1. **Open the Web Interface** at http://localhost:3000
2. **Complete the Great Convergence** (14 questions)
3. **Start chatting with Sallie!**

## Desktop Features (Windows 11)

Sallie's desktop integration includes:

- **System Tray Icon**: Quick access from taskbar
- **Desktop Notifications**: Proactive engagement alerts
- **Windows Startup**: Optional auto-launch on login
- **Native Window**: Full desktop application experience

## Performance Tips

### For Better Performance:
1. **Use Docker** for Ollama and Qdrant (included in setup)
2. **16 GB RAM recommended** (8 GB minimum)
3. **SSD storage** for faster model loading
4. **Close unused apps** when running AI models

### For Lower Resource Usage:
- Use smaller AI models
- Disable creative features you don't need
- Run web interface instead of desktop app

## Updating Sallie

To update to the latest version:

```powershell
cd Sallie
git pull
pip install -r progeny_root/requirements.txt --upgrade
cd web && npm install
cd ..\desktop && npm install
```

## Security Notes

- Sallie runs **100% locally** on your machine
- **No data leaves your computer** (unless you explicitly enable external APIs)
- Backend binds to **127.0.0.1** (localhost only) by default
- To allow LAN access: Set environment variable `SALLIE_BACKEND_HOST=0.0.0.0`

## Getting Help

- **Documentation**: Check the other `.md` files in this repository
- **Issues**: https://github.com/rachellefriloux-alt/Sallie/issues
- **Logs**: 
  - Backend: `backend.log`
  - Web: `web.log`
  - Docker: `cd progeny_root && docker-compose logs`

## Next Steps

After installation:
1. Read `MEETING_SALLIE.md` for first conversation tips
2. Check `QUICK_START.md` for feature overview
3. Explore `README.md` for complete documentation

---

**Enjoy using Sallie - Your AI Cognitive Partner on Windows 11!** 💜✨

*Version: 5.4.2*  
*Platform: Windows 11*  
*Status: Production Ready* ✅
