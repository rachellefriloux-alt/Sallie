@echo off
REM Install Zeroconf for Sallie Auto-Discovery

echo Installing Zeroconf for automatic device discovery...
echo.

REM Find Python
where python >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON=python
    goto :run
)

where python3 >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON=python3
    goto :run
)

echo Error: Python not found!
echo Please install Python 3.8+ first.
pause
exit /b 1

:run
%PYTHON% install_zeroconf.py
exit /b %errorlevel%
