#Requires -Version 5.1
<#
.SYNOPSIS
  Assistant configuration Render pour PetfoodTN (Blueprint unique).

.EXAMPLE
  .\scripts\devops\setup-render.ps1
#>
$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "PetfoodTN - Configuration Render" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "ETAPE 0 - Images GHCR" -ForegroundColor Cyan
Write-Host "  GitHub -> GhassenEl -> Packages"
Write-Host "  Rendre PUBLIC : petfoodtn-backend, petfoodtn-ml"
Write-Host "  (ou credential Render petfoodtn-ghcr + creds dans render.yaml)"
Write-Host ""

Write-Host "ETAPE 1 - Blueprint unique" -ForegroundColor Cyan
Write-Host "  https://dashboard.render.com/blueprints/new"
Write-Host "  Repo : GhassenEl/frontend-petfood"
Write-Host "  Fichier : render.yaml"
Write-Host "  -> Apply (cree db + api + ml + web)"
Write-Host ""

Write-Host "ETAPE 2 - Deploy Hooks GitHub" -ForegroundColor Cyan
Write-Host "  Avec RENDER_API_KEY :"
Write-Host "    node scripts/devops/render-provision.mjs hooks"
Write-Host ""
Write-Host "  Secrets GitHub (frontend-petfood -> Settings -> Secrets) :"
Write-Host "  RENDER_DEPLOY_HOOK_FRONTEND = Deploy Hook petfoodtn-web"
Write-Host "  RENDER_DEPLOY_HOOK_BACKEND  = Deploy Hook petfoodtn-api"
Write-Host "  RENDER_DEPLOY_HOOK_ML       = Deploy Hook petfoodtn-ml"
Write-Host ""
Write-Host "  UPTIME_FRONTEND_URL = https://petfoodtn-web.onrender.com"
Write-Host "  UPTIME_BACKEND_URL  = https://petfoodtn-api.onrender.com"
Write-Host "  UPTIME_ML_URL       = https://petfoodtn-ml.onrender.com"
Write-Host ""

Write-Host "ETAPE 3 - Environnement GitHub" -ForegroundColor Cyan
Write-Host "  Settings -> Environments -> New -> nom : production"
Write-Host ""

Write-Host "ETAPE 4 - Verification" -ForegroundColor Cyan
Write-Host "  node scripts/devops/render-provision.mjs health"
Write-Host "  curl https://petfoodtn-api.onrender.com/health"
Write-Host "  Ouvrir https://petfoodtn-web.onrender.com"
Write-Host ""
Write-Host "Guide complet : docs/RENDER-SETUP.md" -ForegroundColor DarkGray
Write-Host ""
