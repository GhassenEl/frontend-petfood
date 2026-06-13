#Requires -Version 5.1
<#
.SYNOPSIS
  Lance localement les vérifications CI (build + tests backend ML).

.EXAMPLE
  .\scripts\devops\ci-local.ps1
  .\scripts\devops\ci-local.ps1 -SkipBuild
#>
param(
  [switch]$SkipBuild,
  [switch]$WithMl
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $Root

function Step($msg) {
  Write-Host ""
  Write-Host "▶ $msg" -ForegroundColor Cyan
}

$failed = $false

try {
  if (-not $SkipBuild) {
    Step 'Frontend — npm run build'
    npm run build
    if ($LASTEXITCODE -ne 0) { throw 'Build frontend échoué' }
  }

  Step 'Backend — npm run test:ml'
  Push-Location backend
  $env:DATABASE_URL = 'file:./dev.db'
  $env:JWT_SECRET = 'local-ci-secret-min-32-characters-long'
  $env:DEMO_MODE = 'true'
  npx prisma generate | Out-Null
  npm run test:ml
  if ($LASTEXITCODE -ne 0) { throw 'Tests ML backend échoués' }
  Pop-Location

  if ($WithMl) {
    Step 'FastAPI ML — smoke /health'
    Push-Location fastapi_service
    $job = Start-Job { Set-Location $using:Root/fastapi_service; python -m uvicorn app.main:app --host 127.0.0.1 --port 8765 }
    Start-Sleep -Seconds 4
    try {
      $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8765/health' -UseBasicParsing -TimeoutSec 8
      if ($r.StatusCode -ge 400) { throw "ML health HTTP $($r.StatusCode)" }
      Write-Host '  OK FastAPI /health' -ForegroundColor Green
    } finally {
      Stop-Job $job -ErrorAction SilentlyContinue
      Remove-Job $job -Force -ErrorAction SilentlyContinue
    }
    Pop-Location
  }

  Step 'Docker — compose build (dry)'
  docker compose --env-file .env.docker.example build
  if ($LASTEXITCODE -ne 0) { throw 'docker compose build échoué' }

  Write-Host ""
  Write-Host "✅ CI locale réussie" -ForegroundColor Green
} catch {
  $failed = $true
  Write-Host ""
  Write-Host "❌ CI locale échouée : $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
