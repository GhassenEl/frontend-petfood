#!/usr/bin/env node
/**
 * Hébergement PetfoodTN — GitHub Pages + préparation Render.
 *
 * Usage :
 *   node scripts/devops/host-application.mjs
 *   RENDER_API_KEY=xxx node scripts/devops/host-application.mjs --render
 */
import { spawnSync } from 'node:child_process';
import { resolveGithubToken } from './github-token.mjs';

const REPO = 'GhassenEl/frontend-petfood';
const [owner, repo] = REPO.split('/');
const GHCR_PACKAGES = ['petfoodtn-backend', 'petfoodtn-ml', 'petfoodtn-frontend'];
const withRender = process.argv.includes('--render');

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

function provisionRender() {
  const apiKey = process.env.RENDER_API_KEY?.trim();
  if (!apiKey) {
    console.log('\n⏭️  Render — RENDER_API_KEY absent');
    console.log('   Blueprint manuel : https://dashboard.render.com/blueprints/new');
    console.log('   Puis : RENDER_API_KEY=xxx npm run devops:prod:sync -- --render');
    return;
  }

  console.log('\n☁️  Provisionnement Render (API)\n');
  const root = new URL('../..', import.meta.url);
  const cwd = decodeURIComponent(root.pathname).replace(/^\/([A-Z]:)/, '$1');
  const result = spawnSync(process.execPath, ['scripts/devops/render-provision.mjs', 'status'], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, RENDER_API_KEY: apiKey },
  });
  if (result.stdout) console.log(result.stdout);
  if (result.stderr) console.error(result.stderr);

  const sync = spawnSync(process.execPath, ['scripts/devops/render-provision.mjs', 'sync-github'], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, RENDER_API_KEY: apiKey },
  });
  if (sync.stdout) console.log(sync.stdout);
  if (sync.status !== 0 && sync.stderr) console.log(sync.stderr);
}

async function main() {
  console.log('🐾 PetfoodTN — hébergement\n');
  await makeGhcrPackagesPublic();
  const pagesUrl = await enableGithubPages();
  await triggerPagesWorkflow();
  if (withRender) provisionRender();

  console.log('\n✅ Hébergement initié');
  console.log(`\nFrontend (GitHub Pages) : ${pagesUrl}`);
  console.log('Render (stack complète)   : https://petfoodtn-web.onrender.com');
  console.log('                         → Blueprint requis si 404 (voir docs/RENDER-SETUP.md)\n');
}

main().catch((err) => {
  console.error('Erreur:', err.message);
  process.exit(1);
});
