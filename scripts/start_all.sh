#!/bin/bash

# Sallie - Start All Services Script
# Starts backend, web, and desktop apps

set -e

echo "=========================================="
echo "  Sallie - Starting All Services"
echo "  Version 5.4.2"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

# Check if Docker is running
echo "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running${NC}"
    echo "  Please start Docker Desktop and try again"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Start Docker services
echo "Starting Docker services (Ollama + Qdrant)..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker services started${NC}"
else
    echo -e "${RED}✗ Failed to start Docker services${NC}"
    exit 1
fi

echo ""
echo "Waiting for services to be ready..."
sleep 5

# Check Ollama
echo -n "Checking Ollama... "
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ Ollama not responding (may need more time)${NC}"
fi

# Check Qdrant
echo -n "Checking Qdrant... "
if curl -s http://localhost:6333/collections > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ Qdrant not responding (may need more time)${NC}"
fi

echo ""

# Start backend
echo "Starting backend API..."
cd "$ROOT_DIR/progeny_root"

# Check if virtual environment exists
if [ ! -d "$ROOT_DIR/venv" ]; then
    echo -e "${YELLOW}⚠ Virtual environment not found${NC}"
    echo "  Run: python -m venv venv"
    echo "  Then: source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
source "$ROOT_DIR/venv/bin/activate" 2>/dev/null || source "$ROOT_DIR/venv/Scripts/activate" 2>/dev/null

# Start backend in background
echo "Starting uvicorn on port 8000..."
nohup python -m uvicorn core.main:app --host 0.0.0.0 --port 8000 > "$ROOT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "  Logs: $ROOT_DIR/backend.log"

sleep 3

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API started${NC}"
else
    echo -e "${YELLOW}⚠ Backend may need more time to start${NC}"
    echo "  Check logs: tail -f $ROOT_DIR/backend.log"
fi

echo ""

# Start web app
echo "Starting web app..."
cd "$ROOT_DIR/web"

if [ ! -d "node_modules" ]; then
    echo "Installing web dependencies..."
    npm install
fi

echo "Starting Next.js on port 3000..."
nohup npm run dev > "$ROOT_DIR/web.log" 2>&1 &
WEB_PID=$!

echo "Web PID: $WEB_PID"
echo "  Logs: $ROOT_DIR/web.log"
echo "  URL: http://localhost:3000"

echo ""

# Summary
echo "=========================================="
echo "  All Services Started"
echo "=========================================="
echo ""
echo "Services:"
echo "  • Ollama:  http://localhost:11434"
echo "  • Qdrant:  http://localhost:6333"
echo "  • Backend: http://localhost:8000"
echo "  • Web App: http://localhost:3000"
echo ""
echo "Process IDs:"
echo "  • Backend: $BACKEND_PID"
echo "  • Web:     $WEB_PID"
echo ""
echo "Logs:"
echo "  • Backend: tail -f $ROOT_DIR/backend.log"
echo "  • Web:     tail -f $ROOT_DIR/web.log"
echo "  • Docker:  docker-compose logs -f"
echo ""
echo "To stop all services:"
echo "  • Kill backend: kill $BACKEND_PID"
echo "  • Kill web:     kill $WEB_PID"
echo "  • Stop Docker:  docker-compose down"
echo ""
echo -e "${GREEN}✓ Sallie is running!${NC}"
echo ""
echo "Open http://localhost:3000 to begin"
