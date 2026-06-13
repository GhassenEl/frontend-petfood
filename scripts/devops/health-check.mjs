#!/usr/bin/env node
/**
 * Vérifie la santé de la stack PetfoodTN (dev ou Docker).
 *
 * Usage :
 *   node scripts/devops/health-check.mjs
 *   node scripts/devops/health-check.mjs --docker
 *   FRONTEND_URL=http://localhost:8080 node scripts/devops/health-check.mjs
 */
const args = process.argv.slice(2);
const dockerMode = args.includes('--docker') || args.includes('-d');

const FRONTEND = process.env.FRONTEND_URL || (dockerMode ? 'http://localhost:8080' : 'http://localhost:3001');
const BACKEND = process.env.BACKEND_URL || (dockerMode ? 'http://localhost:5002' : 'http://localhost:5002');
const ML = process.env.ML_URL || 'http://localhost:8000';
const CHECK_ML = process.env.CHECK_ML === '1' || args.includes('--ml');

const checks = [
  { name: 'Frontend', url: FRONTEND, optional: false },
  { name: 'Backend /health', url: `${BACKEND}/health`, optional: false },
  { name: 'Nginx /nginx-health', url: `${FRONTEND}/nginx-health`, optional: !dockerMode },
  { name: 'ML FastAPI /health', url: `${ML}/health`, optional: !CHECK_ML },
];

async function ping(label, url) {
  const started = Date.now();
  const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(8000) });
  const ms = Date.now() - started;
  const ok = res.ok || res.status < 500;
  return { label, url, ok, status: res.status, ms };
}

async function main() {
  console.log(`\n🐾 PetfoodTN — health check${dockerMode ? ' (Docker)' : ''}\n`);

  let failed = 0;
  for (const check of checks) {
    try {
      const result = await ping(check.name, check.url);
      if (result.ok) {
        console.log(`  ✅ ${result.label} — ${result.status} (${result.ms}ms)`);
      } else if (check.optional) {
        console.log(`  ⚠️  ${result.label} — ${result.status} (optionnel)`);
      } else {
        console.log(`  ❌ ${result.label} — ${result.status}`);
        failed += 1;
      }
    } catch (err) {
      if (check.optional) {
        console.log(`  ⚠️  ${check.name} — indisponible (${err.message})`);
      } else {
        console.log(`  ❌ ${check.name} — ${err.message}`);
        failed += 1;
      }
    }
  }

  console.log('');
  if (failed > 0) {
    console.error(`❌ ${failed} service(s) critique(s) en échec`);
    process.exit(1);
  }
  console.log('✅ Stack opérationnelle');
}

main();
