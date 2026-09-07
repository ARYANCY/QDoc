$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..\frontend")

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
}

Write-Host "Starting Q-MedSense Clinical Dashboard at http://localhost:5173 ..." -ForegroundColor Cyan
npm run dev