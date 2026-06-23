#!/usr/bin/env node
/**
 * Provisionnement Render PetfoodTN (API + verification).
 *
 * Variables :
 *   RENDER_API_KEY   - cle API Render (Account Settings -> API Keys)
 *   GITHUB_PAT       - optionnel, pour rendre les packages GHCR publics
 *
 * Usage :
 *   node scripts/devops/render-provision.mjs validate
 *   node scripts/devops/render-provision.mjs status
 *   node scripts/devops/render-provision.mjs hooks
 *   node scripts/devops/render-provision.mjs health
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setRepoSecret } from './github-token.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const RENDER_API = 'https://api.render.com/v1';
const SERVICES = ['petfoodtn-web', 'petfoodtn-api', 'petfoodtn-ml'];
const GHCR_OWNER = 'ghassenel';
const GITHUB_REPO = 'https://github.com/GhassenEl/frontend-petfood';
const HEALTH_URLS = {
  web: 'https://petfoodtn-web.onrender.com',
  api: 'https://petfoodtn-api.onrender.com/health',
  ml: 'https://petfoodtn-ml.onrender.com/health',
};

const cmd = process.argv[2] || 'help';
const apiKey = process.env.RENDER_API_KEY;

async function renderFetch(endpoint, options = {}) {
  if (!apiKey) {
    throw new Error('RENDER_API_KEY manquant. Cree une cle sur dashboard.render.com -> Account Settings -> API Keys');
  }
  const res = await fetch(`${RENDER_API}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
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
    throw new Error(`Render API ${res.status} ${endpoint}: ${msg}`);
  }
  return body;
}

async function validateBlueprint() {
  const yaml = fs.readFileSync(path.join(ROOT, 'render.yaml'), 'utf8');
  console.log('Validation render.yaml via API Render...');
  const result = await renderFetch('/blueprints/validate', {
    method: 'POST',
    body: JSON.stringify({ body: yaml }),
  });
  console.log('OK - Blueprint valide');
  if (result?.errors?.length) {
    console.warn('Avertissements:', result.errors);
  }
  return result;
}

async function listOwnerId() {
  const owners = await renderFetch('/owners?limit=20');
  const list = Array.isArray(owners) ? owners : owners?.items || [];
  if (!list.length) throw new Error('Aucun workspace Render trouve');
  const owner = list[0];
  const id = owner?.owner?.id || owner?.id;
  const name = owner?.owner?.name || owner?.name || id;
  console.log(`Workspace : ${name} (${id})`);
  return id;
}

async function listServices() {
  const ownerId = await listOwnerId();
  const services = await renderFetch(`/services?ownerId=${ownerId}&limit=50`);
  const list = Array.isArray(services) ? services : services?.items || [];
  return list.map((row) => row.service || row);
}

async function showStatus() {
  const all = await listServices();
  const ours = all.filter((s) => SERVICES.includes(s.name));
  if (!ours.length) {
    console.log('\nAucun service PetfoodTN sur Render.');
    console.log('Action : Dashboard -> New -> Blueprint -> GhassenEl/frontend-petfood -> Apply');
    console.log('Lien direct : https://dashboard.render.com/blueprints/new');
    return;
  }
  console.log('\nServices PetfoodTN :');
  for (const s of ours) {
    const url = s.serviceDetails?.url || s.url || '(pas d URL)';
    console.log(`  ${s.name}  [${s.type}]  ${s.suspended ? 'SUSPENDU' : s.serviceDetails?.state || 'actif'}  ${url}`);
  }
  const missing = SERVICES.filter((n) => !ours.some((s) => s.name === n));
  if (missing.length) {
    console.log('\nManquants :', missing.join(', '));
    console.log('Synchronise le Blueprint (push render.yaml sur main).');
  }
}

function hookSecretName(serviceName) {
  if (serviceName === 'petfoodtn-web') return 'RENDER_DEPLOY_HOOK_FRONTEND';
  if (serviceName === 'petfoodtn-api') return 'RENDER_DEPLOY_HOOK_BACKEND';
  return 'RENDER_DEPLOY_HOOK_ML';
}

async function getOrCreateDeployHook(service) {
  const hooks = await renderFetch(`/services/${service.id}/deploy-hooks`);
  const list = Array.isArray(hooks) ? hooks : hooks?.items || [];
  const existing = list[0]?.deployHook || list[0];
  if (existing?.url) return existing.url;

  const created = await renderFetch(`/services/${service.id}/deploy-hooks`, {
    method: 'POST',
    body: JSON.stringify({ name: 'github-cd' }),
  });
  const hook = created?.deployHook || created;
  if (!hook?.url) throw new Error(`Deploy hook introuvable pour ${service.name}`);
  return hook.url;
}

async function collectDeployHooks() {
  const all = await listServices();
  const ours = all.filter((s) => SERVICES.includes(s.name));
  if (!ours.length) {
    throw new Error('Aucun service PetfoodTN sur Render. Appliquez le Blueprint render.yaml d abord.');
  }
  const mapping = {};
  for (const s of ours) {
    mapping[hookSecretName(s.name)] = await getOrCreateDeployHook(s);
  }
  return mapping;
}

async function showDeployHooks() {
  try {
    const mapping = await collectDeployHooks();
    console.log('\nDeploy Hooks (secrets GitHub) :\n');
    for (const [secretName, url] of Object.entries(mapping)) {
      console.log(`${secretName}=${url}`);
    }
  } catch (err) {
    console.log(err.message);
    return;
  }
  console.log('\nUptime secrets :');
  console.log('UPTIME_FRONTEND_URL=https://petfoodtn-web.onrender.com');
  console.log('UPTIME_BACKEND_URL=https://petfoodtn-api.onrender.com');
  console.log('UPTIME_ML_URL=https://petfoodtn-ml.onrender.com');
}

async function syncGithubSecrets() {
  const mapping = await collectDeployHooks();
  console.log('\nSync secrets GitHub...\n');
  for (const [name, value] of Object.entries(mapping)) {
    await setRepoSecret(name, value);
    console.log(`  OK ${name}`);
  }
  const uptime = {
    UPTIME_FRONTEND_URL: HEALTH_URLS.web,
    UPTIME_BACKEND_URL: 'https://petfoodtn-api.onrender.com',
    UPTIME_ML_URL: 'https://petfoodtn-ml.onrender.com',
  };
  for (const [name, value] of Object.entries(uptime)) {
    await setRepoSecret(name, value);
    console.log(`  OK ${name}`);
  }
  console.log('\nDeploy hooks synchronises. Lancez : gh workflow run "Deploy Render" -R GhassenEl/frontend-petfood');
}

async function listPostgres() {
  const ownerId = await listOwnerId();
  const data = await renderFetch(`/postgres?ownerId=${ownerId}&limit=50`);
  const list = Array.isArray(data) ? data : data?.items || [];
  return list.map((row) => row.postgres || row);
}

async function ensurePostgres(ownerId) {
  const existing = (await listPostgres()).find((p) => p.name === 'petfoodtn-db');
  if (existing) {
    console.log(`  DB existante : petfoodtn-db (${existing.id})`);
    return existing;
  }
  console.log('  Création PostgreSQL petfoodtn-db…');
  const created = await renderFetch('/postgres', {
    method: 'POST',
    body: JSON.stringify({
      name: 'petfoodtn-db',
      plan: 'free',
      ownerId,
      version: '16',
      databaseName: 'petfood',
      databaseUser: 'petfood',
      region: 'frankfurt',
    }),
  });
  const pg = created?.postgres || created;
  console.log(`  ✅ PostgreSQL créé : ${pg.id}`);
  return pg;
}

async function getPostgresConnectionUrl(postgresId) {
  const info = await renderFetch(`/postgres/${postgresId}/connection`);
  const conn = info?.connection || info;
  return conn?.connectionString || conn?.externalConnectionString || conn?.internalConnectionString;
}

async function createGitWebService(ownerId, config) {
  const { name, repo, branch = 'main', rootDir, runtime, buildCommand, startCommand, envVars, healthCheck = '/health' } = config;
  const existing = (await listServices()).find((s) => s.name === name);
  if (existing) {
    console.log(`  Service existant : ${name}`);
    return existing;
  }
  const body = {
    type: 'web_service',
    name,
    ownerId,
    plan: 'free',
    region: 'frankfurt',
    repo,
    branch,
    envVars,
    serviceDetails: {
      runtime,
      healthCheckPath: healthCheck,
      envSpecificDetails: { buildCommand, startCommand },
    },
  };
  if (rootDir) body.rootDir = rootDir;
  const created = await renderFetch('/services', { method: 'POST', body: JSON.stringify(body) });
  const svc = created?.service || created;
  console.log(`  ✅ ${name} créé (${svc.id})`);
  return svc;
}

async function createImageWebService(ownerId, name, imagePath, envVars, healthCheck = '/health') {
  const existing = (await listServices()).find((s) => s.name === name);
  if (existing) {
    console.log(`  Service existant : ${name}`);
    return existing;
  }
  const created = await renderFetch('/services', {
    method: 'POST',
    body: JSON.stringify({
      type: 'web_service',
      name,
      ownerId,
      plan: 'free',
      region: 'frankfurt',
      image: { ownerId, imagePath },
      envVars,
      serviceDetails: {
        runtime: 'image',
        healthCheckPath: healthCheck,
        envSpecificDetails: {
          dockerCommand: '',
          dockerContext: '',
          dockerfilePath: '',
        },
      },
    }),
  });
  const svc = created?.service || created;
  console.log(`  ✅ ${name} créé (${svc.id})`);
  return svc;
}

async function createStaticSite(ownerId) {
  const existing = (await listServices()).find((s) => s.name === 'petfoodtn-web');
  if (existing) {
    console.log('  Static site existant : petfoodtn-web');
    return existing;
  }
  const created = await renderFetch('/services', {
    method: 'POST',
    body: JSON.stringify({
      type: 'static_site',
      name: 'petfoodtn-web',
      ownerId,
      repo: GITHUB_REPO,
      branch: 'main',
      autoDeploy: 'yes',
      envVars: [
        { key: 'NODE_VERSION', value: '20' },
        { key: 'VITE_API_BASE', value: 'https://petfoodtn-api.onrender.com/api' },
        { key: 'VITE_SOCKET_URL', value: 'https://petfoodtn-api.onrender.com' },
        { key: 'VITE_APP_RELEASE', value: 'petfoodtn@render' },
      ],
      serviceDetails: {
        buildCommand: 'npm ci && npm run build',
        publishPath: 'dist',
        routes: [{ type: 'rewrite', source: '/*', destination: '/index.html' }],
      },
    }),
  });
  const svc = created?.service || created;
  console.log(`  ✅ petfoodtn-web créé (${svc.id})`);
  return svc;
}

async function provisionStack() {
  console.log('\n☁️  Provisionnement stack Render PetfoodTN\n');
  const ownerId = await listOwnerId();
  const pg = await ensurePostgres(ownerId);

  let databaseUrl = null;
  for (let i = 0; i < 12; i += 1) {
    try {
      databaseUrl = await getPostgresConnectionUrl(pg.id);
      if (databaseUrl) break;
    } catch {
      /* retry */
    }
    console.log(`  ⏳ Attente connexion PostgreSQL (${i + 1}/12)…`);
    await new Promise((r) => setTimeout(r, 5000));
  }

  await createGitWebService(ownerId, {
    name: 'petfoodtn-ml',
    repo: GITHUB_REPO,
    rootDir: 'fastapi_service',
    runtime: 'python',
    buildCommand: 'pip install -r requirements.txt',
    startCommand: 'uvicorn app.main:app --host 0.0.0.0 --port $PORT',
    envVars: [{ key: 'TZ', value: 'Africa/Tunis' }],
  });

  const apiEnv = [
    { key: 'NODE_ENV', value: 'production' },
    { key: 'PORT', value: '5002' },
    { key: 'DEMO_MODE', value: 'true' },
    { key: 'RUN_SEED', value: 'true' },
    { key: 'CORS_ORIGINS', value: 'https://petfoodtn-web.onrender.com,https://ghassenel.github.io' },
    { key: 'FASTAPI_URL', value: 'https://petfoodtn-ml.onrender.com' },
    { key: 'STRIPE_MOCK', value: '1' },
    { key: 'MCP_ENABLE', value: 'false' },
    { key: 'JWT_SECRET', generateValue: true },
  ];
  if (databaseUrl) {
    apiEnv.push({ key: 'DATABASE_URL', value: databaseUrl });
  } else {
    console.log('  ⚠️  DATABASE_URL non récupéré — configurez-le sur petfoodtn-api');
  }

  await createGitWebService(ownerId, {
    name: 'petfoodtn-api',
    repo: 'https://github.com/GhassenEl/backend-petfood',
    runtime: 'node',
    buildCommand: 'npm ci && npx prisma generate && npx prisma db push',
    startCommand: 'npm start',
    envVars: apiEnv,
  });

  await createStaticSite(ownerId);
  console.log('\n✅ Provisionnement terminé — déploiements en cours (5–15 min)');
  console.log('   Frontend : https://petfoodtn-web.onrender.com');
  console.log('   API      : https://petfoodtn-api.onrender.com/health');
  console.log('   ML       : https://petfoodtn-ml.onrender.com/health\n');
}

