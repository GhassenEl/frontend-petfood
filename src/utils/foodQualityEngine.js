/**
 * Analyse qualité aliments — ESP32-CAM + module IA PetFoodTN.
 * Cas d'usage : moisissures, couleur, insectes, dégradation, niveau stock.
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
  good: { label: 'Bonne', state: 'Bon', color: '#059669', icon: '✅', fridge: 'Conservation optimale' },
  warning: { label: 'À surveiller', state: 'Limite', color: '#d97706', icon: '⚠️', fridge: 'Surveiller température / humidité' },
  bad: { label: 'Mauvaise', state: 'Aliment altéré', color: '#dc2626', icon: '🚫', fridge: 'Ne pas servir — remplacer' },
  critical: { label: 'Critique', state: 'Aliment altéré', color: '#991b1b', icon: '🚨', fridge: 'Remplacer l\'aliment immédiatement' },
};

/** Seuil scénario alternatif — nourriture détériorée (< 50 %). */
export const NON_CONFORME_THRESHOLD = 50;

export const NON_CONFORME_OLED = {
  alertTitle: 'ALERTE',
  alertMessage: 'Nourriture non conforme',
};

export const AI_DETECTION_KEYS = [
  { key: 'mold', label: 'Moisissures', icon: '🍄' },
  { key: 'colorShift', label: 'Changement couleur', icon: '🎨' },
  { key: 'insects', label: 'Présence insectes', icon: '🐜' },
  { key: 'degradation', label: 'Dégradation', icon: '📉' },
  { key: 'stock', label: 'Niveau récipient', icon: '📦' },
];

/** Détections IA à partir des métriques capteur / vision. */
export const detectAiSignals = ({
  avgR = 140,
  avgG = 110,
  avgB = 70,
  moldPixelRatio = 0,
  darkSpotRatio = 0,
  insectPixelRatio = 0,
  colorShiftScore = 0,
  degradationIndex = 0,
  stockLevelPct = 65,
  temperatureC = 22,
  humidityPct = 45,
} = {}) => {
  const mold = moldPixelRatio || darkSpotRatio;
  const colorIndex = (avgG - avgR * 0.3) / 255;
  const computedColorShift = colorShiftScore || Math.max(0, Math.min(100, Math.round(
    (Math.abs(avgR - 155) + Math.abs(avgG - 115)) / 3 + (colorIndex > 0.25 ? 25 : 0),
  )));

  const moldDetected = mold > 0.04;
  const moldSeverity = mold > 0.12 ? 'high' : mold > 0.06 ? 'medium' : moldDetected ? 'low' : 'none';

  const colorShiftDetected = computedColorShift > 18 || avgR < 95 || (avgG > avgR + 25);
  const colorSeverity = computedColorShift > 40 ? 'high' : computedColorShift > 22 ? 'medium' : colorShiftDetected ? 'low' : 'none';

  const insectsDetected = insectPixelRatio > 0.008;
  const insectSeverity = insectPixelRatio > 0.025 ? 'high' : insectPixelRatio > 0.015 ? 'medium' : insectsDetected ? 'low' : 'none';

  const degradationDetected = degradationIndex > 25 || temperatureC > 26 || humidityPct > 62;
  const degradationSeverity = degradationIndex > 60 ? 'high' : degradationIndex > 35 ? 'medium' : degradationDetected ? 'low' : 'none';

  const stockLow = stockLevelPct < 25;
  const stockSeverity = stockLevelPct < 10 ? 'high' : stockLevelPct < 25 ? 'medium' : 'none';

  return {
    mold: { detected: moldDetected, severity: moldSeverity, value: Math.round(mold * 1000) / 10, unit: '% pixels' },
    colorShift: { detected: colorShiftDetected, severity: colorSeverity, value: computedColorShift, unit: '/100' },
    insects: { detected: insectsDetected, severity: insectSeverity, value: Math.round(insectPixelRatio * 10000) / 100, unit: '% pixels' },
    degradation: { detected: degradationDetected, severity: degradationSeverity, value: degradationIndex, unit: '/100' },
    stock: { detected: stockLow, severity: stockSeverity, value: Math.round(stockLevelPct), unit: '% restant' },
  };
};

