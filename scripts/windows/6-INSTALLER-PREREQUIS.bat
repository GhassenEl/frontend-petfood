@echo off
title PetfoodTN - Installation (1ere fois)
cd /d "%~dp0..\.."
echo.
echo  === Installation PetfoodTN ===
echo.
echo [1/4] npm install (frontend)...
call npm install
echo.
echo [2/4] npm install (backend)...
cd backend
call npm install
cd ..
echo.
echo [3/4] Python venv + pip (FastAPI ML)...
cd fastapi_service
if not exist ".venv\Scripts\python.exe" python -m venv .venv
call .venv\Scripts\pip install -r requirements.txt
cd ..
echo.
echo [4/4] flutter pub get (mobile)...
cd mobile_app
call flutter pub get
cd ..
echo.
echo  === Termine ===
echo  Lancez : scripts\windows\4-DEMARRER-TOUT.bat
echo  Liens  : ACCES_PLATEFORME.html
pause
