output "alb_dns_name" {
  description = "URL publique ALB (DNS à pointer ou utiliser directement)"
  value       = aws_lb.main.dns_name
}

output "app_url" {
  description = "URL application (HTTPS si domaine + certificat configurés)"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "http://${aws_lb.main.dns_name}"
}

output "ecr_frontend_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "ecr_backend_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_ml_url" {
  value = aws_ecr_repository.ml.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_services" {
  value = {
    frontend = aws_ecs_service.frontend.name
    backend  = aws_ecs_service.backend.name
    ml       = aws_ecs_service.ml.name
  }
}

output "rds_endpoint" {
  value     = aws_db_instance.main.address
  sensitive = true
}

output "s3_uploads_bucket" {
  value = aws_s3_bucket.uploads.bucket
}

output "github_secrets_hint" {
  description = "Secrets GitHub Actions à configurer"
  value = <<-EOT
    AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (ou OIDC)
    AWS_REGION=${var.aws_region}
    AWS_ECR_REGISTRY=${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com
    AWS_ECS_CLUSTER=${aws_ecs_cluster.main.name}
    UPTIME_FRONTEND_URL=${var.domain_name != "" ? "https://${var.domain_name}" : "http://${aws_lb.main.dns_name}"}
    UPTIME_BACKEND_URL=${var.domain_name != "" ? "https://${var.domain_name}/health" : "http://${aws_lb.main.dns_name}/health"}
  EOT
}