/** Action recommandée selon le score et les détections. */
export const getRecommendedAction = (quality, qualityScore, signals = {}) => {
  if (quality === 'critical' || qualityScore < 40) {
    return 'Remplacer l\'aliment';
  }
  if (quality === 'bad' || qualityScore < 50) {
    return 'Retirer et remplacer l\'aliment';
  }
  if (signals.stock?.severity === 'high' || signals.stock?.severity === 'medium') {
    return 'Réapprovisionner le récipient';
  }
  if (quality === 'warning') {
    return 'Surveiller et ventiler le bac';
  }
  return 'Aucune action — aliment OK';
};

/** Analyse complète (vision ESP32-CAM + capteurs + module IA). */
export const analyzeFoodQuality = ({
  avgR = 140,
  avgG = 110,
  avgB = 70,
  moldPixelRatio = 0,
  insectPixelRatio = 0,
  colorShiftScore = 0,
  degradationIndex = 0,
  stockLevelPct = 65,
  temperatureC = 22,
  humidityPct = 45,
  lidOpen = false,
  darkSpotRatio = 0,
} = {}) => {
  const mold = moldPixelRatio || darkSpotRatio;
  let score = 92;

  if (temperatureC > 28) score -= 35;
  else if (temperatureC > 25) score -= 18;
  else if (temperatureC > 22) score -= 8;
  else if (temperatureC < 10) score -= 5;

  if (humidityPct > 70) score -= 30;
  else if (humidityPct > 60) score -= 15;
  else if (humidityPct < 25) score -= 5;

  const colorIndex = (avgG - avgR * 0.3) / 255;
  if (colorIndex > 0.35) score -= 20;
  if (avgR < 80 && avgG > 100) score -= 25;

  if (mold > 0.12) score -= 40;
  else if (mold > 0.06) score -= 22;
  else if (mold > 0.03) score -= 10;

  if (insectPixelRatio > 0.025) score -= 35;
  else if (insectPixelRatio > 0.012) score -= 18;

  const computedDegradation = degradationIndex || Math.max(0, Math.min(100,
    (mold * 200) + (insectPixelRatio * 300) + (temperatureC > 25 ? (temperatureC - 22) * 8 : 0),
  ));
  if (computedDegradation > 55) score -= 25;
  else if (computedDegradation > 30) score -= 12;

  if (lidOpen) score -= 12;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let quality = 'good';
  if (score < 40) quality = 'critical';
  else if (score < 50) quality = 'bad';
  else if (score < 75) quality = 'warning';

  const meta = QUALITY_LABELS[quality] || QUALITY_LABELS.good;
  const aiSignals = detectAiSignals({
    avgR, avgG, avgB, moldPixelRatio: mold, insectPixelRatio,
    colorShiftScore, degradationIndex: computedDegradation,
    stockLevelPct, temperatureC, humidityPct,
  });
  const recommendedAction = getRecommendedAction(quality, score, aiSignals);
  const anomalyDetected = Object.values(aiSignals).some(
    (s) => s.detected && s.severity !== 'none',
  );
  const isCritical = quality === 'critical' || score < 40;
  const isNonConforme = score < NON_CONFORME_THRESHOLD;
  const displayState = isNonConforme && !isCritical
    ? NON_CONFORME_OLED.alertMessage
    : meta.state;

  const aiSummary =
    quality === 'critical' || quality === 'bad'
      ? `Qualité ${meta.state.toLowerCase()} (${score}%) — ${
        aiSignals.mold.detected ? 'moisissures détectées. ' : ''
      }${aiSignals.insects.detected ? 'insectes suspects. ' : ''}Action : ${recommendedAction}.`
      : quality === 'warning'
        ? `Qualité limite (${score}%) — température ${temperatureC} °C, humidité ${humidityPct} %. ${recommendedAction}.`
        : `Qualité bonne (${score}%) — stock ${Math.round(stockLevelPct)} %, conservation optimale.`;

  return {
    quality,
    qualityScore: score,
    label: meta.label,
    state: displayState,
    color: meta.color,
    icon: meta.icon,
    avgR: Math.round(avgR),
    avgG: Math.round(avgG),
    avgB: Math.round(avgB),
    moldPixelRatio: Math.round(mold * 1000) / 1000,
    insectPixelRatio: Math.round(insectPixelRatio * 10000) / 10000,
    colorShiftScore: aiSignals.colorShift.value,
    degradationIndex: computedDegradation,
    stockLevelPct: Math.round(stockLevelPct),
    temperatureC: Math.round(temperatureC * 10) / 10,
    humidityPct: Math.round(humidityPct),
    lidOpen,
    colorIndex: Math.round(colorIndex * 100) / 100,
    aiSignals,
    recommendedAction,
    isCritical,
    isNonConforme,
    anomalyDetected,
    oledAlert: isNonConforme ? {
      show: true,
      title: NON_CONFORME_OLED.alertTitle,
      message: NON_CONFORME_OLED.alertMessage,
    } : null,
    aiSummary,
    analyzedAt: new Date().toISOString(),
    source: 'esp32-cam',
  };
};

