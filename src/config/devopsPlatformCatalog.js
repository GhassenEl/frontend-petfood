/** Catalogue interfaces DevOps PetfoodTN — CI/CD, monitoring, infra, sécurité. */

export const DEVOPS_PIPELINES = [
  { id: 'platform', name: 'Platform Pipeline', status: 'ok', detail: 'Orchestrateur CI → Sec → E2E → ECR → AWS ECS', file: '.github/workflows/platform-pipeline.yml' },
  { id: 'ci', name: 'CI — Build & tests', status: 'ok', detail: 'Vite, Prisma, ML smoke, Docker, API wallet', file: '.github/workflows/ci.yml' },
  { id: 'security', name: 'DevSecOps', status: 'ok', detail: 'Gitleaks, Trivy, OWASP, npm audit', file: '.github/workflows/security.yml' },
  { id: 'publish-ecr', name: 'Publish ECR', status: 'ok', detail: 'Images → Amazon ECR (production AWS)', file: '.github/workflows/publish-ecr.yml' },
  { id: 'deploy-aws', name: 'CD AWS ECS', status: 'ok', detail: 'Rolling deploy Fargate + health ALB', file: '.github/workflows/deploy-aws.yml' },
  { id: 'readiness', name: 'Deployment readiness', status: 'ok', detail: 'Gate prod — Terraform AWS + build Vite', file: '.github/workflows/deployment-readiness.yml' },
  { id: 'publish', name: 'Publish GHCR', status: 'ok', detail: 'Images → ghcr.io (VPS secondaire)', file: '.github/workflows/publish-ghcr.yml' },
  { id: 'deploy-vps', name: 'CD VPS', status: 'ok', detail: 'SSH docker-compose.ghcr.yml', file: '.github/workflows/deploy-vps.yml' },
  { id: 'backup', name: 'Sauvegarde nocturne', status: 'ok', detail: 'pg_dump chiffré 02:00 UTC', file: '.github/workflows/backup-nightly.yml' },
  { id: 'uptime', name: 'Uptime & alertes', status: 'ok', detail: 'Sonde /health toutes les 15 min', file: '.github/workflows/uptime.yml' },
  { id: 'dashboards', name: 'Provision dashboards', status: 'ok', detail: 'Validation JSON + push Grafana API', file: '.github/workflows/provision-dashboards.yml' },
  { id: 'e2e', name: 'E2E Playwright', status: 'ok', detail: 'Tests navigateur sur PR', file: '.github/workflows/e2e.yml' },
];

export const DEVOPS_MONITORING = [
  { id: 'grafana', label: 'Grafana', url: 'http://localhost:3000', desc: 'Dashboards CPU, RAM, commandes, IoT ESP32-CAM', status: 'local' },
  { id: 'prometheus', label: 'Prometheus', url: 'http://localhost:9090', desc: 'Collecte métriques scrape 15s', status: 'local' },
  { id: 'metrics', label: 'Metrics exporter', url: 'http://localhost:9105/metrics', desc: 'Métriques métier PetfoodTN', status: 'local' },
  { id: 'ml', label: 'ML FastAPI', url: 'http://localhost:8000/docs', desc: 'Modèles IA / recommandations', status: 'local' },
  { id: 'admin-perf', label: 'Performance plateforme', route: '/admin/performance', desc: 'Latence API, heap, SQL, sockets — vue admin', status: 'app' },
  { id: 'admin-devops', label: 'Hub DevOps admin', route: '/admin/devops', desc: 'CI/CD, déploiements, secrets, runbooks', status: 'app' },
  { id: 'admin-iot', label: 'Surveillance IoT', route: '/admin/iot-anomalies', desc: 'Anomalies capteurs & ESP32-CAM', status: 'app' },
  { id: 'admin-bi', label: 'Hub BI', route: '/admin/business-intelligence', desc: 'Vet, IoT, audience — sync Grafana', status: 'app' },
];

export const DEVOPS_STACKS = [
  { id: 'base', label: 'Stack base', cmd: 'npm run docker:up', desc: 'PostgreSQL + backend + frontend' },
  { id: 'full', label: 'Stack complète', cmd: 'npm run docker:stack:full', desc: 'IA FastAPI + MQTT + Prometheus + Grafana' },
  { id: 'iot', label: 'IoT MQTT', cmd: 'npm run docker:iot:up', desc: 'Mosquitto pour distributeurs & ESP32-CAM' },
  { id: 'monitoring', label: 'Monitoring', cmd: 'npm run docker:monitoring:up', desc: 'Prometheus + Grafana + exporters' },
  { id: 'aws', label: 'Deploy AWS auto', cmd: 'npm run devops:aws:auto', desc: 'Terraform + ECR + ECS (compte AWS requis)' },
  { id: 'prod', label: 'Audit production', cmd: 'npm run devops:prod:audit', desc: 'Secrets, health, pipeline readiness' },
];

export const DEVOPS_ADMIN_INTERFACES = [
  { id: 'devops', icon: '⚙️', label: 'Hub DevOps', route: '/admin/devops', desc: 'CI/CD, déploiements, runbooks, secrets' },
  { id: 'performance', icon: '⚡', label: 'Performance plateforme', route: '/admin/performance', desc: 'Santé API, latence, mémoire, base SQL' },
  { id: 'backups', icon: '💾', label: 'Sauvegardes', route: '/admin/backups', desc: 'pg_dump, snapshots, restauration' },
  { id: 'system', icon: '🔧', label: 'Configuration globale', route: '/admin/system', desc: 'Intégrations, notifications, marketplace' },
  { id: 'security-framework', icon: '📜', label: 'Cadre sécurité', route: '/admin/security-framework', desc: '12 piliers cybersécurité' },
  { id: 'database-security', icon: '🗄️', label: 'Sécurité base de données', route: '/admin/database-security', desc: 'PostgreSQL TLS, Prisma, audit SQL' },
  { id: 'security', icon: '🛡️', label: 'Centre de sécurité', route: '/admin/security', desc: 'IDS, anti-virus, menaces' },
  { id: 'activity-logs', icon: '📋', label: 'Journaux d\'activité', route: '/admin/activity-logs', desc: 'Audit connexions & actions admin' },
  { id: 'iot-anomalies', icon: '📡', label: 'IoT & capteurs', route: '/admin/iot-anomalies', desc: 'Alertes distributeurs & qualité nourriture' },
  { id: 'bi-hub', icon: '📊', label: 'Hub BI & Grafana', route: '/admin/business-intelligence', desc: 'Dashboards vet, IoT, audience — auto DevOps' },
];

export const DEVOPS_PLATFORM_LINKS = [
  { id: 'cloud', icon: '☁️', label: 'Cloud Computing', route: '/cloud', desc: 'AWS ECS, Docker, Terraform' },
  { id: 'big-data', icon: '📊', label: 'Big Data', route: '/big-data', desc: 'Kafka, Spark, Hadoop' },
  { id: 'enterprise', icon: '🏢', label: 'Fonctionnalités entreprise', route: '/enterprise', desc: 'Vue globale PFE' },
];

export const DEVOPS_METRICS_DEMO = {
  health: 'healthy',
  score: 94,
  uptime: '99.7%',
  lastDeploy: '2026-06-16T08:30:00Z',
  pipelinesOk: 9,
  pipelinesTotal: 10,
  containersRunning: 12,
  grafanaDashboards: 3,
};
