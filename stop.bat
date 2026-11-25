@echo off
title GramVerse AI - Shutdown Script
color 0C

echo =======================================================================
echo                 GRAMVERSE AI - SHUTDOWN SCRIPT
echo =======================================================================
echo.
echo Stopping backend server on port 8000 and frontend server on port 3000...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ports = @(8000, 3000); foreach ($p in $ports) { $connections = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue; if ($connections) { foreach ($c in $connections) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Host ('Stopped process on port ' + $p) } } else { Write-Host ('Port ' + $p + ' is clear') } }"

echo.
echo GramVerse AI servers stopped cleanly.
echo.
pause
