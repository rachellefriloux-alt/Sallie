param(
    [int]$Port = 8000,
    [int]$FallbackPort = 8010
)

Write-Host "=== Stopping Sallie Full Stack ===" -ForegroundColor Cyan

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$Outer = Join-Path $ScriptRoot "progeny_root"

function Stop-PortProcess {
    param([int]$PortNumber)
    $pids = Get-NetTCPConnection -LocalPort $PortNumber -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue |
        Sort-Object -Unique
    if (-not $pids) {
        Write-Host "Port $PortNumber already free." -ForegroundColor DarkGray
        return
    }
    foreach ($pid in $pids) {
        try {
            Write-Host "Stopping process on port $PortNumber (PID $pid)..." -ForegroundColor Yellow
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "OK cleared port $PortNumber" -ForegroundColor Green
        } catch {
            Write-Warning "Could not stop PID $pid on port $PortNumber: $_"
        }
    }
}

# Backend
Stop-PortProcess -PortNumber $Port
Stop-PortProcess -PortNumber $FallbackPort

# Frontend (npm dev server)
Write-Host "Stopping frontend..." -ForegroundColor Cyan
$webDir = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "web"
$nodeProcs = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    ($_.CommandLine -match "npm" -or $_.Name -eq "node.exe" -or $_.Name -eq "node") -and
    ($_.CommandLine -match "npm run dev" -or $_.CommandLine -match [regex]::Escape($webDir))
}
if ($nodeProcs) {
    foreach ($p in $nodeProcs) {
        try {
            Write-Host "Stopping frontend PID $($p.ProcessId)..." -ForegroundColor Yellow
            Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop
        } catch {
            Write-Warning "Could not stop PID $($p.ProcessId): $_"
        }
    }
    Write-Host "Frontend stopped." -ForegroundColor Green
} else {
    Write-Host "Frontend not running." -ForegroundColor DarkGray
}

# Docker
Write-Host "Stopping Docker containers..." -ForegroundColor Cyan
try {
    $composeFile = Join-Path $Outer "docker-compose.yml"
    if (Test-Path $composeFile) {
        docker-compose -f $composeFile down 2>$null
        Write-Host "Docker containers stopped (or already down)." -ForegroundColor Green
    } else {
        Write-Host "No docker-compose.yml found at $composeFile; skipping." -ForegroundColor DarkGray
    }
} catch {
    Write-Warning "Docker-compose not available or failed: $_"
}

# Dashboard
Write-Host "`n=== Shutdown Summary ===" -ForegroundColor Green
Write-Host "`nPorts:" -ForegroundColor Cyan
foreach ($p in @($Port, $FallbackPort)) {
    $pid = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
    if ($pid) { Write-Host "  $p -> STILL OCCUPIED (PID $pid)" -ForegroundColor Red }
    else { Write-Host "  $p -> free" -ForegroundColor Green }
}

Write-Host "`nDocker:" -ForegroundColor Cyan
docker ps --format "  Running: {{.Names}}" 2>$null

Write-Host "`nFrontend:" -ForegroundColor Cyan
$stillNode = Get-Process node -ErrorAction SilentlyContinue
if ($stillNode) {
    Write-Host "  Node processes still running:" -ForegroundColor Red
    $stillNode | ForEach-Object { Write-Host "    PID $($_.Id)" }
} else {
    Write-Host "  No node processes running." -ForegroundColor Green
}

Write-Host "`n=== Sallie Fully Stopped ===" -ForegroundColor Cyan
