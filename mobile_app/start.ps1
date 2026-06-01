# Lance PetfoodTN Mobile (Flutter Web)
# Prérequis : backend sur http://localhost:5002

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "🐾 PetfoodTN Mobile" -ForegroundColor Green
Write-Host "Vérification du backend..."
try {
  $null = Invoke-RestMethod -Uri "http://localhost:5002/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"client@petfood.tn","password":"MonChat123!"}' -TimeoutSec 5
  Write-Host "✅ Backend OK (port 5002)" -ForegroundColor Green
} catch {
  Write-Host "⚠️  Backend non détecté sur :5002 — démarrez-le :" -ForegroundColor Yellow
  Write-Host "   cd backend && node server.js"
}

if (-not (Test-Path "build\web\index.html")) {
  Write-Host "📦 Compilation web..."
  flutter build web --release
}

Write-Host "🌐 Application : http://localhost:8080"
Write-Host "   Compte : client@petfood.tn / MonChat123!"
Write-Host "   URL API : http://localhost:5002"
Write-Host ""
flutter run -d chrome --web-port=8080
