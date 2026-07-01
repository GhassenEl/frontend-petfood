variable "aws_region" {
  description = "Région AWS (ex. eu-west-3 Paris, proche Tunisie)"
  type        = string
  default     = "eu-west-3"
}

variable "project_name" {
  description = "Préfixe ressources AWS"
  type        = string
  default     = "petfoodtn"
}

variable "environment" {
  description = "Environnement (production, staging)"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Domaine public (ex. app.petfoodtn.tn) — laisser vide pour utiliser l'URL ALB"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ARN certificat ACM (HTTPS) — obligatoire si domain_name est renseigné"
  type        = string
  default     = ""
}

variable "db_username" {
  description = "Utilisateur PostgreSQL RDS"
  type        = string
  default     = "petfood"
}

variable "db_password" {
  description = "Mot de passe PostgreSQL (min 8 caractères)"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT_SECRET backend (min 32 caractères)"
  type        = string
  sensitive   = true
}

variable "cors_origins" {
  description = "CORS_ORIGINS backend (séparés par virgule)"
  type        = string
  default     = ""
}

variable "backend_cpu" {
  type    = number
  default = 512
}

variable "backend_memory" {
  type    = number
  default = 1024
}

variable "frontend_cpu" {
  type    = number
  default = 256
}

variable "frontend_memory" {
  type    = number
  default = 512
}

variable "ml_cpu" {
  type    = number
  default = 512
}

variable "ml_memory" {
  type    = number
  default = 1024
}

variable "desired_count" {
  description = "Nombre de tâches ECS par service"
  type        = number
  default     = 1
}

variable "image_tag" {
  description = "Tag images ECR (latest ou sha-xxxx)"
  type        = string
  default     = "latest"
}
