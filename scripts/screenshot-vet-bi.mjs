import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'screenshots');
const base = 'http://localhost:3001';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3000);

// Login vet
const email = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail" i]').first();
const pass = page.locator('input[type="password"]').first();
if (await email.count()) {
  await email.fill('vet@petfood.tn');
  await pass.fill('Vet2024!');
  await page.locator('button[type="submit"], button:has-text("Connexion"), button:has-text("Se connecter")').first().click();
  await page.waitForTimeout(4000);
}

await page.goto(`${base}/vet/bi`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);

const shot1 = path.join(outDir, 'vet-bi-top.png');
const shot2 = path.join(outDir, 'vet-bi-full.png');
await page.screenshot({ path: shot1 });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1000);
await page.screenshot({ path: shot2, fullPage: true });

const title = await page.locator('h1').first().textContent().catch(() => '');
const kpis = await page.locator('p').filter({ hasText: /Cas cliniques|Maladies|catalogue|Alertes/ }).allTextContents().catch(() => []);

console.log(JSON.stringify({ shot1, shot2, title, kpis, url: page.url() }, null, 2));
await browser.close();
