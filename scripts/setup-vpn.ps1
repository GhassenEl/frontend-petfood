# Configuration VPN WireGuard PetfoodTN
# Usage : powershell -ExecutionPolicy Bypass -File scripts/setup-vpn.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

Write-Host "=== PetfoodTN - Setup VPN WireGuard ===" -ForegroundColor Cyan

$envDocker = Join-Path $root ".env.docker"
$envExample = Join-Path $root ".env.docker.example"
if (-not (Test-Path $envDocker)) {
  Copy-Item $envExample $envDocker
  Write-Host "[OK] .env.docker cree"
} else {
  Write-Host "[--] .env.docker existe deja"
}

$vpnBlock = @"

# VPN WireGuard (docker-compose.vpn.yml)
VPN_SERVER_PORT=51820
VPN_PEERS=3
VPN_INTERNAL_SUBNET=10.13.13.0
# FEEDER_REQUIRE_VPN=true
# VPN_ALLOWED_CIDRS=10.13.13.0/24
"@

$content = Get-Content $envDocker -Raw -ErrorAction SilentlyContinue
if ($null -eq $content -or $content.IndexOf("VPN_SERVER_PORT") -lt 0) {
  Add-Content -Path $envDocker -Value $vpnBlock
  Write-Host "[OK] Variables VPN ajoutees a .env.docker"
}

$configDir = Join-Path $root "vpn\config"
if (-not (Test-Path $configDir)) {
  New-Item -ItemType Directory -Path $configDir -Force | Out-Null
  Write-Host "[OK] Dossier vpn\config pret"
}

$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCmd) {
  Write-Host ""
  Write-Host "[ATTENTION] Docker non installe ou absent du PATH." -ForegroundColor Yellow
  Write-Host "  1. Installez Docker Desktop"
  Write-Host "  2. Relancez : npm run docker:vpn:up"
  Write-Host "  3. Importez vpn\config\peer1\peer1.conf dans WireGuard"
  Write-Host ""
  Write-Host "Configuration projet prete." -ForegroundColor Green
  exit 0
}

Write-Host "[..] Demarrage stack + VPN..."
npm run docker:vpn:up
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "[OK] VPN demarre. Configs clients :" -ForegroundColor Green
Get-ChildItem -Path $configDir -Recurse -Filter "*.conf" -ErrorAction SilentlyContinue | ForEach-Object {
  Write-Host "  -> $($_.FullName)"
}
Write-Host "Frontend : http://localhost:8080  |  API : http://localhost:5002"
