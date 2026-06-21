import {
  VITAL_THRESHOLDS,
  WEARABLE_ANIMAL_STATES,
  ACTIVITY_GOALS,
  SLEEP_TARGETS,
} from '../config/wearablePetCatalog';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const rnd = (min, max) => min + Math.random() * (max - min);

const getThresholds = (petType) => VITAL_THRESHOLDS[petType] || VITAL_THRESHOLDS.dog;

/** Évalue un signe vital : ok | warn | critical */
export const assessVitalStatus = (metric, value, petType = 'dog') => {
  const t = getThresholds(petType);
  if (value == null) return 'unknown';

  if (metric === 'spo2') {
    if (value < t.spo2.min - 4) return 'critical';
    if (value < t.spo2.min) return 'warn';
    return 'ok';
  }
  if (metric === 'heartRate') {
    if (value > t.heartRate.criticalHigh || value < t.heartRate.criticalLow) return 'critical';
    if (value > t.heartRate.activeMax || value < t.heartRate.restingMin) return 'warn';
    return 'ok';
  }
  if (metric === 'respiratory') {
    if (value > t.respiratory.max + 10 || value < t.respiratory.min - 5) return 'critical';
    if (value > t.respiratory.max || value < t.respiratory.min) return 'warn';
    return 'ok';
  }
  if (metric === 'bodyTemp') {
    if (value > t.bodyTemp.max + 0.8 || value < t.bodyTemp.min - 0.8) return 'critical';
    if (value > t.bodyTemp.max || value < t.bodyTemp.min) return 'warn';
    return 'ok';
  }
  if (metric === 'stress') {
    if (value >= t.stressIndex.critical) return 'critical';
    if (value >= t.stressIndex.warn) return 'warn';
    return 'ok';
  }
  return 'ok';
};

/** Déduit l'état global de l'animal à partir des vitaux. */
export const computeAnimalState = (metrics = {}, petType = 'dog') => {
  const m = metrics;
  const statuses = [
    assessVitalStatus('spo2', m.spo2Percent, petType),
    assessVitalStatus('heartRate', m.heartRateBpm, petType),
    assessVitalStatus('respiratory', m.respiratoryRate, petType),
    assessVitalStatus('bodyTemp', m.bodyTempC, petType),
    assessVitalStatus('stress', m.stressIndex, petType),
  ];

  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('warn') || (m.stressIndex ?? 0) >= getThresholds(petType).stressIndex.warn) return 'stressed';
  if (m.activityLevel === 'sleeping' || (m.heartRateBpm < getThresholds(petType).heartRate.restingMin + 15 && m.stepsToday < 50)) {
    return 'sleeping';
  }
  if (m.activityLevel === 'active' || (m.stepsToday ?? 0) > 3000) return 'active';
  if (m.activityLevel === 'alert') return 'alert';
  if (m.activityLevel === 'resting') return 'resting';
  return 'calm';
};

/** Plages normales affichables pour le propriétaire. */
export const getVitalRangesDisplay = (petType = 'dog') => {
  const t = getThresholds(petType);
  return {
    spo2: `${t.spo2.min}–${t.spo2.max} %`,
    heartRate: `${t.heartRate.restingMin}–${t.heartRate.restingMax} bpm (repos)`,
    respiratory: `${t.respiratory.min}–${t.respiratory.max} /min`,
    bodyTemp: `${t.bodyTemp.min}–${t.bodyTemp.max} °C`,
    stress: `< ${t.stressIndex.warn} /100`,
  };
};

/** Score bien-être 0–100. */
export const computeWellnessScore = ({ metrics = {}, vitalsStatus = {}, petType = 'dog' } = {}) => {
  let score = 100;
  const vs = vitalsStatus;
  Object.values(vs).forEach((s) => {
    if (s === 'warn') score -= 12;
    if (s === 'critical') score -= 28;
  });

  const goal = ACTIVITY_GOALS[petType] || ACTIVITY_GOALS.dog;
  const steps = metrics.stepsToday ?? 0;
  const stepPct = Math.min(100, Math.round((steps / goal.steps) * 100));
  if (stepPct >= 80) score += 5;
  else if (stepPct < 40) score -= 8;

  const sleep = metrics.sleepQuality ?? 80;
  if (sleep >= 80) score += 4;
  else if (sleep < 60) score -= 10;

  if ((metrics.stressIndex ?? 0) > 50) score -= 6;

  return clamp(Math.round(score), 0, 100);
};

