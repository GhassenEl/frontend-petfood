/**
 * Détection d'anomalies IoT — température, humidité, consommation, qualité alimentaire.
 */

const THRESHOLDS = {
  tempMax: 28,
  tempMin: 2,
  humidityMax: 75,
  humidityCritical: 82,
  qualityMin: 50,
  reservoirCritical: 15,
  hydrationCritical: 50,
};

export const detectDeviceAnomalies = (device = {}) => {
  const m = device.metrics || {};
  const anomalies = [];

  const temp = m.temperatureC ?? m.temperature ?? m.waterTempC;
  if (temp != null) {
    if (temp > THRESHOLDS.tempMax) {
      anomalies.push({
        id: `${device.id}-temp-high`,
        deviceId: device.id,
        deviceName: device.name,
        type: 'temperature',
        severity: temp > 32 ? 'high' : 'medium',
        message: `Température élevée ${temp} °C — risque détérioration aliments.`,
        value: temp,
        threshold: THRESHOLDS.tempMax,
      });
    }
    if (temp < THRESHOLDS.tempMin && device.type === 'smart-fridge') {
      anomalies.push({
        id: `${device.id}-temp-low`,
        deviceId: device.id,
        deviceName: device.name,
        type: 'temperature',
        severity: 'high',
        message: `Chaîne du froid compromise — ${temp} °C (seuil ${THRESHOLDS.tempMin} °C).`,
        value: temp,
        threshold: THRESHOLDS.tempMin,
      });
    }
  }

  const hum = m.humidityPct ?? m.humidity;
  if (hum != null) {
    if (hum >= THRESHOLDS.humidityCritical) {
      anomalies.push({
        id: `${device.id}-hum-critical`,
        deviceId: device.id,
        deviceName: device.name,
        type: 'humidity',
        severity: 'high',
        message: `Humidité critique ${hum} % — aliments détériorés possibles.`,
        value: hum,
        threshold: THRESHOLDS.humidityCritical,
      });
    } else if (hum >= THRESHOLDS.humidityMax) {
      anomalies.push({
        id: `${device.id}-hum-warn`,
        deviceId: device.id,
        deviceName: device.name,
        type: 'humidity',
        severity: 'medium',
        message: `Humidité ${hum} % — surveillance renforcée recommandée.`,
        value: hum,
        threshold: THRESHOLDS.humidityMax,
      });
    }
  }

  if (device.type === 'feeder-cam' || m.foodQuality) {
    const score = m.qualityScore;
    const mold = m.moldPixelRatio ?? 0;
    if (m.foodQuality === 'bad' || (score != null && score < THRESHOLDS.qualityMin)) {
      anomalies.push({
        id: `${device.id}-quality`,
        deviceId: device.id,
        deviceName: device.name,
        type: 'food-quality',
        severity: 'high',
        message: `Qualité alimentaire ${score ?? '—'}/100 — ne pas distribuer.`,
        value: score,
      });
    } else if (mold > 0.08) {
      anomalies.push({
        id: `${device.id}-mold`,
        deviceId: device.id,
        deviceName: device.name,
        type: 'mold',
        severity: 'high',
        message: `Moisissures détectées (ratio ${(mold * 100).toFixed(1)} %).`,
        value: mold,
      });
    }
  }

  if (device.type === 'feeder' && m.reservoirPercent != null && m.reservoirPercent <= THRESHOLDS.reservoirCritical) {
    anomalies.push({
      id: `${device.id}-stock`,
      deviceId: device.id,
      deviceName: device.name,
      type: 'stock',
      severity: 'high',
      message: `Rupture imminente — réservoir ${m.reservoirPercent} %.`,
      value: m.reservoirPercent,
    });
  }

  if (device.type === 'water') {
    const pct = m.percentOfTarget ?? Math.round(((m.todayMl || 0) / (m.targetMl || 1)) * 100);
    if (pct < THRESHOLDS.hydrationCritical) {
      anomalies.push({
        id: `${device.id}-hydration`,
        deviceId: device.id,
        deviceName: device.name,
        type: 'hydration',
        severity: 'high',
        message: `Hydratation critique ${pct} % de l'objectif.`,
        value: pct,
      });
    }
  }

  if (device.status !== 'online') {
    anomalies.push({
      id: `${device.id}-offline`,
      deviceId: device.id,
      deviceName: device.name,
      type: 'connectivity',
      severity: 'high',
      message: 'Appareil hors ligne — vérifier alimentation et Wi-Fi.',
    });
  }

  return anomalies;
};

