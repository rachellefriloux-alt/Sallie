#!/bin/bash
# Install Zeroconf for Sallie Auto-Discovery

echo "Installing Zeroconf for automatic device discovery..."
echo ""

# Find Python
if command -v python3 &> /dev/null; then
    PYTHON=python3
elif command -v python &> /dev/null; then
    PYTHON=python
else
    echo "Error: Python not found!"
    echo "Please install Python 3.8+ first."
    exit 1
fi

# Run the installer
$PYTHON install_zeroconf.py

exit $?