/** Résumé sommeil (nuit précédente). */
export const buildSleepSummary = (metrics = {}, petType = 'dog') => {
  const target = SLEEP_TARGETS[petType] || SLEEP_TARGETS.dog;
  const minutes = metrics.sleepMinutesTonight ?? (petType === 'cat' ? 420 : 380);
  const hours = Math.round((minutes / 60) * 10) / 10;
  const quality = metrics.sleepQuality ?? 82;
  const inRange = hours >= target.hoursMin && hours <= target.hoursMax;
  return {
    minutes,
    hours,
    quality,
    inRange,
    targetHours: `${target.hoursMin}–${target.hoursMax} h`,
    status: quality >= target.qualityMin && inRange ? 'good' : quality >= 60 ? 'fair' : 'poor',
  };
};

/** Timeline activité 24 h (barres par heure). */
export const buildActivityTimeline = (device, hours = 24) => {
  const petType = device.petType || 'dog';
  const seed = (device.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const points = [];
  const now = Date.now();

  for (let i = hours - 1; i >= 0; i -= 1) {
    const ts = new Date(now - i * 3600000);
    const h = ts.getHours();
    let level = 'rest';
    let intensity = 25 + ((seed + h) % 15);

    if (h >= 23 || h < 6) {
      level = 'sleep';
      intensity = 8 + (h % 5);
    } else if (petType === 'dog' && (h === 7 || h === 8 || h === 18 || h === 19)) {
      level = 'active';
      intensity = 55 + ((seed + h * 3) % 40);
    } else if (petType === 'cat' && (h === 6 || h === 7 || h === 20 || h === 21)) {
      level = 'play';
      intensity = 50 + ((seed + h) % 35);
    } else if ((seed + h) % 5 === 0) {
      level = 'active';
      intensity = 40 + ((seed + h) % 30);
    }

    points.push({
      at: ts.toISOString(),
      label: `${String(h).padStart(2, '0')}h`,
      level,
      intensity: clamp(intensity, 5, 95),
    });
  }
  return points;
};

const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

/** Tendance 7 jours (moyennes journalières). */
export const buildWeeklyTrend = (device) => {
  const petType = device.petType || 'dog';
  const base = device.metrics || {};
  const seed = (device.petId || device.id || '').length;
  const points = [];

  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(Date.now() - i * 86400000);
    const day = DAY_LABELS[d.getDay()];
    const avgHr = Math.round(
      clamp(
        (base.heartRateBpm ?? 90) + ((seed + i) % 7) * 3 - 9 + rnd(-5, 5),
        getThresholds(petType).heartRate.restingMin,
        getThresholds(petType).heartRate.activeMax,
      ),
    );
    const avgSpo2 = Math.round(clamp((base.spo2Percent ?? 97) + rnd(-0.8, 0.8), 94, 100) * 10) / 10;
    const steps = Math.round((base.stepsToday ?? 3000) * (0.7 + ((seed + i) % 5) * 0.08) + rnd(-200, 400));
    const wellness = computeWellnessScore({
      metrics: { ...base, stepsToday: steps, sleepQuality: 70 + ((seed + i) % 20) },
      vitalsStatus: {
        spo2: assessVitalStatus('spo2', avgSpo2, petType),
        heartRate: assessVitalStatus('heartRate', avgHr, petType),
        respiratory: 'ok',
        bodyTemp: 'ok',
        stress: 'ok',
      },
      petType,
    });
    points.push({ day, avgHr, avgSpo2, steps, wellness });
  }
  return points;
};

