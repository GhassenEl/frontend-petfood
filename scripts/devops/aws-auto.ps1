#Requires -Version 5.1
<#
.SYNOPSIS
  Déploiement AWS PetfoodTN — automatisation maximale.

  Ce script installe les outils, génère les secrets, lance Terraform,
  configure GitHub Actions et déclenche le premier déploiement ECR.

  LIMITES (impossible à automatiser) :
  - Création compte AWS (carte bancaire + téléphone) → ouvre le navigateur
  - gh auth login (OAuth GitHub) → une seule fois si pas connecté

  Usage :
    powershell -ExecutionPolicy Bypass -File scripts/devops/aws-auto.ps1
    powershell -ExecutionPolicy Bypass -File scripts/devops/aws-auto.ps1 -SkipInstall
    powershell -ExecutionPolicy Bypass -File scripts/devops/aws-auto.ps1 -AwsKeyId AKIA... -AwsSecretKey ...
#>
param(
  [switch]$SkipInstall,
  [string]$AwsKeyId = $env:AWS_ACCESS_KEY_ID,
  [string]$AwsSecretKey = $env:AWS_SECRET_ACCESS_KEY,
  [string]$Region = 'eu-west-3',
  [switch]$SkipGithub,
  [switch]$SkipDeploy
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$TfDir = Join-Path $Root 'infra/terraform/aws'
$TfVars = Join-Path $TfDir 'terraform.tfvars'

function Write-Step($n, $msg) { Write-Host "`n[$n] $msg" -ForegroundColor Cyan }
function Write-Ok($msg) { Write-Host "  ✅ $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  ⚠️  $msg" -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host "  ❌ $msg" -ForegroundColor Red }

function Ensure-Command($name, $wingetId) {
  if (Get-Command $name -ErrorAction SilentlyContinue) {
    Write-Ok "$name déjà installé"
    return
  }
  if ($SkipInstall) {
    throw "$name manquant — relancez sans -SkipInstall ou installez manuellement."
  }
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw "$name manquant et winget indisponible."
  }
  Write-Host "  Installation $name via winget..."
  winget install --id $wingetId -e --accept-package-agreements --accept-source-agreements --silent
  $env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "$name installé mais introuvable — redémarrez le terminal puis relancez avec -SkipInstall"
  }
  Write-Ok "$name installé"
}

function New-RandomSecret($len = 32) {
  $bytes = New-Object byte[] $len
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $s = [Convert]::ToBase64String($bytes) -replace '[+/=]', 'x'
  if ($s.Length -gt $len) { return $s.Substring(0, $len) }
  $s
}

function Ensure-TfVars {
  if (Test-Path $TfVars) {
    Write-Ok "terraform.tfvars existe déjà"
    return
  }
  $dbPass = New-RandomSecret 24
  $jwt = New-RandomSecret 40
  @"
aws_region   = "$Region"
project_name = "petfoodtn"
environment  = "production"

db_username = "petfood"
db_password = "$dbPass"
jwt_secret  = "$jwt"

image_tag     = "latest"
desired_count = 1
"@ | Set-Content -Path $TfVars -Encoding UTF8
  Write-Ok "terraform.tfvars généré (db_password + jwt_secret aléatoires)"
}

