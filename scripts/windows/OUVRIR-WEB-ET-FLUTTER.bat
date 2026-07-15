@echo off
title PetfoodTN - Ouvrir Web + Flutter
echo.
echo  Verification des serveurs...
echo.

netstat -ano | findstr ":3001" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL%==0 (
  echo  [OK] Web :3001
  start http://localhost:3001
) else (
  echo  [!] Web non demarre — lancez: 1-DEMARRER-WEB.bat
  echo      ou: DEMARRER-ET-OUVRIR-WEB-FLUTTER.bat
)

netstat -ano | findstr ":8080" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL%==0 (
  echo  [OK] Flutter :8080
  start http://localhost:8080
) else (
  echo  [!] Flutter non demarre — lancement automatique...
  start "PetfoodTN Flutter" cmd /k "cd /d \"%~dp0\" && call 3-DEMARRER-FLUTTER-WEB.bat"
  timeout /t 5 /nobreak >nul
  start http://localhost:8080
)

echo.
pause
