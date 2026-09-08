$Mode = if ($args.Count -gt 0) { $args[0] } else { "production" }
if ($Mode -notin @("production", "demo")) {
    throw "Usage: .\start_backend.ps1 [production|demo]"
}

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
$env:QMED_DB_MODE = $Mode

if (-not (Test-Path ".\.venv\Scripts\Activate.ps1")) {
    Write-Host "Creating Python virtual environment..."
    python -m venv .venv
    .\.venv\Scripts\Activate.ps1
    python -m pip install -r requirements.txt
} else {
    & ".\.venv\Scripts\Activate.ps1"
}

Write-Host "Starting Q-MED AI Backend API at http://127.0.0.1:8000 using the $Mode database ..." -ForegroundColor Cyan
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload --reload-exclude ".venv/**"