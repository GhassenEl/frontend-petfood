/**
 * Surveillance intelligente qualité alimentaire — chaîne du froid IoT + IA.
 * Entrepôts, véhicules, distributeurs, réfrigérateurs connectés.
 */

export const ZONE_TYPES = {
  warehouse: { label: 'Entrepôt', icon: '🏭', color: '#1e40af' },
  vehicle: { label: 'Véhicule livraison', icon: '🚚', color: '#0ea5e9' },
  feeder: { label: 'Distributeur IoT', icon: '🍽️', color: '#059669' },
  fridge: { label: 'Réfrigérateur connecté', icon: '🧊', color: '#7c3aed' },
};

const IDEAL = {
  warehouse: { temp: [15, 22], humidity: [35, 55], lux: [0, 200], air: [0, 800] },
  vehicle: { temp: [12, 20], humidity: [35, 50], lux: [0, 500], air: [0, 900] },
  feeder: { temp: [15, 22], humidity: [35, 55], lux: [0, 300], air: [0, 850] },
  fridge: { temp: [2, 6], humidity: [40, 60], lux: [0, 50], air: [0, 600] },
};

export const scoreFromConditions = ({
  temperatureC = 20,
  humidityPct = 45,
  luminosityLux = 80,
  airQualityPpm = 400,
  lidOpen = false,
  coolingActive = true,
  zoneType = 'warehouse',
} = {}) => {
  const ideal = IDEAL[zoneType] || IDEAL.warehouse;
  let score = 95;

  if (temperatureC < ideal.temp[0] - 3) score -= 12;
  else if (temperatureC < ideal.temp[0]) score -= 5;
  else if (temperatureC > ideal.temp[1] + 6) score -= 35;
  else if (temperatureC > ideal.temp[1] + 3) score -= 20;
  else if (temperatureC > ideal.temp[1]) score -= 10;

  if (humidityPct > ideal.humidity[1] + 15) score -= 28;
  else if (humidityPct > ideal.humidity[1]) score -= 12;
  else if (humidityPct < ideal.humidity[0] - 10) score -= 8;

  if (luminosityLux > ideal.lux[1] * 2) score -= 10;
  if (airQualityPpm > ideal.air[1]) score -= 15;
  if (airQualityPpm > ideal.air[1] * 1.5) score -= 20;

  if (lidOpen) score -= 18;
  if (!coolingActive && zoneType !== 'feeder') score -= 30;

  return Math.max(0, Math.min(100, Math.round(score)));
};

export const detectAnomalies = (zone, reading = {}, history = []) => {
  const anomalies = [];
  const ideal = IDEAL[zone.type] || IDEAL.warehouse;
  const { temperatureC, humidityPct, luminosityLux, airQualityPpm, lidOpen, coolingActive } = reading;

  if (temperatureC != null && temperatureC > ideal.temp[1] + 3) {
    anomalies.push({
      id: `temp-high-${zone.id}`,
      type: 'temperature_high',
      severity: temperatureC > ideal.temp[1] + 6 ? 'high' : 'medium',
      icon: '🌡️',
      title: 'Température trop élevée',
      message: `${zone.name} : ${temperatureC} °C (max ${ideal.temp[1]} °C). Risque dégradation produits.`,
      zoneId: zone.id,
      at: reading.recordedAt || new Date().toISOString(),
    });
  }

  if (humidityPct != null && humidityPct > ideal.humidity[1] + 5) {
    anomalies.push({
      id: `humidity-${zone.id}`,
      type: 'humidity_excess',
      severity: humidityPct > 70 ? 'high' : 'medium',
      icon: '💧',
      title: 'Humidité excessive',
      message: `${zone.name} : ${humidityPct} % HR — moisissure et agglomération possibles.`,
      zoneId: zone.id,
      at: reading.recordedAt || new Date().toISOString(),
    });
  }

  if (coolingActive === false && zone.type !== 'feeder') {
    anomalies.push({
      id: `cooling-${zone.id}`,
      type: 'cooling_failure',
      severity: 'high',
      icon: '❄️',
      title: 'Panne système de refroidissement',
      message: `${zone.name} : compresseur / groupe froid inactif — intervention urgente.`,
      zoneId: zone.id,
      at: reading.recordedAt || new Date().toISOString(),
    });
  }

  if (lidOpen) {
    anomalies.push({
      id: `door-${zone.id}`,
      type: 'abnormal_opening',
      severity: 'medium',
      icon: '🚪',
      title: 'Ouverture anormale',
      message: `${zone.name} : porte ou couvercle ouvert — chaîne du froid rompue.`,
      zoneId: zone.id,
      at: reading.recordedAt || new Date().toISOString(),
    });
  }

  if (airQualityPpm != null && airQualityPpm > (ideal.air[1] || 800)) {
    anomalies.push({
      id: `air-${zone.id}`,
      type: 'air_quality',
      severity: 'low',
      icon: '🌬️',
      title: 'Qualité de l\'air dégradée',
      message: `${zone.name} : COV ${airQualityPpm} ppm — ventilation recommandée.`,
      zoneId: zone.id,
      at: reading.recordedAt || new Date().toISOString(),
    });
  }

  const recent = history.slice(0, 6);
  if (recent.length >= 3) {
    const temps = recent.map((r) => r.temperatureC).filter((t) => t != null);
    if (temps.length >= 3 && temps[0] > temps[temps.length - 1] + 4) {
      anomalies.push({
        id: `trend-${zone.id}`,
        type: 'temperature_trend',
        severity: 'medium',
        icon: '📈',
        title: 'Hausse thermique progressive',
        message: `${zone.name} : +${Math.round(temps[0] - temps[temps.length - 1])} °C sur les dernières mesures.`,
        zoneId: zone.id,
        at: reading.recordedAt || new Date().toISOString(),
      });
    }
  }

  return anomalies;
};

