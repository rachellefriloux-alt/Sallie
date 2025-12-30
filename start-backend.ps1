param(
    [int]$PreferredPort = 8000,
    [int]$FallbackPort = 8010,
    [switch]$NoKill
)

function Get-FreePort {
    param([int]$Primary, [int]$Secondary)
    $inUse = Get-NetTCPConnection -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $Primary }
    if (-not $inUse) { return $Primary }
    return $Secondary
}

function Stop-PortProcess {
    param([int]$Port)
    $conns = Get-NetTCPConnection -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $Port }
    if (-not $conns) { return }
    $pids = $conns.OwningProcess | Sort-Object -Unique
    foreach ($pid in $pids) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "Stopped process $pid using port $Port" -ForegroundColor Yellow
        } catch {
            Write-Warning "Could not stop process $pid on port $Port: $_"
        }
    }
}

# Resolve repo root relative to this script so it works from any caller directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$outerRoot = Resolve-Path (Join-Path $scriptDir "progeny_root") -ErrorAction SilentlyContinue
if (-not $outerRoot) {
    Write-Error "Could not find progeny_root next to this script. Place start-backend.ps1 in C:\Sallie or adjust paths."
    exit 1
}

# Prefer the inner package folder if present
$innerRoot = Resolve-Path (Join-Path $outerRoot "progeny_root") -ErrorAction SilentlyContinue
$workingDir = $null
$modulePath = $null

if ($innerRoot -and (Test-Path (Join-Path $innerRoot "core"))) {
    $workingDir = $innerRoot
    $modulePath = "core.main:app"
} elseif (Test-Path (Join-Path $outerRoot "core")) {
    $workingDir = $outerRoot
    $modulePath = "core.main:app"
} else {
    Write-Error "Could not locate core/ under progeny_root. Check your tree."
    exit 1
}

$env:PYTHONPATH = $workingDir
Set-Location $workingDir

$port = Get-FreePort -Primary $PreferredPort -Secondary $FallbackPort
if ($port -ne $PreferredPort) {
    Write-Host "Port $PreferredPort busy; using $port" -ForegroundColor Yellow
    if (-not $NoKill) { Stop-PortProcess -Port $PreferredPort }
}
if (-not $NoKill) { Stop-PortProcess -Port $port }

Write-Host "Starting backend from $workingDir on port $port" -ForegroundColor Cyan
python -m uvicorn $modulePath --host 0.0.0.0 --port $port
