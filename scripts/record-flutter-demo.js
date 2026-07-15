/**
 * Vidéo MP4 — Démo Flutter PetfoodTN (HomeShell : BI, Qualité, IoT, Sécurité, Produits, Profil)
 * Prérequis : http://localhost:8080 + backend :5002
 * Usage : npm run demo:flutter:mp4
 */

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const BASE = process.env.FLUTTER_DEMO_URL || 'http://localhost:8080';
const OUT_DIR = path.join(__dirname, '..', 'demo-videos');
const PACE = Number(process.env.DEMO_PACE || 1.3);
const pause = (ms) => Math.round(ms * PACE);
const wait = (ms) => new Promise((r) => setTimeout(r, pause(ms)));

const VW = 420;
const VH = 860;

const TABS = [
  { name: 'BI', index: 0, pauseMs: 6000, scroll: 4 },
  { name: 'Qualité', index: 1, pauseMs: 5500, scroll: 5 },
  { name: 'IoT', index: 2, pauseMs: 6500, scroll: 5 },
  { name: 'Sécurité', index: 3, pauseMs: 5000, scroll: 4 },
  { name: 'Produits', index: 4, pauseMs: 5500, scroll: 5 },
  { name: 'Profil', index: 5, pauseMs: 5000, scroll: 3 },
];

async function scrollPage(page, steps = 3, delta = 260) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, delta);
    await wait(400);
  }
}

async function clickTab(page, index) {
  const x = Math.round((VW / TABS.length) * (index + 0.5));
  const y = VH - 42;
  await page.mouse.click(x, y);
  await wait(1000);
}

function convertToMp4(webmPath, mp4Path) {
  return new Promise((resolve, reject) => {
    console.log('→ Conversion MP4…');
    const args = [
      '-y', '-i', webmPath,
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
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

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  try {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    console.error(`❌ Flutter non accessible sur ${BASE}`);
    console.error('   Lancez : scripts\\windows\\3-DEMARRER-FLUTTER-WEB.bat');
    process.exit(1);
  }

  console.log('\n🎬 Démo Flutter PetfoodTN — enregistrement MP4');
  console.log(`   URL: ${BASE}`);

  const browser = await chromium.launch({
    headless: process.env.DEMO_HEADLESS !== '0',
    slowMo: 40,
  });
  const context = await browser.newContext({
    viewport: { width: VW, height: VH },
    recordVideo: { dir: OUT_DIR, size: { width: VW, height: VH } },
    locale: 'fr-FR',
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  try {
    console.log('  · Splash → HomeShell');
    await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
    await wait(5500);

    // Refresh BI (icône haut droite)
    console.log('  · Refresh BI');
    await page.mouse.click(VW - 36, 48);
    await wait(3500);
    await scrollPage(page, 3);
    await wait(4000);

    for (const tab of TABS) {
      console.log(`  · Onglet ${tab.name}`);
      await clickTab(page, tab.index);
      await wait(1500);

      if (tab.name === 'BI' || tab.name === 'Qualité') {
        await page.mouse.click(VW - 36, 48);
        await wait(2000);
      }

      await scrollPage(page, tab.scroll);
      await wait(tab.pauseMs);

      if (tab.name === 'IoT') {
        for (let s = 0; s < 3; s++) {
          console.log(`    · IoT sous-zone ${s + 1}`);
          await page.mouse.click(70 + s * 130, 130);
          await wait(1600);
          await scrollPage(page, 2);
          await wait(2500);
        }
      }

      if (tab.name === 'Produits') {
        await page.mouse.click(VW / 2, VH * 0.35);
        await wait(2000);
        await scrollPage(page, 2);
        await wait(2000);
      }
    }

    console.log('  · Conclusion — retour BI');
    await clickTab(page, 0);
    await wait(2500);
    await scrollPage(page, 2);
    await wait(3500);

    console.log('✅ Parcours Flutter terminé.');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }

  const video = page.video();
  await context.close();
  await browser.close();

  if (!video) {
    console.log('⚠️ Aucune vidéo générée.');
    return;
  }

  const webmSrc = await video.path();
  const stamp = Date.now();
  const webmDest = path.join(OUT_DIR, `petfoodtn-flutter-demo-${stamp}.webm`);
  const mp4Dest = path.join(OUT_DIR, `petfoodtn-flutter-demo-${stamp}.mp4`);
  fs.renameSync(webmSrc, webmDest);
  await convertToMp4(webmDest, mp4Dest);
  if (process.env.DEMO_KEEP_WEBM !== '1') {
    try { fs.unlinkSync(webmDest); } catch { /* ignore */ }
  }
  for (const f of ['flutter-tab-test.png', 'flutter-home-check.png']) {
    try { fs.unlinkSync(path.join(OUT_DIR, f)); } catch { /* ignore */ }
  }
  try { fs.unlinkSync(path.join(__dirname, '_test-flutter-a11y.js')); } catch { /* ignore */ }

  console.log(`\n🎥 MP4 Flutter prêt :\n   ${mp4Dest}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
