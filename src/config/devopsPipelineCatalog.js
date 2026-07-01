/**
 * Pipeline DevOps PetfoodTN — étapes, cibles et métadonnées UI.
 * Aligné sur .github/workflows/platform-pipeline.yml
 */

export const PIPELINE_TARGET = {
  id: 'aws-ecs',
  label: 'Production AWS',
  detail: 'ECS Fargate + RDS + ALB + ECR',
  doc: 'docs/AWS-SETUP.md',
  primary: true,
};

export const PIPELINE_STAGES = [
  {
    id: 'ci',
    order: 1,
    label: 'CI · Build & tests',
    short: 'CI',
    workflow: 'ci.yml',
    jobs: ['Frontend build', 'Backend tests', 'ML smoke', 'Docker build', 'API tests'],
    trigger: 'push / PR main',
    color: '#2563eb',
  },
  {
    id: 'security',
    order: 2,
    label: 'DevSecOps · Scans',
    short: 'Sec',
    workflow: 'security.yml',
    jobs: ['Gitleaks', 'npm audit', 'OWASP', 'Trivy FS & images'],
    trigger: 'push / PR main',
    color: '#7c3aed',
  },
  {
    id: 'e2e',
    order: 3,
    label: 'E2E · Playwright',
    short: 'E2E',
    workflow: 'e2e.yml',
    jobs: ['Navigateur Chrome', 'Flux auth & boutique'],
    trigger: 'PR main',
    color: '#0891b2',
  },
  {
    id: 'readiness',
    order: 4,
    label: 'Readiness · Gate prod',
    short: 'Gate',
    workflow: 'deployment-readiness.yml',
    jobs: ['Build prod', 'Terraform AWS', 'Sonde ALB'],
    trigger: 'main uniquement',
    color: '#d97706',
  },
  {
    id: 'publish-ecr',
    order: 5,
    label: 'CD · Publish ECR',
    short: 'ECR',
    workflow: 'publish-ecr.yml',
    jobs: ['frontend', 'backend', 'ml → Amazon ECR'],
    trigger: 'main · tags v*',
    color: '#059669',
  },
  {
    id: 'deploy-aws',
    order: 6,
    label: 'CD · Deploy AWS ECS',
    short: 'ECS',
    workflow: 'deploy-aws.yml',
    jobs: ['Rolling update', 'Wait stable', 'Health ALB'],
    trigger: 'après ECR',
    color: '#047857',
  },
  {
    id: 'uptime',
    order: 7,
    label: 'Ops · Uptime & backup',
    short: 'Ops',
    workflow: 'uptime.yml + backup-nightly.yml',
    jobs: ['Sonde /health 15 min', 'pg_dump 02:00 UTC'],
    trigger: 'cron',
    color: '#64748b',
  },
];

/** Pipelines secondaires (VPS / GHCR legacy) */
export const PIPELINE_SECONDARY = [
  { id: 'publish-ghcr', name: 'Publish GHCR', file: '.github/workflows/publish-ghcr.yml', detail: 'Images → ghcr.io (VPS)' },
  { id: 'deploy-vps', name: 'CD VPS', file: '.github/workflows/deploy-vps.yml', detail: 'SSH docker-compose' },
];

export const getPipelineProgress = (runs = []) => {
  const byId = Object.fromEntries(runs.map((r) => [r.pipelineId, r]));
  const completed = PIPELINE_STAGES.filter((s) => byId[s.id]?.status === 'success').length;
  return { completed, total: PIPELINE_STAGES.length, runs: byId };
};
