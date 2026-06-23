#!/usr/bin/env node
/**
 * Hébergement PetfoodTN — GitHub Pages + préparation Render.
 *
 * Usage :
 *   node scripts/devops/host-application.mjs
 *   node scripts/devops/host-application.mjs --render
 *
 * Clé Render (une des options) :
 *   - fichier .env.render : RENDER_API_KEY=rnd_...
 *   - variable d'environnement RENDER_API_KEY
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { resolveGithubToken, setRepoSecret } from './github-token.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const REPO = 'GhassenEl/frontend-petfood';
const [owner, repo] = REPO.split('/');
const GHCR_PACKAGES = ['petfoodtn-backend', 'petfoodtn-ml', 'petfoodtn-frontend'];
const withRender = process.argv.includes('--render');

function loadEnvRender() {
  const file = path.join(ROOT, '.env.render');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && value && !process.env[key]) process.env[key] = value;
  }
}

async function githubApi(path, { method = 'GET', body } = {}) {
  const token = resolveGithubToken();
  if (!token) throw new Error('Token GitHub introuvable — connectez git ou définissez GH_TOKEN');

  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = typeof data === 'object' ? JSON.stringify(data) : data;
    throw new Error(`GitHub ${res.status} ${path}: ${msg}`);
  }
  return data;
}

async function makeGhcrPackagesPublic() {
  console.log('\n📦 Packages GHCR → public\n');
  for (const name of GHCR_PACKAGES) {
    try {
      await githubApi(`/user/packages/container/${name}/visibility`, {
        method: 'PUT',
        body: { visibility: 'public' },
      });
      console.log(`  ✅ ${name} — public`);
    } catch (err) {
      if (String(err.message).includes('404')) {
        console.log(`  ⚠️  ${name} — package introuvable (publiez d abord via CI)`);
      } else if (String(err.message).includes('403')) {
        console.log(`  ⚠️  ${name} — permission insuffisante (faites-le manuellement sur GitHub)`);
      } else {
        console.log(`  ⚠️  ${name} — ${err.message}`);
      }
    }
  }
}

async function enableGithubPages() {
  console.log('\n🌐 GitHub Pages (workflow Actions)\n');
  try {
    await githubApi(`/repos/${owner}/${repo}/pages`, {
      method: 'POST',
      body: { build_type: 'workflow' },
    });
    console.log('  ✅ Pages activées (source: GitHub Actions)');
  } catch (err) {
    if (String(err.message).includes('409')) {
      await githubApi(`/repos/${owner}/${repo}/pages`, {
        method: 'PUT',
        body: { build_type: 'workflow' },
      });
      console.log('  ✅ Pages mises à jour (source: GitHub Actions)');
    } else {
      throw err;
    }
  }

  try {
    const pages = await githubApi(`/repos/${owner}/${repo}/pages`);
    const url = pages.html_url || pages.url || `https://${owner.toLowerCase()}.github.io/${repo}/`;
    console.log(`  URL : ${url}`);
    return url;
  } catch {
    const url = `https://${owner.toLowerCase()}.github.io/${repo}/`;
    console.log(`  URL attendue : ${url}`);
    return url;
  }
}

async function triggerPagesWorkflow() {
  console.log('\n🚀 Déclenchement workflow Deploy GitHub Pages\n');
  const workflows = await githubApi(`/repos/${owner}/${repo}/actions/workflows`);
  const wf = workflows.workflows?.find((w) => w.name === 'Deploy GitHub Pages');
  if (!wf) {
    console.log('  ⚠️  Workflow Deploy GitHub Pages introuvable — poussez le commit sur main');
    return;
  }
  await githubApi(`/repos/${owner}/${repo}/actions/workflows/${wf.id}/dispatches`, {
    method: 'POST',
    body: { ref: 'main' },
  });
  console.log('  ✅ Déploiement Pages déclenché');
}

async function provisionRender() {
  loadEnvRender();
  const apiKey = process.env.RENDER_API_KEY?.trim();
  if (!apiKey) {
    console.log('\n⏭️  Render — RENDER_API_KEY absent');
    console.log('   1. Créez .env.render avec : RENDER_API_KEY=rnd_votre_cle');
    console.log('      (Render → Account Settings → API Keys)');
    console.log('   2. Relancez : npm run devops:host:render');
    console.log('   Ou ajoutez le secret RENDER_API_KEY sur GitHub puis :');
    console.log('   gh workflow run "Provision Render Stack" -R GhassenEl/frontend-petfood');
    return;
  }

  console.log('\n☁️  Provisionnement Render (API)\n');
  const run = (args) => {
    const result = spawnSync(process.execPath, args, {
      cwd: ROOT,
      encoding: 'utf8',
      windowsHide: true,
      env: { ...process.env, RENDER_API_KEY: apiKey },
    });
    if (result.stdout) console.log(result.stdout);
    if (result.stderr) console.error(result.stderr);
    return result.status ?? 1;
  };

  try {
    await setRepoSecret('RENDER_API_KEY', apiKey, REPO);
    console.log('  ✅ Secret GitHub RENDER_API_KEY synchronisé');
  } catch (err) {
    console.log(`  ⚠️  Secret GitHub : ${err.message}`);
  }

  const code = run(['scripts/devops/render-provision.mjs', 'provision']);
  if (code === 0) {
    run(['scripts/devops/render-provision.mjs', 'sync-github']);
    await triggerWorkflow('Provision Render Stack');
  }
}

async function triggerWorkflow(name) {
  try {
    const workflows = await githubApi(`/repos/${owner}/${repo}/actions/workflows`);
    const wf = workflows.workflows?.find((w) => w.name === name);
    if (!wf) return;
    await githubApi(`/repos/${owner}/${repo}/actions/workflows/${wf.id}/dispatches`, {
      method: 'POST',
      body: { ref: 'main' },
    });
    console.log(`  ✅ Workflow « ${name} » déclenché`);
  } catch (err) {
    console.log(`  ⚠️  Workflow ${name} : ${err.message}`);
  }
}

async function main() {
  console.log('🐾 PetfoodTN — hébergement\n');
  loadEnvRender();
  await makeGhcrPackagesPublic();
  const pagesUrl = await enableGithubPages();
  await triggerPagesWorkflow();
  await triggerWorkflow('Publish GHCR packages (public)');
  if (withRender || process.env.RENDER_API_KEY) await provisionRender();

  console.log('\n✅ Hébergement initié');
  console.log(`\nFrontend (GitHub Pages) : ${pagesUrl}`);
  console.log('Render (stack complète)   : https://petfoodtn-web.onrender.com');
  console.log('                         → Blueprint requis si 404 (voir docs/RENDER-SETUP.md)\n');
}

main().catch((err) => {
  console.error('Erreur:', err.message);
  process.exit(1);
});
