param(
    [int]$Port = 8000,
    [int]$FallbackPort = 8010
)

Write-Host "=== Stopping Sallie Backend ===" -ForegroundColor Cyan

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

Stop-PortProcess -PortNumber $Port
Stop-PortProcess -PortNumber $FallbackPort

Write-Host "Backend stop complete." -ForegroundColor Cyan
