import { chromium } from 'playwright';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';
const results = { passed: [], failed: [], blockers: [] };

const check = (ok, label) => (ok ? results.passed : results.failed).push(label);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();

try {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.fill('input[name="email"]', 'client@petfood.tn');
  await page.fill('input[name="password"]', 'MonChat123!');
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 25000 });
  check(true, 'Connexion client OK');

  const routes = [
    { path: '/client-products', mustSee: [/Nos Produits|Produits/i], mustNotSee: [/IA Premium|marketplace vendeur|Pack produits/i] },
    { path: '/client-favorites', mustSee: [/favoris|Manteau|Croquettes/i] },
    { path: '/client-orders', mustSee: [/Commandes|commande/i] },
    { path: '/client-invoices', mustSee: [/Factures|facture/i] },
    { path: '/client-history', mustSee: [/Historique/i] },
    { path: '/client-loyalty', mustSee: [/Fidélité|points/i] },
    { path: '/client-reviews', mustSee: [/Avis|avis/i], mustNotSee: [/Livraison & Vétérinaire|ressenti émotionnel/i] },
    { path: '/client-complaints', mustSee: [/Réclamation|réclamation/i] },
    { path: '/client-services', mustSee: [/Mes services|Toilettage|Réhabilitation refuges/i], mustNotSee: [/ressenti émotionnel/i] },
    { path: '/pet-feeder', mustSee: [/Distributeur IoT|Historique récent|Horaires/i] },
    { path: '/pet-calories', mustSee: [/Calories|kcal/i], mustNotSee: [/NutriPro/i] },
    { path: '/pet-advice', mustSee: [/Conseils/i], mustNotSee: [/Détection d'animal avec caméra|Analyse santé IA/i] },
    { path: '/veterinary', mustSee: [/Santé|vétérinaire|Vétérinaire/i] },
    { path: '/medical-dossier', mustSee: [/Dossier|points relais|Retrait médicaments/i] },
    { path: '/checkout', mustSee: [/Livraison à domicile|paiement|Paiement/i], mustNotSee: [/Point relais/i] },
  ];

  for (const { path, mustSee, mustNotSee = [] } of routes) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(800);
    const body = await page.locator('body').innerText();

    for (const re of mustSee) {
      check(re.test(body), `${path} — visible: ${re}`);
    }
    for (const re of mustNotSee) {
      check(!re.test(body), `${path} — absent: ${re}`);
    }
  }

  // Redirects anciennes routes
  for (const [from, toPart] of [
    ['/client-ai', '/client-products'],
    ['/client-wellness', '/pet-calories'],
    ['/client-rehabilitation', '/client-services'],
    ['/smart-food-agent', '/pet-calories'],
  ]) {
    await page.goto(`${BASE}${from}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(500);
    check(page.url().includes(toPart), `Redirect ${from} → ${toPart} (${page.url()})`);
  }

  // Sidebar assistant IA
  await page.goto(`${BASE}/client-products`, { waitUntil: 'domcontentloaded' });
  const sidebarAssistant = await page.getByRole('button', { name: /Assistant IA/i }).first().isVisible().catch(() => false);
  check(sidebarAssistant, 'Sidebar — bouton Assistant IA');

  const recoPanel = await page.getByLabel(/Assistant IA — recommandations/i).isVisible().catch(() => false);
  check(recoPanel, 'Panneau latéral recommandations produits');

  // Onglet points relais véto
  await page.goto(`${BASE}/veterinary`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  const relaisTab = page.locator('button').filter({ hasText: /^Points relais$/ }).first();
  if (await relaisTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await relaisTab.scrollIntoViewIfNeeded();
    await relaisTab.click();
    await page.waitForTimeout(600);
    const relaisBody = await page.locator('body').innerText();
    check(/Points relais|Animalerie|Clinique|relais/i.test(relaisBody), 'Vétérinaire — onglet Points relais');
  } else {
    const bodyFallback = await page.locator('body').innerText();
    check(/Points relais|relais/i.test(bodyFallback), 'Vétérinaire — onglet Points relais (fallback texte page)');
  }
} catch (e) {
  results.blockers.push(String(e.message || e));
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
process.exit(results.failed.length || results.blockers.length ? 1 : 0);
