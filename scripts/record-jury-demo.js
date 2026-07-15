/**
 * Enregistrement vidéo démo jury — tous les acteurs + marketing digital.
 * Prérequis : npm run dev (frontend :3001 + backend :5002)
 *
 * Usage : npm run demo:jury
 * Sortie  : demo-videos/petfoodtn-jury-*.webm
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.DEMO_BASE_URL || 'http://localhost:3001';
const OUT_DIR = path.join(__dirname, '..', 'demo-videos');
const PACE = Number(process.env.DEMO_PACE || 1);
const pause = (ms) => Math.round(ms * PACE);
const wait = (ms) => new Promise((r) => setTimeout(r, pause(ms)));

const ACCOUNTS = {
  admin: { email: 'admin@petfood.tn', password: 'PetfoodTN2024!' },
  client: { email: 'client@petfood.tn', password: 'MonChat123!' },
  vendor: { email: 'vendor@petfood.tn', password: 'Vendor2024!' },
  moderator: { email: 'moderator@petfood.tn', password: 'Moderator2024!' },
  livreur: { email: 'livreur@petfood.tn', password: 'Livreur123!' },
  vet: { email: 'vet@petfood.tn', password: 'Vet2024!' },
};

/** Parcours jury — aligné sur src/config/juryDemoConfig.js JURY_VIDEO_TOUR */
const JURY_TOUR = [
  { phase: 'Intro jury', path: '/jury-demo', pauseMs: 6000 },
  { phase: 'Landing marketing', path: '/', pauseMs: 5000 },
  { phase: 'Admin — Dashboard', path: '/admin/dashboard', pauseMs: 4500, loginAs: 'admin' },
  { phase: 'Admin — Marketing digital', path: '/admin/digital-marketing', pauseMs: 5500, loginAs: 'admin' },
  { phase: 'Admin — Commandes', path: '/admin/orders', pauseMs: 4000, loginAs: 'admin' },
  { phase: 'Client — Boutique', path: '/client-products', pauseMs: 4500, loginAs: 'client' },
  { phase: 'Client — Commandes', path: '/client-orders', pauseMs: 4000, loginAs: 'client' },
  { phase: 'Client — Smart Hub', path: '/client-smart-hub', pauseMs: 4000, loginAs: 'client' },
  { phase: 'Vendeur — Dashboard', path: '/vendor/dashboard', pauseMs: 4500, loginAs: 'vendor' },
  { phase: 'Vendeur — Marketing', path: '/vendor/marketing', pauseMs: 5000, loginAs: 'vendor' },
  { phase: 'Vendeur — Produits', path: '/vendor/products', pauseMs: 4000, loginAs: 'vendor' },
  { phase: 'Modérateur — Dashboard', path: '/moderator/dashboard', pauseMs: 4500, loginAs: 'moderator' },
  { phase: 'Modérateur — Anti-fraude', path: '/moderator/fraud', pauseMs: 4000, loginAs: 'moderator' },
  { phase: 'Modérateur — Contenu', path: '/moderator/content', pauseMs: 4000, loginAs: 'moderator' },
  { phase: 'Livreur — Dashboard', path: '/livreur/dashboard', pauseMs: 4500, loginAs: 'livreur' },
  { phase: 'Livreur — Commandes', path: '/livreur/orders', pauseMs: 4000, loginAs: 'livreur' },
  { phase: 'Livreur — Carte', path: '/livreur/map', pauseMs: 4000, loginAs: 'livreur' },
  { phase: 'Vétérinaire — Dashboard', path: '/vet/dashboard', pauseMs: 4500, loginAs: 'vet' },
  { phase: 'Vétérinaire — Calendrier', path: '/vet/calendar', pauseMs: 4000, loginAs: 'vet' },
  { phase: 'Vétérinaire — Dossiers', path: '/vet/medical-dossiers', pauseMs: 4000, loginAs: 'vet' },
  { phase: 'Marketing admin (fin)', path: '/admin/digital-marketing', pauseMs: 6000, loginAs: 'admin' },
  { phase: 'Retour jury', path: '/jury-demo', pauseMs: 5000 },
];

let currentRole = null;

async function login(page, role) {
  const creds = ACCOUNTS[role];
  if (!creds) return;
  if (currentRole === role) return;
  console.log(`→ Connexion ${role}…`);
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await wait(800);
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
  currentRole = role;
  await wait(1200);
}

async function logout(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    ['token', 'petfood_token', 'authToken'].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  });
  currentRole = null;
  await wait(600);
}

async function visitStep(page, step) {
  console.log(`  · ${step.phase}`);
  if (step.loginAs) {
    if (currentRole && currentRole !== step.loginAs) {
      await logout(page);
    }
    await login(page, step.loginAs);
  } else if (currentRole) {
    await logout(page);
  }
  await page.goto(`${BASE}${step.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  if (step.path === '/jury-demo') {
    await page.locator('.jury-nav__btn').first().waitFor({ timeout: 5000 }).catch(() => {});
    const actorsBtn = page.locator('button', { hasText: 'Acteurs' });
    if (await actorsBtn.count()) {
      await actorsBtn.first().click();
      await wait(1500);
    }
  }
  if (step.path.includes('digital-marketing') || step.path.includes('/vendor/marketing')) {
    await page.mouse.wheel(0, 350);
    await wait(800);
    await page.mouse.wheel(0, 350);
    await wait(800);
  } else {
    await page.mouse.wheel(0, 280);
    await wait(500);
  }
  await wait(step.pauseMs || 4000);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('🎬 Enregistrement démo jury PetfoodTN…');
  console.log(`   URL: ${BASE}`);
  console.log(`   Étapes: ${JURY_TOUR.length}`);

  const browser = await chromium.launch({
    headless: process.env.DEMO_HEADLESS !== '0',
    slowMo: 50,
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 720 } },
    locale: 'fr-FR',
  });

  const page = await context.newPage();
  page.setDefaultTimeout(35000);

  try {
    for (const step of JURY_TOUR) {
      await visitStep(page, step);
    }
    console.log('✅ Parcours jury terminé.');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }

  const video = page.video();
  await context.close();
  await browser.close();

  if (video) {
    const src = await video.path();
    const dest = path.join(OUT_DIR, `petfoodtn-jury-${Date.now()}.webm`);
    fs.renameSync(src, dest);
    console.log(`\n🎥 Vidéo jury :\n   ${dest}\n`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
