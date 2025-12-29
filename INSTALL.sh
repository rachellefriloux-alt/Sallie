#!/bin/bash
# Sallie - One-Click Installer (Mac/Linux)
# Double-click this file (or run ./INSTALL.sh) to install everything!

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Find Python
if command -v python3 &> /dev/null; then
    PYTHON=python3
elif command -v python &> /dev/null; then
    PYTHON=python
else
    echo -e "${RED}========================================================${NC}"
    echo -e "${RED}  ERROR: Python not found!${NC}"
    echo -e "${RED}========================================================${NC}"
    echo ""
    echo "Please install Python 3.11+ from:"
    echo "  https://www.python.org/downloads/"
    echo ""
    echo "Or use your package manager:"
    echo "  Mac:   brew install python3"
    echo "  Linux: sudo apt install python3"
    echo ""
    exit 1
fi

# Check Python version
PYTHON_VERSION=$($PYTHON --version 2>&1 | awk '{print $2}')
echo "Found Python $PYTHON_VERSION"

# Run the installer
$PYTHON install_everything.py
EXIT_CODE=$?

# Check if installation succeeded
if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo -e "${RED}Installation failed.${NC}"
    exit $EXIT_CODE
fi

# Success - offer to launch
echo ""
read -p "Would you like to launch Sallie now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}Launching Sallie...${NC}"
    $PYTHON launcher.py &
else
    echo ""
    echo "You can launch Sallie anytime by running: python3 launcher.py"
    sleep 2
fi

exit 0
