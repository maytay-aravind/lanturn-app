@echo off
title LanTURN - Dev Server
color 0A
echo.
echo  ================================================
echo     LanTURN Development Server
echo  ================================================
echo.
echo  Starting both Backend and Frontend servers...
echo.
echo  After startup, open this in your browser:
echo.
echo     Frontend:  http://localhost:5173
echo     Admin Login:  http://localhost:5173/admin-login
echo     Backend API:  http://localhost:4001
echo.
echo  Press Ctrl+C in each window to stop the servers.
echo  ================================================
echo.

:: Start Backend in a new terminal window
start "LanTURN Backend" cmd /k "cd /d "%~dp0backend" && echo [Backend] Starting server on port 4001... && npm run dev"

:: Wait 2 seconds so the windows don't overlap
timeout /t 2 /nobreak >nul

:: Start Frontend in a new terminal window
start "LanTURN Frontend" cmd /k "cd /d "%~dp0frontend" && echo [Frontend] Starting dev server on port 5173... && npm run dev"

echo.
echo  Both servers are starting in separate windows!
echo.
echo  Once ready, open:  http://localhost:5173
echo.
pause
