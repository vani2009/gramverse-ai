@echo off
title GramVerse AI - One-Click Launcher
color 0A

echo =======================================================================
echo                 GRAMVERSE AI - ONE-CLICK LAUNCHER
echo      Rural Governance, GIS Mapping, Offline Sync ^& Village Cloud
echo =======================================================================
echo.

cd /d "%~dp0"

REM 1. Verify Backend Virtual Environment
if not exist "backend\venv\Scripts\python.exe" (
    echo [INFO] Python virtual environment not found. Setting up backend\venv...
    python -m venv backend\venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment. Ensure Python is installed.
        pause
        exit /b 1
    )
    echo [INFO] Installing backend dependencies...
    backend\venv\Scripts\pip.exe install -r backend\requirements.txt
)

REM 2. Verify Node Modules for Frontend
if not exist "node_modules\" (
    echo [INFO] Node modules not found. Running npm install...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed. Ensure Node.js is installed.
        pause
        exit /b 1
    )
)

echo [1/3] Starting FastAPI Backend on http://localhost:8000 ...
start "GramVerse AI - Backend Server" cmd /k "cd /d "%~dp0backend" && venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000"

echo [INFO] Waiting for Backend ^& Database initialization...
timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend Dev Server on http://localhost:3000 ...
start "GramVerse AI - Frontend UI" cmd /k "cd /d "%~dp0" && npm run dev"

echo [INFO] Waiting for Frontend Server to stand up...
timeout /t 3 /nobreak >nul

echo [3/3] Opening GramVerse AI in your default web browser...
start http://localhost:3000

echo.
echo =======================================================================
echo   GramVerse AI is running!
echo.
echo   - Citizen / Panchayat / Admin UI : http://localhost:3000
echo   - Backend Swagger API Docs       : http://localhost:8000/docs
echo   - Database Health Check          : http://localhost:8000/health
echo.
echo   To stop both servers anytime, simply double-click "stop.bat"
echo =======================================================================
echo.
pause
