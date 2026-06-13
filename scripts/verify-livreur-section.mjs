import { chromium } from 'playwright';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';
const results = { passed: [], failed: [], blockers: [] };

const check = (ok, label) => (ok ? results.passed : results.failed).push(label);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();

try {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.fill('input[name="email"]', 'livreur@petfood.tn');
  await page.fill('input[name="password"]', 'Livreur123!');
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 25000 });
  check(true, 'Connexion livreur OK');

  const routes = [
    { path: '/livreur/dashboard', mustSee: [/Bonjour|Tableau de bord|livraison/i], mustNotSee: [/IA livraison|Prévisions de tournée|XGBoost/i] },
    { path: '/livreur/orders', mustSee: [/Commandes|La Marsa|Ariana/i], mustNotSee: [/Aucune commande trouvée/i] },
    { path: '/livreur/map', mustSee: [/Carte des livraisons|GPS|La Marsa/i], mustNotSee: [/Aucune livraison en cours/i] },
    { path: '/livreur/stats', mustSee: [/Statistiques|Commission|Livraisons/i], mustNotSee: [/IA livraison|Prévisions de tournée/i] },
    { path: '/livreur/earnings', mustSee: [/Gains|Commission|DT/i], mustNotSee: [/Aucun gain pour cette période/i] },
    { path: '/livreur/history', mustSee: [/Historique|Carthage|La Marsa/i], mustNotSee: [/Aucune livraison effectuée/i] },
    { path: '/livreur/messages', mustSee: [/Messages|Administration|Sami Ben Ali/i], mustNotSee: [] },
    { path: '/livreur/leave-requests', mustSee: [/Congés|maladie|Validé|En attente/i], mustNotSee: [/Aucune demande pour le moment/i] },
    { path: '/livreur/route', mustSee: [/Tournée|Arrêts|km/i], mustNotSee: [] },
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

  await page.goto(`${BASE}/livreur/ml`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(500);
  check(page.url().includes('/livreur/stats'), `Redirect /livreur/ml → stats (${page.url()})`);

  await page.goto(`${BASE}/livreur/dashboard`, { waitUntil: 'domcontentloaded' });
  const sidebarText = await page.locator('.livreur-sidebar, .sidebar-nav').first().innerText().catch(() => '');
  check(!/IA Livraison/i.test(sidebarText), 'Sidebar — IA Livraison absente');
} catch (err) {
  results.blockers.push(String(err.message || err));
} finally {
  await browser.close();
}

console.log(`\n=== Vérification espace livreur ===`);
console.log(`OK: ${results.passed.length} | KO: ${results.failed.length} | Bloquants: ${results.blockers.length}`);
if (results.failed.length) console.log('\nÉchecs:', results.failed);
if (results.blockers.length) console.log('\nBloquants:', results.blockers);
process.exit(results.failed.length || results.blockers.length ? 1 : 0);
