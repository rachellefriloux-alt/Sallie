@echo off
setlocal EnableDelayedExpansion

REM Sallie - Simple Unified Startup Script for Windows
REM This script starts all necessary services to run Sallie

set "SALLIE_VERSION=5.4.2"

TITLE Sallie - AI Cognitive Partner
COLOR 0B

echo ========================================================
echo      SALLIE - Your AI Cognitive Partner
echo                Version %SALLIE_VERSION%
echo ========================================================
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Check Docker
echo [1/5] Checking Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    COLOR 0C
    echo [X] Docker is not running
    echo     Please start Docker Desktop and try again
    pause
    exit /b 1
)
echo [OK] Docker is running
echo.

REM Start Docker services
echo [2/5] Starting backend services (Ollama + Qdrant)...
cd progeny_root
docker-compose up -d >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Services started
) else (
    echo [!] Services may already be running
)
cd ..
echo.

REM Wait for services
echo [3/5] Waiting for services to be ready...
timeout /t 5 /nobreak >nul

REM Check Ollama
echo   - Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo     [OK]
) else (
    echo     [!] Not responding yet
)

REM Check Qdrant
echo   - Qdrant...
curl -s http://localhost:6333/collections >nul 2>&1
if %errorlevel% equ 0 (
    echo     [OK]
) else (
    echo     [!] Not responding yet
)
echo.

REM Start backend API
echo [4/5] Starting backend API...
cd progeny_root

REM Check if virtual environment exists
if exist "%SCRIPT_DIR%venv\Scripts\activate.bat" (
    call "%SCRIPT_DIR%venv\Scripts\activate.bat"
    echo   - Using virtual environment
) else (
    echo   - Using system Python
)

REM Start backend in background (bind to localhost for security)
REM To allow LAN access, set environment variable: set SALLIE_BACKEND_HOST=0.0.0.0
if not defined SALLIE_BACKEND_HOST set SALLIE_BACKEND_HOST=127.0.0.1
start "Sallie Backend" /MIN cmd /k "python -m uvicorn core.main:app --host %SALLIE_BACKEND_HOST% --port 8000 > ..\backend.log 2>&1"
timeout /t 3 /nobreak >nul

REM Check if backend is running
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend API is running
) else (
    echo [!] Backend starting, may need more time
    echo     Check logs: type backend.log
)
cd ..
echo.

REM Start web app
echo [5/5] Starting web interface...
cd web

REM Check if node_modules exists
if not exist "node_modules\" (
    echo   - Installing dependencies (first time only)...
    call npm install --silent
)

REM Start Next.js
start "Sallie Web" /MIN cmd /k "npm run dev > ..\web.log 2>&1"
timeout /t 5 /nobreak >nul

cd ..
echo.

REM Final status
COLOR 0A
echo ========================================================
echo        SALLIE IS RUNNING!
echo ========================================================
echo.
echo Access Sallie:
echo   Web: http://localhost:3000
echo   Mobile/Desktop: Configure to http://localhost:8000
echo.
echo Services:
echo   Backend API:  http://localhost:8000
echo   Web App:      http://localhost:3000
echo   Ollama:       http://localhost:11434
echo   Qdrant:       http://localhost:6333
echo.
echo Logs:
echo   Backend: type backend.log
echo   Web:     type web.log
echo   Docker:  cd progeny_root ^&^& docker-compose logs
echo.
echo Opening web browser...
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"
echo.
echo Press any key to STOP all services...
pause >nul

REM Shutdown sequence
echo.
echo Shutting down Sallie...
taskkill /FI "WINDOWTITLE eq Sallie Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Sallie Web*" /F >nul 2>&1
echo [OK] Services stopped

set /p STOP_DOCKER="Stop Docker containers? (Y/N) "
if /I "%STOP_DOCKER%"=="Y" (
    echo Stopping Docker services...
    cd progeny_root
    docker-compose stop
    cd ..
    echo [OK] Docker services stopped
) else (
    echo [!] Docker containers left running
)

echo.
echo Goodbye! 💜
timeout /t 3 /nobreak >nul
