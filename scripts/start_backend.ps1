$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Test-Path ".\.venv\Scripts\Activate.ps1")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    .\.venv\Scripts\Activate.ps1
    python -m pip install -r requirements.txt
} else {
    & ".\.venv\Scripts\Activate.ps1"
}

Write-Host "Starting Q-MedSense Backend API at http://127.0.0.1:8000 ..." -ForegroundColor Cyan
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload --reload-exclude ".venv/**"