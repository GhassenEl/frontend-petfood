#Requires -Version 5.1
<#
.SYNOPSIS
  Assistant configuration Render pour PetfoodTN.

.EXAMPLE
  .\scripts\devops\setup-render.ps1
#>
$ErrorActionPreference = 'Stop'

function New-RandomSecret([int]$Length = 48) {
  -join ((48..57) + (65..90) + (97..122) | Get-Random -Count $Length | ForEach-Object { [char]$_ })
}

Write-Host ""
Write-Host "PetfoodTN - Configuration Render" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""

$jwt = New-RandomSecret 48

Write-Host "ETAPE 1 - Blueprint frontend" -ForegroundColor Cyan
Write-Host "  Render Dashboard -> New -> Blueprint"
Write-Host "  Repo : GhassenEl/frontend-petfood"
Write-Host "  Fichier : render.yaml (a la racine)"
Write-Host ""

Write-Host "ETAPE 2 - Blueprint backend" -ForegroundColor Cyan
Write-Host "  Copier docs/render-backend.yaml -> render.yaml dans backend-petfood"
Write-Host "  Commit + push backend-petfood"
Write-Host "  Render -> New -> Blueprint -> GhassenEl/backend-petfood"
Write-Host ""

Write-Host "ETAPE 3 - Variables Render (copier-coller)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  petfoodtn-api :" -ForegroundColor Green
Write-Host "    JWT_SECRET=$jwt"
Write-Host "    CORS_ORIGINS=https://petfoodtn-web.onrender.com"
Write-Host "    FASTAPI_URL=https://petfoodtn-ml.onrender.com"
Write-Host "    DEMO_MODE=true"
Write-Host "    RUN_SEED=true"
Write-Host ""
Write-Host "  petfoodtn-web :" -ForegroundColor Green
Write-Host "    VITE_API_BASE=https://petfoodtn-api.onrender.com/api"
Write-Host "    VITE_SOCKET_URL=https://petfoodtn-api.onrender.com"
Write-Host "    NODE_VERSION=20"
Write-Host ""

Write-Host "ETAPE 4 - Secrets GitHub (frontend-petfood -> Settings -> Secrets)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  RENDER_DEPLOY_HOOK_FRONTEND = Deploy Hook petfoodtn-web"
Write-Host "  RENDER_DEPLOY_HOOK_BACKEND  = Deploy Hook petfoodtn-api"
Write-Host "  RENDER_DEPLOY_HOOK_ML       = Deploy Hook petfoodtn-ml"
Write-Host ""
Write-Host "  UPTIME_FRONTEND_URL = https://petfoodtn-web.onrender.com"
Write-Host "  UPTIME_BACKEND_URL  = https://petfoodtn-api.onrender.com"
Write-Host "  UPTIME_ML_URL       = https://petfoodtn-ml.onrender.com"
Write-Host "  VITE_SENTRY_DSN     = optionnel (sentry.io)"
Write-Host ""

Write-Host "ETAPE 5 - Environnement GitHub" -ForegroundColor Cyan
Write-Host "  Settings -> Environments -> New -> nom : production"
Write-Host ""

Write-Host "ETAPE 6 - Verification" -ForegroundColor Cyan
Write-Host "  curl https://petfoodtn-api.onrender.com/health"
Write-Host "  curl https://petfoodtn-ml.onrender.com/health"
Write-Host "  Ouvrir https://petfoodtn-web.onrender.com"
Write-Host ""
Write-Host "Guide complet : docs/RENDER-SETUP.md" -ForegroundColor DarkGray
Write-Host ""
Write-Host "JWT_SECRET genere ci-dessus - conserve-le en lieu sur." -ForegroundColor Green
Write-Host ""
