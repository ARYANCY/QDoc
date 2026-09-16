$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
Set-Location "frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..."
    npm install --legacy-peer-deps
}

Write-Host "Starting Q-Rakshak Hospital Portal at http://localhost:5173 ..." -ForegroundColor Cyan
npm run dev