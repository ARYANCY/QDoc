$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
Set-Location "frontend"

if (-not (Test-Path "node_modules")) {
    npm install
}

npm run dev
