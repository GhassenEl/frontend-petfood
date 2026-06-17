# Sauvegarde nocturne PetfoodTN (Windows / dev local)
param(
  [string]$DeployPath = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
  [string]$BackupRoot = ""
)

$ErrorActionPreference = "Stop"
if (-not $BackupRoot) { $BackupRoot = Join-Path $DeployPath "backups" }
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$dest = Join-Path $BackupRoot $stamp
New-Item -ItemType Directory -Force -Path $dest | Out-Null

Write-Host "[$(Get-Date -Format o)] Sauvegarde → $dest"

$envFile = Join-Path $DeployPath ".env.docker"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
      Set-Item -Path "env:$($matches[1].Trim())" -Value $matches[2].Trim()
    }
  }
}

$pgUser = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "petfood" }
$pgDb = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "petfood" }

try {
  docker compose --env-file $envFile exec -T db pg_dump -U $pgUser $pgDb |
    gzip > (Join-Path $dest "postgres.sql.gz")
  Write-Host "  OK PostgreSQL"
} catch {
  Write-Host "  WARN PostgreSQL — $($_.Exception.Message)"
}

$mlPath = Join-Path $DeployPath "fastapi_service\models"
if (Test-Path $mlPath) {
  Compress-Archive -Path (Join-Path $mlPath "*") -DestinationPath (Join-Path $dest "ml-models.zip") -Force
  Write-Host "  OK Modèles IA"
}

Get-ChildItem $BackupRoot -Directory | Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-14) } |
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Sauvegarde terminée."
