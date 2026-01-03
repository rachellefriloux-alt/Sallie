@echo off
REM ========================================
REM START SALLIE SERVER
REM ========================================
REM Put this file in your Startup folder to auto-start Sallie
REM 
REM To find Startup folder:
REM 1. Press Windows + R
REM 2. Type: shell:startup
REM 3. Press Enter
REM 4. Copy this file there
REM ========================================

cd /d C:\Sallie\server
python sallie_server.py
