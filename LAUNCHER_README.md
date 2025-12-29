# 🚀 Sallie One-Click Launcher

## Quick Start

### Installation

**Step 1: Install Dependencies**

Run the installer script:

**Windows:**
```bash
install.bat
```

**Mac/Linux:**
```bash
python3 install.py
```

This will:
- Check prerequisites (Python, Docker, Node.js)
- Install all Python dependencies
- Install web interface dependencies
- Create necessary directories
- Set up configuration files

**Step 2: Launch Sallie**

Simply run the launcher:

```bash
python launcher.py
```

Or double-click `launcher.py` on Windows.

---

## The Launcher GUI

The launcher provides a simple graphical interface with:

### Features

✅ **Visual Status Indicators**
- Docker services status
- Backend API status  
- Web interface status

✅ **One-Click Controls**
- 🚀 **START SALLIE** - Starts all services automatically
- ⏹ **STOP SALLIE** - Stops all running services
- 🌐 **Open Web Interface** - Opens http://localhost:3000 in your browser

✅ **Real-Time Logs**
- See what's happening in real-time
- Color-coded log messages
- Automatic scrolling

### What Happens When You Click "Start"

1. **Docker Services** - Starts Ollama (AI models) and Qdrant (memory database)
2. **Backend API** - Starts the FastAPI backend on port 8000
3. **Web Interface** - Starts the Next.js frontend on port 3000
4. **Auto-Open Browser** - Automatically opens Sallie in your default browser

Everything happens automatically - just click and wait!

---

## Creating a Distributable Executable

Want to create a standalone `.exe` file (Windows) or app (Mac/Linux)?

### Step 1: Install PyInstaller

```bash
pip install pyinstaller
```

### Step 2: Build the Executable

**Windows:**
```bash
pyinstaller launcher.py --onefile --windowed --name Sallie --icon=sallie.ico
```

**Mac:**
```bash
pyinstaller launcher.py --onefile --windowed --name Sallie --icon=sallie.icns
```

**Linux:**
```bash
pyinstaller launcher.py --onefile --windowed --name Sallie
```

### Step 3: Find Your Executable

The executable will be in the `dist/` folder:
- Windows: `dist/Sallie.exe`
- Mac: `dist/Sallie.app`
- Linux: `dist/Sallie`

You can now distribute this single file to users!

**Note:** Users will still need Docker and Node.js installed, but they won't need to manually install Python dependencies.

---

## Troubleshooting

### "Docker is not running"

**Solution:** Start Docker Desktop before launching Sallie.

### "Failed to install dependencies"

**Solution:** 
1. Make sure you have Python 3.11+ installed
2. Try running with admin/sudo privileges
3. Check your internet connection

### "Backend won't start"

**Solution:**
1. Check that port 8000 is not in use
2. Check `backend.log` for error messages
3. Verify Python dependencies are installed: `pip list | grep fastapi`

### "Web interface blank page"

**Solution:**
1. Check that port 3000 is not in use
2. Check `web.log` for error messages
3. Try clearing browser cache (Ctrl+Shift+R)
4. Verify Node.js dependencies: check if `web/node_modules` exists

### Missing Dependencies (UI/ID errors)

**Solution:**
Run the installer again to fix missing dependencies:
```bash
python install.py
```

---

## Peer Communication & Companion Soul

Sallie includes advanced features for multi-instance communication:

### Peer Network
- Connect with other Sallie instances
- Secure P2P encrypted communication
- Share knowledge and experiences
- Located in: `progeny_root/core/peer_communication.py`

### Kinship System (Multi-User)
- Multiple users can interact with the same Sallie
- Separate contexts and memory partitions
- Role-based permissions
- Located in: `progeny_root/core/kinship.py`

These systems are automatically included and can be enabled in the configuration:

```json
{
  "peer_network": {
    "enabled": true,
    "discovery": "local"
  }
}
```

---

## System Architecture

```
Sallie/
├── launcher.py          # 🎯 Main GUI launcher (START HERE!)
├── install.py           # Automated installer
├── install.bat          # Windows installer
├── start-sallie.sh      # Linux/Mac startup script
├── start-sallie.bat     # Windows startup script
│
├── progeny_root/        # Backend system
│   ├── core/            # Core AI systems
│   │   ├── main.py      # FastAPI entry point
│   │   ├── limbic.py    # Emotional system
│   │   ├── memory/      # Memory systems
│   │   ├── kinship.py   # Multi-user support
│   │   └── peer_communication.py  # P2P networking
│   ├── requirements.txt # Python dependencies
│   └── docker-compose.yml  # Docker services
│
└── web/                 # Frontend interface
    ├── package.json     # Node.js dependencies
    ├── pages/           # Next.js pages
    └── components/      # React components
```

---

## What Makes This Launcher Special

### Traditional Way (Painful 😫)
```bash
# Terminal 1
cd progeny_root
docker-compose up -d

# Terminal 2  
cd progeny_root
python -m uvicorn core.main:app --reload

# Terminal 3
cd web
npm run dev

# Terminal 4
# Open browser manually...
```

### With Launcher (Easy! 😊)
```bash
python launcher.py
# Click "START SALLIE" button
# Done! 🎉
```

---

## Configuration

The launcher reads configuration from:
- `progeny_root/core/config.json` - Main configuration
- `progeny_root/.env` - Environment variables

Default ports:
- Backend API: 8000
- Web Interface: 3000
- Ollama: 11434
- Qdrant: 6333

To change ports, edit `config.json`.

---

## Requirements

### Minimum Requirements
- **Python:** 3.11 or higher
- **Node.js:** 18 or higher
- **Docker:** Docker Desktop installed and running
- **RAM:** 8 GB (16 GB recommended)
- **Storage:** 20 GB free space

### Tested Platforms
- ✅ Windows 10/11
- ✅ macOS 11+ (Intel and Apple Silicon)
- ✅ Ubuntu 20.04+
- ✅ Debian 11+

---

## Additional Resources

- **Full Documentation:** See `README.md`
- **Quick Start Guide:** See `QUICK_START.md`
- **Running Guide:** See `RUNNING.md`
- **Troubleshooting:** See `README.md` (Troubleshooting section)

---

## Support

If you encounter issues:

1. **Check the logs:**
   - Backend: `backend.log`
   - Web: `web.log`
   - Docker: `cd progeny_root && docker-compose logs`

2. **Run the health check:**
   - Open: http://localhost:8000/health
   - Should return: `{"status": "healthy"}`

3. **Reinstall dependencies:**
   ```bash
   python install.py
   ```

4. **GitHub Issues:**
   - Report bugs or request features at the repository

---

## License

See `LICENSE` file for details.

---

**Made with 💜 by the Sallie community**

*Version 5.4.2 | Last Updated: December 2025*
