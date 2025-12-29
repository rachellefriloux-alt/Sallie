#!/bin/bash

# Sallie - Simple Unified Startup Script
# This script starts all necessary services to run Sallie

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}"
echo "════════════════════════════════════════════════"
echo "     🌟 SALLIE - Your AI Cognitive Partner 🌟"
echo "                Version 5.4.2"
echo "════════════════════════════════════════════════"
echo -e "${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down Sallie...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        # Try graceful shutdown first
        if kill "$BACKEND_PID" 2>/dev/null; then
            TIMEOUT=5
            while kill -0 "$BACKEND_PID" 2>/dev/null && [ "$TIMEOUT" -gt 0 ]; do
                sleep 1
                TIMEOUT=$((TIMEOUT - 1))
            done
            # If still running after timeout, force kill
            if kill -0 "$BACKEND_PID" 2>/dev/null; then
                kill -9 "$BACKEND_PID" 2>/dev/null || true
            fi
        fi
        echo "✓ Backend stopped"
    fi
    
    if [ ! -z "$WEB_PID" ]; then
        # Try graceful shutdown first
        if kill "$WEB_PID" 2>/dev/null; then
            TIMEOUT=5
            while kill -0 "$WEB_PID" 2>/dev/null && [ "$TIMEOUT" -gt 0 ]; do
                sleep 1
                TIMEOUT=$((TIMEOUT - 1))
            done
            # If still running after timeout, force kill
            if kill -0 "$WEB_PID" 2>/dev/null; then
                kill -9 "$WEB_PID" 2>/dev/null || true
            fi
        fi
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
    echo "  Please start Docker Desktop and try again"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Start Docker services
echo ""
echo -e "${BLUE}[2/5]${NC} Starting backend services (Ollama + Qdrant)..."
cd progeny_root
docker-compose up -d 2>&1 | grep -v "Warning: No resource found"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Services started${NC}"
else
    echo -e "${YELLOW}⚠ Services may already be running${NC}"
fi

# Wait for services
echo ""
echo -e "${BLUE}[3/5]${NC} Waiting for services to be ready..."
sleep 5

# Check Ollama
echo -n "  • Ollama... "
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ Not responding (may need more time)${NC}"
fi

# Check Qdrant
echo -n "  • Qdrant... "
if curl -s http://localhost:6333/collections > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ Not responding (may need more time)${NC}"
fi

# Start backend API
echo ""
echo -e "${BLUE}[4/5]${NC} Starting backend API..."

# Check if Python virtual environment exists
if [ ! -d "$SCRIPT_DIR/venv" ]; then
    echo -e "${YELLOW}⚠ Virtual environment not found, using system Python${NC}"
else
    source "$SCRIPT_DIR/venv/bin/activate" 2>/dev/null || source "$SCRIPT_DIR/venv/Scripts/activate" 2>/dev/null
    echo "  • Activated virtual environment"
fi

# Start backend in background
cd progeny_root
nohup python -m uvicorn core.main:app --host 0.0.0.0 --port 8000 > "$SCRIPT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

echo "  • Backend PID: $BACKEND_PID"
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API is running${NC}"
else
    echo -e "${YELLOW}⚠ Backend starting (may need more time)${NC}"
    echo "  • Check logs: tail -f $SCRIPT_DIR/backend.log"
fi

# Start web app
echo ""
echo -e "${BLUE}[5/5]${NC} Starting web interface..."
cd "$SCRIPT_DIR/web"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "  • Installing dependencies (first time only)..."
    npm install --silent
fi

# Start Next.js
nohup npm run dev > "$SCRIPT_DIR/web.log" 2>&1 &
WEB_PID=$!

echo "  • Web PID: $WEB_PID"
sleep 5

# Final status
echo ""
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Sallie is running! ✨${NC}"
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Access Sallie:${NC}"
echo "  🌐 Web: http://localhost:3000"
echo "  📱 Mobile/Desktop: Configure to connect to http://localhost:8000"
echo ""
echo -e "${BLUE}Services:${NC}"
echo "  • Backend API:  http://localhost:8000 (PID: $BACKEND_PID)"
echo "  • Web App:      http://localhost:3000 (PID: $WEB_PID)"
echo "  • Ollama:       http://localhost:11434"
echo "  • Qdrant:       http://localhost:6333"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo "  • Backend: tail -f $SCRIPT_DIR/backend.log"
echo "  • Web:     tail -f $SCRIPT_DIR/web.log"
echo "  • Docker:  cd $SCRIPT_DIR/progeny_root && docker-compose logs -f"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait forever (until Ctrl+C)
while true; do
    sleep 1
done
