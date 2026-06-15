#!/usr/bin/env node
/**
 * Mise en production PetfoodTN — audit CI/CD + sync secrets GitHub.
 *
 * Usage :
 *   node scripts/devops/setup-prod.mjs audit
 *   node scripts/devops/setup-prod.mjs sync
 *   node scripts/devops/setup-prod.mjs sync --render   (requiert RENDER_API_KEY)
 *
 * Variables :
 *   RENDER_API_KEY — cle API Render (hooks + status)
 *   GH_TOKEN / GITHUB_TOKEN / GITHUB_PAT — token GitHub (sinon git credential)
 */
import { spawnSync } from 'node:child_process';
import { listRepoSecrets, setRepoSecret, resolveGithubToken } from './github-token.mjs';

const REPO = 'GhassenEl/frontend-petfood';
const WORKFLOWS = ['CI', 'Publish Docker Images', 'Deploy Render', 'Deploy VPS', 'E2E Tests'];
const UPTIME_SECRETS = {
  UPTIME_FRONTEND_URL: 'https://petfoodtn-web.onrender.com',
  UPTIME_BACKEND_URL: 'https://petfoodtn-api.onrender.com',
  UPTIME_ML_URL: 'https://petfoodtn-ml.onrender.com',
};

const cmd = process.argv[2] || 'audit';
const withRender = process.argv.includes('--render');

async function githubApi(path) {
  const token = resolveGithubToken();
  if (!token) throw new Error('Token GitHub introuvable');
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'PetfoodTN-DevOps',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg = typeof body === 'object' ? JSON.stringify(body) : body;
    throw new Error(`GitHub API ${res.status} ${path}: ${msg}`);
  }
  return body;
}

async function auditWorkflows() {
  console.log('\n📋 Workflows GitHub Actions (dernier run sur main)\n');
  const list = await githubApi(`/repos/${REPO}/actions/workflows`);
  for (const name of WORKFLOWS) {
    const wf = list.workflows.find((w) => w.name === name);
    if (!wf) {
      console.log(`  ⚠️  ${name} — workflow introuvable`);
      continue;
    }
    const runs = await githubApi(`/repos/${REPO}/actions/workflows/${wf.id}/runs?per_page=1&branch=main`);
    const run = runs.workflow_runs?.[0];
    if (!run) {
      console.log(`  ⚪ ${name} — aucun run`);
      continue;
    }
    const icon = run.conclusion === 'success' ? '✅' : run.conclusion === 'failure' ? '❌' : '⚠️';
    console.log(`  ${icon} ${name} — ${run.conclusion} (${run.html_url})`);
  }
}

async function auditSecrets() {
  const names = await listRepoSecrets(REPO);
  console.log('\n🔐 Secrets GitHub Actions\n');
  const required = [
    'UPTIME_FRONTEND_URL',
    'UPTIME_BACKEND_URL',
    'UPTIME_ML_URL',
    'RENDER_DEPLOY_HOOK_FRONTEND',
    'RENDER_DEPLOY_HOOK_BACKEND',
    'RENDER_DEPLOY_HOOK_ML',
    'VPS_HOST',
    'VPS_USER',
    'VPS_SSH_KEY',
    'VPS_DEPLOY_PATH',
  ];
  for (const key of required) {
    const ok = names.includes(key);
    console.log(`  ${ok ? '✅' : '⬜'} ${key}`);
  }
  if (!names.length) console.log('  (aucun secret avant sync)');
}

async function syncUptimeSecrets() {
  console.log('\n⬆️  Sync secrets uptime...\n');
  for (const [name, value] of Object.entries(UPTIME_SECRETS)) {
    await setRepoSecret(name, value, REPO);
    console.log(`  ✅ ${name}`);
  }
}

async function syncRenderHooks() {
  const apiKey = process.env.RENDER_API_KEY?.trim();
  if (!apiKey) {
    console.log('\n⚠️  RENDER_API_KEY absent — hooks Render non synchronisés.');
    console.log('   Après Blueprint Render : RENDER_API_KEY=xxx node scripts/devops/setup-prod.mjs sync --render');
    return;
  }

  const root = new URL('../..', import.meta.url);
  const cwd = decodeURIComponent(root.pathname).replace(/^\/([A-Z]:)/, '$1');
  const result = spawnSync(process.execPath, ['scripts/devops/render-provision.mjs', 'sync-github'], {
    cwd,
    encoding: 'utf8',
    windowsHide: true,
    env: { ...process.env, RENDER_API_KEY: apiKey },
  });

  if (result.stdout) console.log(result.stdout);
  if (result.status !== 0) {
    console.error(result.stderr || 'sync-github a échoué');
    process.exit(result.status || 1);
  }
}

async function checkRenderHealth() {
  console.log('\n🌐 Santé Render (URLs publiques)\n');
  const urls = Object.entries(UPTIME_SECRETS);
  for (const [name, url] of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      const icon = res.ok ? '✅' : '⚠️';
      console.log(`  ${icon} ${name} — ${res.status} ${url}`);
    } catch (err) {
      console.log(`  ❌ ${name} — indisponible (${err.message})`);
    }
  }
}

async function printNextSteps() {
  console.log(`
📌 Étapes restantes (si Render 404) :
  1. Rendre publics les packages GHCR : petfoodtn-backend, petfoodtn-ml
     GitHub → Packages → Package settings → Public
  2. Blueprint Render (une fois) :
     https://dashboard.render.com/blueprints/new
     Repo : GhassenEl/frontend-petfood | Fichier : render.yaml → Apply
  3. Sync hooks :
     $env:RENDER_API_KEY="votre_cle"; npm run devops:prod:sync -- --render
  4. Déploiement manuel :
     gh workflow run "Deploy Render" -R ${REPO}
`);
}

async function main() {
  try {
    switch (cmd) {
      case 'audit':
        await auditWorkflows();
        await auditSecrets();
        await checkRenderHealth();
        await printNextSteps();
        break;
      case 'sync':
        await syncUptimeSecrets();
        if (withRender) await syncRenderHooks();
        await auditSecrets();
        await checkRenderHealth();
        if (!withRender) await printNextSteps();
        break;
      default:
        console.log('Usage: node scripts/devops/setup-prod.mjs [audit|sync] [--render]');
    }
  } catch (err) {
    console.error('Erreur:', err.message);
    process.exit(1);
  }
}

main();
