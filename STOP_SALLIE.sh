#!/bin/bash

###################################################################################
# STOP_SALLIE.sh - Graceful Shutdown Script
# Sallie v5.4.1 Complete
#
# Gracefully stops backend and frontend servers
###################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}Stopping Sallie servers...${NC}"

# Stop backend
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${YELLOW}Stopping backend server (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID
        sleep 2
        # Force kill if still running
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill -9 $BACKEND_PID 2>/dev/null
        fi
        echo -e "${GREEN}✅ Backend stopped${NC}"
    else
        echo -e "${YELLOW}Backend not running${NC}"
    fi
    rm -f .backend.pid
else
    echo -e "${YELLOW}No backend PID file found${NC}"
fi

# Stop frontend
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${YELLOW}Stopping frontend server (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID
        sleep 2
        # Force kill if still running
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill -9 $FRONTEND_PID 2>/dev/null
        fi
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    else
        echo -e "${YELLOW}Frontend not running${NC}"
    fi
    rm -f .frontend.pid
else
    echo -e "${YELLOW}No frontend PID file found${NC}"
fi

echo -e "${GREEN}All Sallie servers stopped${NC}"
