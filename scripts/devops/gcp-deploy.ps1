#Requires -Version 5.1
<#
.SYNOPSIS
  Déploie PetfoodTN sur Google Cloud Run + Cloud SQL (Paris europe-west9).

.USAGE
  powershell -ExecutionPolicy Bypass -File scripts/devops/gcp-deploy.ps1
  powershell -ExecutionPolicy Bypass -File scripts/devops/gcp-deploy.ps1 -ProjectId mon-projet-gcp
#>
param(
  [string]$ProjectId = $env:GCP_PROJECT_ID,
  [string]$Region = $(if ($env:GCP_REGION) { $env:GCP_REGION } else { 'europe-west9' }),
  [string]$Repo = 'petfoodtn',
  [switch]$SkipSql,
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

function Find-Gcloud {
  $candidates = @(
    (Get-Command gcloud -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source),
    "$env:LOCALAPPDATA\Google\CloudSDK\google-cloud-sdk\bin\gcloud.cmd",
    "$env:ProgramFiles\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd",
    "${env:ProgramFiles(x86)}\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
  ) | Where-Object { $_ -and (Test-Path $_) }
  if (-not $candidates) { return $null }
  return $candidates[0]
}

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg) { Write-Host "  OK  $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  !!  $msg" -ForegroundColor Yellow }

$gcloud = Find-Gcloud
if (-not $gcloud) {
  Write-Host @"

Google Cloud SDK (gcloud) introuvable.

1. Installe : https://cloud.google.com/sdk/docs/install
   ou : winget install Google.CloudSDK
2. Accepte l'invite Administrateur Windows
3. Relance ce script

"@ -ForegroundColor Red
  exit 1
}

Write-Ok "gcloud = $gcloud"

function Gcloud { & $gcloud @args }
function GcloudCapture {
  $out = & $gcloud @args 2>&1 | Out-String
  return $out.Trim()
}

Write-Step "Authentification"
$accounts = GcloudCapture auth list --filter=status:ACTIVE --format="value(account)"
if (-not $accounts) {
  Write-Warn "Aucune session — ouverture du login navigateur…"
  Gcloud auth login
  Gcloud auth application-default login
}

if (-not $ProjectId) {
  $ProjectId = (GcloudCapture config get-value project 2>$null)
}
if (-not $ProjectId -or $ProjectId -eq '(unset)') {
  Write-Host @"

Indique ton Project ID Google Cloud :
  Console : https://console.cloud.google.com/projectcreate

"@
  $ProjectId = Read-Host "GCP_PROJECT_ID"
}
if (-not $ProjectId) { throw "Project ID requis" }

Gcloud config set project $ProjectId | Out-Null
Write-Ok "Projet = $ProjectId | Région = $Region"

Write-Step "Activation des API"
Gcloud services enable `
  run.googleapis.com `
  sqladmin.googleapis.com `
  artifactregistry.googleapis.com `
  cloudbuild.googleapis.com `
  secretmanager.googleapis.com `
  compute.googleapis.com `
  --project $ProjectId

Write-Step "Artifact Registry"
$repoExists = GcloudCapture artifacts repositories describe $Repo --location=$Region --format="value(name)" 2>$null
if (-not $repoExists) {
  Gcloud artifacts repositories create $Repo `
    --repository-format=docker `
    --location=$Region `
    --description="PetfoodTN images"
  Write-Ok "Repo créé : $Repo"
} else {
  Write-Ok "Repo existant : $Repo"
}
Gcloud auth configure-docker "$Region-docker.pkg.dev" --quiet

$backendImage = "$Region-docker.pkg.dev/$ProjectId/$Repo/backend:latest"
$mlImage = "$Region-docker.pkg.dev/$ProjectId/$Repo/ml:latest"
$feImage = "$Region-docker.pkg.dev/$ProjectId/$Repo/frontend:latest"

# Secrets
$jwtSecret = -join ((48..57 + 65..90 + 97..122) | Get-Random -Count 40 | ForEach-Object { [char]$_ })
$dbPass = -join ((48..57 + 65..90 + 97..122) | Get-Random -Count 24 | ForEach-Object { [char]$_ })
$sqlInstance = "petfoodtn-db"
$dbName = "petfood"
$dbUser = "petfood"

