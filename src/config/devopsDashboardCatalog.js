/** Catalogue dashboards Grafana + pipeline d'automatisation DevOps → BI. */

export const GRAFANA_DASHBOARD_CATALOG = [
  {
    uid: 'petfoodtn-overview',
    title: 'Monitoring temps réel',
    file: 'petfoodtn-overview.json',
    folder: 'PetfoodTN',
    tags: ['devops', 'infra'],
    grafanaPath: '/d/petfoodtn-overview',
    appRoute: '/admin/performance',
    desc: 'CPU, RAM, latence API, commandes, ESP32-CAM, ML',
  },
  {
    uid: 'petfoodtn-bi-platform',
    title: 'BI plateforme (vet · IoT · audience)',
    file: 'petfoodtn-bi-platform.json',
    folder: 'PetfoodTN',
    tags: ['bi', 'vet', 'iot', 'audience'],
    grafanaPath: '/d/petfoodtn-bi-platform',
    appRoute: '/admin/business-intelligence',
    desc: 'Audience live, cas vet, alertes IoT, commandes',
  },
];

export const DASHBOARD_AUTOMATION_PIPELINE = [
  {
    id: 'validate',
    label: 'Validation JSON',
    cmd: 'npm run devops:dashboards:validate',
    workflow: '.github/workflows/provision-dashboards.yml',
    trigger: 'PR + push infra/monitoring/grafana/**',
  },
  {
    id: 'metrics',
    label: 'Export métriques BI',
    cmd: 'metrics-exporter → Prometheus',
    workflow: 'docker-compose.monitoring.yml',
    trigger: 'Scrape 30s — vet, IoT, audience',
  },
  {
    id: 'provision-docker',
    label: 'Provisioning Grafana (Docker)',
    cmd: 'npm run docker:monitoring:up',
    workflow: 'grafana/provisioning/dashboards.yml',
    trigger: 'Volume monté — reload auto 30s',
  },
  {
    id: 'provision-api',
    label: 'Push API Grafana (CI/CD)',
    cmd: 'npm run devops:dashboards:provision',
    workflow: '.github/workflows/provision-dashboards.yml',
    trigger: 'Deploy VPS / workflow_dispatch',
  },
  {
    id: 'bi-sync',
    label: 'Sync hub BI admin',
    cmd: 'biPlatformSnapshotService',
    workflow: '—',
    trigger: 'Polling admin — /admin/business-intelligence',
  },
];

export const resolveGrafanaBaseUrl = () => {
  const fromEnv = import.meta.env.VITE_GRAFANA_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (import.meta.env.DEV) return 'http://localhost:3000';
  return '/grafana';
};

export default GRAFANA_DASHBOARD_CATALOG;
