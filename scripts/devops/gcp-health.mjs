#!/usr/bin/env node
/**
 * Health check PetfoodTN sur Google Cloud Run.
 * Lit .env.gcp (UPTIME_*_URL) généré par gcp-deploy.ps1
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const envFile = path.join(ROOT, '.env.gcp');

function loadEnv() {
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (k && v && !process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const checks = [
  { name: 'Frontend', url: process.env.UPTIME_FRONTEND_URL },
  { name: 'API /health', url: process.env.UPTIME_BACKEND_URL ? `${process.env.UPTIME_BACKEND_URL.replace(/\/$/, '')}/health` : null },
  { name: 'ML /health', url: process.env.UPTIME_ML_URL ? `${process.env.UPTIME_ML_URL.replace(/\/$/, '')}/health` : null },
];

if (!checks.some((c) => c.url)) {
  console.error('Aucune URL dans .env.gcp — lance d abord : npm run devops:gcp:deploy');
  process.exit(1);
}

console.log('\nGCP health\n');
let failed = 0;
for (const c of checks) {
  if (!c.url) {
    console.log(`  skip ${c.name}`);
    continue;
  }
  try {
    const res = await fetch(c.url, { signal: AbortSignal.timeout(20000) });
    const ok = res.ok;
    console.log(`  ${ok ? 'OK' : 'FAIL'} ${c.name} — ${res.status} ${c.url}`);
    if (!ok) failed += 1;
  } catch (e) {
    console.log(`  FAIL ${c.name} — ${e.message}`);
    failed += 1;
  }
}
process.exit(failed ? 1 : 0);
