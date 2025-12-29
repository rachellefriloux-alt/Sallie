#!/bin/bash
# Digital Progeny - Linux/macOS Installation Script
# Checks dependencies and installs required packages

set -e

echo "============================================================"
echo "Digital Progeny - Installation"
echo "============================================================"
echo

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    PKG_MGR=""
    if command -v apt-get &> /dev/null; then
        PKG_MGR="apt"
    elif command -v yum &> /dev/null; then
        PKG_MGR="yum"
    elif command -v dnf &> /dev/null; then
        PKG_MGR="dnf"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    PKG_MGR="brew"
else
    echo "[ERROR] Unsupported OS: $OSTYPE"
    exit 1
fi

echo "Detected OS: $OS"
echo

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 not found. Please install Python 3.11+"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo "[OK] Python found: $PYTHON_VERSION"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found. Please install Node.js 18+"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "[OK] Node.js found: $NODE_VERSION"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "[WARNING] Docker not found. Ollama/Qdrant will need to be installed separately."
else
    DOCKER_VERSION=$(docker --version)
    echo "[OK] Docker found: $DOCKER_VERSION"
fi

# Check Git
if ! command -v git &> /dev/null; then
    echo "[WARNING] Git not found. Some features may not work."
else
    GIT_VERSION=$(git --version)
    echo "[OK] Git found: $GIT_VERSION"
fi

echo
echo "============================================================"
echo "Installing Python dependencies..."
echo "============================================================"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install Python dependencies"
    exit 1
fi
echo "[OK] Python dependencies installed"

echo
echo "============================================================"
echo "Installing Web UI dependencies..."
echo "============================================================"

cd web
npm install

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install web dependencies"
    exit 1
fi
echo "[OK] Web UI dependencies installed"
cd ..

echo
echo "============================================================"
echo "Installing Mobile App dependencies (optional)..."
echo "============================================================"

if [ -d "mobile" ]; then
    cd mobile
    npm install || echo "[WARNING] Failed to install mobile dependencies (optional)"
    cd ..
fi

echo
echo "============================================================"
echo "Installing Desktop App dependencies (optional)..."
echo "============================================================"

if [ -d "desktop" ]; then
    cd desktop
    npm install || echo "[WARNING] Failed to install desktop dependencies (optional)"
    cd ..
fi

echo
echo "============================================================"
echo "Setup complete!"
echo "============================================================"
echo
echo "Next steps:"
echo "1. Start Docker (if using Docker)"
echo "2. Pull Ollama models: ollama pull deepseek-v3"
echo "3. Run the setup wizard: python3 scripts/setup_wizard.py"
echo "4. Start services: scripts/start_services.sh"
echo

