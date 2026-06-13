/** @param {import('@playwright/test').Page} page */
async function loginAsClient(page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel(/adresse email/i).fill('client@petfood.tn');
  await page.getByLabel(/^mot de passe$/i).fill('MonChat123!');
  await page.getByRole('button', { name: /se connecter/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30_000 });
}

module.exports = { loginAsClient };
