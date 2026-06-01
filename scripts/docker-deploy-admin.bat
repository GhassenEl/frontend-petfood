@echo off
title PetfoodTN Docker Deploy
cd /d "%~dp0.."
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0docker-deploy.ps1"
if errorlevel 1 pause
