#!/usr/bin/env node
/**
 * Simulateur ESP32-CAM — qualité croquettes temps réel (sans matériel).
 *
 * Usage:
 *   node scripts/simulate-esp32cam-food-quality.mjs
 *   node scripts/simulate-esp32cam-food-quality.mjs --scenario bad --interval 3
 *   node scripts/simulate-esp32cam-food-quality.mjs --api http://192.168.1.100:5002
 *
 * Envoie des lectures JSON au backend (ou affiche en console si API indisponible).
 * Même logique que firmware/esp32/PetFoodQualityESP32CAM/
 */

import { simulateEsp32CamReading, analyzeFoodQuality } from '../src/utils/foodQualityEngine.js';

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const API_BASE = getArg('--api', process.env.PETFOOD_API || 'http://localhost:5002');
const INTERVAL_SEC = Number(getArg('--interval', '4'));
const SCENARIO = getArg('--scenario', null); // good | warning | bad
const DEVICE_KEY = getArg('--device-key', process.env.DEVICE_KEY || 'demo-esp32-cam');

let tick = 0;

async function sendReading(reading) {
  const url = `${API_BASE}/api/client/iot/food-quality/reading`;
  const payload = {
    deviceId: 'demo-esp32cam-1',
    source: 'esp32-cam-simulator',
    ...reading,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Key': DEVICE_KEY,
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    console.log(
      `[${new Date().toLocaleTimeString('fr-FR')}] POST ${res.status} | ${reading.icon} ${reading.label} (${reading.qualityScore}/100) temp=${reading.temperatureC}°C HR=${reading.humidityPct}%`,
    );
    if (!res.ok && text) console.log('  →', text.slice(0, 200));
    return res.ok;
  } catch (err) {
    console.log(
      `[${new Date().toLocaleTimeString('fr-FR')}] API hors ligne — lecture locale:`,
      JSON.stringify({
        quality: reading.quality,
        score: reading.qualityScore,
        temp: reading.temperatureC,
        humidity: reading.humidityPct,
        mold: reading.moldPixelRatio,
      }),
    );
    return false;
  }
}

async function runOnce() {
  tick += 1;
  const reading = SCENARIO
    ? analyzeFoodQuality(
        SCENARIO === 'good'
          ? { avgR: 165, avgG: 120, avgB: 75, moldPixelRatio: 0.01, temperatureC: 20, humidityPct: 42 }
          : SCENARIO === 'bad'
            ? { avgR: 90, avgG: 150, avgB: 70, moldPixelRatio: 0.14, temperatureC: 29, humidityPct: 75 }
            : { avgR: 130, avgG: 135, avgB: 80, moldPixelRatio: 0.05, temperatureC: 26, humidityPct: 62 },
      )
    : simulateEsp32CamReading();
  await sendReading(reading);
}

console.log('PetfoodTN — simulateur ESP32-CAM qualité croquettes');
console.log(`API: ${API_BASE} | intervalle: ${INTERVAL_SEC}s | scénario: ${SCENARIO || 'cycle auto'}`);
console.log('Ctrl+C pour arrêter.\n');

await runOnce();
setInterval(runOnce, INTERVAL_SEC * 1000);
