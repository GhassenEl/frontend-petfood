@echo off
title PetfoodTN - FastAPI ML (8000)
cd /d "%~dp0..\.."
echo.
echo  PetfoodTN - FastAPI ML
echo  URL : http://localhost:8000
echo  Docs: http://localhost:8000/docs
echo.
if not exist "fastapi_service\.venv\Scripts\python.exe" (
  echo  Creation environnement Python...
  cd fastapi_service
  python -m venv .venv
  .venv\Scripts\pip install -r requirements.txt
  cd ..
)
npm run dev:ml
pause