/** Score qualité lot : stockage + âge + expiration + anomalies */
export const computeBatchQualityScore = (batch, zoneAnomalies = []) => {
  const storageScore = batch.storageScore ?? batch.avgStorageScore ?? 85;
  const ageDays = batch.ageDays ?? 0;
  const maxShelfDays = batch.maxShelfDays ?? 180;
  const daysToExpiry = batch.daysToExpiry ?? 90;

  let score = storageScore * 0.45;

  const ageRatio = ageDays / maxShelfDays;
  score += (1 - Math.min(1, ageRatio)) * 25;

  const expiryRatio = Math.max(0, daysToExpiry / maxShelfDays);
  score += expiryRatio * 25;

  const batchAnomalies = zoneAnomalies.filter((a) =>
    batch.zoneIds?.includes(a.zoneId) || batch.zoneId === a.zoneId,
  );
  score -= batchAnomalies.filter((a) => a.severity === 'high').length * 12;
  score -= batchAnomalies.filter((a) => a.severity === 'medium').length * 6;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let status = 'good';
  if (score < 50) status = 'critical';
  else if (score < 70) status = 'warning';
  else if (score < 85) status = 'acceptable';

  return { score, status };
};

/** Prédiction durée de conservation restante (jours) + priorité vente */
export const predictShelfLife = (batch, currentReading = {}) => {
  const { score } = computeBatchQualityScore(batch);
  const baseDays = batch.daysToExpiry ?? 60;
  const tempFactor = currentReading.temperatureC > 25 ? 0.6 : currentReading.temperatureC > 22 ? 0.85 : 1;
  const humFactor = currentReading.humidityPct > 65 ? 0.75 : 1;
  const remainingDays = Math.max(0, Math.round(baseDays * (score / 100) * tempFactor * humFactor));

  let priority = 'normal';
  if (remainingDays <= 7 || score < 55) priority = 'urgent';
  else if (remainingDays <= 21 || score < 70) priority = 'high';

  const aiSummary =
    priority === 'urgent'
      ? `Lot ${batch.code} : vendre ou consommer sous ${remainingDays} j — conditions dégradées.`
      : priority === 'high'
        ? `Lot ${batch.code} : prioriser rotation sous ${remainingDays} j.`
        : `Lot ${batch.code} : conservation OK (~${remainingDays} j restants).`;

  return { remainingDays, priority, aiSummary, qualityScore: score };
};

export const buildHistorySeries = (readings = [], hours = 24) => {
  return readings.slice(0, hours).reverse().map((r) => ({
    t: new Date(r.recordedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    temp: r.temperatureC,
    humidity: r.humidityPct,
    lux: r.luminosityLux,
    air: r.airQualityPpm,
  }));
};

export const enrichSurveillancePack = (pack = {}) => {
  const zones = (pack.zones || []).map((z) => {
    const reading = z.currentReading || {};
    const history = z.history || [];
    const conditionScore = scoreFromConditions({ ...reading, zoneType: z.type });
    const anomalies = detectAnomalies(z, reading, history);
    return {
      ...z,
      conditionScore,
      anomalies,
      historySeries: buildHistorySeries(history),
    };
  });

  const allAnomalies = zones.flatMap((z) => z.anomalies);
  const batches = (pack.batches || []).map((b) => {
    const zone = zones.find((z) => z.id === b.zoneId || b.zoneIds?.includes(z.id));
    const prediction = predictShelfLife(b, zone?.currentReading || {});
    const { score, status } = computeBatchQualityScore(b, allAnomalies);
    return {
      ...b,
      qualityScore: score,
      qualityStatus: status,
      prediction,
    };
  });

  const avgScore = batches.length
    ? Math.round(batches.reduce((a, b) => a + b.qualityScore, 0) / batches.length)
    : Math.round(zones.reduce((a, z) => a + z.conditionScore, 0) / Math.max(zones.length, 1));

  const priorityLots = [...batches]
    .sort((a, b) => {
      const p = { urgent: 3, high: 2, normal: 1 };
      return (p[b.prediction?.priority] || 0) - (p[a.prediction?.priority] || 0);
    })
    .slice(0, 5);

  return {
    ...pack,
    zones,
    batches,
    anomalies: allAnomalies.sort((a, b) => {
      const s = { high: 3, medium: 2, low: 1 };
      return (s[b.severity] || 0) - (s[a.severity] || 0);
    }),
    priorityLots,
    counts: {
      zones: zones.length,
      zonesOnline: zones.filter((z) => z.status === 'online').length,
      activeAlerts: allAnomalies.length,
      criticalAlerts: allAnomalies.filter((a) => a.severity === 'high').length,
      batches: batches.length,
      urgentLots: batches.filter((b) => b.prediction?.priority === 'urgent').length,
      avgQualityScore: avgScore,
    },
    intelligence: {
      summary:
        allAnomalies.length === 0
          ? 'Chaîne du froid stable — tous les capteurs dans les normes.'
          : `${allAnomalies.length} anomalie(s) détectée(s) — ${allAnomalies.filter((a) => a.severity === 'high').length} critique(s).`,
    },
  };
};

export default enrichSurveillancePack;
