/** @param {import('@playwright/test').Page} page */
async function loginAsClient(page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', 'client@petfood.tn');
  await page.fill('input[name="password"]', 'MonChat123!');
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 25_000 });
}

module.exports = { loginAsClient };
