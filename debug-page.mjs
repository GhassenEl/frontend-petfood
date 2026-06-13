import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3001/';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];

page.on('pageerror', (e) => errors.push(`PAGE: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`CONSOLE: ${m.text()}`);
});

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(8000);

const root = await page.evaluate(() => ({
  innerHTML: document.getElementById('root')?.innerHTML?.slice(0, 500) || '',
  len: document.getElementById('root')?.innerHTML?.length ?? -1,
  bodyClass: document.body.className,
  bodyBg: getComputedStyle(document.body).backgroundColor,
}));

console.log('URL:', url);
console.log('TITLE:', await page.title());
console.log('ROOT:', JSON.stringify(root, null, 2));
console.log('ERRORS:', JSON.stringify(errors, null, 2));

await browser.close();
