@echo off
title PetfoodTN - Tout demarrer
cd /d "%~dp0..\.."
echo.
echo  PetfoodTN - Lancement Web + Backend + ML
echo.
if not exist "fastapi_service\.venv\Scripts\python.exe" (
  echo  Installation ML (1ere fois)...
  cd fastapi_service
  python -m venv .venv
  .venv\Scripts\pip install -r requirements.txt
  cd ..
)
start "PetfoodTN Web+API" cmd /k "cd /d \"%CD%\" && npm run dev"
timeout /t 8 /nobreak >nul
start "PetfoodTN ML" cmd /k "cd /d \"%CD%\" && npm run dev:ml"
timeout /t 5 /nobreak >nul
start "" "%CD%\ACCES_PLATEFORME.html"
echo.
echo  Fenetres ouvertes :
echo    - Web     http://localhost:3001
echo    - Backend http://localhost:5002
echo    - ML      http://localhost:8000
echo.
echo  Flutter (optionnel) : scripts\windows\3-DEMARRER-FLUTTER-WEB.bat
pause
