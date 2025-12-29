#!/bin/bash

# Desktop App Launcher
# Starts the Electron desktop app

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting Sallie Desktop App...${NC}\n"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/desktop"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies (first time only)...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install dependencies${NC}"
        exit 1
    fi
fi

# Check if backend is running
echo -e "Checking backend connection..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running${NC}\n"
else
    echo -e "${YELLOW}⚠ Backend is not running${NC}"
    echo -e "Desktop app will launch, but you need to start the backend:"
    echo -e "  ${BLUE}./start-sallie.sh${NC}\n"
fi

# Start desktop app
echo -e "Launching desktop app...\n"
npm start
