@echo off
setlocal EnableDelayedExpansion

TITLE The Digital Progeny - Native Launcher
COLOR 0A

echo ========================================================
echo       THE DIGITAL PROGENY - NATIVE LAUNCHER
echo ========================================================
echo.

:: 1. CHECK FOR OLLAMA
echo [1/5] Checking for Brain (Ollama)...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    COLOR 0E
    echo [WARNING] Ollama is not responding!
    echo.
    echo Please ensure you have installed Ollama from https://ollama.com
    echo and that it is running in the system tray.
    echo.
    echo Attempting to start 'ollama app' anyway...
    start ollama app
    timeout /t 5 >nul
) else (
    echo [OK] Brain is active.
)

:: 2. CHECK MODELS
echo.
echo [2/5] Verifying Neural Pathways (Models)...
:: We use curl to check tags because 'ollama list' might not be in PATH if just installed
curl -s http://localhost:11434/api/tags | findstr "llama3" >nul
if %errorlevel% neq 0 (
    echo [INFO] Model 'llama3' missing. Downloading... (This may take a while)
    ollama pull llama3
)
curl -s http://localhost:11434/api/tags | findstr "phi3" >nul
if %errorlevel% neq 0 (
    echo [INFO] Model 'phi3' missing. Downloading...
    ollama pull phi3
)
curl -s http://localhost:11434/api/tags | findstr "nomic-embed-text" >nul
if %errorlevel% neq 0 (
    echo [INFO] Model 'nomic-embed-text' missing. Downloading...
    ollama pull nomic-embed-text
)
echo [OK] Neural pathways verified.

:: 3. START CORE
echo.
echo [3/5] Igniting the Core (Native Mode)...
cd progeny_root
:: Using 'start' to run in background
start "Progeny Core" /MIN cmd /k "python -m core.main"
echo [OK] Core ignited.

:: 4. START GHOST INTERFACE
echo.
echo [4/5] Summoning Ghost Interface...
start "Progeny Ghost" /MIN cmd /k "python interface/ghost.py"
echo [OK] Ghost summoned to System Tray.

:: 5. LAUNCH DASHBOARD
echo.
echo [5/5] Opening Interface...
timeout /t 2 >nul
start "" "http://localhost:8000/docs" 
:: Note: Pointing to API docs for now as web UI might not be built yet.
:: Once web UI is ready, change to: start "" "http://localhost:3000"

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

echo.
echo Goodbye, Creator.
timeout /t 3 >nul