/** Conseils IA personnalisés par collier. */
export const generateWearableInsights = (collar = {}) => {
  const m = collar.metrics || {};
  const vs = collar.vitalsStatus || {};
  const petType = collar.petType || 'dog';
  const goal = ACTIVITY_GOALS[petType] || ACTIVITY_GOALS.dog;
  const tips = [];

  if (vs.heartRate === 'warn' || vs.heartRate === 'critical') {
    tips.push({
      id: `${collar.id}-hr-tip`,
      icon: '❤️',
      priority: vs.heartRate === 'critical' ? 'high' : 'medium',
      title: 'Rythme cardiaque élevé',
      message: `La FC de ${collar.petName} est hors norme. Laissez-le se reposer et surveillez 15 min. Consultez un véto si persistant.`,
    });
  }
  if (vs.spo2 === 'warn' || vs.spo2 === 'critical') {
    tips.push({
      id: `${collar.id}-spo2-tip`,
      icon: '🫁',
      priority: 'high',
      title: 'SpO₂ basse',
      message: `Oxygénation à ${m.spo2Percent} %. Vérifiez que le collier est bien ajusté et que ${collar.petName} respire normalement.`,
    });
  }
  if ((m.stepsToday ?? 0) < goal.steps * 0.5) {
    tips.push({
      id: `${collar.id}-activity-tip`,
      icon: '🏃',
      priority: 'low',
      title: 'Activité insuffisante',
      message: `${Math.round(((m.stepsToday ?? 0) / goal.steps) * 100)} % de l'objectif pas (${goal.steps.toLocaleString('fr-FR')}). Une promenade ou session de jeu est recommandée.`,
    });
  }
  if ((m.stressIndex ?? 0) >= getThresholds(petType).stressIndex.warn) {
    tips.push({
      id: `${collar.id}-stress-tip`,
      icon: '😰',
      priority: 'medium',
      title: 'Stress détecté',
      message: `Indice stress ${m.stressIndex}/100. Réduisez les stimuli (bruit, visiteurs) et favorisez un environnement calme.`,
    });
  }
  const sleep = buildSleepSummary(m, petType);
  if (sleep.status === 'poor') {
    tips.push({
      id: `${collar.id}-sleep-tip`,
      icon: '😴',
      priority: 'medium',
      title: 'Sommeil perturbé',
      message: `${sleep.hours} h de sommeil (qualité ${sleep.quality} %). Objectif ${sleep.targetHours} pour un ${petType === 'cat' ? 'chat' : 'chien'}.`,
    });
  }
  if (collar.batteryPercent != null && collar.batteryPercent < 30) {
    tips.push({
      id: `${collar.id}-batt-tip`,
      icon: '🔋',
      priority: 'medium',
      title: 'Batterie faible',
      message: `Collier à ${collar.batteryPercent} %. Rechargez avant la nuit pour un suivi continu.`,
    });
  }
  if (!tips.length) {
    tips.push({
      id: `${collar.id}-ok-tip`,
      icon: '✅',
      priority: 'low',
      title: 'Tout va bien',
      message: `${collar.petName} présente des signes vitaux stables. Continuez le suivi régulier.`,
    });
  }
  return tips;
};

/** Enrichit un collier avec scores, timeline et conseils. */
export const enrichCollar = (collar, historyExtra) => {
  const petType = collar.petType || 'dog';
  const metrics = {
    ...collar.metrics,
    animalState: collar.metrics?.animalState || computeAnimalState(collar.metrics, petType),
  };
  const vitalsStatus = collar.vitalsStatus || {
    spo2: assessVitalStatus('spo2', metrics.spo2Percent, petType),
    heartRate: assessVitalStatus('heartRate', metrics.heartRateBpm, petType),
    respiratory: assessVitalStatus('respiratory', metrics.respiratoryRate, petType),
    bodyTemp: assessVitalStatus('bodyTemp', metrics.bodyTempC, petType),
    stress: assessVitalStatus('stress', metrics.stressIndex, petType),
  };
  const enriched = {
    ...collar,
    metrics,
    vitalsStatus,
    stateMeta: WEARABLE_ANIMAL_STATES[metrics.animalState] || WEARABLE_ANIMAL_STATES.calm,
    wellnessScore: computeWellnessScore({ metrics, vitalsStatus, petType }),
    sleep: buildSleepSummary(metrics, petType),
    activityTimeline: buildActivityTimeline(collar),
    weeklyTrend: buildWeeklyTrend(collar),
    vitalRanges: getVitalRangesDisplay(petType),
    activityGoal: ACTIVITY_GOALS[petType] || ACTIVITY_GOALS.dog,
  };
  enriched.insights = generateWearableInsights(enriched);
  if (historyExtra) enriched.historyPoints = historyExtra;
  return enriched;
};

