$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host "Setting up Python Environment..." -ForegroundColor Cyan
if (-not (Test-Path ".\.venv")) {
    python -m venv .venv
}
& ".\.venv\Scripts\Activate.ps1"
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

Write-Host "Setting up Frontend Node Environment..." -ForegroundColor Cyan
Set-Location "frontend"
npm install --legacy-peer-deps
Set-Location ".."

Write-Host "Environment setup complete!" -ForegroundColor Green