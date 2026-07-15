@echo off
echo Ouverture des liens PetfoodTN...
start http://localhost:3001
start http://localhost:3001/jury-demo
start http://localhost:3001/login
start http://localhost:5002/api/health
start http://localhost:8000/docs
start http://localhost:8080
start "" "%~dp0..\..\ACCES_PLATEFORME.html"
start "" "%~dp0..\..\docs\rapport\PETFOODTN-BOARD.html"
