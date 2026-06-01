import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'screenshots');
const front = 'http://localhost:3001';
const api = 'http://localhost:5002/api';

async function login(email, password) {
  const res = await fetch(`${api}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

async function getNotifs(token) {
  const res = await fetch(`${api}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const countRes = await fetch(`${api}/notifications/count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { list: await res.json(), count: await countRes.json() };
}

const vet = await login('vet@petfood.tn', 'Vet2024!');
const liv = await login('livreur@petfood.tn', 'Livreur123!');
const vetData = await getNotifs(vet.token);
const livData = await getNotifs(liv.token);

console.log('API Vet:', vetData.count.unread, 'notifs, list:', vetData.list.length);
console.log('API Livreur:', livData.count.unread, 'notifs, list:', livData.list.length);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

async function shotRole(email, password, filename) {
  await page.context().clearCookies();
  await page.goto(front, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.count()) {
    await emailInput.first().fill(email);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);
  }
  await page.locator('button[aria-label="Notifications"]').first().click({ timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, filename) });
}

await shotRole('vet@petfood.tn', 'Vet2024!', 'notif-vet.png');
await shotRole('livreur@petfood.tn', 'Livreur123!', 'notif-livreur.png');

await browser.close();
console.log('Screenshots saved in screenshots/');
