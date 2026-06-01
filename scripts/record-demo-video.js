/**
 * Enregistre une vidéo de démonstration (~5 min) de PetfoodTN.
 * Prérequis : npm run dev (frontend :3001 + backend :5002)
 *
 * Usage : npm run demo:video
 * Sortie  : demo-videos/petfoodtn-demo-*.webm
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.DEMO_BASE_URL || 'http://localhost:3001';
const OUT_DIR = path.join(__dirname, '..', 'demo-videos');
/** Multiplicateur de pause (2.3 ≈ 5 min total) */
const PACE = Number(process.env.DEMO_PACE || 1);
const pause = (ms) => Math.round(ms * PACE);

const ACCOUNTS = {
  client: { email: 'client@petfood.tn', password: 'MonChat123!' },
  livreur: { email: 'livreur@petfood.tn', password: 'Livreur123!' },
  admin: { email: 'admin@petfood.tn', password: 'PetfoodTN2024!' },
  vet: { email: 'vet@petfood.tn', password: 'Vet2024!' },
};

const wait = (ms) => new Promise((r) => setTimeout(r, pause(ms)));

async function login(page, { email, password }, label) {
  console.log(`→ Connexion ${label}…`);
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await wait(1000);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
  await wait(1500);
}

async function logout(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    ['token', 'petfood_token', 'authToken'].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  });
  await wait(800);
}

async function visit(page, route, pauseMs = 3500, label = route) {
  console.log(`  · ${label}`);
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await wait(pauseMs);
}

async function scrollPage(page, steps = 3) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, 400);
    await wait(500);
  }
}

async function openNotifications(page) {
  const bell = page.locator('button[aria-label*="Notification"]').first();
  if (await bell.count()) {
    await bell.click();
    await wait(2500);
    await page.keyboard.press('Escape');
    await wait(400);
  }
}

async function runClientDemo(page) {
  await login(page, ACCOUNTS.client, 'client');
  await visit(page, '/client-products', 4000, 'Catalogue produits');
  await scrollPage(page, 2);

  const heart = page.locator('button').filter({ hasText: /🤍|❤️/ }).first();
  if (await heart.count()) {
    await heart.click();
    await wait(1500);
  }

  await visit(page, '/client-favorites', 3500, 'Favoris & achats fréquents');
  await visit(page, '/client-loyalty', 4000, 'Fidélité & promotions');
  await visit(page, '/client-orders', 3500, 'Suivi commandes');
  await visit(page, '/client-invoices', 3000, 'Factures');
  await visit(page, '/medical-dossier', 3500, 'Dossier médical');
  await openNotifications(page);
}

async function runLivreurDemo(page) {
  await logout(page);
  await login(page, ACCOUNTS.livreur, 'livreur');
  await visit(page, '/livreur/dashboard', 5000, 'Dashboard + graphiques');
  await scrollPage(page, 4);
  await visit(page, '/livreur/stats', 4000, 'Statistiques détaillées');
  await visit(page, '/livreur/messages', 4000, 'Messagerie livreur');
  await visit(page, '/livreur/orders', 3500, 'Commandes livreur');
  await openNotifications(page);
}

async function runAdminDemo(page) {
  await logout(page);
  await login(page, ACCOUNTS.admin, 'admin');
  await visit(page, '/admin/dashboard', 3500, 'Dashboard admin');
  await visit(page, '/admin/messages', 4500, 'Messagerie admin');
  await visit(page, '/admin/orders', 3000, 'Commandes admin');
  await openNotifications(page);
}

async function runVetDemo(page) {
  await logout(page);
  await login(page, ACCOUNTS.vet, 'vétérinaire');
  await visit(page, '/vet/dashboard', 4000, 'Dashboard vétérinaire');
  await visit(page, '/vet/medical-dossiers', 3500, 'Dossiers médicaux');
  await openNotifications(page);
  await wait(2000);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('🎬 Démarrage enregistrement démo PetfoodTN…');
  console.log(`   URL: ${BASE}`);
  console.log(`   Dossier: ${OUT_DIR}`);

  const browser = await chromium.launch({
    headless: process.env.DEMO_HEADLESS !== '0',
    slowMo: 60,
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1280, height: 720 },
    },
    locale: 'fr-FR',
  });

  const page = await context.newPage();
  page.setDefaultTimeout(35000);

  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await wait(1500);

    await runClientDemo(page);
    await runLivreurDemo(page);
    await runAdminDemo(page);
    await runVetDemo(page);

    console.log('✅ Parcours terminé — finalisation vidéo…');
  } catch (err) {
    console.error('❌ Erreur pendant l\'enregistrement:', err.message);
  }

  const video = page.video();
  await context.close();
  await browser.close();

  if (video) {
    const src = await video.path();
    const dest = path.join(OUT_DIR, `petfoodtn-demo-${Date.now()}.webm`);
    fs.renameSync(src, dest);
    console.log(`\n🎥 Vidéo enregistrée :\n   ${dest}\n`);
    console.log('Pour convertir en MP4 (si ffmpeg installé) :');
    console.log(`   ffmpeg -i "${dest}" -c:v libx264 -crf 23 demo.mp4`);
  } else {
    console.log('⚠️ Aucune vidéo générée.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
