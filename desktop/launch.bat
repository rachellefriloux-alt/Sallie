@echo off
setlocal

REM Desktop App Launcher
REM Starts the Electron desktop app

TITLE Sallie Desktop App
COLOR 0B

echo Starting Sallie Desktop App...
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies (first time only)...
    call npm install
    if %errorlevel% neq 0 (
        COLOR 0C
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if backend is running
echo Checking backend connection...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    COLOR 0A
    echo [OK] Backend is running
    echo.
) else (
    COLOR 0E
    echo [!] Backend is not running
    echo Desktop app will launch, but you need to start the backend:
    echo   start-sallie.bat
    echo.
)

REM Start desktop app
COLOR 0B
echo Launching desktop app...
echo.
npm start
