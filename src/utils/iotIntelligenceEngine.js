const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();

/** Score santé global du parc IoT (0–100). */
export const computeIoTHealthScore = ({ devices = [], alerts = [] } = {}) => {
  if (!devices.length) return 0;

  let score = 100;
  devices.forEach((d) => {
    if (d.status !== 'online') score -= 18;
    const m = d.metrics || {};
    if (d.type === 'feeder' && m.isLowFood) score -= 12;
    if (d.type === 'feeder' && m.reservoirPercent != null && m.reservoirPercent < 20) score -= 8;
    if (d.type === 'water' && m.percentOfTarget != null && m.percentOfTarget < 70) score -= 10;
    if (d.type === 'water' && m.filterDaysLeft != null && m.filterDaysLeft < 5) score -= 6;
    if (d.signalStrength != null && d.signalStrength < 40) score -= 5;
    if (d.batteryPercent != null && d.batteryPercent < 20) score -= 8;
  });

  alerts.forEach((a) => {
    if (a.severity === 'high') score -= 8;
    else if (a.severity === 'medium') score -= 4;
  });

  return Math.max(0, Math.min(100, Math.round(score)));
};

/** Prédiction de rupture croquettes (jours restants). */
export const predictFoodDepletion = (device = {}) => {
  const m = device.metrics || {};
  const pct = m.reservoirPercent;
  const daily = m.todayGrams || m.avgDailyGrams || 65;
  if (pct == null) return null;

  const capacityGrams = m.capacityGrams || 1200;
  const remaining = (pct / 100) * capacityGrams;
  const daysLeft = daily > 0 ? Math.round((remaining / daily) * 10) / 10 : null;

  return {
    deviceId: device.id,
    deviceName: device.name,
    petName: device.petName,
    reservoirPercent: pct,
    daysLeft,
    urgency: daysLeft != null && daysLeft <= 2 ? 'high' : daysLeft <= 5 ? 'medium' : 'low',
    aiSummary:
      daysLeft != null && daysLeft <= 2
        ? `Rupture estimée dans ${daysLeft} jour(s) — commandez ou rechargez maintenant.`
        : daysLeft != null
          ? `Stock suffisant ~${daysLeft} jours au rythme actuel (${daily} g/j).`
          : 'Surveillez le niveau du réservoir.',
  };
};

/** Risque hydratation insuffisante. */
export const predictHydrationRisk = (device = {}) => {
  const m = device.metrics || {};
  const today = m.todayMl ?? 0;
  const target = m.targetMl || 250;
  const pct = m.percentOfTarget ?? Math.round((today / target) * 100);

  let risk = 'low';
  if (pct < 50) risk = 'high';
  else if (pct < 70) risk = 'medium';

  return {
    deviceId: device.id,
    deviceName: device.name,
    petName: device.petName,
    todayMl: today,
    targetMl: target,
    percentOfTarget: pct,
    risk,
    aiSummary:
      risk === 'high'
        ? `Hydratation critique (${pct} %) — encouragez ${device.petName || 'l\'animal'} à boire.`
        : risk === 'medium'
          ? `Hydratation sous l'objectif (${pct} %) — vérifiez la fontaine et l'activité.`
          : `Hydratation correcte (${pct} % de l'objectif).`,
  };
};

