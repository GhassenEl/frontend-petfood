# Terraform AWS — PetfoodTN

Stack **ECS Fargate + RDS PostgreSQL + ALB + ECR + S3**.

## Prérequis

- [AWS CLI](https://aws.amazon.com/cli/) configuré (`aws configure`)
- [Terraform](https://www.terraform.io/) >= 1.5
- Images Docker poussées sur ECR (voir `docs/AWS-SETUP.md`)

## Déploiement initial

```bash
cd infra/terraform/aws
cp terraform.tfvars.example terraform.tfvars
# Éditer terraform.tfvars avec db_password, jwt_secret, domaine optionnel

terraform init
terraform plan
terraform apply
```

Après `apply`, noter `alb_dns_name` et configurer DNS (CNAME) si vous utilisez un domaine.

## Mise à jour images

```bash
# GitHub Actions : Publish ECR + Deploy AWS (automatique sur main)
# Ou manuellement :
aws ecs update-service --cluster petfoodtn-production-cluster \
  --service petfoodtn-production-backend --force-new-deployment
```

## Coût estimé (eu-west-3)

| Ressource | ~€/mois |
|-----------|---------|
| RDS db.t4g.micro | ~15 |
| ECS Fargate (3 services) | ~25–40 |
| ALB + NAT Gateway | ~35 |
| S3 + logs | ~5 |

> Pour réduire les coûts en dev : une seule AZ, pas de NAT (tasks en subnet public), ou EC2 + docker-compose.

Voir [docs/AWS-SETUP.md](../../../docs/AWS-SETUP.md) pour le guide complet.
