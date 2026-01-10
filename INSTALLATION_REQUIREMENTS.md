# 🚀 Complete Installation Requirements

## Python Backend Dependencies (server/)

### Core Backend
python>=3.11
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
websockets>=12.0
python-dotenv>=1.0.0
pydantic>=2.4.0
python-multipart>=0.0.6

### Security & Authentication
cryptography>=41.0.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4

### Data & Storage
qdrant-client>=1.6.0
chromadb>=0.4.15
numpy>=1.24.0
pandas>=2.1.0

### NLP & AI
openai>=1.3.0
anthropic>=0.7.0
sentence-transformers>=2.2.2
transformers>=4.35.0
torch>=2.1.0

### Voice Processing
openai-whisper>=20231117
piper-tts>=1.2.0
sounddevice>=0.4.6
soundfile>=0.12.1
librosa>=0.10.1
webrtcvad>=2.0.10

### System Tray (Ghost Interface)
pystray>=0.19.5
Pillow>=10.1.0

### Utilities
aiofiles>=23.2.1
httpx>=0.25.0
tenacity>=8.2.3
schedule>=1.2.0
psutil>=5.9.6
python-dateutil>=2.8.2
pytz>=2023.3

### Development & Testing
pytest>=7.4.0
pytest-asyncio>=0.21.0
pytest-cov>=4.1.0
black>=23.10.0
flake8>=6.1.0
mypy>=1.6.0

### Monitoring & Logging
loguru>=0.7.2
sentry-sdk>=1.34.0

---

## Node.js Frontend Dependencies (web/)

### Core Framework
next@14.0.3
react@18.2.0
react-dom@18.2.0
typescript@5.3.2

### UI & Styling
tailwindcss@3.3.5
@tailwindcss/forms@0.5.7
@tailwindcss/typography@0.5.10
framer-motion@10.16.5
lucide-react@0.294.0
class-variance-authority@0.7.0
clsx@2.0.0
tailwind-merge@2.1.0

### State Management
zustand@4.4.7
@tanstack/react-query@5.8.4
immer@10.0.3

### WebSocket & Real-time
socket.io-client@4.6.0
ws@8.14.2

### Forms & Validation
react-hook-form@7.48.2
zod@3.22.4
@hookform/resolvers@3.3.2

### Charts & Visualization
recharts@2.10.3
d3@7.8.5
@visx/visx@3.7.0

### Date & Time
date-fns@2.30.0
dayjs@1.11.10

### Development Tools
@types/node@20.9.0
@types/react@18.2.38
@types/react-dom@18.2.17
eslint@8.53.0
eslint-config-next@14.0.3
prettier@3.1.0
@testing-library/react@14.1.2
@testing-library/jest-dom@6.1.5
playwright@1.40.0

### Build Tools
@next/bundle-analyzer@14.0.3
webpack@5.89.0

---

## System Requirements

### Operating System
- Windows 11 Pro (primary target)
- macOS 12+ (supported)
- Linux (Ubuntu 22.04+, supported)

### Software Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: 20 LTS or higher
- **npm**: 10+ (comes with Node.js)
- **Git**: Latest version (optional, for updates)

### Hardware Requirements
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 5GB free space minimum
- **CPU**: Modern multi-core processor
- **Microphone**: Required for voice input (optional feature)
- **Network**: Stable internet for initial setup

---

## Installation Commands

### Backend (Python)
```bash
cd server
pip install -r requirements.txt
```

### Frontend (Node.js)
```bash
cd web
npm install
```

### Complete Setup (One Command)
```bash
# Windows
START_SALLIE.bat

# macOS/Linux
bash START_SALLIE.sh
```

---

## Optional Dependencies

### For Advanced Features
```bash
# GPU acceleration (if available)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Advanced voice models
pip install coqui-tts

# Image processing
pip install opencv-python

# PDF processing
pip install pypdf2 pdfplumber

# Web scraping (for learning)
pip install beautifulsoup4 scrapy
```

---

## Verification

### Check Python Dependencies
```bash
cd server
python -c "import fastapi, websockets, qdrant_client, whisper; print('All core dependencies installed')"
```

### Check Node Dependencies
```bash
cd web
npm list --depth=0
```

### Check Complete System
```bash
# Start both servers and check health
python server/sallie_main_server.py
# In another terminal
cd web && npm run dev
# Open http://localhost:3000 and http://localhost:8742/health
```

---

## Troubleshooting

### Python Issues
- **Issue**: `pip install` fails
  - **Solution**: Upgrade pip: `python -m pip install --upgrade pip`

- **Issue**: Whisper installation fails
  - **Solution**: Install system dependencies (Windows: Visual C++ Redistributable)

- **Issue**: Torch/CUDA not available
  - **Solution**: Use CPU version or install CUDA toolkit

### Node.js Issues
- **Issue**: `npm install` fails
  - **Solution**: Clear cache: `npm cache clean --force`

- **Issue**: Module not found errors
  - **Solution**: Delete `node_modules` and `package-lock.json`, then `npm install`

### System Tray (Ghost Interface)
- **Issue**: pystray not working on Windows
  - **Solution**: Run as Administrator for first time

---

## Platform-Specific Notes

### Windows 11 Pro
- Run PowerShell as Administrator for first setup
- Windows Defender may prompt for network access (allow it)
- Microphone permissions: Settings > Privacy > Microphone

### macOS
- Grant Terminal/iTerm microphone access
- May need to install Xcode Command Line Tools: `xcode-select --install`
- Use Homebrew for system dependencies

### Linux
- Install system audio libraries: `sudo apt-get install portaudio19-dev python3-pyaudio`
- Grant microphone permissions via system settings
- May need to run with `sudo` for system tray access

---

## Docker Alternative (Coming Soon)

For simplified deployment:
```bash
docker-compose up
```

This will start both backend and frontend in containers with all dependencies pre-installed.

---

## Next Steps After Installation

1. ✅ Run `START_SALLIE.bat` (Windows) or `START_SALLIE.sh` (macOS/Linux)
2. ✅ Navigate to http://localhost:3000 in your browser
3. ✅ Complete The Great Convergence (30 questions)
4. ✅ Begin your cognitive partnership with Sallie

---

**Version**: 5.4.1 Complete  
**Last Updated**: 2026-01-10  
**Support**: All dependencies tested and verified for production use
