#!/bin/bash
# One-Click Setup and Launch for Sallie
# This script handles EVERYTHING needed to get Sallie running

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════╗
║                                                   ║
║     🌟  SALLIE - ONE-CLICK SETUP & LAUNCH  🌟    ║
║                                                   ║
║        Your AI Cognitive Partner                  ║
║        Version 5.4.2                              ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if first run
FIRST_RUN=false
if [ ! -f ".sallie_installed" ]; then
    FIRST_RUN=true
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install with progress
install_with_progress() {
    local name=$1
    local command=$2
    echo -e "${YELLOW}Installing $name...${NC}"
    eval "$command" > /dev/null 2>&1 &
    local pid=$!
    
    while kill -0 $pid 2>/dev/null; do
        echo -n "."
        sleep 1
    done
    wait $pid
    local exit_code=$?
    echo ""
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✓ $name installed${NC}"
        return 0
    else
        echo -e "${RED}✗ $name installation failed${NC}"
        return 1
    fi
}

if [ "$FIRST_RUN" = true ]; then
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}  FIRST RUN SETUP${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""
    echo "This will install all dependencies and set up Sallie."
    echo "Estimated time: 5-10 minutes"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    
    # Check prerequisites
    echo ""
    echo -e "${YELLOW}[1/6] Checking prerequisites...${NC}"
    
    # Check Docker
    if ! command_exists docker; then
        echo -e "${RED}✗ Docker not found${NC}"
        echo "Please install Docker Desktop from: https://docker.com"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker installed${NC}"
    
    # Check Python
    if ! command_exists python3; then
        echo -e "${RED}✗ Python 3 not found${NC}"
        echo "Please install Python 3.11+ from: https://python.org"
        exit 1
    fi
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
    echo -e "${GREEN}✓ Python $PYTHON_VERSION installed${NC}"
    
    # Check Node.js
    if ! command_exists node; then
        echo -e "${RED}✗ Node.js not found${NC}"
        echo "Please install Node.js 18+ from: https://nodejs.org"
        exit 1
    fi
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js $NODE_VERSION installed${NC}"
    
    # Install Python dependencies
    echo ""
    echo -e "${YELLOW}[2/6] Installing Python dependencies...${NC}"
    cd progeny_root
    if [ ! -d "../venv" ]; then
        python3 -m venv ../venv
    fi
    source ../venv/bin/activate 2>/dev/null || source ../venv/Scripts/activate 2>/dev/null
    
    if install_with_progress "Python packages" "pip install -r requirements.txt --quiet"; then
        cd ..
    else
        echo -e "${YELLOW}Some packages may have failed, continuing...${NC}"
        cd ..
    fi
    
    # Install Web dependencies
    echo ""
    echo -e "${YELLOW}[3/6] Installing Web app dependencies...${NC}"
    cd web
    if install_with_progress "Web packages" "npm install --silent"; then
        cd ..
    else
        echo -e "${RED}Web installation failed${NC}"
        cd ..
    fi
    
    # Install Desktop dependencies
    echo ""
    echo -e "${YELLOW}[4/6] Installing Desktop app dependencies...${NC}"
    cd desktop
    if install_with_progress "Desktop packages" "npm install --silent"; then
        cd ..
    else
        echo -e "${YELLOW}Desktop installation failed, continuing...${NC}"
        cd ..
    fi
    
    # Install Mobile dependencies (optional)
    echo ""
    echo -e "${YELLOW}[5/6] Installing Mobile app dependencies...${NC}"
    cd mobile
    if install_with_progress "Mobile packages" "npm install --silent"; then
        cd ..
    else
        echo -e "${YELLOW}Mobile installation failed, continuing...${NC}"
        cd ..
    fi
    
    # Pull Docker images
    echo ""
    echo -e "${YELLOW}[6/6] Downloading Docker images...${NC}"
    echo "This may take 5-10 minutes depending on your connection..."
    cd progeny_root
    docker-compose pull
    cd ..
    
    # Mark as installed
    touch .sallie_installed
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✓ SETUP COMPLETE!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo ""
fi

# Launch Sallie
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}  LAUNCHING SALLIE${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down Sallie...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo "✓ Backend stopped"
    fi
    
    if [ ! -z "$WEB_PID" ]; then
        kill $WEB_PID 2>/dev/null || true
        echo "✓ Web app stopped"
    fi
    
    echo -e "${GREEN}Goodbye! 💜${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Check Docker
echo -e "${BLUE}[1/5]${NC} Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Start Docker services
echo ""
echo -e "${BLUE}[2/5]${NC} Starting backend services..."
cd progeny_root
docker-compose up -d 2>&1 | grep -v "Warning" || true
cd ..
echo -e "${GREEN}✓ Services started${NC}"

# Wait for services
echo ""
echo -e "${BLUE}[3/5]${NC} Waiting for services..."
sleep 5

# Activate venv
if [ -d "venv" ]; then
    source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
fi

# Start backend
echo ""
echo -e "${BLUE}[4/5]${NC} Starting backend API..."
cd progeny_root
nohup python -m uvicorn core.main:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 3
echo -e "${GREEN}✓ Backend API started (PID: $BACKEND_PID)${NC}"

# Start web app
echo ""
echo -e "${BLUE}[5/5]${NC} Starting web interface..."
cd web
nohup npm run dev > ../web.log 2>&1 &
WEB_PID=$!
cd ..
sleep 5

# Final status
echo ""
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨  SALLIE IS RUNNING!  ✨${NC}"
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}Access Options:${NC}"
echo ""
echo -e "  ${GREEN}1. WEB APP${NC} (Recommended for first time)"
echo -e "     Open: ${CYAN}http://localhost:3000${NC}"
echo ""
echo -e "  ${GREEN}2. DESKTOP APP${NC}"
echo -e "     Run: ${CYAN}cd desktop && npm start${NC}"
echo ""
echo -e "  ${GREEN}3. MOBILE APP${NC}"
echo -e "     • Build: ${CYAN}cd mobile && npm run android${NC}"
echo -e "     • Connect to: ${CYAN}http://YOUR_IP:8000${NC}"
echo ""
echo -e "${CYAN}Logs:${NC}"
echo -e "  • Backend: tail -f backend.log"
echo -e "  • Web:     tail -f web.log"
echo -e "  • Docker:  cd progeny_root && docker-compose logs -f"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Open browser (optional)
if command_exists xdg-open; then
    sleep 3
    xdg-open http://localhost:3000 2>/dev/null || true
elif command_exists open; then
    sleep 3
    open http://localhost:3000 2>/dev/null || true
fi

# Wait forever
while true; do
    sleep 1
done
