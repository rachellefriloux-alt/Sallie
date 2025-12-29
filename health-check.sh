#!/bin/bash

# Sallie Health Check Script
# Run this to diagnose connection and service issues

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "════════════════════════════════════════"
echo "  SALLIE HEALTH CHECK"
echo "  Diagnosing system status..."
echo "════════════════════════════════════════"
echo -e "${NC}"

ISSUES_FOUND=0

# Check 1: Docker
echo -e "\n${BLUE}[1/8]${NC} Checking Docker..."
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker is running${NC}"
else
    echo -e "${RED}✗ Docker is not running${NC}"
    echo "  → Start Docker Desktop and try again"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check 2: Docker Containers
echo -e "\n${BLUE}[2/8]${NC} Checking Docker containers..."
OLLAMA_RUNNING=$(docker ps --filter "name=progeny-brain" --format "{{.Names}}" 2>/dev/null)
QDRANT_RUNNING=$(docker ps --filter "name=progeny-memory" --format "{{.Names}}" 2>/dev/null)

if [ ! -z "$OLLAMA_RUNNING" ]; then
    echo -e "${GREEN}✓ Ollama container is running${NC}"
else
    echo -e "${YELLOW}⚠ Ollama container is not running${NC}"
    echo "  → Run: cd progeny_root && docker-compose up -d"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ ! -z "$QDRANT_RUNNING" ]; then
    echo -e "${GREEN}✓ Qdrant container is running${NC}"
else
    echo -e "${YELLOW}⚠ Qdrant container is not running${NC}"
    echo "  → Run: cd progeny_root && docker-compose up -d"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check 3: Ollama Service
echo -e "\n${BLUE}[3/8]${NC} Checking Ollama service..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ollama is responding${NC}"
    
    # Check models
    MODELS=$(curl -s http://localhost:11434/api/tags 2>/dev/null | grep -o '"name":"[^"]*"' | wc -l)
    if [ "$MODELS" -gt 0 ]; then
        echo "  • $MODELS model(s) available"
    else
        echo -e "${YELLOW}⚠ No models installed${NC}"
        echo "  → Run: ollama pull llama3"
    fi
else
    echo -e "${RED}✗ Ollama is not responding${NC}"
    echo "  → Check if container is running: docker ps"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check 4: Qdrant Service
echo -e "\n${BLUE}[4/8]${NC} Checking Qdrant service..."
if curl -s http://localhost:6333/collections > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Qdrant is responding${NC}"
else
    echo -e "${RED}✗ Qdrant is not responding${NC}"
    echo "  → Check if container is running: docker ps"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check 5: Backend API
echo -e "\n${BLUE}[5/8]${NC} Checking Backend API..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:8000/health 2>/dev/null)
    echo -e "${GREEN}✓ Backend API is running${NC}"
    echo "  • Response: $HEALTH"
else
    echo -e "${YELLOW}⚠ Backend API is not running${NC}"
    echo "  → Run: ./start-sallie.sh"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check 6: Web App
echo -e "\n${BLUE}[6/8]${NC} Checking Web app..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Web app is running${NC}"
else
    echo -e "${YELLOW}⚠ Web app is not running${NC}"
    echo "  → Run: cd web && npm run dev"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check 7: Python Dependencies
echo -e "\n${BLUE}[7/8]${NC} Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
    echo -e "${GREEN}✓ Python installed: $PYTHON_VERSION${NC}"
    
    # Check if requirements are installed
    if python3 -c "import fastapi" 2>/dev/null; then
        echo "  • FastAPI is installed"
    else
        echo -e "${YELLOW}⚠ FastAPI not installed${NC}"
        echo "  → Run: cd progeny_root && pip install -r requirements.txt"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    echo -e "${RED}✗ Python not found${NC}"
    echo "  → Install Python 3.11+ from https://python.org"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check 8: Node.js
echo -e "\n${BLUE}[8/8]${NC} Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
    
    # Check if web dependencies are installed
    if [ -d "web/node_modules" ]; then
        echo "  • Web dependencies installed"
    else
        echo -e "${YELLOW}⚠ Web dependencies not installed${NC}"
        echo "  → Run: cd web && npm install"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "  → Install Node.js 18+ from https://nodejs.org"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Network Info
echo -e "\n${BLUE}[Network Info]${NC}"
echo "Local IP addresses:"
if command -v ip &> /dev/null; then
    ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print "  • " $2}' | sed 's/\/.*//'
elif command -v ifconfig &> /dev/null; then
    ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print "  • " $2}'
else
    echo "  • Unable to detect (use 'ipconfig' or 'ifconfig' manually)"
fi

# Summary
echo -e "\n${CYAN}════════════════════════════════════════${NC}"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✨ All checks passed! Sallie should be working.${NC}"
    echo -e "\nAccess Sallie at: ${BLUE}http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠ Found $ISSUES_FOUND issue(s) - see above for solutions${NC}"
    echo -e "\nQuick fix: Run ${BLUE}./start-sallie.sh${NC} to start all services"
fi
echo -e "${CYAN}════════════════════════════════════════${NC}"
echo ""
