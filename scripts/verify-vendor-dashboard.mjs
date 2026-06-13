import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';

const results = { passed: [], failed: [], blockers: [] };

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();

try {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.fill('input[name="email"]', 'client@petfood.tn');
  await page.fill('input[name="password"]', 'MonChat123!');
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 25000 });
  results.passed.push('Connexion client OK');

  await page.goto(`${BASE}/vendor-dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(
    () => document.querySelector('h1')?.innerText?.length > 3
      || document.body?.innerText?.includes('CA 7 jours')
      || document.body?.innerText?.includes('Devenir vendeur'),
    { timeout: 45000 },
  );

  const becomeVendor = await page.getByRole('heading', { name: /Devenir vendeur/i }).isVisible().catch(() => false);
  if (becomeVendor) {
    results.blockers.push('DEMO_MODE désactivé : écran inscription au lieu du dashboard démo');
  }

  const title = (await page.locator('h1').first().textContent())?.trim() || '';
  if (/animalerie/i.test(title) && /démo|demo/i.test(title)) {
    results.passed.push(`Dashboard démo: ${title}`);
  } else if (title && !/Devenir vendeur/i.test(title)) {
    results.passed.push(`En-tête boutique: ${title}`);
  } else {
    results.failed.push(`En-tête inattendu: ${title}`);
  }

  for (const [name, re] of [
    ['CA 7 jours', /CA 7 jours/i],
    ['CA 30 jours', /CA 30 jours/i],
    ['Agent BI', /Agent BI/i],
    ['Prévision CA', /Prévision CA/i],
    ['Tendance des ventes', /Tendance des ventes/i],
    ['Actualiser', /Actualiser/i],
  ]) {
    const ok = await page.getByText(re).first().isVisible().catch(() => false);
    (ok ? results.passed : results.failed).push(`Visible: ${name}`);
  }

  await page.getByRole('button', { name: 'Produits & perf.' }).click();
  await page.waitForTimeout(400);
  const catalog = await page.getByText(/Catalogue & stocks/i).isVisible().catch(() => false);
  (catalog ? results.passed : results.failed).push('Onglet Produits');

  await page.getByRole('button', { name: 'Commandes' }).click();
  await page.waitForTimeout(400);
  const orders = await page.getByText(/commissions récentes/i).isVisible().catch(() => false);
  (orders ? results.passed : results.failed).push('Onglet Commandes');

  const apiResp = await page.evaluate(async () => {
    const t = localStorage.getItem('token');
    const r = await fetch('/api/ecosystem/vendor/dashboard', {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    });
    const j = await r.json().catch(() => ({}));
    return { status: r.status, hasKpis: !!j.kpis, hasMl: !!j.mlAgent, shop: j.shopName };
  });

  if (apiResp.status === 200 && apiResp.hasKpis && apiResp.hasMl) {
    results.passed.push(`API dashboard: ${apiResp.shop} (kpis + mlAgent)`);
  } else {
    results.failed.push(
      `API dashboard status=${apiResp.status} kpis=${apiResp.hasKpis} ml=${apiResp.hasMl}`,
    );
  }

  const shotDir = path.join(process.cwd(), 'test-results');
  fs.mkdirSync(shotDir, { recursive: true });
  const shot = path.join(shotDir, 'vendor-dashboard-verify.png');
  await page.screenshot({ path: shot, fullPage: true });
  results.passed.push(`Capture: ${shot}`);
} catch (e) {
  results.blockers.push(e.message);
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
process.exit(results.failed.length || results.blockers.length ? 1 : 0);
