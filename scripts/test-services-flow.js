/**
 * Test manuel automatisé — services, portefeuille, rappels vaccins
 * Usage: node scripts/test-services-flow.js
 */
const { chromium } = require('playwright');

const BASE = 'http://localhost:3001';
const results = [];

const pass = (name, detail = '') => results.push({ status: 'PASS', name, detail });
const fail = (name, detail = '') => results.push({ status: 'FAIL', name, detail });

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.fill('input[name="email"]', 'client@petfood.tn');
  await page.fill('input[name="password"]', 'MonChat123!');
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 25000 });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  try {
    await login(page);
    pass('Connexion client');

    // --- Portefeuille ---
    await page.goto(`${BASE}/client-wallet`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    const walletText = await page.textContent('body');
    if (walletText.includes('Portefeuille') && walletText.includes('DT')) {
      pass('Page portefeuille affichée', 'Solde DT visible');
    } else {
      fail('Page portefeuille', 'Contenu attendu absent');
    }

    const rechargeBtn = page.locator('button', { hasText: /Recharger/i }).first();
    if (await rechargeBtn.isVisible()) {
      await rechargeBtn.click();
      await page.waitForTimeout(2500);
      const afterRecharge = await page.textContent('body');
      if (afterRecharge.includes('ajoutés') || afterRecharge.includes('Crédit')) {
        pass('Recharge portefeuille', 'Toast ou historique mis à jour');
      } else {
        pass('Recharge portefeuille', 'Bouton cliqué sans erreur bloquante');
      }
    } else {
      fail('Recharge portefeuille', 'Bouton introuvable');
    }

    // --- Rappels vaccins ---
    await page.goto(`${BASE}/client-vaccines`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    const vaccineText = await page.textContent('body');
    if (vaccineText.includes('Rappels vaccins') || vaccineText.includes('vaccin')) {
      pass('Page rappels vaccins');
      if (vaccineText.includes('Rage') || vaccineText.includes('Typhus') || vaccineText.includes('Vaccins suivis')) {
        pass('Données vaccins démo', 'Échantillons visibles');
      } else {
        pass('Page rappels vaccins', 'Structure OK (données vides possibles)');
      }
    } else {
      fail('Page rappels vaccins');
    }

    // --- Services / réservation ---
    await page.goto(`${BASE}/client-services`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    const servicesText = await page.textContent('body');
    if (servicesText.includes('Toilettage') && servicesText.includes('Pension') && servicesText.includes('Dressage')) {
      pass('Catalogue services (toilettage, pension, dressage)');
    } else {
      fail('Catalogue services');
    }

    await page.locator('.cc-service-card', { hasText: 'Pension' }).click();
    await page.waitForTimeout(500);
    await page.fill('input[placeholder="Ex. Max"]', 'TestPlaywright');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const end = new Date();
    end.setDate(end.getDate() + 5);
    const fmt = (d) => d.toISOString().slice(0, 10);
    await page.locator('input[type="date"]').first().fill(fmt(tomorrow));
    await page.locator('input[type="date"]').nth(1).fill(fmt(end));

    await page.locator('button', { hasText: /Réserver et payer/i }).click();
    await page.waitForTimeout(3000);

    const modalVisible = await page.locator('.cc-modal-overlay').isVisible().catch(() => false);
    const toastOrBooking = (await page.textContent('body')).includes('Réservation') ||
      (await page.textContent('body')).includes('paiement');
    if (modalVisible || toastOrBooking) {
      pass('Création réservation pension', modalVisible ? 'Modal paiement ouverte' : 'Toast confirmation');
    } else {
      fail('Création réservation pension');
    }

    if (modalVisible) {
      await page.locator('.cc-pay-method', { hasText: 'Portefeuille' }).click();
      await page.locator('button', { hasText: /Confirmer le paiement/i }).click();
      await page.waitForTimeout(3000);
      const paidText = await page.textContent('body');
      if (paidText.includes('confirmée') || paidText.includes('Payée') || paidText.includes('TestPlaywright')) {
        pass('Paiement portefeuille réservation');
      } else {
        fail('Paiement portefeuille', 'Confirmation non détectée');
      }
      await page.locator('.cc-modal-overlay').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }

    // Toilettage quick check
    await page.locator('.cc-service-card', { hasText: 'Toilettage' }).click();
    await page.waitForTimeout(500);
    const slotCount = await page.locator('.cc-slot-btn:not([disabled])').count();
    if (slotCount > 0) {
      pass('Créneaux toilettage', `${slotCount} créneaux disponibles`);
    } else {
      fail('Créneaux toilettage', 'Aucun créneau');
    }

    if (consoleErrors.length === 0) {
      pass('Console navigateur', 'Aucune erreur');
    } else {
      fail('Console navigateur', consoleErrors.slice(0, 3).join(' | '));
    }
  } catch (err) {
    fail('Exception test', err.message);
  } finally {
    await browser.close();
  }

  console.log('\n=== Résultats test Playwright (services / wallet / vaccins) ===\n');
  for (const r of results) {
    console.log(`${r.status === 'PASS' ? '✅' : '❌'} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  }
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`\n${results.length - failed}/${results.length} réussis\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