const buildHistoryPoint = (device, at) => {
  const m = device.metrics || {};
  return {
    at: at || new Date().toISOString(),
    spo2Percent: m.spo2Percent,
    heartRateBpm: m.heartRateBpm,
    respiratoryRate: m.respiratoryRate,
    bodyTempC: m.bodyTempC,
    stressIndex: m.stressIndex,
    animalState: m.animalState,
  };
};

/** Génère l'historique horaire démo (24 points). */
export const buildWearableHistory = (device, hours = 24) => {
  const petType = device.petType || 'dog';
  const base = device.metrics || {};
  const points = [];
  const now = Date.now();

  for (let i = hours - 1; i >= 0; i -= 1) {
    const t = getThresholds(petType);
    const hour = new Date(now - i * 3600000);
    const isNight = hour.getHours() >= 22 || hour.getHours() < 6;
    const hrBase = isNight ? (t.heartRate.restingMin + t.heartRate.restingMax) / 2 - 10 : base.heartRateBpm ?? 90;
    const spo2 = clamp((base.spo2Percent ?? 97) + rnd(-1.5, 1.5), 92, 100);
    const hr = Math.round(clamp(hrBase + rnd(-12, 12), t.heartRate.criticalLow + 5, t.heartRate.activeMax));
    points.push({
      at: hour.toISOString(),
      label: `${String(hour.getHours()).padStart(2, '0')}h`,
      spo2Percent: Math.round(spo2 * 10) / 10,
      heartRateBpm: hr,
      respiratoryRate: Math.round((base.respiratoryRate ?? 20) + rnd(-4, 4)),
      bodyTempC: Math.round(((base.bodyTempC ?? 38.4) + rnd(-0.3, 0.3)) * 10) / 10,
      stressIndex: Math.round(clamp((base.stressIndex ?? 20) + rnd(-15, 15), 5, 85)),
    });
  }
  return points;
};

/** Simule une nouvelle lecture temps réel (démo). */
export const simulateWearableReading = (device) => {
  const petType = device.petType || 'dog';
  const t = getThresholds(petType);
  const prev = device.metrics || {};
  const activityRoll = Math.random();
  const activityLevel = activityRoll > 0.92 ? 'active' : activityRoll > 0.85 ? 'alert' : activityRoll < 0.25 ? 'resting' : prev.activityLevel || 'calm';

  const hrDrift = activityLevel === 'active' ? rnd(8, 25) : activityLevel === 'resting' ? rnd(-8, 2) : rnd(-4, 4);
  const heartRateBpm = Math.round(clamp(
    (prev.heartRateBpm ?? (t.heartRate.restingMin + t.heartRate.restingMax) / 2) + hrDrift,
    t.heartRate.criticalLow + 5,
    t.heartRate.activeMax,
  ));

  const spo2Percent = Math.round(clamp((prev.spo2Percent ?? 97) + rnd(-0.8, 0.8), 93, 100) * 10) / 10;
  const respiratoryRate = Math.round(clamp((prev.respiratoryRate ?? 22) + rnd(-2, 2), t.respiratory.min - 2, t.respiratory.max + 5));
  const bodyTempC = Math.round(clamp((prev.bodyTempC ?? 38.4) + rnd(-0.15, 0.15), t.bodyTemp.min - 0.5, t.bodyTemp.max + 0.5) * 10) / 10;
  const stressIndex = Math.round(clamp(
    (prev.stressIndex ?? 18) + (activityLevel === 'active' ? rnd(2, 8) : rnd(-3, 2)),
    5,
    90,
  ));
  const stepsToday = Math.round((prev.stepsToday ?? 0) + (activityLevel === 'active' ? rnd(15, 45) : rnd(0, 3)));

  const metrics = {
    ...prev,
    spo2Percent,
    heartRateBpm,
    respiratoryRate,
    bodyTempC,
    stressIndex,
    activityLevel,
    stepsToday,
    caloriesBurned: Math.round((prev.caloriesBurned ?? 200) + (activityLevel === 'active' ? rnd(1, 4) : 0)),
  };
  metrics.animalState = computeAnimalState(metrics, petType);

  return {
    deviceId: device.id,
    petId: device.petId,
    petName: device.petName,
    at: new Date().toISOString(),
    metrics,
    vitalsStatus: {
      spo2: assessVitalStatus('spo2', spo2Percent, petType),
      heartRate: assessVitalStatus('heartRate', heartRateBpm, petType),
      respiratory: assessVitalStatus('respiratory', respiratoryRate, petType),
      bodyTemp: assessVitalStatus('bodyTemp', bodyTempC, petType),
      stress: assessVitalStatus('stress', stressIndex, petType),
    },
  };
};

