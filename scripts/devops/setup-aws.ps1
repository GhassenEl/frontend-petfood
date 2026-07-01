#Requires -Version 5.1
<#
.SYNOPSIS
  Guide interactif déploiement AWS PetfoodTN (Terraform + ECR + ECS).
#>
$ErrorActionPreference = 'Stop'
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $Root

Write-Host "`n☁️  PetfoodTN — Setup AWS`n" -ForegroundColor Cyan

function Test-Cmd($name) {
  if (Get-Command $name -ErrorAction SilentlyContinue) { Write-Host "  ✅ $name" -ForegroundColor Green; return $true }
  Write-Host "  ❌ $name manquant" -ForegroundColor Red
  return $false
}

$ok = $true
$ok = (Test-Cmd aws) -and $ok
$ok = (Test-Cmd terraform) -and $ok
$ok = (Test-Cmd docker) -and $ok

if (-not $ok) {
  Write-Host "`nInstallez AWS CLI, Terraform et Docker puis relancez.`n"
  exit 1
}

$TfDir = Join-Path $Root 'infra/terraform/aws'
$TfVars = Join-Path $TfDir 'terraform.tfvars'
$Example = Join-Path $TfDir 'terraform.tfvars.example'

if (-not (Test-Path $TfVars)) {
  Copy-Item $Example $TfVars
  Write-Host "  📝 terraform.tfvars créé — éditez db_password et jwt_secret`n" -ForegroundColor Yellow
  notepad $TfVars
}

Write-Host @"

Output attendu après terraform apply :
  - ALB DNS (URL publique)
  - Repos ECR (frontend, backend, ml)
  - Cluster ECS petfoodtn-production-cluster

Secrets GitHub :
  AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
  Variables : AWS_REGION, AWS_ECS_CLUSTER, UPTIME_FRONTEND_URL

Documentation : docs/AWS-SETUP.md
"@

$run = Read-Host "`nLancer terraform init + plan dans infra/terraform/aws ? (o/N)"
if ($run -eq 'o' -or $run -eq 'O') {
  Set-Location $TfDir
  terraform init
  terraform plan
  Write-Host "`nPour appliquer : terraform apply`n" -ForegroundColor Cyan
}
