# PetfoodTN — Déploiement AWS

Guide pour déployer la stack **PetfoodTN** sur **AWS** (ECS Fargate + RDS + ALB + ECR + S3), **sans Render**.

## Architecture

```mermaid
flowchart TB
  user[Utilisateur] --> alb[Application Load Balancer]
  alb -->|"/"| fe[ECS Frontend nginx]
  alb -->|"/api/* /socket.io /health"| api[ECS Backend Node]
  api --> rds[(RDS PostgreSQL 16)]
  api --> ml[ECS FastAPI ML]
  api --> s3[S3 uploads]
  gh[GitHub Actions] --> ecr[ECR]
  ecr --> ecs[ECS Fargate]
```

| Composant | Service AWS |
|-----------|-------------|
| Frontend React | ECS Fargate + nginx |
| API Node/Express | ECS Fargate |
| ML FastAPI | ECS Fargate (réseau privé + Cloud Map) |
| PostgreSQL | RDS `db.t4g.micro` |
| Images / uploads | S3 bucket |
| CI/CD | GitHub Actions → ECR → ECS |

---

## Déploiement automatique (1 commande)

Après création du compte AWS et des clés IAM :

```powershell
npm run devops:aws:auto
```

Le script `scripts/devops/aws-auto.ps1` automatise :

1. Installation AWS CLI + Terraform (via winget)
2. Génération `terraform.tfvars` (mots de passe aléatoires)
3. `terraform init` + `terraform apply -auto-approve`
4. Secrets GitHub (`gh secret set`) si `gh auth login` actif
5. Déclenchement workflow **Publish ECR Images**

**Non automatisable** (obligatoire une fois) :

- Création compte AWS (carte bancaire) — le script ouvre https://aws.amazon.com/fr/free/
- Coller les clés IAM quand demandé
- `gh auth login` pour GitHub Actions

Avec clés déjà connues :

```powershell
$env:AWS_ACCESS_KEY_ID="AKIA..."
$env:AWS_SECRET_ACCESS_KEY="..."
npm run devops:aws:auto
```

---

