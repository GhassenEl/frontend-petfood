import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto('http://localhost:3001/login', { waitUntil: 'domcontentloaded' });
const loginChecks = {
  emailLabel: await page.locator('label[for="login-email"]').count(),
  rememberMe: await page.getByText('Se souvenir de moi').count(),
  submit: await page.locator('button[type="submit"]').count(),
};

await page.goto('http://localhost:3001/register', { waitUntil: 'domcontentloaded' });
const regChecks = {
  nameLabel: await page.locator('label[for="register-name"]').count(),
  rememberMe: await page.getByText('Se souvenir de moi').count(),
  eyeBtn: await page.locator('button[aria-label*="mot de passe"]').count(),
};

await page.goto('http://localhost:3001/login');
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(600);
const loginErrors = await page.locator('[role="alert"]').count();

console.log(JSON.stringify({ loginChecks, regChecks, loginErrorsAfterEmptySubmit: loginErrors }, null, 2));
await browser.close();
