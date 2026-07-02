import {
  buildIoTAnomalies,
  buildEnvironmentSummary,
  forecastConsumption,
  detectConsumptionSpike,
} from './iotAnomalyEngine';
import { computeNetworkHealth } from './iotEcosystemEngine';
import { buildIoTSecurityPack } from './iotSecurityEngine';
import { buildEmbeddedStackSummary } from '../config/embeddedPlatformCatalog';
import { assessVitalStatus, computeAnimalState } from './wearablePetEngine';

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
    if (d.type === 'feeder-cam' && m.foodQuality === 'bad') score -= 20;
    else if (d.type === 'feeder-cam' && m.foodQuality === 'warning') score -= 8;
    else if (d.type === 'feeder-cam' && m.qualityScore != null && m.qualityScore < 50) score -= 20;
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

  devices.filter((d) => d.type === 'feeder-cam').forEach((d) => {
    const m = d.metrics || {};
    const q = m.foodQuality || (m.qualityScore < 50 ? 'bad' : m.qualityScore < 75 ? 'warning' : 'good');
    if (q !== 'good') {
      insights.push({
        id: `food-quality-${d.id}`,
        icon: q === 'bad' ? '🚫' : '⚠️',
        priority: q === 'bad' ? 'high' : 'medium',
        title: `Qualité croquettes ${d.petName}`,
        message:
          q === 'bad'
            ? `ESP32-CAM : qualité mauvaise (${m.qualityScore ?? '—'}/100) — ne pas servir, vérifier le bac.`
            : `ESP32-CAM : qualité limite (${m.qualityScore ?? '—'}/100) — temp ${m.temperatureC ?? '—'} °C, HR ${m.humidityPct ?? '—'} %.`,
        link: '/client-iot',
      });
    }
  });

  devices.filter((d) => d.type === 'smart-fridge').forEach((d) => {
    const m = d.metrics || {};
    if (m.temperatureC != null && m.temperatureC > 6) {
      insights.push({
        id: `fridge-${d.id}`,
        icon: '🧊',
        priority: 'high',
        title: `Chaîne du froid ${d.petName}`,
        message: `Réfrigérateur à ${m.temperatureC} °C — seuil 4 °C dépassé.`,
        link: '/client-iot?tab=advanced',
      });
    }
    if (m.expiryDays != null && m.expiryDays < 7) {
      insights.push({
        id: `expiry-${d.id}`,
        icon: '📅',
        priority: 'medium',
        title: 'Péremption proche',
        message: `Lot alimentaire expire dans ${m.expiryDays} jours.`,
        link: '/client-iot?tab=advanced',
      });
    }
  });

  devices.filter((d) => d.type === 'scale').forEach((d) => {
    const m = d.metrics || {};
    if (m.adherence != null && m.adherence < 80) {
      insights.push({
        id: `scale-${d.id}`,
        icon: '⚖️',
        priority: 'medium',
        title: `Ration ${d.petName}`,
        message: `Adhérence nutritionnelle ${m.adherence} % — ajuster la distribution.`,
        link: '/client-digital-twin',
      });
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

  devices.filter((d) => d.type === 'wearable-collar').forEach((d) => {
    const m = d.metrics || {};
    const petType = d.petType || 'dog';
    const spo2Status = assessVitalStatus('spo2', m.spo2Percent, petType);
    const hrStatus = assessVitalStatus('heartRate', m.heartRateBpm, petType);
    const state = m.animalState || computeAnimalState(m, petType);

    if (spo2Status === 'critical' || spo2Status === 'warn') {
      insights.push({
        id: `wear-spo2-${d.id}`,
        icon: '🫁',
        priority: spo2Status === 'critical' ? 'high' : 'medium',
        title: `SpO₂ ${d.petName}`,
        message: `Saturation oxygène ${m.spo2Percent ?? '—'} % — surveiller le collier connecté.`,
        link: '/client-iot?tab=wearable',
      });
    }
    if (hrStatus === 'critical' || hrStatus === 'warn') {
      insights.push({
        id: `wear-hr-${d.id}`,
        icon: '❤️',
        priority: hrStatus === 'critical' ? 'high' : 'medium',
        title: `Rythme cardiaque ${d.petName}`,
        message: `${m.heartRateBpm ?? '—'} bpm — hors plage habituelle pour un ${petType === 'cat' ? 'chat' : 'chien'}.`,
        link: '/client-iot?tab=wearable',
      });
    }
    if (state === 'stressed' || state === 'critical') {
      insights.push({
        id: `wear-state-${d.id}`,
        icon: state === 'critical' ? '🚨' : '😰',
        priority: state === 'critical' ? 'high' : 'medium',
        title: `État ${d.petName}`,
        message: `Collier : état ${state} — indices physiologiques à vérifier.`,
        link: '/veterinary',
      });
    }
    if (d.batteryPercent != null && d.batteryPercent < 25) {
      insights.push({
        id: `wear-batt-${d.id}`,
        icon: '🔋',
        priority: 'medium',
        title: `Batterie collier ${d.petName}`,
        message: `Batterie à ${d.batteryPercent} % — recharger le collier.`,
        link: '/client-iot?tab=wearable',
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
    if (d.type === 'feeder-cam') {
      const q = m.foodQuality || 'good';
      const icons = { good: '✅', warning: '⚠️', bad: '🚫' };
      events.push({
        id: `${d.id}-quality`,
        deviceId: d.id,
        deviceName: d.name,
        type: 'food-quality',
        icon: icons[q] || '📷',
        message: `Qualité croquettes : ${q === 'good' ? 'Bonne' : q === 'bad' ? 'Mauvaise' : 'À surveiller'} (${m.qualityScore ?? '—'}/100)`,
        at: hoursAgo(0.2),
      });
      if (m.humidityPct != null) {
        events.push({
          id: `${d.id}-humidity`,
          deviceId: d.id,
          deviceName: d.name,
          type: 'humidity',
          icon: '💧',
          message: `Humidité bac ${m.humidityPct} %`,
          at: hoursAgo(0.35),
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
    batteryPercent: d.batteryPercent ?? (d.type === 'feeder' ? null : d.type === 'wearable-collar' ? 70 + (i * 3) % 25 : 78 + (i * 5) % 18),
    lastSeen: d.lastSeen || hoursAgo(d.status === 'online' ? 0.05 : 3),
    metrics: {
      ...d.metrics,
      ...(d.type === 'wearable-collar' && d.metrics ? {
        animalState: d.metrics.animalState || computeAnimalState(d.metrics, d.petType || 'dog'),
      } : {}),
      percentOfTarget:
        d.metrics?.percentOfTarget ??
        (d.metrics?.todayMl != null && d.metrics?.targetMl
          ? Math.round((d.metrics.todayMl / d.metrics.targetMl) * 100)
          : undefined),
    },
  }));

  const enriched = { ...base, devices };
  const anomalies = buildIoTAnomalies(enriched);
  const environment = buildEnvironmentSummary(devices);
  const feeder = devices.find((d) => d.type === 'feeder');
  const consumptionForecast = feeder
    ? forecastConsumption(
        base.telemetry?.feederGrams7d,
        feeder.metrics?.reservoirPercent,
        feeder.metrics?.capacityGrams
      )
    : null;
  const feederSpike = detectConsumptionSpike(base.telemetry?.feederGrams7d, 'Croquettes');

  const mqtt = {
    connected: base.mqtt?.connected ?? base.mode === 'live',
    broker: base.mqtt?.broker || 'mqtt://localhost:1883',
    topicPrefix: base.mqtt?.topicPrefix || 'petfood/',
    devicesSubscribed: base.mqtt?.devicesSubscribed ?? devices.filter((d) => d.status === 'online').length,
  };

  const partial = { ...enriched, healthScore, mqtt };
  const networkHealth = computeNetworkHealth(partial);
  const security = buildIoTSecurityPack({ ...partial, networkHealth });
  const embeddedStack = buildEmbeddedStackSummary({ ...partial, mqtt, networkHealth });

  return {
    ...enriched,
    healthScore,
    insights,
    predictions,
    sensorTimeline,
    anomalies,
    environment,
    consumptionForecast,
    consumptionSpike: feederSpike,
    mqtt,
    networkHealth,
    security,
    embeddedStack,
    intelligence: {
      insightCount: insights.length,
      anomalyCount: anomalies.length,
      criticalAnomalies: anomalies.filter((a) => a.severity === 'high').length,
      criticalPredictions: predictions.filter((p) => p.urgency === 'high' || p.risk === 'high').length,
    },
  };
};

export default enrichIoTPack;
