@echo off
REM Digital Progeny - Windows Installation Script
REM Checks dependencies and installs required packages

echo ============================================================
echo Digital Progeny - Windows Installation
echo ============================================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.11+ from https://www.python.org/downloads/
    exit /b 1
)
echo [OK] Python found
python --version

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js 18+ from https://nodejs.org/
    exit /b 1
)
echo [OK] Node.js found
node --version

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Docker not found. Ollama/Qdrant will need to be installed separately.
    echo          Install Docker Desktop from https://www.docker.com/products/docker-desktop/
) else (
    echo [OK] Docker found
    docker --version
)

echo.
echo ============================================================
echo Installing Python dependencies...
echo ============================================================
cd /d "%~dp0.."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install Python dependencies
    exit /b 1
)
echo [OK] Python dependencies installed

echo.
echo ============================================================
echo Installing Web UI dependencies...
echo ============================================================
cd web
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install web dependencies
    exit /b 1
)
echo [OK] Web UI dependencies installed
cd ..

echo.
echo ============================================================
echo Installing Mobile App dependencies...
echo ============================================================
if exist mobile (
    cd mobile
    call npm install
    if errorlevel 1 (
        echo [WARNING] Failed to install mobile dependencies (optional)
    ) else (
        echo [OK] Mobile app dependencies installed
    )
    cd ..
)

echo.
echo ============================================================
echo Installing Desktop App dependencies...
echo ============================================================
if exist desktop (
    cd desktop
    call npm install
    if errorlevel 1 (
        echo [WARNING] Failed to install desktop dependencies (optional)
    ) else (
        echo [OK] Desktop app dependencies installed
    )
    cd ..
)

echo.
echo ============================================================
echo Setup complete!
echo ============================================================
echo.
echo Next steps:
echo 1. Start Docker Desktop (if using Docker)
echo 2. Pull Ollama models: ollama pull deepseek-v3
echo 3. Run the setup wizard: python scripts\setup_wizard.py
echo 4. Start services: scripts\start_services.bat
echo.

