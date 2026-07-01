const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();
const minsAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

export const DEMO_DEVOPS_SERVICES = [
  { id: 'api', label: 'API Backend (/health)', ok: true, latencyMs: 42, status: 200 },
  { id: 'db', label: 'PostgreSQL', ok: true, latencyMs: 3, status: 200 },
  { id: 'frontend', label: 'Frontend Vite', ok: true, latencyMs: 18, status: 200 },
  { id: 'ml', label: 'ML FastAPI', ok: true, latencyMs: 86, status: 200, optional: true },
  { id: 'prometheus', label: 'Prometheus', ok: false, latencyMs: 0, status: 0, error: 'Connexion refusée', optional: true },
  { id: 'grafana', label: 'Grafana', ok: false, latencyMs: 0, status: 0, error: 'Connexion refusée', optional: true },
  { id: 'mqtt', label: 'MQTT Mosquitto', ok: true, latencyMs: 12, status: 200, optional: true },
];

export const DEMO_PIPELINE_RUNS = [
  { pipelineId: 'platform', status: 'success', branch: 'main', duration: '18m 42s', at: minsAgo(30), commit: 'f91d277' },
  { pipelineId: 'ci', status: 'success', branch: 'main', duration: '4m 12s', at: minsAgo(45), commit: 'f91d277' },
  { pipelineId: 'security', status: 'success', branch: 'main', duration: '2m 08s', at: hoursAgo(3), commit: 'f91d277' },
  { pipelineId: 'readiness', status: 'success', branch: 'main', duration: '1m 15s', at: hoursAgo(5), commit: '122dbb2' },
  { pipelineId: 'e2e', status: 'success', branch: 'main', duration: '6m 34s', at: hoursAgo(5), commit: '122dbb2' },
  { pipelineId: 'publish-ecr', status: 'success', branch: 'main', duration: '8m 01s', at: hoursAgo(6), commit: '122dbb2' },
  { pipelineId: 'deploy-aws', status: 'success', branch: 'main', duration: '4m 18s', at: hoursAgo(6.5), commit: '122dbb2' },
  { pipelineId: 'uptime', status: 'success', branch: 'main', duration: '0m 48s', at: minsAgo(12), commit: '—' },
  { pipelineId: 'backup', status: 'success', branch: 'main', duration: '1m 55s', at: hoursAgo(10), commit: '—' },
  { pipelineId: 'deploy-vps', status: 'skipped', branch: 'main', duration: '—', at: hoursAgo(24), commit: '—' },
];

export const DEMO_DEPLOYMENTS = [
  {
    id: 'dep-1',
    env: 'production',
    target: 'AWS ECS Fargate',
    version: 'f91d277',
    status: 'success',
    at: hoursAgo(6.5),
    services: ['Frontend', 'API', 'ML', 'RDS PostgreSQL'],
  },
  {
    id: 'dep-2',
    env: 'staging',
    target: 'Docker local',
    version: '122dbb2',
    status: 'success',
    at: hoursAgo(18),
    services: ['Stack complète'],
  },
  {
    id: 'dep-3',
    env: 'production',
    target: 'Amazon ECR',
    version: '121aec4',
    status: 'success',
    at: hoursAgo(30),
    services: ['frontend', 'backend', 'ml'],
  },
  {
    id: 'dep-4',
    env: 'lab',
    target: 'VPS SSH',
    version: '8c965c9',
    status: 'failed',
    at: hoursAgo(48),
    services: ['docker-compose.ghcr.yml'],
    note: 'Timeout SSH — relance manuelle',
  },
];

export const DEMO_DEVOPS_ALERTS = [
  {
    severity: 'warning',
    title: 'Prometheus / Grafana hors ligne',
    message: 'Stack monitoring locale non démarrée — npm run docker:monitoring:up',
  },
  {
    severity: 'info',
    title: 'Sauvegarde nocturne réussie',
    message: 'pg_dump chiffré — rétention 30 jours (02:00 UTC).',
  },
  {
    severity: 'ok',
    title: 'Uptime API',
    message: 'Sonde /health — 99.7 % sur 30 jours.',
  },
];

