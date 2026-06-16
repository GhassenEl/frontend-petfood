/**
 * Analyse qualité croquettes — ESP32-CAM + capteurs type réfrigérateur connecté.
 * Entrées : RGB moyen, pixels sombres (moisissure), température, humidité, couvercle.
 */

const STORAGE_KEY = 'petfoodtn:iot:food-quality-readings';
const SCHEDULES_KEY = 'petfoodtn:iot:food-quality-schedules';

export const DEFAULT_FOOD_QUALITY_SCHEDULES = [
  { id: 'sq-1', time: '07:15', label: 'Avant petit-déjeuner Max', enabled: true },
  { id: 'sq-2', time: '12:15', label: 'Avant déjeuner Max', enabled: true },
  { id: 'sq-3', time: '19:15', label: 'Avant dîner Max', enabled: true },
  { id: 'sq-4', time: '02:00', label: 'Contrôle nocturne bac', enabled: true },
];

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
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const history = [];

  DEFAULT_FOOD_QUALITY_SCHEDULES.filter((s) => s.enabled !== false).forEach((slot, i) => {
    const slotMin = timeToMinutes(slot.time);
    const [h, m] = slot.time.split(':').map(Number);
    const at = new Date(now);
    at.setHours(h, m, 0, 0);

    if (slotMin > nowMin) {
      if (slot.time === '02:00') at.setDate(at.getDate() - 1);
      else return;
    }

    const s = scenarios[i % 3];
    const reading = analyzeFoodQuality({
      ...s,
      moldPixelRatio: s.moldPixelRatio + (Math.random() * 0.02),
    });
    reading.analyzedAt = at.toISOString();
    reading.scheduleId = slot.id;
    reading.scheduleTime = slot.time;
    history.push(reading);
  });

  return history.sort((a, b) => new Date(b.analyzedAt) - new Date(a.analyzedAt));
};

/** "07:30" → minutes depuis minuit */
export const timeToMinutes = (time = '00:00') => {
  const [h, m] = String(time).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const formatTimeFr = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeShort = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

/** Prochain créneau de contrôle ESP32-CAM */
export const getNextScheduledCheck = (schedules = DEFAULT_FOOD_QUALITY_SCHEDULES, refDate = new Date()) => {
  const enabled = schedules.filter((s) => s.enabled !== false);
  if (!enabled.length) return null;

  const nowMin = refDate.getHours() * 60 + refDate.getMinutes();
  const sorted = [...enabled].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  for (const slot of sorted) {
    const slotMin = timeToMinutes(slot.time);
    if (slotMin > nowMin) {
      const next = new Date(refDate);
      next.setHours(Math.floor(slotMin / 60), slotMin % 60, 0, 0);
      return { ...slot, at: next.toISOString(), isToday: true };
    }
  }

  const first = sorted[0];
  const slotMin = timeToMinutes(first.time);
  const next = new Date(refDate);
  next.setDate(next.getDate() + 1);
  next.setHours(Math.floor(slotMin / 60), slotMin % 60, 0, 0);
  return { ...first, at: next.toISOString(), isToday: false };
};

/** Statut de chaque horaire aujourd'hui (effectué / manqué / à venir) */
export const buildScheduleStatuses = (schedules = DEFAULT_FOOD_QUALITY_SCHEDULES, history = [], refDate = new Date()) => {
  const today = refDate.toDateString();
  const nowMin = refDate.getHours() * 60 + refDate.getMinutes();

  return schedules
    .filter((s) => s.enabled !== false)
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
    .map((slot) => {
      const slotMin = timeToMinutes(slot.time);
      const reading = history.find((r) => {
        const d = new Date(r.analyzedAt);
        if (d.toDateString() !== today) return false;
        const rMin = d.getHours() * 60 + d.getMinutes();
        return Math.abs(rMin - slotMin) <= 45;
      });

      let status = 'upcoming';
      if (reading) status = 'done';
      else if (slotMin <= nowMin) status = 'missed';

      return {
        ...slot,
        status,
        reading: reading || null,
        quality: reading?.quality,
        qualityScore: reading?.qualityScore,
      };
    });
};

export const getStoredQualitySchedules = () => {
  try {
    const raw = localStorage.getItem(SCHEDULES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return DEFAULT_FOOD_QUALITY_SCHEDULES.map((s) => ({ ...s }));
};

export const storeQualitySchedules = (schedules) => {
  try {
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  } catch {
    /* quota */
  }
  return schedules;
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
