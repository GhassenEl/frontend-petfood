#!/usr/bin/env node
/**
 * Automatisation dashboards Grafana — validation JSON + provisioning API.
 *
 * Usage :
 *   node scripts/devops/provision-dashboards.mjs --validate
 *   node scripts/devops/provision-dashboards.mjs --provision
 *   GRAFANA_URL=http://localhost:3000 GRAFANA_ADMIN_USER=admin GRAFANA_ADMIN_PASSWORD=xxx node scripts/devops/provision-dashboards.mjs --provision
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const DASHBOARDS_DIR = path.join(ROOT, 'infra/monitoring/grafana/dashboards');

const args = process.argv.slice(2);
const validateOnly = args.includes('--validate') || (!args.includes('--provision') && !args.includes('--push'));
const doProvision = args.includes('--provision') || args.includes('--push');

const GRAFANA_URL = (process.env.GRAFANA_URL || process.env.VITE_GRAFANA_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const GRAFANA_USER = process.env.GRAFANA_ADMIN_USER || 'admin';
const GRAFANA_PASS = process.env.GRAFANA_ADMIN_PASSWORD || process.env.GRAFANA_PASSWORD || '';

function listDashboardFiles() {
  if (!fs.existsSync(DASHBOARDS_DIR)) {
    throw new Error(`Dossier dashboards introuvable : ${DASHBOARDS_DIR}`);
  }
  return fs.readdirSync(DASHBOARDS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(DASHBOARDS_DIR, f));
}

function validateDashboard(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    throw new Error(`${path.basename(filePath)} : JSON invalide — ${e.message}`);
  }
  if (!json.title) throw new Error(`${path.basename(filePath)} : champ "title" requis`);
  if (!json.uid) throw new Error(`${path.basename(filePath)} : champ "uid" requis`);
  if (!Array.isArray(json.panels)) throw new Error(`${path.basename(filePath)} : "panels" doit être un tableau`);
  return { file: path.basename(filePath), uid: json.uid, title: json.title, json };
}

async function grafanaRequest(apiPath, { method = 'GET', body } = {}) {
  const auth = Buffer.from(`${GRAFANA_USER}:${GRAFANA_PASS}`).toString('base64');
  const res = await fetch(`${GRAFANA_URL}${apiPath}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) {
    throw new Error(`Grafana ${method} ${apiPath} → ${res.status} ${data?.message || text}`);
  }
  return data;
}

async function provisionToGrafana(dashboard) {
  const folderUid = process.env.GRAFANA_FOLDER_UID || 'petfoodtn';
  let folderId = 0;
  try {
    const folders = await grafanaRequest('/api/folders');
    const found = Array.isArray(folders) ? folders.find((f) => f.uid === folderUid || f.title === 'PetfoodTN') : null;
    if (found) folderId = found.id;
    else {
      const created = await grafanaRequest('/api/folders', {
        method: 'POST',
        body: { uid: folderUid, title: 'PetfoodTN' },
      });
      folderId = created.id;
    }
  } catch {
    folderId = 0;
  }

  const payload = {
    dashboard: { ...dashboard.json, id: null },
    folderId,
    overwrite: true,
    message: `provision-dashboards.mjs — ${new Date().toISOString()}`,
  };

  await grafanaRequest('/api/dashboards/db', { method: 'POST', body: payload });
  return `${GRAFANA_URL}/d/${dashboard.uid}`;
}

async function main() {
  console.log('\n📊 PetfoodTN — automatisation dashboards DevOps\n');

  const files = listDashboardFiles();
  const dashboards = files.map(validateDashboard);
  console.log(`✅ ${dashboards.length} dashboard(s) JSON valide(s) :`);
  dashboards.forEach((d) => console.log(`   · ${d.uid} — ${d.title}`));

  if (validateOnly && !doProvision) {
    console.log('\n✅ Validation terminée (--validate)\n');
    return;
  }

  if (!GRAFANA_PASS) {
    console.warn('\n⚠️  GRAFANA_ADMIN_PASSWORD absent — provisioning API ignoré.');
    console.warn('   Les dashboards sont chargés via provisioning Docker (volume Grafana).\n');
    return;
  }

  let grafanaOk = false;
  try {
    await grafanaRequest('/api/health');
    grafanaOk = true;
    console.log(`\n✅ Grafana accessible : ${GRAFANA_URL}`);
  } catch (e) {
    console.warn(`\n⚠️  Grafana indisponible (${e.message}) — skip push API`);
  }

  if (!grafanaOk) return;

  for (const dash of dashboards) {
    try {
      const url = await provisionToGrafana(dash);
      console.log(`   ✅ Provisionné : ${dash.uid} → ${url}`);
    } catch (e) {
      console.error(`   ❌ ${dash.uid} : ${e.message}`);
      process.exitCode = 1;
    }
  }

  console.log('\n✅ Provisioning Grafana terminé\n');
}

main().catch((e) => {
  console.error(`\n❌ ${e.message}\n`);
  process.exit(1);
});
