# GramVerse AI — PowerShell Shutdown Script
Write-Host "=======================================================================" -ForegroundColor Red
Write-Host "                GRAMVERSE AI - SHUTDOWN SCRIPT                         " -ForegroundColor Red
Write-Host "=======================================================================" -ForegroundColor Red
Write-Host ""
Write-Host "Stopping servers on ports 8000 and 3000..." -ForegroundColor Yellow

$ports = @(8000, 3000)
foreach ($p in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($conns) {
        foreach ($c in $conns) {
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped process on port $p (PID $($c.OwningProcess))" -ForegroundColor Green
        }
    } else {
        Write-Host "Port $p is already clear" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "GramVerse AI servers stopped cleanly." -ForegroundColor Green