/** Insights IA agrégés pour le hub IoT. */
export const generateIoTInsights = (pack = {}) => {
  const devices = pack.devices || [];
  const insights = [];
  const predictions = [];

  devices.filter((d) => d.type === 'feeder').forEach((d) => {
    const pred = predictFoodDepletion(d);
    if (pred) {
      predictions.push({ kind: 'food', ...pred });
      if (pred.urgency !== 'low') {
        insights.push({
          id: `food-${d.id}`,
          icon: '🍽️',
          priority: pred.urgency,
          title: `Stock ${d.petName}`,
          message: pred.aiSummary,
          link: d.route || '/pet-feeder',
        });
      }
    }
  });

  devices.filter((d) => d.type === 'water').forEach((d) => {
    const pred = predictHydrationRisk(d);
    predictions.push({ kind: 'water', ...pred });
    if (pred.risk !== 'low') {
      insights.push({
        id: `water-${d.id}`,
        icon: '💧',
        priority: pred.risk,
        title: `Hydratation ${d.petName}`,
        message: pred.aiSummary,
        link: d.route || '/client-smart-water',
      });
    }
  });

  const offline = devices.filter((d) => d.status !== 'online');
  offline.forEach((d) => {
    insights.push({
      id: `offline-${d.id}`,
      icon: '📡',
      priority: 'high',
      title: `${d.name} hors ligne`,
      message: 'Vérifiez alimentation, Wi-Fi et firmware ESP32.',
      link: d.route || '/client-iot',
    });
  });

  const telemetry = pack.telemetry || {};
  const waterSeries = telemetry.waterMl7d || [];
  if (waterSeries.length >= 3) {
    const recent = waterSeries.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const prev = waterSeries.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    if (prev > 0 && recent < prev * 0.8) {
      insights.push({
        id: 'water-trend',
        icon: '📉',
        priority: 'medium',
        title: 'Baisse hydratation globale',
        message: `Consommation eau -${Math.round((1 - recent / prev) * 100)} % sur 3 jours — surveillez vos animaux.`,
        link: '/client-smart-water',
      });
    }
  }

  return {
    insights: insights.sort((a, b) => {
      const p = { high: 3, medium: 2, low: 1 };
      return (p[b.priority] || 0) - (p[a.priority] || 0);
    }),
    predictions,
  };
};

/** Timeline capteurs temps réel (événements récents). */
export const buildSensorTimeline = (pack = {}) => {
  if (pack.sensorEvents?.length) return pack.sensorEvents;

  const events = [];
  (pack.devices || []).forEach((d) => {
    const m = d.metrics || {};
    if (d.type === 'feeder') {
      events.push({
        id: `${d.id}-level`,
        deviceId: d.id,
        deviceName: d.name,
        type: 'level',
        icon: '📊',
        message: `Niveau réservoir ${m.reservoirPercent ?? '—'} % · ${m.todayGrams ?? 0} g distribués`,
        at: hoursAgo(0.5),
      });
      if (m.temperature != null) {
        events.push({
          id: `${d.id}-temp`,
          deviceId: d.id,
          deviceName: d.name,
          type: 'temperature',
          icon: '🌡️',
          message: `Température bac ${m.temperature} °C`,
          at: hoursAgo(1),
        });
      }
    }
    if (d.type === 'water') {
      events.push({
        id: `${d.id}-hydration`,
        deviceId: d.id,
        deviceName: d.name,
        type: 'hydration',
        icon: '💧',
        message: `${m.todayMl ?? 0} ml aujourd'hui (${m.percentOfTarget ?? Math.round(((m.todayMl || 0) / (m.targetMl || 1)) * 100)} % objectif)`,
        at: hoursAgo(0.25),
      });
    }
    events.push({
      id: `${d.id}-heartbeat`,
      deviceId: d.id,
      deviceName: d.name,
      type: 'heartbeat',
      icon: d.status === 'online' ? '🟢' : '🔴',
      message: d.status === 'online' ? 'Appareil en ligne' : 'Connexion perdue',
      at: hoursAgo(d.status === 'online' ? 0.1 : 2),
    });
  });

  return events.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 12);
};

/** Enrichit le pack IoT avec scores et intelligence. */
export const enrichIoTPack = (pack) => {
  const base = { ...pack };
  const { insights, predictions } = generateIoTInsights(base);
  const healthScore = computeIoTHealthScore(base);
  const sensorTimeline = buildSensorTimeline(base);

  const devices = (base.devices || []).map((d, i) => ({
    ...d,
    signalStrength: d.signalStrength ?? (d.status === 'online' ? 68 + (i * 7) % 25 : 0),
    batteryPercent: d.batteryPercent ?? (d.type === 'feeder' ? null : 78 + (i * 5) % 18),
    lastSeen: d.lastSeen || hoursAgo(d.status === 'online' ? 0.05 : 3),
    metrics: {
      ...d.metrics,
      percentOfTarget:
        d.metrics?.percentOfTarget ??
        (d.metrics?.todayMl != null && d.metrics?.targetMl
          ? Math.round((d.metrics.todayMl / d.metrics.targetMl) * 100)
          : undefined),
    },
  }));

  return {
    ...base,
    devices,
    healthScore,
    insights,
    predictions,
    sensorTimeline,
    intelligence: {
      insightCount: insights.length,
      criticalPredictions: predictions.filter((p) => p.urgency === 'high' || p.risk === 'high').length,
    },
  };
};

export default enrichIoTPack;
