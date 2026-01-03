param(
    [int]$PreferredPort = 8000,
    [int]$FallbackPort = 8010,
    [switch]$NoKill,
    [string]$FrontendCommand = "npm run dev"
)

$ErrorActionPreference = "Stop"

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $ScriptRoot "logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
$Timestamp = (Get-Date -Format "yyyy-MM-dd_HH-mm-ss")
$LogFile = Join-Path $LogDir "start-all-$Timestamp.log"
Start-Transcript -Path $LogFile -Append | Out-Null

Write-Host "=== Sallie: Starting Full Stack ===" -ForegroundColor Cyan

# Detect backend layout
$Outer = Join-Path $ScriptRoot "progeny_root"
$Inner = Join-Path $Outer "progeny_root"
if (Test-Path (Join-Path $Inner "core")) {
    $BackendRoot = (Resolve-Path $Inner)
    $ModulePath = "core.main:app"
} elseif (Test-Path (Join-Path $Outer "core")) {
    $BackendRoot = (Resolve-Path $Outer)
    $ModulePath = "core.main:app"
} else {
    Write-Host "ERROR: Could not locate backend core/ folder." -ForegroundColor Red
    Stop-Transcript | Out-Null
    exit 1
}
Write-Host "Backend root: $BackendRoot" -ForegroundColor Yellow

# Start Docker
Write-Host "Starting Docker containers..." -ForegroundColor Cyan
try {
    docker-compose -f (Join-Path $Outer "docker-compose.yml") up -d | Out-Null
} catch {
    Write-Warning "Docker compose failed or not installed: $_"
}

# Start backend
Write-Host "Launching backend..." -ForegroundColor Cyan
$BackendScript = Join-Path $ScriptRoot "start-backend.ps1"
$backendParams = @('-PreferredPort', $PreferredPort, '-FallbackPort', $FallbackPort)
if ($NoKill) { $backendParams += '-NoKill' }
& powershell -ExecutionPolicy Bypass -File $BackendScript @backendParams

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Cyan
$WebDir = Join-Path $ScriptRoot "web"
if (-not (Test-Path $WebDir)) {
    Write-Warning "Web directory not found at $WebDir; skipping frontend."
    $FrontendProcess = $null
} else {
    $FrontendProcess = Start-Process powershell -ArgumentList "-NoExit","-Command","cd `"$WebDir`"; $FrontendCommand" -WorkingDirectory $WebDir -PassThru
}

Start-Sleep -Seconds 2

# Dashboard
Write-Host "" 
Write-Host "=== Sallie System Dashboard ===" -ForegroundColor Green

Write-Host "`nPorts:" -ForegroundColor Cyan
foreach ($p in @($PreferredPort, $FallbackPort)) {
    $pid = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
    if ($pid) { Write-Host "  $p -> PID $pid" -ForegroundColor Green }
    else { Write-Host "  $p -> free" -ForegroundColor DarkGray }
}

Write-Host "`nPaths:" -ForegroundColor Cyan
Write-Host "  Script root:   $ScriptRoot"
Write-Host "  Backend root:  $BackendRoot"
Write-Host "  PYTHONPATH:    $BackendRoot"

Write-Host "`nEnvironment:" -ForegroundColor Cyan
Write-Host "  Preferred port: $PreferredPort"
Write-Host "  Fallback port:  $FallbackPort"
Write-Host "  NoKill:         $NoKill"

Write-Host "`nFrontend:" -ForegroundColor Cyan
if ($FrontendProcess) {
    Write-Host "  PID: $($FrontendProcess.Id)" -ForegroundColor Green
} else {
    Write-Host "  Not started" -ForegroundColor DarkGray
}

Write-Host "`nLog file: $LogFile" -ForegroundColor Yellow
Write-Host "`n=== Sallie Full Stack Running ===" -ForegroundColor Green

Stop-Transcript | Out-Null
