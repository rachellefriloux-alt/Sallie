@echo off
REM Digital Progeny - Start Services (Windows)

echo ============================================================
echo Digital Progeny - Starting Services
echo ============================================================

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Docker is not running. Starting services without Docker...
    goto :skip_docker
)

echo.
echo Starting Docker services (Ollama, Qdrant)...
cd /d "%~dp0.."
docker-compose up -d
if errorlevel 1 (
    echo [WARNING] Failed to start Docker services
) else (
    echo [OK] Docker services started
    timeout /t 3 >nul
)

:skip_docker

echo.
echo ============================================================
echo Services started!
echo ============================================================
echo.
echo Next steps:
echo 1. Start the main server: python -m uvicorn core.main:app --reload --port 8000
echo 2. Start the web UI: cd web ^&^& npm run dev
echo 3. Open http://localhost:3000
echo.

pause