function Configure-AwsCli {
  if (-not $AwsKeyId -or -not $AwsSecretKey) {
    Write-Warn "Pas de clés AWS — ouverture page inscription AWS"
    Start-Process 'https://aws.amazon.com/fr/free/'
    Write-Host @"

  Après création du compte AWS :
  1. Console IAM → Users → Create user → petfoodtn-deploy
  2. AdministratorAccess (temporaire, pour le 1er déploiement)
  3. Security credentials → Create access key → CLI

"@
    $AwsKeyId = Read-Host 'Collez AWS_ACCESS_KEY_ID'
    $AwsSecretKey = Read-Host 'Collez AWS_SECRET_ACCESS_KEY' -AsSecureString
    $BSTR = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($AwsSecretKey)
    $AwsSecretKey = [Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
  }

  aws configure set aws_access_key_id $AwsKeyId
  aws configure set aws_secret_access_key $AwsSecretKey
  aws configure set default.region $Region
  aws configure set default.output json

  $id = aws sts get-caller-identity --query Account --output text 2>&1
  if ($LASTEXITCODE -ne 0) { throw "Clés AWS invalides : $id" }
  Write-Ok "AWS connecté — compte $id"
}

function Invoke-Terraform {
  Set-Location $TfDir
  terraform init -input=false
  if ($LASTEXITCODE -ne 0) { throw 'terraform init échoué' }
  Write-Host '  terraform apply (5–10 min)...' -ForegroundColor Yellow
  terraform apply -auto-approve -input=false
  if ($LASTEXITCODE -ne 0) { throw 'terraform apply échoué' }
  $script:AlbUrl = terraform output -raw alb_dns_name
  $script:Cluster = terraform output -raw ecs_cluster_name
  Write-Ok "Infrastructure créée — ALB: http://$AlbUrl"
}

function Set-GithubSecrets {
  if ($SkipGithub) { return }
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Warn 'gh CLI absent — secrets GitHub non configurés'
    return
  }
  $auth = gh auth status 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Warn 'GitHub non connecté — lancez: gh auth login'
    Write-Host '  Puis relancez: npm run devops:aws:auto -SkipInstall' -ForegroundColor Yellow
    return
  }

  gh secret set AWS_ACCESS_KEY_ID --body $AwsKeyId
  gh secret set AWS_SECRET_ACCESS_KEY --body $AwsSecretKey
  gh variable set AWS_REGION --body $Region
  gh variable set AWS_ECS_CLUSTER --body $Cluster
  gh variable set AWS_ECR_PREFIX --body 'petfoodtn-production'
  gh variable set UPTIME_FRONTEND_URL --body "http://$AlbUrl"
  Write-Ok 'Secrets GitHub configurés'
}

function Start-EcrDeploy {
  if ($SkipDeploy) { return }
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { return }
  $auth = gh auth status 2>&1
  if ($LASTEXITCODE -ne 0) { return }

  Write-Host '  Déclenchement workflow Publish ECR Images...'
  gh workflow run 'Publish ECR Images' 2>&1 | Out-Null
  if ($LASTEXITCODE -eq 0) {
    Write-Ok 'Workflow ECR lancé — suivez dans GitHub Actions'
  } else {
    Write-Warn 'Workflow ECR non lancé (push sur main ou lancez manuellement dans Actions)'
  }
}

# ─── Main ───
Write-Host "`n☁️  PetfoodTN — Déploiement AWS automatique`n" -ForegroundColor White

Write-Step 1 'Installation outils (AWS CLI, Terraform, Docker)'
Ensure-Command aws 'Amazon.AWSCLI'
Ensure-Command terraform 'Hashicorp.Terraform'
if (Get-Command docker -ErrorAction SilentlyContinue) { Write-Ok 'docker OK' } else { Write-Warn 'docker absent — build ECR via GitHub Actions uniquement' }

Write-Step 2 'Configuration AWS'
Configure-AwsCli

Write-Step 3 'Génération terraform.tfvars'
Ensure-TfVars

Write-Step 4 'Provisionnement infrastructure (Terraform apply)'
Invoke-Terraform

Write-Step 5 'Configuration GitHub Actions'
Set-GithubSecrets

Write-Step 6 'Premier déploiement conteneurs'
Start-EcrDeploy

Write-Host @"

════════════════════════════════════════════
  Déploiement AWS terminé (ou en cours)

  URL app  : http://$AlbUrl
  Health   : http://$AlbUrl/health
  Cluster  : $Cluster

  Vérifier : npm run devops:aws:health
  (définir `$env:UPTIME_FRONTEND_URL='http://$AlbUrl' d'abord)

  Coût estimé : ~75–95 EUR/mois (NAT + ECS + RDS)
  Free Tier : RDS et EC2 partiellement couverts 12 mois
════════════════════════════════════════════
"@ -ForegroundColor Green
