# Démarre l'app Flutter web (mode release, plus rapide qu'en debug)
Set-Location $PSScriptRoot
Write-Host "Compilation et démarrage sur http://127.0.0.1:8090 ..." -ForegroundColor Cyan
Write-Host "Gardez ce terminal ouvert. Ouvrez le lien dans Chrome." -ForegroundColor Yellow
flutter run -d web-server --web-port 8090 --web-hostname 127.0.0.1 --release