/** Fusionne une lecture dans l'état wearable. */
export const mergeWearableReading = (state, reading) => {
  if (!reading?.deviceId) return state;
  const collars = (state?.collars || []).map((c) => {
    if (c.id !== reading.deviceId) return c;
    const merged = {
      ...c,
      metrics: { ...c.metrics, ...reading.metrics },
      lastSeen: reading.at || new Date().toISOString(),
      vitalsStatus: reading.vitalsStatus,
    };
    return enrichCollar(merged, state?.history?.[reading.deviceId]);
  });

  const history = { ...(state?.history || {}) };
  const point = buildHistoryPoint(
    collars.find((c) => c.id === reading.deviceId) || { metrics: reading.metrics },
    reading.at,
  );
  const prevHist = history[reading.deviceId] || [];
  history[reading.deviceId] = [point, ...prevHist].slice(0, 60);

  return { ...state, collars, history, lastReadingAt: reading.at };
};

/** Construit le pack wearable depuis les appareils IoT. */
export const buildWearablePack = (devices = [], extra = {}) => {
  const history = {};
  const rawCollars = devices.filter((d) => d.type === 'wearable-collar');

  rawCollars.forEach((d) => {
    history[d.id] = extra.history?.[d.id] || buildWearableHistory(d);
  });

  const collars = rawCollars.map((d) => enrichCollar(d, history[d.id]));

  const alerts = collars.flatMap((c) => {
    const issues = [];
    const vs = c.vitalsStatus || {};
    if (vs.spo2 === 'critical' || vs.spo2 === 'warn') {
      issues.push({
        id: `wear-${c.id}-spo2`,
        severity: vs.spo2 === 'critical' ? 'high' : 'medium',
        title: `SpO₂ ${c.petName}`,
        message: `Saturation oxygène ${c.metrics.spo2Percent} % — surveiller.`,
        deviceId: c.id,
        link: '/client-iot?tab=wearable',
      });
    }
    if (vs.heartRate === 'critical' || vs.heartRate === 'warn') {
      issues.push({
        id: `wear-${c.id}-hr`,
        severity: vs.heartRate === 'critical' ? 'high' : 'medium',
        title: `Rythme cardiaque ${c.petName}`,
        message: `${c.metrics.heartRateBpm} bpm — hors plage habituelle.`,
        deviceId: c.id,
        link: '/client-iot?tab=wearable',
      });
    }
    if (c.metrics.animalState === 'critical' || c.metrics.animalState === 'stressed') {
      issues.push({
        id: `wear-${c.id}-state`,
        severity: c.metrics.animalState === 'critical' ? 'high' : 'medium',
        title: `État ${c.petName}`,
        message: `${c.stateMeta?.label || c.metrics.animalState} — ${c.stateMeta?.desc || ''}`,
        deviceId: c.id,
        link: '/veterinary',
      });
    }
    return issues;
  });

  const online = collars.filter((c) => c.status === 'online').length;
  const avgWellness = collars.length
    ? Math.round(collars.reduce((s, c) => s + (c.wellnessScore ?? 0), 0) / collars.length)
    : null;

  return {
    mode: extra.mode || 'demo',
    collars,
    history,
    alerts,
    counts: {
      total: collars.length,
      online,
      critical: collars.filter((c) => c.metrics.animalState === 'critical').length,
      stressed: collars.filter((c) => c.metrics.animalState === 'stressed').length,
      avgWellness,
    },
    lastSyncAt: extra.lastSyncAt || new Date().toISOString(),
  };
};

export default {
  assessVitalStatus,
  computeAnimalState,
  getVitalRangesDisplay,
  computeWellnessScore,
  buildSleepSummary,
  buildActivityTimeline,
  buildWeeklyTrend,
  generateWearableInsights,
  enrichCollar,
  buildWearableHistory,
  simulateWearableReading,
  mergeWearableReading,
  buildWearablePack,
};
