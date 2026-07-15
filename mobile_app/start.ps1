# Lance PetfoodTN Mobile (Flutter Web) — mode rapide via build/web
# Prérequis : backend sur http://localhost:5002

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "PetfoodTN Mobile (Flutter Web)" -ForegroundColor Green

try {
  $null = Invoke-RestMethod -Uri "http://localhost:5002/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"client@petfood.tn","password":"MonChat123!"}' -TimeoutSec 5
  Write-Host "Backend OK (port 5002)" -ForegroundColor Green
} catch {
  Write-Host "Backend non detecte sur :5002 — demarrez: npm run dev" -ForegroundColor Yellow
}

$listening = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
if ($listening) {
  Write-Host "Deja demarre: http://localhost:8080" -ForegroundColor Cyan
  Start-Process "http://localhost:8080"
  exit 0
}

if (-not (Test-Path "build\web\index.html")) {
  Write-Host "Compilation web (1ere fois)..." -ForegroundColor Yellow
  flutter build web --release
}

Write-Host "Application : http://localhost:8080" -ForegroundColor Cyan
Write-Host "Compte : client@petfood.tn / MonChat123!"
Write-Host "Gardez ce terminal ouvert." -ForegroundColor Yellow
Start-Process "http://localhost:8080"
python -m http.server 8080 --directory build\web
