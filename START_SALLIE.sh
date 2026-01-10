#!/bin/bash

###################################################################################
# START_SALLIE.sh - One-Click Startup Script for macOS/Linux
# Sallie v5.4.1 Complete
#
# This script automatically:
# 1. Checks for Python 3.11+ and Node.js 20+
# 2. Creates .env file with secure JWT secret
# 3. Creates necessary directories
# 4. Installs dependencies (first run only)
# 5. Starts backend and frontend servers
# 6. Opens browser to http://localhost:3000
#
# Usage: bash START_SALLIE.sh
# Or: chmod +x START_SALLIE.sh && ./START_SALLIE.sh
###################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║           🌟  SALLIE v5.4.1 - STARTUP SCRIPT  🌟             ║"
echo "║                                                               ║"
echo "║            Your Complete Cognitive Partner                    ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate secure JWT secret
generate_jwt_secret() {
    if command_exists openssl; then
        openssl rand -base64 64 | tr -d '\n'
    else
        # Fallback to /dev/urandom
        head -c 64 /dev/urandom | base64 | tr -d '\n'
    fi
}

# Step 1: Check Python
echo -e "${BLUE}[1/8] Checking Python installation...${NC}"
if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 not found!${NC}"
    echo -e "${YELLOW}Please install Python 3.11+ from https://www.python.org/downloads/${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo -e "${GREEN}✅ Python ${PYTHON_VERSION} found${NC}"

# Check if Python version is 3.11+
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 11 ]); then
    echo -e "${RED}❌ Python 3.11+ required (found ${PYTHON_VERSION})${NC}"
    echo -e "${YELLOW}Please upgrade Python from https://www.python.org/downloads/${NC}"
    exit 1
fi

# Step 2: Check Node.js
echo -e "${BLUE}[2/8] Checking Node.js installation...${NC}"
if ! command_exists node; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo -e "${YELLOW}Please install Node.js 20+ from https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION} found${NC}"

# Check if Node version is 20+
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 20 ]; then
    echo -e "${YELLOW}⚠️  Node.js 20+ recommended (found ${NODE_VERSION})${NC}"
fi

# Step 3: Create .env file if it doesn't exist
echo -e "${BLUE}[3/8] Setting up environment configuration...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo -e "${CYAN}Creating .env file from template...${NC}"
        cp .env.example .env
        
        # Generate secure JWT secret
        echo -e "${CYAN}Generating secure JWT secret...${NC}"
        JWT_SECRET=$(generate_jwt_secret)
        
        # Replace placeholder in .env
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/your-secret-key-here-minimum-32-characters/${JWT_SECRET}/" .env
        else
            # Linux
            sed -i "s/your-secret-key-here-minimum-32-characters/${JWT_SECRET}/" .env
        fi
        
        echo -e "${GREEN}✅ .env file created with secure JWT secret${NC}"
    else
        echo -e "${RED}❌ .env.example not found!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Step 4: Create necessary directories
echo -e "${BLUE}[4/8] Creating data directories...${NC}"
mkdir -p data/heritage
mkdir -p data/working
mkdir -p data/archive/working
mkdir -p data/dream_cycle
mkdir -p data/ghost
mkdir -p server/logs
echo -e "${GREEN}✅ Directories created${NC}"

# Step 5: Install Python dependencies (if needed)
echo -e "${BLUE}[5/8] Checking Python dependencies...${NC}"
if [ ! -d "venv" ]; then
    echo -e "${CYAN}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

if [ ! -f "venv/.dependencies_installed" ]; then
    echo -e "${CYAN}Installing Python dependencies (this may take a few minutes)...${NC}"
    pip install --upgrade pip
    pip install -r requirements.txt
    touch venv/.dependencies_installed
    echo -e "${GREEN}✅ Python dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Python dependencies already installed${NC}"
fi

# Step 6: Install Node.js dependencies (if needed)
echo -e "${BLUE}[6/8] Checking Node.js dependencies...${NC}"
cd web
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}Installing Node.js dependencies (this may take a few minutes)...${NC}"
    npm install
    echo -e "${GREEN}✅ Node.js dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Node.js dependencies already installed${NC}"
fi
cd ..

# Step 7: Start Backend Server
echo -e "${BLUE}[7/8] Starting backend server...${NC}"
echo -e "${CYAN}Backend will run on http://localhost:8742${NC}"

# Start backend in background
source venv/bin/activate
python server/sallie_main_server.py > server/logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > .backend.pid

# Wait for backend to be ready
echo -e "${CYAN}Waiting for backend to start...${NC}"
sleep 5

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend server failed to start${NC}"
    echo -e "${YELLOW}Check server/logs/backend.log for errors${NC}"
    exit 1
fi

# Step 8: Start Frontend Server
echo -e "${BLUE}[8/8] Starting frontend server...${NC}"
echo -e "${CYAN}Frontend will run on http://localhost:3000${NC}"

cd web
npm run dev > ../server/logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../.frontend.pid
cd ..

# Wait for frontend to be ready
echo -e "${CYAN}Waiting for frontend to start...${NC}"
sleep 8

# Check if frontend is running
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend server started (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Frontend server failed to start${NC}"
    echo -e "${YELLOW}Check server/logs/frontend.log for errors${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Success!
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}║              🎉  SALLIE IS NOW RUNNING!  🎉                   ║${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📍 Frontend:${NC} http://localhost:3000"
echo -e "${CYAN}📍 Backend:${NC}  http://localhost:8742"
echo -e "${CYAN}📍 Health:${NC}   http://localhost:8742/health"
echo ""
echo -e "${YELLOW}Opening browser...${NC}"

# Open browser (try different commands for different systems)
sleep 2
if command_exists xdg-open; then
    xdg-open http://localhost:3000 >/dev/null 2>&1
elif command_exists open; then
    open http://localhost:3000
elif command_exists start; then
    start http://localhost:3000
fi

echo ""
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}To stop Sallie:${NC}"
echo -e "  bash STOP_SALLIE.sh"
echo -e ""
echo -e "${CYAN}To view logs:${NC}"
echo -e "  Backend:  tail -f server/logs/backend.log"
echo -e "  Frontend: tail -f server/logs/frontend.log"
echo -e ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "  1. Complete The Great Convergence (30 questions)"
echo -e "  2. Build trust and unlock capabilities"
echo -e "  3. Experience your cognitive partnership!"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✨ Welcome to Sallie v5.4.1 - Your Complete Digital Progeny ✨${NC}"
echo ""

# Keep script running to show logs
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Trap Ctrl+C to cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    rm -f .backend.pid .frontend.pid
    echo -e "${GREEN}Servers stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
