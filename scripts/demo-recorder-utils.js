/**
 * Utilitaires partagés — enregistrement Playwright + export MP4 (ffmpeg-installer).
 */

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const BASE = process.env.DEMO_BASE_URL || 'http://localhost:3001';
const OUT_DIR = path.join(__dirname, '..', 'demo-videos');
const PACE = Number(process.env.DEMO_PACE || 1.15);
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

let currentRole = null;

async function login(page, role) {
  const creds = ACCOUNTS[role];
  if (!creds || currentRole === role) return;
  console.log(`→ Connexion ${role}…`);
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await wait(700);
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
  currentRole = role;
  await wait(1000);
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
  await wait(500);
}

async function scrollPage(page, steps = 4, delta = 320) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, delta);
    await wait(450);
  }
}

async function clickJuryTab(page, labelPart) {
  const btn = page.locator('button.jury-nav__btn', { hasText: labelPart });
  if (await btn.count()) {
    await btn.first().click();
    await wait(1200);
  }
}

async function visitStep(page, step) {
  console.log(`  · ${step.phase}`);
  if (step.loginAs) {
    if (currentRole && currentRole !== step.loginAs) await logout(page);
    await login(page, step.loginAs);
  } else if (currentRole && step.logout !== false) {
    await logout(page);
  }

  const url = step.hash ? `${BASE}${step.path}${step.hash}` : `${BASE}${step.path}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});

  if (step.juryTab) await clickJuryTab(page, step.juryTab);
  if (step.scroll) await scrollPage(page, step.scroll, step.scrollDelta || 320);
  await wait(step.pauseMs || 4000);
}

function convertToMp4(webmPath, mp4Path) {
  return new Promise((resolve, reject) => {
    console.log('→ Conversion MP4…');
    const args = [
      '-y',
      '-i', webmPath,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      mp4Path,
    ];
    const proc = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    proc.stderr.on('data', (d) => { err += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0) resolve(mp4Path);
      else reject(new Error(`ffmpeg exit ${code}: ${err.slice(-400)}`));
    });
  });
}

async function recordTour({ title, tour, outputName }) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  currentRole = null;

  console.log(`\n🎬 ${title}`);
  console.log(`   URL: ${BASE}`);
  console.log(`   Étapes: ${tour.length}`);

  const browser = await chromium.launch({
    headless: process.env.DEMO_HEADLESS !== '0',
    slowMo: 45,
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 720 } },
    locale: 'fr-FR',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(35000);

  try {
    for (const step of tour) {
      await visitStep(page, step);
    }
    console.log('✅ Parcours terminé.');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }

  const video = page.video();
  await context.close();
  await browser.close();

  if (!video) {
    console.log('⚠️ Aucune vidéo générée.');
    return null;
  }

  const webmSrc = await video.path();
  const stamp = Date.now();
  const webmDest = path.join(OUT_DIR, `${outputName}-${stamp}.webm`);
  const mp4Dest = path.join(OUT_DIR, `${outputName}-${stamp}.mp4`);

  fs.renameSync(webmSrc, webmDest);
  await convertToMp4(webmDest, mp4Dest);

  if (process.env.DEMO_KEEP_WEBM !== '1') {
    try { fs.unlinkSync(webmDest); } catch { /* ignore */ }
  }

  console.log(`\n🎥 MP4 prêt :\n   ${mp4Dest}\n`);
  return mp4Dest;
}

module.exports = {
  BASE,
  OUT_DIR,
  ACCOUNTS,
  wait,
  login,
  logout,
  scrollPage,
  visitStep,
  recordTour,
  convertToMp4,
};
