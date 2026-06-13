import { chromium } from 'playwright';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';
const results = { passed: [], failed: [], blockers: [] };

const check = (ok, label) => (ok ? results.passed : results.failed).push(label);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();

try {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.fill('input[name="email"]', 'vet@petfood.tn');
  await page.fill('input[name="password"]', 'Vet2024!');
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 25000 });
  check(true, 'Connexion vétérinaire OK');

  const routes = [
    {
      path: '/vet/dashboard',
      mustSee: [/VetCare|Rendez-vous du jour|Synthèse clinique|Réapprovisionnements|Derniers cas cliniques/i],
      mustNotSee: [/Agent IA|IA clinique|Import pharmacie|Réhabilitation/i],
    },
    {
      path: '/vet/bi',
      mustSee: [/Dashboard BI|Référentiel maladie|Derniers cas cliniques|réapprovisionnements|Max|Mimi/i],
      mustNotSee: [/Import pharmacie|Importez des données|Pharmacie partenaire/i],
    },
    { path: '/vet/calendar', mustSee: [/Max|Mimi|Calendrier|Planifié|Confirmé/i], mustNotSee: [] },
    { path: '/vet/medical-dossiers', mustSee: [/DMP-2026|Max|Mimi|Dossiers médicaux/i], mustNotSee: [] },
    { path: '/vet/vaccinations', mustSee: [/Vaccinations|Max|Mimi|Rage|Typhus/i], mustNotSee: [] },
    { path: '/vet/pharmacy', mustSee: [/Pharmacie clinique|Antiparasitaire|Stock clinique|Emplacement/i], mustNotSee: [/Pharmacie partenaire/i] },
    {
      path: '/vet/diagnostics',
      mustSee: [/Détection précoce|Analyser symptômes|Patient & signes/i],
      mustNotSee: [/diagnostic IA|Agent IA|Analyse IA|Notes cliniques IA|ml-agent/i],
    },
    {
      path: '/vet/clients',
      mustSee: [/Sami Ben Ali|Ajouter client|Détails|Nadia/i],
      mustNotSee: [/Agent IA|Diagnostic IA/i],
    },
    {
      path: '/vet/clients/demo-client-2',
      mustSee: [/Ines Trabelsi|Mimi|Consultations récentes|Dermatite/i],
      mustNotSee: [],
    },
    { path: '/vet/history', mustSee: [/Historique|Consultations|Dermatite|Max|Mimi/i], mustNotSee: [/Aucune consultation pour cet animal/i] },
    { path: '/vet/contact-requests', mustSee: [/Demandes de contact|Dermatite|Simba|en attente/i], mustNotSee: [] },
    { path: '/vet/leave-requests', mustSee: [/Congés|maladie|Congrès|Indisposition/i], mustNotSee: [/Agent IA/i] },
  ];

  for (const { path, mustSee, mustNotSee = [] } of routes) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(900);
    const body = await page.locator('body').innerText();

    for (const re of mustSee) {
      check(re.test(body), `${path} — visible: ${re}`);
    }
    for (const re of mustNotSee) {
      check(!re.test(body), `${path} — absent: ${re}`);
    }
  }

  for (const [from, toPart] of [
    ['/vet/ml-agent', '/vet/dashboard'],
    ['/vet/rehabilitation', '/vet/dashboard'],
  ]) {
    await page.goto(`${BASE}${from}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(500);
    check(page.url().includes(toPart), `Redirect ${from} → ${toPart} (${page.url()})`);
  }

  await page.goto(`${BASE}/vet/dashboard`, { waitUntil: 'domcontentloaded' });
  const sidebarText = await page.locator('.vet-sidebar').first().innerText().catch(() => '');
  check(!/Agent IA|IA clinique|Réhabilitation|Import données/i.test(sidebarText), 'Sidebar — entrées IA/réhab absentes');
  check(/Assistant IA/i.test(sidebarText), 'Sidebar — Assistant IA présent');
  check(!/Assistance clinique|Agent IA/i.test(sidebarText), 'Sidebar — pas Agent IA / Assistance clinique');
} catch (err) {
  results.blockers.push(String(err.message || err));
} finally {
  await browser.close();
}

console.log(`\n=== Vérification espace vétérinaire ===`);
console.log(`OK: ${results.passed.length} | KO: ${results.failed.length} | Bloquants: ${results.blockers.length}`);
if (results.failed.length) console.log('\nÉchecs:', results.failed);
if (results.blockers.length) console.log('\nBloquants:', results.blockers);
process.exit(results.failed.length || results.blockers.length ? 1 : 0);
