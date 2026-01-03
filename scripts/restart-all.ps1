Write-Host "=== Restarting Sallie Full Stack ===" -ForegroundColor Cyan
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
& "$ScriptRoot\stop-all.ps1"
& "$ScriptRoot\start-all.ps1"
Write-Host "=== Sallie Restart Complete ===" -ForegroundColor Green
