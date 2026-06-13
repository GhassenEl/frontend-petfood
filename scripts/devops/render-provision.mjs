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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const RENDER_API = 'https://api.render.com/v1';
const SERVICES = ['petfoodtn-web', 'petfoodtn-api', 'petfoodtn-ml'];
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

async function showDeployHooks() {
  const all = await listServices();
  const ours = all.filter((s) => SERVICES.includes(s.name));
  if (!ours.length) {
    console.log('Cree d abord les services via Blueprint.');
    return;
  }
  console.log('\nDeploy Hooks (secrets GitHub) :\n');
  for (const s of ours) {
    const hooks = await renderFetch(`/services/${s.id}/deploy-hooks`);
    const list = Array.isArray(hooks) ? hooks : hooks?.items || [];
    const hook = list[0]?.deployHook || list[0];
    const secretName =
      s.name === 'petfoodtn-web'
        ? 'RENDER_DEPLOY_HOOK_FRONTEND'
        : s.name === 'petfoodtn-api'
          ? 'RENDER_DEPLOY_HOOK_BACKEND'
          : 'RENDER_DEPLOY_HOOK_ML';
    if (hook?.url) {
      console.log(`${secretName}=${hook.url}`);
    } else {
      console.log(`${secretName} -> Service ${s.name} -> Settings -> Deploy Hook (a creer)`);
    }
  }
  console.log('\nUptime secrets :');
  console.log('UPTIME_FRONTEND_URL=https://petfoodtn-web.onrender.com');
  console.log('UPTIME_BACKEND_URL=https://petfoodtn-api.onrender.com');
  console.log('UPTIME_ML_URL=https://petfoodtn-ml.onrender.com');
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
  hooks      Affiche les Deploy Hooks pour secrets GitHub
  health     Teste les URLs publiques (sans cle API)

Etapes manuelles (sans cle API) :
  1. https://dashboard.render.com/blueprints/new
  2. Repo : GhassenEl/frontend-petfood  |  Blueprint Path : render.yaml
  3. Apply -> attendre 5-10 min
  4. GHCR : rendre public ghcr.io/ghassenel/petfoodtn-{backend,ml}
     ou ajouter credential "petfoodtn-ghcr" (username + PAT read:packages)
  5. npm run devops:render:hooks (avec RENDER_API_KEY) -> copier secrets GitHub
`);
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
      case 'health':
        await checkHealth();
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
