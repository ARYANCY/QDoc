$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".\.venv\Scripts\Activate.ps1")) {
    throw "Virtual environment not found. Run: python -m venv .venv"
}

& ".\.venv\Scripts\Activate.ps1"
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
