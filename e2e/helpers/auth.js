/** @param {import('@playwright/test').Page} page */
async function acceptCookieConsent(page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'petfood_cookie_consent',
      JSON.stringify({
        version: 1,
        decidedAt: new Date().toISOString(),
        categories: {
          necessary: true,
          preferences: true,
          analytics: false,
          marketing: false,
        },
      }),
    );
  });
}

/** @param {import('@playwright/test').Page} page */
async function loginAsClient(page) {
  await acceptCookieConsent(page);
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel(/adresse email/i).fill('client@petfood.tn');
  await page.getByLabel(/^mot de passe$/i).fill('MonChat123!');
  await page.getByRole('button', { name: /se connecter/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30_000 });
}

module.exports = { loginAsClient, acceptCookieConsent };
