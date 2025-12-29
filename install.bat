@echo off
REM Sallie - Windows Installer
REM Installs all dependencies and sets up the environment

setlocal EnableDelayedExpansion

title Sallie Installer
color 0B

echo.
echo ============================================================
echo      SALLIE - Installation Wizard
echo                  Version 5.4.2
echo ============================================================
echo.

REM Check Python
echo [1/6] Checking Python...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python found
) else (
    echo [ERROR] Python not found
    echo Please install Python 3.11+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check Docker
echo.
echo [2/6] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker found
    docker info >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Docker is running
    ) else (
        echo [WARNING] Docker is not running
        echo Please start Docker Desktop
        pause
    )
) else (
    echo [WARNING] Docker not found
    echo Please install Docker Desktop from https://www.docker.com/
)

REM Check Node.js
echo.
echo [3/6] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js found
) else (
    echo [WARNING] Node.js not found
    echo Please install Node.js from https://nodejs.org/
)

REM Create directories
echo.
echo [4/6] Creating directories...
if not exist "progeny_root\logs" mkdir progeny_root\logs
if not exist "progeny_root\memory" mkdir progeny_root\memory
if not exist "progeny_root\limbic" mkdir progeny_root\limbic
if not exist "progeny_root\working" mkdir progeny_root\working
if not exist "progeny_root\convergence" mkdir progeny_root\convergence
if not exist "progeny_root\projects" mkdir progeny_root\projects
if not exist "progeny_root\drafts" mkdir progeny_root\drafts
echo [OK] Directories created

REM Install Python dependencies
echo.
echo [5/6] Installing Python dependencies...
echo This may take several minutes...
python -m pip install -r progeny_root\requirements.txt
if %errorlevel% equ 0 (
    echo [OK] Python dependencies installed
) else (
    echo [ERROR] Failed to install Python dependencies
    pause
)

REM Install web dependencies
echo.
echo [6/6] Installing web dependencies...
echo This may take several minutes...
cd web
call npm install
if %errorlevel% equ 0 (
    echo [OK] Web dependencies installed
) else (
    echo [WARNING] Failed to install web dependencies
)
cd ..

REM Create config if needed
if not exist "progeny_root\core\config.json" (
    echo.
    echo Creating default config...
    copy progeny_root\.env.example progeny_root\.env >nul 2>&1
)

REM Done
echo.
echo ============================================================
echo      Installation Complete!
echo ============================================================
echo.
echo To start Sallie:
echo   1. Double-click launcher.py
echo   OR
echo   2. Run: python launcher.py
echo   OR
echo   3. Run: start-sallie.bat
echo.
echo The launcher provides a simple GUI to start all services.
echo.
echo Thank you for choosing Sallie! 
echo.
pause
