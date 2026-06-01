import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '..', 'screenshots', 'vet-map.png');
const front = 'http://localhost:3001';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(front, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(2000);
await page.locator('input[type="email"]').first().fill('client@petfood.tn');
await page.locator('input[type="password"]').first().fill('MonChat123!');
await page.locator('button[type="submit"]').first().click();
await page.waitForTimeout(4000);
await page.goto(`${front}/veterinary`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await page.screenshot({ path: out, fullPage: false });
console.log('Saved', out);
await browser.close();