if (-not $SkipSql) {
  Write-Step "Cloud SQL PostgreSQL ($sqlInstance)"
  $sqlExists = GcloudCapture sql instances describe $sqlInstance --format="value(name)" 2>$null
  if (-not $sqlExists) {
    Write-Warn "Création Cloud SQL (2–5 min)…"
    Gcloud sql instances create $sqlInstance `
      --database-version=POSTGRES_16 `
      --tier=db-f1-micro `
      --region=$Region `
      --storage-size=10GB `
      --storage-auto-increase `
      --root-password=$dbPass `
      --quiet
    Gcloud sql databases create $dbName --instance=$sqlInstance
    Gcloud sql users create $dbUser --instance=$sqlInstance --password=$dbPass
    Write-Ok "Cloud SQL prêt"
  } else {
    Write-Ok "Cloud SQL déjà présent — mot de passe DB inchangé (utilise Secret Manager)"
    $existing = GcloudCapture secrets versions access latest --secret=petfoodtn-db-password 2>$null
    if ($existing) { $dbPass = $existing }
  }

  # Store secrets
  foreach ($pair in @(
    @{ Name = 'petfoodtn-db-password'; Value = $dbPass },
    @{ Name = 'petfoodtn-jwt-secret'; Value = $jwtSecret }
  )) {
    $secExists = GcloudCapture secrets describe $pair.Name --format="value(name)" 2>$null
    if (-not $secExists) {
      $pair.Value | Gcloud secrets create $pair.Name --data-file=-
    } else {
      $pair.Value | Gcloud secrets versions add $pair.Name --data-file=-
    }
  }
}

$connectionName = "$ProjectId`:$Region`:$sqlInstance"
# Prisma Cloud SQL unix socket
$databaseUrl = "postgresql://${dbUser}:${dbPass}@localhost/${dbName}?host=/cloudsql/${connectionName}"

if (-not $SkipBuild) {
  Write-Step "Build & push images Docker"
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker Desktop doit être démarré pour builder les images."
  }
  docker build -t $backendImage "$Root\backend"
  docker push $backendImage
  docker build -t $mlImage "$Root\fastapi_service"
  docker push $mlImage
}

Write-Step "Deploy Cloud Run — ML"
Gcloud run deploy petfoodtn-ml `
  --image=$mlImage `
  --region=$Region `
  --platform=managed `
  --allow-unauthenticated `
  --port=8000 `
  --memory=1Gi `
  --cpu=1 `
  --min-instances=0 `
  --max-instances=3 `
  --set-env-vars="TZ=Africa/Tunis" `
  --quiet

$mlUrl = GcloudCapture run services describe petfoodtn-ml --region=$Region --format="value(status.url)"
Write-Ok "ML = $mlUrl"

Write-Step "Deploy Cloud Run — API"
Gcloud run deploy petfoodtn-api `
  --image=$backendImage `
  --region=$Region `
  --platform=managed `
  --allow-unauthenticated `
  --port=5002 `
  --memory=1Gi `
  --cpu=1 `
  --min-instances=0 `
  --max-instances=5 `
  --add-cloudsql-instances=$connectionName `
  --set-env-vars="NODE_ENV=production,DEMO_MODE=false,ALLOW_DEMO_LOGIN=false,RUN_SEED=true,PORT=5002,FASTAPI_URL=$mlUrl,CORS_ORIGINS=*" `
  --set-secrets="JWT_SECRET=petfoodtn-jwt-secret:latest,DATABASE_URL=petfoodtn-database-url:latest" `
  --quiet 2>$null

# DATABASE_URL as secret
$dbUrlExists = GcloudCapture secrets describe petfoodtn-database-url --format="value(name)" 2>$null
if (-not $dbUrlExists) {
  $databaseUrl | Gcloud secrets create petfoodtn-database-url --data-file=-
} else {
  $databaseUrl | Gcloud secrets versions add petfoodtn-database-url --data-file=-
}

# Redeploy API with secrets correctly bound
Gcloud run deploy petfoodtn-api `
  --image=$backendImage `
  --region=$Region `
  --platform=managed `
  --allow-unauthenticated `
  --port=5002 `
  --memory=1Gi `
  --cpu=1 `
  --add-cloudsql-instances=$connectionName `
  --set-env-vars="NODE_ENV=production,DEMO_MODE=false,ALLOW_DEMO_LOGIN=false,RUN_SEED=true,PORT=5002,FASTAPI_URL=$mlUrl,CORS_ORIGINS=*,STRIPE_MOCK=1" `
  --update-secrets="JWT_SECRET=petfoodtn-jwt-secret:latest,DATABASE_URL=petfoodtn-database-url:latest" `
  --quiet

$apiUrl = GcloudCapture run services describe petfoodtn-api --region=$Region --format="value(status.url)"
Write-Ok "API = $apiUrl"

Write-Step "Build & deploy Frontend"
$feApiBase = "$apiUrl/api"
docker build `
  -f "$Root\Dockerfile.frontend.cloudrun" `
  --build-arg "VITE_API_BASE=$feApiBase" `
  --build-arg "VITE_SOCKET_URL=$apiUrl" `
  --build-arg "VITE_STRICT_LIVE=true" `
  -t $feImage `
  $Root
docker push $feImage

Gcloud run deploy petfoodtn-web `
  --image=$feImage `
  --region=$Region `
  --platform=managed `
  --allow-unauthenticated `
  --port=8080 `
  --memory=256Mi `
  --cpu=1 `
  --min-instances=0 `
  --max-instances=5 `
  --quiet

$webUrl = GcloudCapture run services describe petfoodtn-web --region=$Region --format="value(status.url)"

# Update CORS to real frontend URL
Gcloud run services update petfoodtn-api `
  --region=$Region `
  --update-env-vars="CORS_ORIGINS=$webUrl,FRONTEND_URL=$webUrl" `
  --quiet

Write-Host @"

========================================
  PetfoodTN — Google Cloud déployé
========================================
  Frontend : $webUrl
  API      : $apiUrl
  ML       : $mlUrl
  Région   : $Region
  Projet   : $ProjectId
========================================

Ouvre le Frontend dans le navigateur.
Astuce : Cloud Run scale à 0 → 1er chargement peut prendre ~10–30s.

"@ -ForegroundColor Green

# Persist URLs locally (non-secret)
@"
GCP_PROJECT_ID=$ProjectId
GCP_REGION=$Region
UPTIME_FRONTEND_URL=$webUrl
UPTIME_BACKEND_URL=$apiUrl
UPTIME_ML_URL=$mlUrl
"@ | Set-Content -Path (Join-Path $Root '.env.gcp') -Encoding UTF8
Write-Ok "URLs sauvegardées dans .env.gcp"
