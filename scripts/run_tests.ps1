$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
Write-Host "Running Q-MedSense Test Suite..." -ForegroundColor Cyan
pytest