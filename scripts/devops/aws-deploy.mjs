#!/usr/bin/env node
/**
 * Outils déploiement AWS PetfoodTN (ECS + ALB).
 *
 * Usage :
 *   node scripts/devops/aws-deploy.mjs health
 *   node scripts/devops/aws-deploy.mjs status
 *   node scripts/devops/aws-deploy.mjs deploy
 *   node scripts/devops/aws-deploy.mjs outputs
 *
 * Variables :
 *   AWS_REGION, AWS_ECS_CLUSTER, AWS_ECR_PREFIX
 *   UPTIME_FRONTEND_URL — URL publique (ALB ou domaine)
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const cmd = process.argv[2] || 'health';
const REGION = process.env.AWS_REGION || 'eu-west-3';
const CLUSTER = process.env.AWS_ECS_CLUSTER || 'petfoodtn-production-cluster';
const PREFIX = process.env.AWS_ECR_PREFIX || 'petfoodtn-production';
const APP_URL = process.env.UPTIME_FRONTEND_URL || process.env.APP_URL || '';

function aws(args, { json = false } = {}) {
  const out = execSync(`aws ${args} --region ${REGION} --output ${json ? 'json' : 'text'}`, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return json ? JSON.parse(out) : out.trim();
}

async function health() {
  const base = APP_URL || process.env.ALB_URL;
  if (!base) {
    console.error('❌ Définissez UPTIME_FRONTEND_URL ou APP_URL (ex. https://app.petfoodtn.tn)');
    process.exit(1);
  }
  console.log(`\n☁️  PetfoodTN AWS health — ${base}\n`);
  const checks = [
    { name: 'Frontend /nginx-health', url: `${base}/nginx-health` },
    { name: 'Backend /health', url: `${base}/health` },
  ];
  let failed = 0;
  for (const c of checks) {
    try {
      const res = await fetch(c.url, { signal: AbortSignal.timeout(10000) });
      if (res.ok) console.log(`  ✅ ${c.name} — ${res.status}`);
      else {
        console.log(`  ❌ ${c.name} — ${res.status}`);
        failed += 1;
      }
    } catch (e) {
      console.log(`  ❌ ${c.name} — ${e.message}`);
      failed += 1;
    }
  }
  process.exit(failed ? 1 : 0);
}

function status() {
  console.log(`\n☁️  ECS cluster: ${CLUSTER} (${REGION})\n`);
  const services = [`${PREFIX}-frontend`, `${PREFIX}-backend`, `${PREFIX}-ml`];
  for (const name of services) {
    try {
      const data = aws(
        `ecs describe-services --cluster ${CLUSTER} --services ${name}`,
        { json: true },
      );
      const svc = data.services?.[0];
      if (!svc) {
        console.log(`  ⚠️  ${name} — introuvable (terraform apply ?)`);
        continue;
      }
      console.log(
        `  ${svc.status === 'ACTIVE' ? '✅' : '⚠️'} ${name} — ${svc.runningCount}/${svc.desiredCount} tasks — ${svc.deployments?.[0]?.rolloutState || 'N/A'}`,
      );
    } catch (e) {
      console.log(`  ❌ ${name} — ${e.stderr?.toString() || e.message}`);
    }
  }
}

function deploy() {
  console.log(`\n🚀 Force redeploy ECS (${CLUSTER})\n`);
  for (const svc of ['frontend', 'backend', 'ml']) {
    const name = `${PREFIX}-${svc}`;
    try {
      aws(`ecs update-service --cluster ${CLUSTER} --service ${name} --force-new-deployment`);
      console.log(`  ✅ ${name}`);
    } catch (e) {
      console.log(`  ❌ ${name} — ${e.stderr?.toString() || e.message}`);
    }
  }
}

function outputs() {
  console.log('\n📋 Terraform outputs (infra/terraform/aws)\n');
  try {
    const out = execSync('terraform output -json', {
      cwd: path.join(ROOT, 'infra/terraform/aws'),
      encoding: 'utf8',
    });
    const j = JSON.parse(out);
    for (const [k, v] of Object.entries(j)) {
      console.log(`  ${k}: ${v.value}`);
    }
  } catch {
    console.log('  Lancez terraform apply dans infra/terraform/aws');
  }
}

const handlers = { health, status, deploy, outputs };
if (!handlers[cmd]) {
  console.log(`
PetfoodTN AWS deploy

  health   — ping ALB /nginx-health + /health
  status   — état services ECS
  deploy   — force new deployment
  outputs  — terraform output
`);
  process.exit(0);
}

handlers[cmd]().catch((e) => {
  console.error(e);
  process.exit(1);
});
