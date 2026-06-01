import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'screenshots');
const base = 'http://localhost:5002/api';
const front = 'http://localhost:3001';

// 1) Login API
const loginRes = await fetch(`${base}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'vet@petfood.tn', password: 'Vet2024!' }),
});
const { token } = await loginRes.json();
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

// 2) Before import
const before = await fetch(`${base}/vet/bi/dashboard`, { headers }).then((r) => r.json());
const alertsBefore = before.summary?.lowStock ?? 0;
const missingBefore = before.missingMedications?.length ?? 0;

// 3) Pharmacy import — médicaments manquants
const pharmacyCsv = `medicament,quantite,unite,prix
Probiotiques,40,unité,10
Support digestion,35,unité,8
Complément fibres,30,unité,9
Ajustement dose,25,unité,7
Solution hydratation,20,unité,6`;

const importRes = await fetch(`${base}/vet/bi/pharmacy-import`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ csv: pharmacyCsv, fileName: 'test-reappro.csv' }),
});
const importBody = await importRes.json();

// 4) After import
const after = await fetch(`${base}/vet/bi/dashboard`, { headers }).then((r) => r.json());
const alertsAfter = after.summary?.lowStock ?? 0;

console.log(JSON.stringify({
  importOk: importRes.ok,
  importMessage: importBody.message,
  imported: importBody.imported,
  alertsBefore,
  alertsAfter,
  missingBefore,
  missingAfter: after.missingMedications?.length,
}, null, 2));

// 5) Screenshot UI after import
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(front, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(2000);
await page.locator('input[type="email"]').first().fill('vet@petfood.tn');
await page.locator('input[type="password"]').first().fill('Vet2024!');
await page.locator('button[type="submit"]').first().click();
await page.waitForTimeout(4000);
await page.goto(`${front}/vet/bi`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);

const shot = path.join(outDir, 'vet-bi-after-import.png');
await page.screenshot({ path: shot, fullPage: true });
console.log('Screenshot:', shot);
await browser.close();
