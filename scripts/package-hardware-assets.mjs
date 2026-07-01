#!/usr/bin/env node
/**
 * Package hardware assets: Gerber ZIPs, Proteus .pdsprj, copy to public/ for download.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const hardware = path.join(root, 'hardware');
const publicHw = path.join(root, 'public', 'hardware');

const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });

const zipDir = (srcDir, destZip) => {
  ensureDir(path.dirname(destZip));
  if (fs.existsSync(destZip)) fs.unlinkSync(destZip);
  const parent = path.dirname(srcDir);
  const name = path.basename(srcDir);
  if (process.platform === 'win32') {
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '${srcDir}\\*' -DestinationPath '${destZip}' -Force"`,
      { stdio: 'inherit' },
    );
  } else {
    execSync(`cd "${parent}" && zip -r "${destZip}" "${name}"`, { stdio: 'inherit' });
  }
};

const copyFile = (src, dest) => {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
};

const copyTree = (src, dest) => {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyTree(s, d);
    else copyFile(s, d);
  }
};

const buildPdsprj = (baseName) => {
  const folderName = baseName;
  const src = path.join(hardware, 'proteus', folderName);
  const dest = path.join(hardware, 'proteus', `${baseName}.pdsprj`);
  const tempZip = path.join(hardware, 'proteus', `${baseName}.pdsprj.zip`);
  const staging = path.join(hardware, 'proteus', `.staging-${folderName}`);
  if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true });
  copyTree(src, staging);
  const importDir = path.join(staging, 'IMPORT');
  ensureDir(importDir);
  copyFile(path.join(hardware, 'proteus', `${baseName}.net`), path.join(importDir, `${baseName}.net`));
  copyFile(path.join(hardware, 'proteus', `${baseName}.BOM.csv`), path.join(importDir, `${baseName}.BOM.csv`));
  copyFile(path.join(hardware, 'proteus', 'README.md'), path.join(importDir, 'README.md'));

  if (fs.existsSync(dest)) fs.unlinkSync(dest);
  if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);
  if (process.platform === 'win32') {
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '${staging}\\*' -DestinationPath '${tempZip}' -Force"`,
      { stdio: 'inherit' },
    );
  } else {
    execSync(`cd "${staging}" && zip -r "${tempZip}" .`, { stdio: 'inherit' });
  }
  fs.renameSync(tempZip, dest);
  fs.rmSync(staging, { recursive: true });
};

console.log('📦 Packaging Gerber demos…');
const gerberBoards = ['PF-TN-CTRL-v1', 'PF-TN-PSU-v1'];
for (const board of gerberBoards) {
  const src = path.join(hardware, 'gerber', board);
  const zipHw = path.join(hardware, 'gerber', `${board}.zip`);
  const zipPub = path.join(publicHw, 'gerber', `${board}.zip`);
  zipDir(src, zipHw);
  copyFile(zipHw, zipPub);
  console.log(`  ✓ ${board}.zip`);
}

console.log('📦 Building Proteus .pdsprj starters…');
buildPdsprj('PetFeeder_CTRL');
buildPdsprj('PetFeeder_PSU');

const proteusFiles = [
  'PetFeeder_CTRL.pdsprj',
  'PetFeeder_PSU.pdsprj',
  'PetFeeder_CTRL.net',
  'PetFeeder_PSU.net',
  'PetFeeder_CTRL.BOM.csv',
  'PetFeeder_PSU.BOM.csv',
  'README.md',
];
const pubProteus = path.join(publicHw, 'proteus');
ensureDir(pubProteus);
for (const f of proteusFiles) {
  copyFile(path.join(hardware, 'proteus', f), path.join(pubProteus, f));
  console.log(`  ✓ proteus/${f}`);
}

console.log('\n✅ Hardware assets ready in hardware/ and public/hardware/');
