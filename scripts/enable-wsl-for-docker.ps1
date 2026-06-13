#Requires -RunAsAdministrator
# Active WSL2 + Plateforme VM (prerequis Docker Desktop / VPN WireGuard)
# Clic droit > Executer avec PowerShell (admin), ou :
#   powershell -ExecutionPolicy Bypass -File scripts/enable-wsl-for-docker.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Activation WSL2 pour Docker / VPN ===" -ForegroundColor Cyan

function Enable-DismFeature($name) {
  Write-Host "[..] $name"
  $r = dism.exe /online /enable-feature /featurename:$name /all /norestart
  if ($LASTEXITCODE -ne 0) { throw "dism a echoue pour $name (code $LASTEXITCODE)" }
}

Enable-DismFeature "VirtualMachinePlatform"
Enable-DismFeature "Microsoft-Windows-Subsystem-Linux"

Write-Host "[..] wsl --install --no-distribution"
wsl --install --no-distribution 2>&1 | ForEach-Object { Write-Host $_ }

Write-Host ""
Write-Host "[OK] Fonctionnalites activees." -ForegroundColor Green
Write-Host "  1. Redemarrez Windows si demande."
Write-Host "  2. Ouvrez Docker Desktop (attendez Running)."
Write-Host "  3. Dans frontend Lido : powershell -File scripts/setup-vpn.ps1"
Write-Host ""
Write-Host "Si WSL signale encore la virtualisation : activez Intel VT-x / AMD-V dans le BIOS."
Write-Host "https://aka.ms/enablevirtualization"
