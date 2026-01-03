param(
    [int]$PreferredPort = 8000,
    [int]$FallbackPort = 8010
)

Write-Host "=== Sallie Backend Watcher ===" -ForegroundColor Cyan
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$Outer = Join-Path $ScriptRoot "progeny_root"
$Inner = Join-Path $Outer "progeny_root"
$BackendRoot = if (Test-Path (Join-Path $Inner "core")) { $Inner } else { $Outer }

Write-Host "Watching backend at: $BackendRoot" -ForegroundColor Yellow

& "$ScriptRoot\start-backend.ps1" -PreferredPort $PreferredPort -FallbackPort $FallbackPort

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $BackendRoot
$watcher.Filter = "*.py"
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

$action = {
    Write-Host "`nChange detected. Restarting backend..." -ForegroundColor Cyan
    & "$using:ScriptRoot\stop-backend.ps1" -Port $using:PreferredPort -FallbackPort $using:FallbackPort
    & "$using:ScriptRoot\start-backend.ps1" -PreferredPort $using:PreferredPort -FallbackPort $using:FallbackPort
}

Register-ObjectEvent $watcher Changed -Action $action | Out-Null
Register-ObjectEvent $watcher Created -Action $action | Out-Null
Register-ObjectEvent $watcher Deleted -Action $action | Out-Null
Register-ObjectEvent $watcher Renamed -Action $action | Out-Null

Write-Host "`nWatching for changes. Press Ctrl+C to exit." -ForegroundColor Green
while ($true) { Start-Sleep -Seconds 1 }
