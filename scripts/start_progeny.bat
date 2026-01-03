@echo off
setlocal EnableDelayedExpansion

TITLE The Digital Progeny - Launcher
COLOR 0A

echo ========================================================
echo       THE DIGITAL PROGENY - SYSTEM INITIALIZATION
echo ========================================================
echo.

:: 1. CHECK FOR DOCKER
echo [1/6] Checking Infrastructure (Docker)...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    COLOR 0C
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b
)
echo [OK] Docker is active.

:: 2. START CONTAINERS
echo.
echo [2/6] Waking the Body (Ollama + Qdrant)...
cd progeny_root
docker-compose up -d
if %errorlevel% neq 0 (
    COLOR 0C
    echo [ERROR] Failed to start containers.
    pause
    exit /b
)
echo [OK] Body is awake.

:: 3. CHECK MODELS (Lazy Loading)
echo.
echo [3/6] Verifying Neural Pathways (Models)...
:: Check if llama3 exists, if not pull it
docker exec progeny-brain ollama list | findstr "llama3" >nul
if %errorlevel% neq 0 (
    echo [INFO] Model 'llama3' missing. Downloading... (This may take a while)
    docker exec progeny-brain ollama pull llama3
)
:: Check if phi3 exists (for fast perception)
docker exec progeny-brain ollama list | findstr "phi3" >nul
if %errorlevel% neq 0 (
    echo [INFO] Model 'phi3' missing. Downloading...
    docker exec progeny-brain ollama pull phi3
)
:: Check embedding model
docker exec progeny-brain ollama list | findstr "nomic-embed-text" >nul
if %errorlevel% neq 0 (
    echo [INFO] Model 'nomic-embed-text' missing. Downloading...
    docker exec progeny-brain ollama pull nomic-embed-text
)
echo [OK] Neural pathways verified.

:: 4. START CORE
echo.
echo [4/6] Igniting the Core (Limbic System & Agency)...
:: We use 'start' to run it in a separate window or background
:: Assuming python is in path and requirements are installed
start "Progeny Core" /MIN cmd /k "python core/main.py"
echo [OK] Core ignited.

:: 5. START GHOST INTERFACE
echo.
echo [5/6] Summoning Ghost Interface...
start "Progeny Ghost" /MIN cmd /k "python interface/ghost.py"
echo [OK] Ghost summoned to System Tray.

:: 6. LAUNCH DASHBOARD
echo.
echo [6/6] Opening Interface...
timeout /t 2 >nul
start "" "http://localhost:3000"
:: Or open the file directly if it's static HTML for now
:: start "" "interface/web/index.html"

echo.
echo ========================================================
echo           SYSTEM ONLINE - LISTENING
echo ========================================================
echo.
echo Press any key to initiate SHUTDOWN sequence...
pause >nul

:: SHUTDOWN SEQUENCE
echo.
echo [SHUTDOWN] Stopping Core services...
taskkill /FI "WINDOWTITLE eq Progeny Core" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Progeny Ghost" /F >nul 2>&1

set /p STOP_DOCKER="Do you want to stop the Docker containers (Body)? (Y/N) "
if /I "%STOP_DOCKER%"=="Y" (
    echo Stopping containers...
    docker-compose stop
    echo [OK] Body is sleeping.
) else (
    echo [INFO] Containers left running for faster startup next time.
)

echo.
echo Goodbye, Creator.
timeout /t 3 >nul
