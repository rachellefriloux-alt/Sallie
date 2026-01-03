@echo off
setlocal EnableDelayedExpansion

REM Sallie Health Check Script
REM Run this to diagnose connection and service issues

TITLE Sallie Health Check
COLOR 0B

echo ========================================
echo   SALLIE HEALTH CHECK
echo   Diagnosing system status...
echo ========================================
echo.

set ISSUES=0

REM Check 1: Docker
echo [1/8] Checking Docker...
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker is running
) else (
    echo [X] Docker is not running
    echo     Start Docker Desktop and try again
    set /a ISSUES+=1
)

REM Check 2: Docker Containers
echo.
echo [2/8] Checking Docker containers...
docker ps --filter "name=progeny-brain" --format "{{.Names}}" | findstr "progeny-brain" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Ollama container is running
) else (
    echo [!] Ollama container is not running
    echo     Run: cd progeny_root ^&^& docker-compose up -d
    set /a ISSUES+=1
)

docker ps --filter "name=progeny-memory" --format "{{.Names}}" | findstr "progeny-memory" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Qdrant container is running
) else (
    echo [!] Qdrant container is not running
    echo     Run: cd progeny_root ^&^& docker-compose up -d
    set /a ISSUES+=1
)

REM Check 3: Ollama Service
echo.
echo [3/8] Checking Ollama service...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Ollama is responding
) else (
    echo [X] Ollama is not responding
    echo     Check if container is running: docker ps
    set /a ISSUES+=1
)

REM Check 4: Qdrant Service
echo.
echo [4/8] Checking Qdrant service...
curl -s http://localhost:6333/collections >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Qdrant is responding
) else (
    echo [X] Qdrant is not responding
    echo     Check if container is running: docker ps
    set /a ISSUES+=1
)

REM Check 5: Backend API
echo.
echo [5/8] Checking Backend API...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend API is running
) else (
    echo [!] Backend API is not running
    echo     Run: start-sallie.bat
    set /a ISSUES+=1
)

REM Check 6: Web App
echo.
echo [6/8] Checking Web app...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Web app is running
) else (
    echo [!] Web app is not running
    echo     Run: cd web ^&^& npm run dev
    set /a ISSUES+=1
)

REM Check 7: Python
echo.
echo [7/8] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%v in ('python --version 2^>^&1') do echo [OK] Python installed: %%v
    
    python -c "import fastapi" >nul 2>&1
    if %errorlevel% equ 0 (
        echo     FastAPI is installed
    ) else (
        echo [!] FastAPI not installed
        echo     Run: cd progeny_root ^&^& pip install -r requirements.txt
        set /a ISSUES+=1
    )
) else (
    echo [X] Python not found
    echo     Install Python 3.11+ from https://python.org
    set /a ISSUES+=1
)

REM Check 8: Node.js
echo.
echo [8/8] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f %%v in ('node --version') do echo [OK] Node.js installed: %%v
    
    if exist "web\node_modules\" (
        echo     Web dependencies installed
    ) else (
        echo [!] Web dependencies not installed
        echo     Run: cd web ^&^& npm install
        set /a ISSUES+=1
    )
) else (
    echo [X] Node.js not found
    echo     Install Node.js 18+ from https://nodejs.org
    set /a ISSUES+=1
)

REM Network Info
echo.
echo [Network Info]
echo Local IP addresses:
ipconfig | findstr /C:"IPv4 Address"

REM Summary
echo.
echo ========================================
if %ISSUES% equ 0 (
    COLOR 0A
    echo ALL CHECKS PASSED! Sallie should be working.
    echo.
    echo Access Sallie at: http://localhost:3000
) else (
    COLOR 0E
    echo Found %ISSUES% issue(s) - see above for solutions
    echo.
    echo Quick fix: Run start-sallie.bat to start all services
)
echo ========================================
echo.
pause
