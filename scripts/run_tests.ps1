$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
Write-Host "Running Q-RAKSHAK Test Suite..." -ForegroundColor Cyan
pytest