1. Compte AWS avec droits **ECS, ECR, RDS, VPC, ALB, S3, Secrets Manager, IAM**
2. [AWS CLI](https://aws.amazon.com/cli/) : `aws configure`
3. [Terraform](https://www.terraform.io/) >= 1.5
4. Repo cloné localement

---

## 2. Provisionner l'infrastructure (Terraform)

```powershell
cd infra/terraform/aws
copy terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars
```

Variables **obligatoires** dans `terraform.tfvars` :

```hcl
aws_region   = "eu-west-3"   # Paris — proche Tunisie
db_password  = "<mot-de-passe-fort>"
jwt_secret   = "<secret-jwt-min-32-chars>"
```

Optionnel (HTTPS + domaine) :

```hcl
domain_name     = "app.petfoodtn.tn"
certificate_arn = "arn:aws:acm:eu-west-3:ACCOUNT:certificate/UUID"
cors_origins    = "https://app.petfoodtn.tn"
```

> Créez le certificat ACM **dans la même région** que l'ALB (eu-west-3).

```powershell
terraform init
terraform plan
terraform apply
```

Notez les outputs :

- `alb_dns_name` — URL temporaire ALB
- `ecr_*_url` — registres images
- `github_secrets_hint` — secrets GitHub à configurer

### DNS

Enregistrement **CNAME** :

```
app.petfoodtn.tn  →  petfoodtn-production-alb-xxxxxxxx.eu-west-3.elb.amazonaws.com
```

---

## 3. Secrets GitHub Actions

Settings → Secrets and variables → Actions :

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | Clé IAM (ECR + ECS deploy) |
| `AWS_SECRET_ACCESS_KEY` | Secret IAM |

Variables (Settings → Variables) :

| Variable | Exemple |
|----------|---------|
| `AWS_REGION` | `eu-west-3` |
| `AWS_ECS_CLUSTER` | `petfoodtn-production-cluster` |
| `AWS_ECR_PREFIX` | `petfoodtn-production` |
| `UPTIME_FRONTEND_URL` | `https://app.petfoodtn.tn` |

Politique IAM minimale pour le user CI :

- `ecr:*` (push/pull)
- `ecs:UpdateService`, `ecs:RegisterTaskDefinition`, `ecs:Describe*`
- `iam:PassRole` (rôles ECS task)

---

## 4. Premier déploiement (images + services)

### Option A — GitHub Actions (recommandé)

1. `terraform apply` (crée ECR repos + ECS services vides)
2. Push sur `main` → workflows **Publish ECR Images** puis **Deploy AWS**
3. Ou manuel : Actions → **Publish ECR Images** → Run workflow

### Option B — Local

```powershell
# Login ECR
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.eu-west-3.amazonaws.com

# Build & push (adapter ACCOUNT et PREFIX)
$REG="ACCOUNT.dkr.ecr.eu-west-3.amazonaws.com/petfoodtn-production"
docker build -f Dockerfile.frontend -t "$REG-frontend:latest" --build-arg VITE_API_BASE=/api .
docker push "$REG-frontend:latest"
# idem backend + ml

# Force redeploy
aws ecs update-service --cluster petfoodtn-production-cluster --service petfoodtn-production-frontend --force-new-deployment
```

---

## 5. Migrations Prisma (première fois)

Le backend exécute les migrations au démarrage si configuré, sinon :

```powershell
# Depuis une machine avec accès RDS (bastion ou task ECS one-off)
cd backend
$env:DATABASE_URL="postgresql://petfood:PASSWORD@RDS_ENDPOINT:5432/petfoodtn?schema=public"
npx prisma migrate deploy
```

---

## 6. Commandes npm

```powershell
npm run devops:aws:health      # vérifie ALB /health
npm run devops:aws:status      # statut ECS services
npm run devops:aws:deploy      # force redeploy ECS
```

---

## 7. Vérification

```powershell
npm run devops:aws:health
# ou
curl https://app.petfoodtn.tn/nginx-health
curl https://app.petfoodtn.tn/health
```

Comptes démo : voir [COMPTES-ACCES.md](./COMPTES-ACCES.md) (`RUN_SEED=true` uniquement en staging).

---

## 8. Alternative légère : EC2 + Docker Compose

Si vous préférez éviter ECS/NAT (coût ~35€/mois pour NAT Gateway) :

1. Lancez une **EC2 t3.small** (Ubuntu 24.04) dans le même VPC ou standalone
2. Utilisez RDS externe (endpoint Terraform) ou PostgreSQL sur EC2
3. Déployez avec le workflow **Deploy VPS** existant ou :

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.aws.yml \
  -f docker-compose.ml.yml \
  -f docker-compose.prod.yml \
  --env-file .env.aws up -d
```

Voir `.env.aws.example`.

---

## 9. Render → AWS (migration)

| Render | AWS |
|--------|-----|
| `petfoodtn-db` | RDS PostgreSQL |
| `petfoodtn-api` | ECS backend + ALB `/api` |
| `petfoodtn-ml` | ECS ml (privé) |
| `petfoodtn-web` | ECS frontend |
| Deploy Hooks | GitHub **Deploy AWS** |
| `render.yaml` | `infra/terraform/aws/` |

Désactivez les workflows Render dans GitHub si vous n'en avez plus besoin :
- `deploy-render.yml`, `provision-render.yml`, `auto-provision-render.yml`

---

## Dépannage

| Problème | Solution |
|----------|----------|
| ECS task ne démarre pas | CloudWatch Logs `/ecs/petfoodtn-production` |
| 502 ALB | Target group unhealthy — vérifier `/health` backend |
| CORS errors | Mettre à jour `cors_origins` dans terraform + `terraform apply` |
| ML indisponible | Vérifier Cloud Map `ml.petfoodtn.local:8000` depuis backend |
| Images ECR vides | Lancer **Publish ECR Images** |

Voir aussi [CD.md](./CD.md) et [DEVOPS.md](./DEVOPS.md).
