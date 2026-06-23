// @ts-check
const { test, expect } = require('@playwright/test');
const { loginAsClient } = require('./helpers/auth');
const { loginClientApi, ensureWalletBalance, localDateStr } = require('./helpers/api');

test.describe('Refonte portefeuille & rappels vaccins', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsClient(page);
  });

  test('redirige /client-wallet vers /checkout', async ({ page }) => {
    await page.goto('/client-wallet');
    await expect(page).toHaveURL(/\/checkout$/);
  });

  test('redirige /client-vaccines vers /medical-dossier', async ({ page }) => {
    await page.goto('/client-vaccines');
    await expect(page).toHaveURL(/\/medical-dossier$/);
  });

  test('affiche le portefeuille dans les moyens de paiement (checkout)', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.getByRole('heading', { name: /méthode de paiement/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /portefeuille/i }).first()).toBeVisible();
    await page.getByRole('button', { name: /portefeuille/i }).first().click();
    await expect(page.getByText(/portefeuille électronique/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /\+20 DT/i })).toBeVisible();
  });

  test('recharge le portefeuille depuis le checkout', async ({ page }) => {
    await page.goto('/checkout');
    await page.getByRole('button', { name: /portefeuille/i }).first().click();
    await expect(page.getByText(/portefeuille électronique/i)).toBeVisible();
    const topupResponse = page.waitForResponse(
      (r) => r.url().includes('/wallet/topup') && r.request().method() === 'POST',
    );
    await page.getByRole('button', { name: /\+50 DT/i }).click();
    const response = await topupResponse;
    expect(response.ok()).toBeTruthy();
  });

  test('affiche les rappels vaccins dans le dossier médical', async ({ page }) => {
    await page.goto('/medical-dossier');
    await expect(page.getByRole('heading', { name: /rappels santé automatiques/i })).toBeVisible();
    await expect(page.locator('body')).toContainText(/vaccin|rappel/i);
  });

  test('sidebar sans entrées portefeuille ni rappels vaccins', async ({ page }) => {
    await page.goto('/client-products');
    const sidebar = page.locator('aside.admin-sidebar');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /^portefeuille$/i })).toHaveCount(0);
    await expect(sidebar.getByRole('link', { name: /rappels vaccins/i })).toHaveCount(0);
    await expect(sidebar.getByRole('link', { name: /dossier médical/i })).toBeVisible();
  });
});

test.describe('Réservation services avec portefeuille', () => {
  const bookableCard = (page, heading) =>
    page.locator('.cc-service-grid .cc-service-card').filter({
      has: page.getByRole('heading', { name: heading }),
    });
  const groomingCard = (page) => bookableCard(page, /^Toilettage/);
  const pensionCard = (page) => bookableCard(page, 'Pension');
  const trainingCard = (page) => bookableCard(page, 'Dressage');

  test.beforeEach(async ({ page, request }) => {
    await loginAsClient(page);
    const { token } = await loginClientApi(request);
    await ensureWalletBalance(request, token, 250);
  });

  test('catalogue services et réservation pension avec paiement portefeuille', async ({ page }) => {
    await page.goto('/client-services');
    await expect(page.locator('.cc-service-card').first()).toBeVisible({ timeout: 15_000 });
    await expect(groomingCard(page)).toBeVisible();
    await expect(pensionCard(page)).toBeVisible();
    await expect(trainingCard(page)).toBeVisible();

    await pensionCard(page).click();
    await expect(page.getByText(/date de fin|départ/i)).toBeVisible();

    const petName = `E2E-${Date.now()}`;
    await page.fill('input[placeholder="Ex. Max"]', petName);
    await page.locator('input[type="date"]').first().fill(localDateStr(3));
    await page.locator('input[type="date"]').nth(1).fill(localDateStr(6));

    const bookingResponse = page.waitForResponse(
      (r) => r.url().includes('/service-bookings') && r.request().method() === 'POST',
      { timeout: 30_000 },
    );
    await page.getByRole('button', { name: /réserver et payer/i }).click();
    const response = await bookingResponse;
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Réservation pension échouée (${response.status()}): ${body}`);
    }

    const modal = page.locator('.cc-modal-overlay');
    await expect(modal).toBeVisible({ timeout: 15_000 });
    await modal.getByRole('button', { name: /confirmer le paiement/i }).click();

    await expect(modal).toBeHidden({ timeout: 20_000 });
    await page.getByRole('tab', { name: /mes réservations/i }).click();
    await expect(
      page.locator('.cc-list').getByRole('heading', { name: new RegExp(petName) }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('créneaux toilettage disponibles', async ({ page }) => {
    await page.goto('/client-services');
    await expect(groomingCard(page)).toBeVisible({ timeout: 15_000 });
    await groomingCard(page).click();
    await expect(page.getByText(/créneau horaire/i)).toBeVisible();
    const slots = page.locator('.cc-slot-btn:not([disabled])');
    await expect(slots.first()).toBeVisible({ timeout: 15_000 });
    expect(await slots.count()).toBeGreaterThan(0);
  });
});
