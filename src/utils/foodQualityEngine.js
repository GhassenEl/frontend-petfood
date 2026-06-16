/**
 * Analyse qualité croquettes — ESP32-CAM + capteurs type réfrigérateur connecté.
 * Entrées : RGB moyen, pixels sombres (moisissure), température, humidité, couvercle.
 */

const STORAGE_KEY = 'petfoodtn:iot:food-quality-readings';

export const QUALITY_LABELS = {
  good: { label: 'Bonne', color: '#059669', icon: '✅', fridge: 'Zone fraîche OK' },
  warning: { label: 'À surveiller', color: '#d97706', icon: '⚠️', fridge: 'Température / humidité limite' },
  bad: { label: 'Mauvaise', color: '#dc2626', icon: '🚫', fridge: 'Risque altération — ne pas servir' },
};

/** Analyse une mesure capteur (comme un frigo connecté). */
export const analyzeFoodQuality = ({
  avgR = 140,
  avgG = 110,
  avgB = 70,
  moldPixelRatio = 0,
  temperatureC = 22,
  humidityPct = 45,
  lidOpen = false,
  darkSpotRatio = 0,
} = {}) => {
  const mold = moldPixelRatio || darkSpotRatio;
  let score = 92;

  // Température bac croquettes (idéal 15–22 °C)
  if (temperatureC > 28) score -= 35;
  else if (temperatureC > 25) score -= 18;
  else if (temperatureC > 22) score -= 8;
  else if (temperatureC < 10) score -= 5;

  // Humidité (idéal 35–55 % — au-delà moisissure)
  if (humidityPct > 70) score -= 30;
  else if (humidityPct > 60) score -= 15;
  else if (humidityPct < 25) score -= 5;

  // Couleur anormale (oxidation / moisissure verte)
  const colorIndex = (avgG - avgR * 0.3) / 255;
  if (colorIndex > 0.35) score -= 20;
  if (avgR < 80 && avgG > 100) score -= 25;

  // Moisissure / taches sombres (vision ESP32-CAM)
  if (mold > 0.12) score -= 40;
  else if (mold > 0.06) score -= 22;
  else if (mold > 0.03) score -= 10;

  if (lidOpen) score -= 12;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let quality = 'good';
  if (score < 50) quality = 'bad';
  else if (score < 75) quality = 'warning';

  const meta = QUALITY_LABELS[quality];

  const aiSummary =
    quality === 'bad'
      ? `Qualité mauvaise (${score}/100) — ${mold > 0.08 ? 'taches suspectes détectées' : 'conditions de stockage dégradées'}. Retirez les croquettes.`
      : quality === 'warning'
        ? `Qualité acceptable mais limite (${score}/100) — vérifiez température (${temperatureC} °C) et humidité (${humidityPct} %).`
        : `Qualité bonne (${score}/100) — conditions de conservation optimales.`;

  return {
    quality,
    qualityScore: score,
    label: meta.label,
    color: meta.color,
    icon: meta.icon,
    avgR: Math.round(avgR),
    avgG: Math.round(avgG),
    avgB: Math.round(avgB),
    moldPixelRatio: Math.round(mold * 1000) / 1000,
    temperatureC: Math.round(temperatureC * 10) / 10,
    humidityPct: Math.round(humidityPct),
    lidOpen,
    colorIndex: Math.round(colorIndex * 100) / 100,
    aiSummary,
    analyzedAt: new Date().toISOString(),
    source: 'esp32-cam',
  };
};

const scenarios = [
  { name: 'good', avgR: 165, avgG: 120, avgB: 75, moldPixelRatio: 0.01, temperatureC: 20, humidityPct: 42 },
  { name: 'warning', avgR: 130, avgG: 135, avgB: 80, moldPixelRatio: 0.05, temperatureC: 26, humidityPct: 62 },
  { name: 'bad', avgR: 90, avgG: 150, avgB: 70, moldPixelRatio: 0.14, temperatureC: 29, humidityPct: 75 },
];

let scenarioIndex = 0;

/** Simule une lecture ESP32-CAM (cycle bon → alerte → mauvais). */
export const simulateEsp32CamReading = (forcedScenario) => {
  const base = forcedScenario
    ? scenarios.find((s) => s.name === forcedScenario) || scenarios[0]
    : scenarios[scenarioIndex % scenarios.length];
  if (!forcedScenario) scenarioIndex += 1;

  const jitter = () => (Math.random() - 0.5) * 4;
  return analyzeFoodQuality({
    ...base,
    avgR: base.avgR + jitter(),
    avgG: base.avgG + jitter(),
    temperatureC: base.temperatureC + jitter() * 0.5,
    humidityPct: base.humidityPct + jitter(),
    moldPixelRatio: Math.max(0, base.moldPixelRatio + (Math.random() - 0.5) * 0.01),
    lidOpen: false,
  });
};

export const buildDemoQualityHistory = () => {
  const history = [];
  const now = Date.now();
  for (let i = 11; i >= 0; i -= 1) {
    const s = scenarios[i % 3];
    const reading = analyzeFoodQuality({
      ...s,
      moldPixelRatio: s.moldPixelRatio + (Math.random() * 0.02),
    });
    reading.analyzedAt = new Date(now - i * 300000).toISOString();
    history.push(reading);
  }
  return history;
};

export const getStoredQualityReadings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
};

export const storeQualityReading = (reading) => {
  const list = getStoredQualityReadings();
  list.unshift(reading);
  const trimmed = list.slice(0, 50);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* quota */
  }
  return trimmed;
};

export const getLatestQualityReading = (fallback) => {
  const stored = getStoredQualityReadings();
  if (stored.length) return stored[0];
  return fallback || simulateEsp32CamReading('good');
};

export default analyzeFoodQuality;
