@echo off
title WiFi Human Detect + Forest Fire Predict
cd /d "%~dp0"

start "WiFi Human Detect" cmd /k "cd /d \"%~dp0wifi-human-detect\" && streamlit run app.py --server.port 8510 --server.headless true"
timeout /t 3 /nobreak >nul
start "Forest Fire Predict" cmd /k "cd /d \"%~dp0forest-fire-predict\" && streamlit run app.py --server.port 8511 --server.headless true"
timeout /t 5 /nobreak >nul
start http://localhost:8510
start http://localhost:8511
echo.
echo  WiFi Human Detect : http://localhost:8510
echo  Forest Fire Pred  : http://localhost:8511
echo.
pause
