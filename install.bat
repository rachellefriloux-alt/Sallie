@echo off
REM Sallie - One-Click Installer (Windows)
REM Double-click this file to install everything!

TITLE Sallie Installer

REM Find Python
where python >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON=python
    goto :install
)

where python3 >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON=python3
    goto :install
)

REM Python not found
COLOR 0C
echo ========================================================
echo   ERROR: Python not found!
echo ========================================================
echo.
echo Please install Python 3.11+ from:
echo   https://www.python.org/downloads/
echo.
echo Make sure to check "Add Python to PATH" during installation!
echo.
pause
exit /b 1

:install
REM Run the installer
%PYTHON% install_everything.py

REM Keep window open if there was an error
if %errorlevel% neq 0 (
    echo.
    echo Installation failed. Press any key to exit...
    pause >nul
    exit /b %errorlevel%
)

REM Success - offer to launch
echo.
set /p LAUNCH="Would you like to launch Sallie now? (Y/N) "
if /I "%LAUNCH%"=="Y" (
    echo.
    echo Launching Sallie...
    start "" "%PYTHON%" launcher.py
) else (
    echo.
    echo You can launch Sallie anytime by running: launcher.py
    timeout /t 3 /nobreak >nul
)

exit /b 0
