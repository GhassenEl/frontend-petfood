/** Catalogue interfaces DevOps PetfoodTN — CI/CD, monitoring, infra, sécurité. */

export const DEVOPS_PIPELINES = [
  { id: 'ci', name: 'CI — GitHub Actions', status: 'ok', detail: 'Build Vite, tests backend, ML, Docker, SonarQube, Playwright', file: '.github/workflows/ci.yml' },
  { id: 'publish', name: 'Publish GHCR', status: 'ok', detail: 'Images frontend, backend, ML → ghcr.io', file: '.github/workflows/publish-ghcr.yml' },
  { id: 'deploy-vps', name: 'CD VPS', status: 'ok', detail: 'Déploiement SSH docker-compose.ghcr.yml', file: '.github/workflows/deploy-vps.yml' },
  { id: 'deploy-render', name: 'CD Render', status: 'ok', detail: 'Hooks Blueprint render.yaml', file: '.github/workflows/deploy-render.yml' },
  { id: 'backup', name: 'Sauvegarde nocturne', status: 'ok', detail: 'pg_dump 02:00 UTC', file: '.github/workflows/backup-nightly.yml' },
  { id: 'uptime', name: 'Uptime & alertes', status: 'ok', detail: 'Sonde /health toutes les 15 min', file: '.github/workflows/uptime.yml' },
  { id: 'e2e', name: 'E2E Playwright', status: 'ok', detail: 'Tests navigateur sur PR', file: '.github/workflows/e2e.yml' },
];

export const DEVOPS_MONITORING = [
  { id: 'grafana', label: 'Grafana', url: 'http://localhost:3000', desc: 'Dashboards CPU, RAM, commandes, IoT ESP32-CAM', status: 'local' },
  { id: 'prometheus', label: 'Prometheus', url: 'http://localhost:9090', desc: 'Collecte métriques scrape 15s', status: 'local' },
  { id: 'metrics', label: 'Metrics exporter', url: 'http://localhost:9105/metrics', desc: 'Métriques métier PetfoodTN', status: 'local' },
  { id: 'ml', label: 'ML FastAPI', url: 'http://localhost:8000/docs', desc: 'Modèles IA / recommandations', status: 'local' },
  { id: 'admin-perf', label: 'Performance plateforme', route: '/admin/performance', desc: 'Latence API, heap, SQL, sockets — vue admin', status: 'app' },
  { id: 'admin-iot', label: 'Surveillance IoT', route: '/admin/iot-anomalies', desc: 'Anomalies capteurs & ESP32-CAM', status: 'app' },
];

export const DEVOPS_STACKS = [
  { id: 'base', label: 'Stack base', cmd: 'npm run docker:up', desc: 'PostgreSQL + backend + frontend' },
  { id: 'full', label: 'Stack complète', cmd: 'npm run docker:stack:full', desc: 'IA FastAPI + MQTT + Prometheus + Grafana' },
  { id: 'iot', label: 'IoT MQTT', cmd: 'npm run docker:iot:up', desc: 'Mosquitto pour distributeurs & ESP32-CAM' },
  { id: 'monitoring', label: 'Monitoring', cmd: 'npm run docker:monitoring:up', desc: 'Prometheus + Grafana + exporters' },
];

export const DEVOPS_ADMIN_INTERFACES = [
  { id: 'performance', icon: '⚡', label: 'Performance plateforme', route: '/admin/performance', desc: 'Santé API, latence, mémoire, base SQL' },
  { id: 'backups', icon: '💾', label: 'Sauvegardes', route: '/admin/backups', desc: 'pg_dump, snapshots, restauration' },
  { id: 'system', icon: '🔧', label: 'Configuration globale', route: '/admin/system', desc: 'Intégrations, notifications, marketplace' },
  { id: 'security', icon: '🛡️', label: 'Centre de sécurité', route: '/admin/security', desc: 'Menaces, scans, politiques' },
  { id: 'intel-security', icon: '🧠', label: 'Sécurité intelligente', route: '/admin/intelligent-security', desc: 'IDS, anomalies réseau' },
  { id: 'activity-logs', icon: '📋', label: 'Journaux d\'activité', route: '/admin/activity-logs', desc: 'Audit connexions & actions admin' },
  { id: 'iot-anomalies', icon: '📡', label: 'IoT & capteurs', route: '/admin/iot-anomalies', desc: 'Alertes distributeurs & qualité nourriture' },
];

export const DEVOPS_PLATFORM_LINKS = [
  { id: 'cloud', icon: '☁️', label: 'Cloud Computing', route: '/cloud', desc: 'Render, Docker, AWS/Azure/GCP' },
  { id: 'big-data', icon: '📊', label: 'Big Data', route: '/big-data', desc: 'Kafka, Spark, Hadoop' },
  { id: 'enterprise', icon: '🏢', label: 'Fonctionnalités entreprise', route: '/enterprise', desc: 'Vue globale PFE' },
];

export const DEVOPS_METRICS_DEMO = {
  health: 'healthy',
  score: 94,
  uptime: '99.7%',
  lastDeploy: '2026-06-15T08:30:00Z',
  pipelinesOk: 7,
  pipelinesTotal: 7,
  containersRunning: 12,
  grafanaDashboards: 3,
};