async function checkHealth() {
  console.log('Verification endpoints publics...\n');
  for (const [name, url] of Object.entries(HEALTH_URLS)) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      console.log(`  ${name.padEnd(4)} ${res.status}  ${url}`);
    } catch (err) {
      console.log(`  ${name.padEnd(4)} ERR  ${url}  (${err.message})`);
    }
  }
}

function showHelp() {
  console.log(`
PetfoodTN - Render provision

Commandes :
  validate   Valide render.yaml (requiert RENDER_API_KEY)
  status     Liste les services petfoodtn-* sur Render
  hooks        Affiche les Deploy Hooks pour secrets GitHub
  sync-github  Cree les hooks Render et les pousse en secrets GitHub
  provision    Cree la stack (DB + API + ML + web) via API Render
  health       Teste les URLs publiques (sans cle API)
  github       Liste les secrets GitHub a configurer

Etapes manuelles (sans cle API) :
  1. https://dashboard.render.com/blueprints/new
  2. Repo : GhassenEl/frontend-petfood  |  Blueprint Path : render.yaml
  3. Apply -> attendre 5-10 min
  4. GHCR : rendre public ghcr.io/ghassenel/petfoodtn-{backend,ml}
     ou ajouter credential "petfoodtn-ghcr" (username + PAT read:packages)
  5. npm run devops:render:hooks (avec RENDER_API_KEY) -> copier secrets GitHub
`);
}

