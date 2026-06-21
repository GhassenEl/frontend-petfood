import {
  VITAL_THRESHOLDS,
  WEARABLE_ANIMAL_STATES,
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
    const metrics = { ...c.metrics, ...reading.metrics };
    return {
      ...c,
      metrics,
      lastSeen: reading.at || new Date().toISOString(),
      vitalsStatus: reading.vitalsStatus,
    };
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
  const collars = devices
    .filter((d) => d.type === 'wearable-collar')
    .map((d) => {
      const petType = d.petType || 'dog';
      const metrics = {
        ...d.metrics,
        animalState: d.metrics?.animalState || computeAnimalState(d.metrics, petType),
      };
      return {
        ...d,
        metrics,
        vitalsStatus: {
          spo2: assessVitalStatus('spo2', metrics.spo2Percent, petType),
          heartRate: assessVitalStatus('heartRate', metrics.heartRateBpm, petType),
          respiratory: assessVitalStatus('respiratory', metrics.respiratoryRate, petType),
          bodyTemp: assessVitalStatus('bodyTemp', metrics.bodyTempC, petType),
          stress: assessVitalStatus('stress', metrics.stressIndex, petType),
        },
        stateMeta: WEARABLE_ANIMAL_STATES[metrics.animalState] || WEARABLE_ANIMAL_STATES.calm,
      };
    });

  const history = {};
  collars.forEach((c) => {
    history[c.id] = extra.history?.[c.id] || buildWearableHistory(c);
  });

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
    },
    lastSyncAt: extra.lastSyncAt || new Date().toISOString(),
  };
};

export default {
  assessVitalStatus,
  computeAnimalState,
  buildWearableHistory,
  simulateWearableReading,
  mergeWearableReading,
  buildWearablePack,
};
