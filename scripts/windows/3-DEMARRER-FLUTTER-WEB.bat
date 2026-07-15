@echo off
title PetfoodTN - Flutter Web (8080)
cd /d "%~dp0..\..\mobile_app"
echo.
echo  PetfoodTN Flutter Web
echo  URL : http://localhost:8080
echo  Backend requis : http://localhost:5002
echo  Compte : client@petfood.tn / MonChat123!
echo.

REM Verifier si le port 8080 est deja pris
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL%==0 (
  echo  Flutter deja demarre sur :8080
  start http://localhost:8080
  goto :eof
)

if not exist "build\web\index.html" (
  echo  Compilation Flutter web (1ere fois, ~2-5 min)...
  call flutter build web --release
  if errorlevel 1 (
    echo  ERREUR: flutter build a echoue. Verifiez: flutter doctor
    pause
    exit /b 1
  )
)

echo  Serveur Flutter sur http://localhost:8080
echo  Gardez cette fenetre ouverte.
echo.
start http://localhost:8080
python -m http.server 8080 --directory build\web
if errorlevel 1 (
  echo  Python indisponible — tentative flutter run...
  call flutter run -d chrome --web-port=8080 --release
)
pause
