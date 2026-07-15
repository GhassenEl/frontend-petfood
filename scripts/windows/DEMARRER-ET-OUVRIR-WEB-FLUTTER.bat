@echo off
title PetfoodTN - Demarrer + Ouvrir Web et Flutter
cd /d "%~dp0..\.."
echo.
echo  === PetfoodTN : Web + Flutter ===
echo.

REM Web + Backend
netstat -ano | findstr ":3001" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL%==0 (
  echo  [OK] Web deja sur :3001
) else (
  echo  Demarrage Web (3001) + Backend (5002)...
  start "PetfoodTN Web" cmd /k "cd /d \"%CD%\" && npm run dev"
  timeout /t 12 /nobreak >nul
)

REM Flutter
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL%==0 (
  echo  [OK] Flutter deja sur :8080
) else (
  echo  Demarrage Flutter Web (8080)...
  start "PetfoodTN Flutter" cmd /k "cd /d \"%~dp0\" && call 3-DEMARRER-FLUTTER-WEB.bat"
  timeout /t 8 /nobreak >nul
)

echo.
echo  Ouverture navigateur...
start http://localhost:3001
start http://localhost:8080
echo.
echo  Web     : http://localhost:3001
echo  Flutter : http://localhost:8080
echo.
pause
