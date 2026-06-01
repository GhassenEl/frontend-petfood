#Requires -Version 5.1
param(
  [switch]$SkipElevate
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $ProjectRoot

function Test-Admin {
  $id = [Security.Principal.WindowsIdentity]::GetCurrent()
  $p = New-Object Security.Principal.WindowsPrincipal($id)
  return $p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Find-Docker {
  $cmd = Get-Command docker -ErrorAction SilentlyContinue
  if ($cmd -and $cmd.Source -and (Test-Path $cmd.Source)) {
    return $cmd.Source
  }
  $defaultPath = 'C:\Program Files\Docker\Docker\resources\bin\docker.exe'
  if (Test-Path $defaultPath) { return $defaultPath }
  return $null
}

function Test-DockerReady {
  $docker = Find-Docker
  if (-not $docker) { return $null }
  & $docker info 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { return $docker }
  return $null
}

function Request-AdminElevation {
  Write-Host ""
  Write-Host "Docker n est pas installe. Elevation administrateur requise..." -ForegroundColor Yellow
  Write-Host "Une fenetre UAC va s ouvrir : cliquez Oui." -ForegroundColor Yellow
  Write-Host ""
  $scriptPath = $MyInvocation.MyCommand.Path
  Start-Process powershell.exe -Verb RunAs -ArgumentList @(
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', "`"$scriptPath`"",
    '-SkipElevate'
  )
  exit 0
}

function Ensure-EnvDocker {
  $envFile = Join-Path $ProjectRoot '.env.docker'
  if (-not (Test-Path $envFile)) {
    Copy-Item (Join-Path $ProjectRoot '.env.docker.example') $envFile
  }
  $content = Get-Content $envFile -Raw
  if ($content -match 'change-me-super-secret-jwt') {
    $jwt = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
    $content = $content -replace 'change-me-super-secret-jwt-key-at-least-32-chars', $jwt
  }
  if ($content -match 'change-me-strong-password') {
    $pg = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 24 | ForEach-Object { [char]$_ })
    $content = $content -replace 'change-me-strong-password', $pg
  }
  Set-Content -Path $envFile -Value $content
  Write-Host "OK .env.docker pret" -ForegroundColor Green
}

function Ensure-Wsl {
  $wslRaw = wsl --status 2>&1 | Out-String
  if ($wslRaw -match "n'est pas install" -or $wslRaw -match 'is not installed') {
    Write-Host "Installation WSL (redemarrage Windows possible)..." -ForegroundColor Cyan
    wsl --install --no-distribution
    Write-Host ""
    Write-Host "IMPORTANT : redemarrez Windows, ouvrez Docker Desktop, puis relancez :" -ForegroundColor Yellow
    Write-Host "  .\scripts\docker-deploy.ps1"
    exit 0
  }
}

function Ensure-DockerDesktop {
  $ready = Test-DockerReady
  if ($ready) { return $ready }

  $docker = Find-Docker
  if ($docker) {
    Write-Host "Docker detecte mais pas demarre. Lancement Docker Desktop..." -ForegroundColor Cyan
    $desktop = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
    if (Test-Path $desktop) { Start-Process $desktop }
    $deadline = (Get-Date).AddMinutes(3)
    do {
      Start-Sleep -Seconds 5
      $ready = Test-DockerReady
      if ($ready) { return $ready }
    } while ((Get-Date) -lt $deadline)
    throw "Docker Desktop ne repond pas. Ouvrez-le manuellement puis relancez le script."
  }

  if (-not (Test-Admin)) {
    Request-AdminElevation
  }

  Write-Host "Installation Docker Desktop via winget..." -ForegroundColor Cyan
  winget install -e --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
  $desktop = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
  if (Test-Path $desktop) { Start-Process $desktop }

  Write-Host "Attente demarrage Docker (jusqu a 3 min)..." -ForegroundColor Cyan
  $deadline = (Get-Date).AddMinutes(3)
  do {
    Start-Sleep -Seconds 5
    $ready = Test-DockerReady
    if ($ready) { return $ready }
  } while ((Get-Date) -lt $deadline)

  Write-Host ""
  Write-Host "Docker installe. Si besoin : redemarrez le PC, lancez Docker Desktop, puis :" -ForegroundColor Yellow
  Write-Host "  .\scripts\docker-deploy.ps1"
  exit 0
}

function Deploy-Stack {
  param([string]$DockerExe)
  Write-Host "Build et demarrage des conteneurs..." -ForegroundColor Cyan
  & $DockerExe compose --env-file .env.docker down 2>$null
  & $DockerExe compose --env-file .env.docker up -d --build
  if ($LASTEXITCODE -ne 0) { throw "docker compose up a echoue" }

  Write-Host ""
  Write-Host "Deploiement termine !" -ForegroundColor Green
  Write-Host "  Frontend : http://localhost:8080"
  Write-Host "  Backend  : http://localhost:5002/health"
  Write-Host "  Admin    : admin@petfood.tn / PetfoodTN2024!"
  Write-Host ""
  Write-Host "  Logs : docker compose --env-file .env.docker logs -f"
}

Write-Host "PetfoodTN - deploiement Docker" -ForegroundColor Yellow

$dockerReady = Test-DockerReady
if ($dockerReady) {
  Write-Host "Docker OK — deploiement sans droits admin." -ForegroundColor Green
  Ensure-EnvDocker
  Deploy-Stack -DockerExe $dockerReady
  exit 0
}

# Docker absent ou pas pret — installation (admin requis)
if (-not (Test-Admin) -and -not $SkipElevate) {
  Request-AdminElevation
}

Ensure-EnvDocker
Ensure-Wsl
$dockerExe = Ensure-DockerDesktop
Deploy-Stack -DockerExe $dockerExe
