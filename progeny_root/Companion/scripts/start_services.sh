#!/bin/bash
# Digital Progeny - Start Services (Linux/macOS)

echo "============================================================"
echo "Digital Progeny - Starting Services"
echo "============================================================"

# Check if Docker is running
if command -v docker &> /dev/null; then
    if docker ps &> /dev/null; then
        echo
        echo "Starting Docker services (Ollama, Qdrant)..."
        SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
        cd "$SCRIPT_DIR/.."
        
        docker-compose up -d
        
        if [ $? -eq 0 ]; then
            echo "[OK] Docker services started"
            sleep 3
        else
            echo "[WARNING] Failed to start Docker services"
        fi
    else
        echo "[WARNING] Docker is not running"
    fi
else
    echo "[WARNING] Docker not found"
fi

echo
echo "============================================================"
echo "Services started!"
echo "============================================================"
echo
echo "Next steps:"
echo "1. Start the main server: python3 -m uvicorn core.main:app --reload --port 8000"
echo "2. Start the web UI: cd web && npm run dev"
echo "3. Open http://localhost:3000"
echo