async function showGithubSecretsTemplate() {
  console.log('\nSecrets GitHub (Settings -> Secrets -> Actions) :\n');
  console.log('RENDER_API_KEY            = (Render Account -> API Keys)');
  console.log('RENDER_DEPLOY_HOOK_FRONTEND = (Render petfoodtn-web -> Deploy Hook)');
  console.log('RENDER_DEPLOY_HOOK_BACKEND  = (Render petfoodtn-api -> Deploy Hook)');
  console.log('RENDER_DEPLOY_HOOK_ML       = (Render petfoodtn-ml -> Deploy Hook)');
  console.log('UPTIME_FRONTEND_URL = https://petfoodtn-web.onrender.com');
  console.log('UPTIME_BACKEND_URL  = https://petfoodtn-api.onrender.com');
  console.log('UPTIME_ML_URL       = https://petfoodtn-ml.onrender.com');
  console.log('\nEnvironnement : production (Settings -> Environments)\n');
  console.log('Blueprint Render : https://dashboard.render.com/blueprints/new');
  console.log('Repo : GhassenEl/frontend-petfood | render.yaml\n');
}

async function main() {
  try {
    switch (cmd) {
      case 'validate':
        await validateBlueprint();
        break;
      case 'status':
        await showStatus();
        break;
      case 'hooks':
        await showDeployHooks();
        break;
      case 'sync-github':
        await syncGithubSecrets();
        break;
      case 'provision':
        await provisionStack();
        break;
      case 'health':
        await checkHealth();
        break;
      case 'github':
        await showGithubSecretsTemplate();
        break;
      default:
        showHelp();
    }
  } catch (err) {
    console.error('Erreur:', err.message);
    process.exit(1);
  }
}

main();
