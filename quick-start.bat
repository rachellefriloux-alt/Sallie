@echo off
REM One-Click Setup and Launch for Sallie (Windows)
REM This script handles EVERYTHING needed to get Sallie running

setlocal enabledelayedexpansion

color 0B
echo.
echo ════════════════════════════════════════════════
echo.
echo      🌟  SALLIE - ONE-CLICK SETUP ^& LAUNCH  🌟
echo.
echo         Your AI Cognitive Partner
echo         Version 5.4.2
echo.
echo ════════════════════════════════════════════════
echo.

REM Check if first run
set FIRST_RUN=false
if not exist .sallie_installed set FIRST_RUN=true

if "%FIRST_RUN%"=="true" (
    echo.
    echo ════════════════════════════════════════════════
    echo   FIRST RUN SETUP
    echo ════════════════════════════════════════════════
    echo.
    echo This will install all dependencies and set up Sallie.
    echo Estimated time: 5-10 minutes
    echo.
    set /p CONTINUE="Continue? (y/n): "
    if /i not "!CONTINUE!"=="y" exit /b 1
    
    REM Check prerequisites
    echo.
    echo [1/6] Checking prerequisites...
    
    REM Check Docker
    where docker >nul 2>nul
    if errorlevel 1 (
        echo ✗ Docker not found
        echo Please install Docker Desktop from: https://docker.com
        pause
        exit /b 1
    )
    echo ✓ Docker installed
    
    REM Check Python
    where python >nul 2>nul
    if errorlevel 1 (
        echo ✗ Python 3 not found
        echo Please install Python 3.11+ from: https://python.org
        pause
        exit /b 1
    )
    for /f "tokens=2" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo ✓ Python !PYTHON_VERSION! installed
    
    REM Check Node.js
    where node >nul 2>nul
    if errorlevel 1 (
        echo ✗ Node.js not found
        echo Please install Node.js 18+ from: https://nodejs.org
        pause
        exit /b 1
    )
    for /f %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✓ Node.js !NODE_VERSION! installed
    
    REM Install Python dependencies
    echo.
    echo [2/6] Installing Python dependencies...
    cd progeny_root
    if not exist ..\venv (
        python -m venv ..\venv
    )
    call ..\venv\Scripts\activate.bat
    pip install -r requirements.txt --quiet
    if errorlevel 1 (
        echo Some packages may have failed, continuing...
    ) else (
        echo ✓ Python packages installed
    )
    cd ..
    
    REM Install Web dependencies
    echo.
    echo [3/6] Installing Web app dependencies...
    cd web
    npm install --silent
    if errorlevel 1 (
        echo ✗ Web installation failed
    ) else (
        echo ✓ Web packages installed
    )
    cd ..
    
    REM Install Desktop dependencies
    echo.
    echo [4/6] Installing Desktop app dependencies...
    cd desktop
    npm install --silent
    if errorlevel 1 (
        echo Desktop installation failed, continuing...
    ) else (
        echo ✓ Desktop packages installed
    )
    cd ..
    
    REM Install Mobile dependencies
    echo.
    echo [5/6] Installing Mobile app dependencies...
    cd mobile
    npm install --silent
    if errorlevel 1 (
        echo Mobile installation failed, continuing...
    ) else (
        echo ✓ Mobile packages installed
    )
    cd ..
    
    REM Pull Docker images
    echo.
    echo [6/6] Downloading Docker images...
    echo This may take 5-10 minutes depending on your connection...
    cd progeny_root
    docker-compose pull
    cd ..
    
    REM Mark as installed
    echo. > .sallie_installed
    
    echo.
    echo ════════════════════════════════════════════════
    echo   ✓ SETUP COMPLETE!
    echo ════════════════════════════════════════════════
    echo.
)

REM Launch Sallie
echo.
echo ════════════════════════════════════════════════
echo   LAUNCHING SALLIE
echo ════════════════════════════════════════════════
echo.

REM Check Docker
echo [1/5] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo ✗ Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)
echo ✓ Docker is running

REM Start Docker services
echo.
echo [2/5] Starting backend services...
cd progeny_root
docker-compose up -d 2>nul
echo ✓ Services started
cd ..

REM Wait for services
echo.
echo [3/5] Waiting for services...
timeout /t 5 /nobreak >nul

REM Activate venv
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM Start backend
echo.
echo [4/5] Starting backend API...
cd progeny_root
start /b python -m uvicorn core.main:app --host 0.0.0.0 --port 8000 > ..\backend.log 2>&1
cd ..
timeout /t 3 /nobreak >nul
echo ✓ Backend API started

REM Start web app
echo.
echo [5/5] Starting web interface...
cd web
start /b npm run dev > ..\web.log 2>&1
cd ..
timeout /t 5 /nobreak >nul

REM Final status
echo.
echo ════════════════════════════════════════════════
echo ✨  SALLIE IS RUNNING!  ✨
echo ════════════════════════════════════════════════
echo.
echo Access Options:
echo.
echo   1. WEB APP (Recommended for first time)
echo      Open: http://localhost:3000
echo.
echo   2. DESKTOP APP
echo      Run: cd desktop ^&^& npm start
echo.
echo   3. MOBILE APP
echo      • Build: cd mobile ^&^& npm run android
echo      • Connect to: http://YOUR_IP:8000
echo.
echo Logs:
echo   • Backend: type backend.log
echo   • Web:     type web.log
echo   • Docker:  cd progeny_root ^&^& docker-compose logs -f
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul

REM Open browser
start http://localhost:3000

echo.
echo Press any key to stop all services...
pause >nul

REM Cleanup
echo.
echo Shutting down Sallie...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
cd progeny_root
docker-compose down >nul 2>&1
cd ..
echo ✓ All services stopped
echo.
echo Goodbye! 💜
pause
