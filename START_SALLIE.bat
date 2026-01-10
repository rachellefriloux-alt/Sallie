@echo off
REM Sallie - One-Click Startup for Windows
REM This script makes starting Sallie as simple as double-clicking
REM No coding knowledge required!

title Sallie - Starting Up...
color 0B

echo.
echo  ========================================
echo    SALLIE - Your Cognitive Partner
echo  ========================================
echo.
echo  Starting Sallie... Please wait.
echo.

REM Get the directory where this script is located
set SALLIE_DIR=%~dp0
cd /d "%SALLIE_DIR%"

REM Check if Python is installed
echo [1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo  ERROR: Python is not installed or not in PATH!
    echo.
    echo  Please install Python 3.11 from: https://www.python.org/downloads/
    echo  Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)
echo  ✓ Python found!

REM Check if Node.js is installed
echo [2/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo  ERROR: Node.js is not installed or not in PATH!
    echo.
    echo  Please install Node.js 20 LTS from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo  ✓ Node.js found!

REM Check if .env file exists, if not create from .env.example
echo [3/5] Checking environment configuration...
if not exist ".env" (
    echo  First-time setup detected!
    echo  Generating secure JWT secret...
    
    REM Generate a secure JWT secret
    for /f "delims=" %%i in ('python -c "import secrets; print(secrets.token_hex(32))"') do set JWT_SECRET=%%i
    
    REM Create .env from .env.example
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        
        REM Replace the default JWT_SECRET with generated one
        powershell -Command "(gc .env) -replace 'your-super-secret-jwt-key-change-this-in-production', '%JWT_SECRET%' | Out-File -encoding ASCII .env"
        
        echo  ✓ Configuration file created with secure JWT secret!
        echo.
        echo  IMPORTANT: Your .env file has been created with a secure secret.
        echo  You can edit it in Notepad if you need to add API keys later.
        echo.
    ) else (
        echo  ERROR: .env.example file not found!
        pause
        exit /b 1
    )
) else (
    echo  ✓ Configuration file found!
)

REM Create data directories if they don't exist
echo [4/5] Setting up data directories...
if not exist "data\heritage" mkdir "data\heritage"
if not exist "data\dream_cycle" mkdir "data\dream_cycle"
if not exist "data\working" mkdir "data\working"
echo  ✓ Data directories ready!

REM Check if dependencies are installed
echo [5/5] Checking dependencies...
if not exist "backend\requirements.txt" (
    echo  Warning: backend\requirements.txt not found, checking server...
)

REM Start backend server in a new window
echo.
echo  ========================================
echo   Starting Backend Server...
echo  ========================================
echo.
start "Sallie Backend" cmd /k "cd /d "%SALLIE_DIR%server" && python sallie_main_server.py || (echo. && echo ERROR: Backend failed to start! && echo Check that all Python packages are installed. && echo Run: pip install -r ..\backend\requirements.txt && echo. && echo Or run: pip install fastapi uvicorn python-dotenv && pause)"

REM Wait a bit for backend to start
timeout /t 5 /nobreak >nul

REM Start web interface in a new window
echo.
echo  ========================================
echo   Starting Web Interface...
echo  ========================================
echo.
start "Sallie Web" cmd /k "cd /d "%SALLIE_DIR%web" && npm run dev || (echo. && echo ERROR: Web interface failed to start! && echo Check that npm packages are installed. && echo Run: npm install && pause)"

REM Wait a bit for web to start
timeout /t 5 /nobreak >nul

echo.
echo  ========================================
echo   SALLIE IS STARTING!
echo  ========================================
echo.
echo  Two windows have opened:
echo   1. Sallie Backend (Python server)
echo   2. Sallie Web (Next.js interface)
echo.
echo  In a few seconds, your browser will open automatically.
echo  If it doesn't, manually open: http://localhost:3000
echo.
echo  IMPORTANT: Keep both windows open while using Sallie!
echo.
echo  To stop Sallie:
echo   1. Close your browser
echo   2. Press Ctrl+C in each window
echo   3. Or just close both windows
echo.

REM Wait for web server to fully start
timeout /t 10 /nobreak >nul

REM Open browser
echo  Opening Sallie in your browser...
start http://localhost:3000

echo.
echo  ✓ Sallie is ready! Welcome to The Great Convergence.
echo.
echo  This window can be closed - Sallie is running in the other windows.
echo.
pause
