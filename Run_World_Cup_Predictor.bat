@echo off
echo ===================================================
echo     World Cup 2026 ML Predictor - Startup Script
echo ===================================================
echo.

echo Starting Node.js ML Backend API...
cd backend
start "WC2026 Backend" cmd /c "node server.js"

echo.
echo Starting React Frontend...
cd ../frontend
start "WC2026 Frontend" cmd /c "npm run dev"

echo.
echo Waiting for servers to initialize...
timeout /t 4 /nobreak > nul

echo.
echo Launching Application in your Web Browser...
start http://localhost:5173

echo.
echo Startup complete! You can close this black window.
exit