/** Z-score sur série de consommation (7 jours). */
export const detectConsumptionSpike = (series = [], label = 'Consommation') => {
  if (series.length < 4) return null;
  const arr = series.map(Number);
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const std = Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length) || 1;
  const last = arr[arr.length - 1];
  const z = (last - mean) / std;
  if (Math.abs(z) < 1.8) return null;
  return {
    type: 'consumption',
    severity: z > 2.5 ? 'high' : 'medium',
    message:
      z > 0
        ? `${label} en hausse (+${Math.round(((last - mean) / mean) * 100)} % vs moyenne 7j).`
        : `${label} en baisse (${Math.round(((last - mean) / mean) * 100)} % vs moyenne 7j).`,
    zScore: Math.round(z * 100) / 100,
    lastValue: last,
    meanValue: Math.round(mean),
  };
};

/** Prévision consommation croquettes (jours restants). */
export const forecastConsumption = (grams7d = [], reservoirPercent = 50, capacityGrams = 1200) => {
  if (!grams7d.length) return null;
  const avg = grams7d.reduce((a, b) => a + b, 0) / grams7d.length;
  const remaining = (reservoirPercent / 100) * capacityGrams;
  const daysLeft = avg > 0 ? Math.round((remaining / avg) * 10) / 10 : null;
  const trend = grams7d.length >= 2
    ? grams7d[grams7d.length - 1] - grams7d[grams7d.length - 2]
    : 0;
  return {
    avgDailyGrams: Math.round(avg),
    daysUntilEmpty: daysLeft,
    trend: trend > 5 ? 'up' : trend < -5 ? 'down' : 'stable',
    urgency: daysLeft != null && daysLeft <= 2 ? 'high' : daysLeft <= 5 ? 'medium' : 'low',
  };
};

/** Agrège toutes les anomalies du parc. */
export const buildIoTAnomalies = (pack = {}) => {
  const fromDevices = (pack.devices || []).flatMap(detectDeviceAnomalies);
  const fromAlerts = (pack.alerts || [])
    .filter((a) => a.severity === 'high' || a.severity === 'medium')
    .map((a) => ({
      id: a.id,
      deviceId: a.deviceId,
      deviceName: a.title,
      type: a.source || 'alert',
      severity: a.severity,
      message: a.message,
      source: 'alert',
    }));

  const telemetry = pack.telemetry || {};
  const feederSpike = detectConsumptionSpike(telemetry.feederGrams7d, 'Croquettes');
  const waterSpike = detectConsumptionSpike(telemetry.waterMl7d, 'Hydratation');

  const extra = [feederSpike, waterSpike].filter(Boolean).map((s, i) => ({
    id: `telemetry-${i}`,
    type: s.type,
    severity: s.severity,
    message: s.message,
    zScore: s.zScore,
    source: 'telemetry',
  }));

  const merged = [...fromDevices, ...extra];
  const seen = new Set();
  const unique = merged.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  return unique.sort((a, b) => {
    const p = { high: 3, medium: 2, low: 1 };
    return (p[b.severity] || 0) - (p[a.severity] || 0);
  });
};

/** Résumé environnement (temp / humidité moyennes). */
export const buildEnvironmentSummary = (devices = []) => {
  const temps = [];
  const hums = [];
  const byDevice = [];

  devices.forEach((d) => {
    const m = d.metrics || {};
    const t = m.temperatureC ?? m.temperature;
    const h = m.humidityPct ?? m.humidity;
    if (t != null) temps.push(t);
    if (h != null) hums.push(h);
    if (t != null || h != null) {
      byDevice.push({
        id: d.id,
        name: d.name,
        petName: d.petName,
        type: d.type,
        temperature: t,
        humidity: h,
        status: d.status,
      });
    }
  });

  return {
    avgTemperature: temps.length ? Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10 : null,
    avgHumidity: hums.length ? Math.round(hums.reduce((a, b) => a + b, 0) / hums.length) : null,
    deviceCount: byDevice.length,
    devices: byDevice,
    status:
      temps.some((t) => t > THRESHOLDS.tempMax) || hums.some((h) => h >= THRESHOLDS.humidityMax)
        ? 'warning'
        : 'ok',
  };
};

export default buildIoTAnomalies;
