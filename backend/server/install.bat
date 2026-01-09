@echo off
REM ========================================
REM SALLIE SERVER INSTALLER FOR WINDOWS
REM ========================================
REM Run this script on your mini PC to install Sallie
REM 
REM KEYBOARD ONLY INSTRUCTIONS:
REM 1. Press Windows key
REM 2. Type "powershell" and press Enter
REM 3. Type: cd C:\Sallie\server
REM 4. Type: .\install.bat
REM 5. Press Enter
REM ========================================

echo.
echo ========================================
echo    SALLIE SERVER INSTALLER
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed!
    echo.
    echo Please install Python first:
    echo 1. Press Windows key
    echo 2. Type "microsoft store" and press Enter
    echo 3. Tab to search, type "python"
    echo 4. Select Python 3.11 and press Enter
    echo 5. Tab to "Get" button and press Enter
    echo.
    echo After installing Python, run this script again.
    pause
    exit /b 1
)

echo Python found!
python --version
echo.

REM Install required packages
echo Installing required packages...
echo.

pip install fastapi uvicorn pydantic websockets aiofiles

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install packages!
    echo Try running PowerShell as Administrator.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    INSTALLATION COMPLETE!
echo ========================================
echo.
echo To start Sallie:
echo   python sallie_server.py
echo.
echo To make Sallie start automatically:
echo   1. Press Windows + R
echo   2. Type: shell:startup
echo   3. Press Enter
echo   4. Copy "start_sallie.bat" to that folder
echo.
pause
