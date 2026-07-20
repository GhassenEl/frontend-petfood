#Requires -Version 5.1
<#
.SYNOPSIS
  Déploiement PetfoodTN sur réseau interne (LAN Wi-Fi).

.USAGE
  powershell -ExecutionPolicy Bypass -File scripts/devops/deploy-lan.ps1
#>
param(
  [string]$LanIp = '',
  [int]$FrontendPort = 3000,
  [int]$BackendPort = 5002
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

if (-not $LanIp) {
  $LanIp = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.InterfaceAlias -match 'Wi-Fi|Ethernet' -and $_.IPAddress -notmatch '^127\.' } |
    Select-Object -First 1 -ExpandProperty IPAddress)
}
if (-not $LanIp) { throw "IP LAN introuvable" }

Write-Host "==> LAN IP = $LanIp" -ForegroundColor Cyan

# Firewall
foreach ($rule in @(
  @{ Name = 'PetfoodTN-Frontend'; Port = $FrontendPort },
  @{ Name = 'PetfoodTN-API'; Port = $BackendPort }
)) {
  netsh advfirewall firewall delete rule name=$rule.Name 2>$null | Out-Null
  netsh advfirewall firewall add rule name=$rule.Name dir=in action=allow protocol=TCP localport=$rule.Port | Out-Null
  Write-Host "  Firewall OK : $($rule.Name) :$($rule.Port)"
}

Write-Host @"

========================================
  PetfoodTN — réseau interne
========================================
  Frontend : http://${LanIp}:${FrontendPort}
  API      : http://${LanIp}:${BackendPort}/health
  Local    : http://localhost:${FrontendPort}
========================================
  Sur un autre PC / téléphone (même Wi-Fi) :
  ouvrir http://${LanIp}:${FrontendPort}
========================================

"@ -ForegroundColor Green