const scenarios = [
  {
    name: 'good',
    avgR: 165, avgG: 120, avgB: 75,
    moldPixelRatio: 0.01, insectPixelRatio: 0,
    temperatureC: 20, humidityPct: 42, stockLevelPct: 65,
  },
  {
    name: 'warning',
    avgR: 130, avgG: 135, avgB: 80,
    moldPixelRatio: 0.05, insectPixelRatio: 0.005,
    temperatureC: 26, humidityPct: 62, stockLevelPct: 38,
  },
  {
    name: 'bad',
    avgR: 90, avgG: 150, avgB: 70,
    moldPixelRatio: 0.14, insectPixelRatio: 0.018,
    temperatureC: 29, humidityPct: 75, stockLevelPct: 22,
  },
  {
    name: 'critical',
    avgR: 75, avgG: 160, avgB: 65,
    moldPixelRatio: 0.18, insectPixelRatio: 0.032,
    temperatureC: 31, humidityPct: 78, stockLevelPct: 15,
  },
  /** Scénario alternatif — nourriture détériorée (~42 %). */
  {
    name: 'deteriorated',
    avgR: 98, avgG: 138, avgB: 74,
    moldPixelRatio: 0.08, insectPixelRatio: 0.012,
    temperatureC: 26, humidityPct: 64, stockLevelPct: 30,
  },
];

let scenarioIndex = 0;

export const simulateEsp32CamReading = (forcedScenario) => {
  const base = forcedScenario
    ? scenarios.find((s) => s.name === forcedScenario) || scenarios[0]
    : scenarios[scenarioIndex % scenarios.length];
  if (!forcedScenario) scenarioIndex += 1;

  const jitter = () => (Math.random() - 0.5) * 4;
  const reading = analyzeFoodQuality({
    ...base,
    avgR: base.avgR + jitter(),
    avgG: base.avgG + jitter(),
    temperatureC: base.temperatureC + jitter() * 0.5,
    humidityPct: base.humidityPct + jitter(),
    stockLevelPct: Math.max(5, base.stockLevelPct + jitter() * 2),
    moldPixelRatio: Math.max(0, base.moldPixelRatio + (Math.random() - 0.5) * 0.01),
    insectPixelRatio: Math.max(0, base.insectPixelRatio + (Math.random() - 0.5) * 0.003),
    lidOpen: false,
  });

  if (forcedScenario === 'deteriorated') {
    reading.qualityScore = 42;
    reading.quality = 'bad';
    reading.isNonConforme = true;
    reading.isCritical = false;
    reading.anomalyDetected = true;
    reading.state = NON_CONFORME_OLED.alertMessage;
    reading.recommendedAction = 'Remplacer l\'aliment';
    reading.oledAlert = {
      show: true,
      title: NON_CONFORME_OLED.alertTitle,
      message: NON_CONFORME_OLED.alertMessage,
    };
    reading.aiSummary = `Anomalie IA détectée — nourriture non conforme (${reading.qualityScore}%). ${reading.recommendedAction}.`;
  }

  return reading;
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

    const s = scenarios[i % scenarios.length];
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
