const { chromium } = require('playwright');

const BASE = 'http://localhost:3001';
const issues = [];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', (msg) => {
    const t = msg.type();
    if (t === 'error' || t === 'warning') {
      issues.push({ type: t, text: msg.text(), url: page.url() });
    }
  });
  page.on('pageerror', (err) => {
    issues.push({ type: 'pageerror', text: err.message, url: page.url() });
  });

  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  await page.fill('input[name="email"]', 'client@petfood.tn');
  await page.fill('input[name="password"]', 'MonChat123!');
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 20000 });
  await page.waitForTimeout(3000);

  for (const route of ['/client-products', '/client-favorites', '/client-loyalty', '/client-orders']) {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
  }

  await browser.close();

  const unique = [...new Map(issues.map((i) => [i.type + i.text, i])).values()];
  console.log(JSON.stringify(unique, null, 2));
  console.log('\nTotal:', unique.length);
}

run().catch(console.error);