export const DEMO_ENV_SECRETS = [
  { key: 'DATABASE_URL', label: 'PostgreSQL', category: 'database', configured: true, rotationDays: 90 },
  { key: 'JWT_SECRET', label: 'JWT signing', category: 'auth', configured: true, rotationDays: 90 },
  { key: 'STRIPE_SECRET_KEY', label: 'Stripe', category: 'payment', configured: true, rotationDays: 180 },
  { key: 'VITE_STRIPE_PK', label: 'Stripe publishable', category: 'payment', configured: true, rotationDays: null },
  { key: 'SMTP_*', label: 'Email transactionnel', category: 'mail', configured: false, rotationDays: null },
  { key: 'KONNECT_API_KEY', label: 'Konnect TN', category: 'payment', configured: false, rotationDays: null },
  { key: 'AWS_ACCESS_KEY_ID', label: 'AWS CI/CD', category: 'cicd', configured: false, rotationDays: 90 },
  { key: 'AWS_SECRET_ACCESS_KEY', label: 'AWS secret', category: 'cicd', configured: false, rotationDays: 90 },
  { key: 'GHCR_TOKEN', label: 'GitHub Container Registry', category: 'cicd', configured: true, rotationDays: 365 },
];

export const DEVOPS_RUNBOOKS = [
  { id: 'health', label: 'Santé stack', cmd: 'npm run devops:health' },
  { id: 'ci', label: 'CI locale', cmd: 'npm run devops:ci' },
  { id: 'pipeline', label: 'Pipeline local audit', cmd: 'npm run devops:pipeline' },
  { id: 'aws', label: 'Deploy AWS auto', cmd: 'npm run devops:aws:auto' },
  { id: 'docker', label: 'Stack Docker', cmd: 'npm run docker:stack:full' },
  { id: 'monitoring', label: 'Monitoring', cmd: 'npm run docker:monitoring:up' },
  { id: 'backup', label: 'Sauvegarde manuelle', cmd: 'npm run devops:backup' },
  { id: 'audit', label: 'Audit prod', cmd: 'npm run devops:prod:audit' },
];

const summarizeServices = (services) => {
  const up = services.filter((s) => s.ok).length;
  const optionalDown = services.filter((s) => !s.ok && s.optional).length;
  const criticalDown = services.filter((s) => !s.ok && !s.optional).length;
  let stackStatus = 'healthy';
  if (criticalDown > 0) stackStatus = 'critical';
  else if (optionalDown > 0) stackStatus = 'partial';
  return { up, total: services.length, optionalDown, stackStatus };
};

export const buildDemoDevOpsStatus = () => {
  const services = DEMO_DEVOPS_SERVICES;
  const summary = summarizeServices(services);
  return {
    mode: 'demo',
    collectedAt: new Date().toISOString(),
    services,
    summary,
    hero: {
      score: 94,
      health: summary.stackStatus === 'healthy' ? 'healthy' : 'degraded',
      uptime: '99.7%',
      pipelinesOk: 9,
      pipelinesTotal: 10,
      containersRunning: 12,
      apiP95Ms: 124,
      errorRate: 0.8,
      dbLatencyMs: 3,
      socketConnections: 6,
      lastDeploy: hoursAgo(6.5),
    },
    pipelines: DEMO_PIPELINE_RUNS,
    deployments: DEMO_DEPLOYMENTS,
    alerts: DEMO_DEVOPS_ALERTS,
    envSecrets: DEMO_ENV_SECRETS,
    performance: {
      score: 94,
      uptime: { formatted: '99.7%' },
      security: { eventsLast24h: 4, monitoredIps: 12, idsEnabled: true },
      api: {
        avgMs: 48,
        p95Ms: 124,
        errorRate: 0.8,
        requestSeries: [
          { label: '09:00', count: 28 },
          { label: '09:05', count: 31 },
          { label: '09:10', count: 36 },
          { label: '09:15', count: 34 },
          { label: '09:20', count: 42 },
        ],
        latencySeries: [
          { label: '1', ms: 42 },
          { label: '2', ms: 55 },
          { label: '3', ms: 38 },
          { label: '4', ms: 61 },
          { label: '5', ms: 47 },
        ],
        slowest: [
          { method: 'GET', path: '/api/analytics/hub', status: 200, ms: 186 },
          { method: 'GET', path: '/api/orders', status: 200, ms: 142 },
        ],
      },
    },
  };
};

export const buildDemoStackHealth = () => {
  const services = DEMO_DEVOPS_SERVICES.filter((s) => !['prometheus', 'grafana'].includes(s.id));
  const summary = summarizeServices(services);
  return {
    mode: 'demo',
    collectedAt: new Date().toISOString(),
    services,
    summary,
    performance: buildDemoDevOpsStatus().performance,
  };
};
