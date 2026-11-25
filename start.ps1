# GramVerse AI — One-Click PowerShell Launcher
param(
    [switch]$NoBrowser = $false
)

$ErrorActionPreference = "Stop"
$rootDir = $PSScriptRoot

Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "                GRAMVERSE AI - ONE-CLICK LAUNCHER                      " -ForegroundColor Cyan
Write-Host "      Rural Governance, GIS Mapping, Offline Sync & Village Cloud      " -ForegroundColor Cyan
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verify Virtual Environment
$venvPython = Join-Path $rootDir "backend\venv\Scripts\python.exe"
$venvUvicorn = Join-Path $rootDir "backend\venv\Scripts\uvicorn.exe"
if (-not (Test-Path $venvPython)) {
    Write-Host "[INFO] Python virtual environment not found. Creating backend\venv..." -ForegroundColor Yellow
    python -m venv (Join-Path $rootDir "backend\venv")
    Write-Host "[INFO] Installing backend dependencies..." -ForegroundColor Yellow
    & (Join-Path $rootDir "backend\venv\Scripts\pip.exe") install -r (Join-Path $rootDir "backend\requirements.txt")
}

# 2. Verify Node Modules
$nodeModules = Join-Path $rootDir "node_modules"
if (-not (Test-Path $nodeModules)) {
    Write-Host "[INFO] node_modules not found. Running npm install..." -ForegroundColor Yellow
    Set-Location -Path $rootDir
    npm install
}

# 3. Start Backend
Write-Host "[1/3] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"cd /d `"$rootDir\backend`" && venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000`"" -WorkingDirectory (Join-Path $rootDir "backend")

Write-Host "[INFO] Waiting 3 seconds for Backend & Database initialization..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# 4. Start Frontend
Write-Host "[2/3] Starting Frontend Dev Server on http://localhost:3000 ..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"cd /d `"$rootDir`" && npm run dev`"" -WorkingDirectory $rootDir

Write-Host "[INFO] Waiting 2 seconds for Frontend Server..." -ForegroundColor Gray
Start-Sleep -Seconds 2

# 5. Open Browser
if (-not $NoBrowser) {
    Write-Host "[3/3] Opening GramVerse AI in your default browser..." -ForegroundColor Green
    Start-Process "http://localhost:3000"
}

Write-Host ""
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "  GramVerse AI is running!" -ForegroundColor Green
Write-Host "  - Frontend UI             : http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend API Docs        : http://localhost:8000/docs" -ForegroundColor White
Write-Host "  - Database Health Check   : http://localhost:8000/health" -ForegroundColor White
Write-Host ""
Write-Host "  To stop both servers anytime, run .\stop.ps1 or double-click stop.bat" -ForegroundColor Yellow
Write-Host "=======================================================================" -ForegroundColor Cyan
