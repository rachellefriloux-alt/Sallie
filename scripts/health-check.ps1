param(
    [int]$Port = 8000,
    [int]$FallbackPort = 8010
)

Write-Host "=== Sallie Health Check ===" -ForegroundColor Cyan
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Test-PortOpen {
    param([int]$P)
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $client.Connect("127.0.0.1", $P)
        $client.Close()
        return $true
    } catch { return $false }
}

function Test-HealthEndpoint {
    param([int]$P)
    try {
        $resp = Invoke-WebRequest -Uri "http://127.0.0.1:$P/health" -UseBasicParsing -TimeoutSec 3
        return $resp.StatusCode -eq 200
    } catch { return $false }
}

Write-Host "`nBackend:" -ForegroundColor Yellow
foreach ($p in @($Port, $FallbackPort)) {
    $open = Test-PortOpen -P $p
    $healthy = $open -and (Test-HealthEndpoint -P $p)
    if ($healthy) { Write-Host "  Port $p -> ONLINE (health OK)" -ForegroundColor Green }
    elseif ($open) { Write-Host "  Port $p -> LISTENING (no /health)" -ForegroundColor Yellow }
    else { Write-Host "  Port $p -> offline" -ForegroundColor DarkGray }
}

Write-Host "`nDocker:" -ForegroundColor Yellow
$docker = docker ps --format "{{.Names}}" 2>$null
if ($docker) {
    Write-Host "  Running containers:" -ForegroundColor Green
    $docker | ForEach-Object { Write-Host "    $_" }
} else {
    Write-Host "  No containers running." -ForegroundColor DarkGray
}

Write-Host "`nFrontend:" -ForegroundColor Yellow
$node = Get-Process node -ErrorAction SilentlyContinue
if ($node) {
    Write-Host "  Node processes running:" -ForegroundColor Green
    $node | ForEach-Object { Write-Host "    PID $($_.Id)" }
} else {
    Write-Host "  Frontend offline." -ForegroundColor DarkGray
}

Write-Host "`nEnvironment:" -ForegroundColor Yellow
Write-Host "  Script root: $ScriptRoot"
Write-Host "  Python: $(Get-Command python | Select-Object -ExpandProperty Source)"
Write-Host "  Node:   $(Get-Command node | Select-Object -ExpandProperty Source)"
Write-Host "  Docker: $(Get-Command docker | Select-Object -ExpandProperty Source)"

Write-Host "`n=== Health Check Complete ===" -ForegroundColor Cyan
