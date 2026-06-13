import { chromium } from 'playwright';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';
const results = { passed: [], failed: [], blockers: [] };

const check = (ok, label) => (ok ? results.passed : results.failed).push(label);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();

try {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.fill('input[name="email"]', 'admin@petfood.tn');
  await page.fill('input[name="password"]', 'PetfoodTN2024!');
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 25000 });
  check(true, 'Connexion admin OK');

  const routes = [
    {
      path: '/admin/dashboard',
      mustSee: [/Bonjour|Chiffre d'affaires|Statut des commandes|Activité récente/i],
      mustNotSee: [/Agent IA|Détection anomalie|Risque d'annulation|Rachat client|alertes plateforme/i],
    },
    { path: '/admin/powerbi', mustSee: [/Power BI|Alertes opérationnelles|CA du mois/i], mustNotSee: [/Incidents IA|Agent IA incidents/i] },
    { path: '/admin/orders', mustSee: [/Commandes|DT|pending|delivered/i], mustNotSee: [/Aucune commande/i] },
    { path: '/admin/invoices', mustSee: [/Factures|DT/i], mustNotSee: [] },
    { path: '/admin/history', mustSee: [/Historique|Commande|Facture/i], mustNotSee: [/Aucun événement/i] },
    { path: '/admin/users', mustSee: [/Utilisateurs|Karim|Sami|Dr\. Amira/i], mustNotSee: [] },
    { path: '/admin/livreurs', mustSee: [/Livreurs|Karim|Grand Tunis/i], mustNotSee: [] },
    { path: '/admin/veterinary', mustSee: [/vétérinaire|Max|Mimi|diagnostic/i], mustNotSee: [] },
    { path: '/admin/leave-requests', mustSee: [/Congés|maladie|Karim|Dr\. Amira/i], mustNotSee: [] },
    { path: '/admin/messages', mustSee: [/Messages|Sami Ben Ali|Karim Mansouri/i], mustNotSee: [] },
    { path: '/admin/reviews', mustSee: [/Avis|Manteau|Croquettes/i], mustNotSee: [] },
    { path: '/admin/complaints', mustSee: [/Réclamation|Facture|Produit/i], mustNotSee: [/Agent IA/i] },
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
    ['/admin/crm', '/admin/dashboard'],
    ['/admin/rehabilitation', '/admin/dashboard'],
    ['/admin/ml-agent', '/admin/dashboard'],
    ['/admin/incidents-ml', '/admin/dashboard'],
    ['/admin/blog-articles', '/admin/dashboard'],
    ['/admin/stock-bi', '/admin/powerbi'],
  ]) {
    await page.goto(`${BASE}${from}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(500);
    check(page.url().includes(toPart), `Redirect ${from} → ${toPart} (${page.url()})`);
  }

  await page.goto(`${BASE}/admin/dashboard`, { waitUntil: 'domcontentloaded' });
  const sidebarText = await page.locator('.admin-sidebar').first().innerText().catch(() => '');
  check(!/Articles blog|CRM|Réhabilitation|Agent IA|IA Livraison/i.test(sidebarText), 'Sidebar — entrées IA/CRM/blog absentes');
  check(/Power BI/i.test(sidebarText), 'Sidebar — Power BI présent');
} catch (err) {
  results.blockers.push(String(err.message || err));
} finally {
  await browser.close();
}

console.log(`\n=== Vérification espace admin ===`);
console.log(`OK: ${results.passed.length} | KO: ${results.failed.length} | Bloquants: ${results.blockers.length}`);
if (results.failed.length) console.log('\nÉchecs:', results.failed);
if (results.blockers.length) console.log('\nBloquants:', results.blockers);
process.exit(results.failed.length || results.blockers.length ? 1 : 0);
