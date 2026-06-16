/**
 * Surveillance chaîne du froid pendant la livraison — entrepôt → véhicule → client.
 */

import { scoreFromConditions, detectAnomalies, predictShelfLife, computeBatchQualityScore } from './coldChainQualityEngine';

export const DELIVERY_STAGES = {
  warehouse: { label: 'Entrepôt', icon: '🏭', step: 1 },
  loading: { label: 'Chargement', icon: '📦', step: 2 },
  transit: { label: 'En transit', icon: '🚚', step: 3 },
  arriving: { label: 'Arrivée imminente', icon: '📍', step: 4 },
  delivered: { label: 'Réception client', icon: '✅', step: 5 },
};

const TRANSIT_IDEAL = { temp: [12, 20], humidity: [35, 50] };

export const computeChainIntegrityScore = (delivery = {}) => {
  const r = delivery.currentReading || {};
  let score = scoreFromConditions({ ...r, zoneType: 'vehicle' });

  const stage = delivery.stage || 'transit';
  if (stage === 'delivered' && delivery.receivedAt) score = Math.min(100, score + 5);
  if (delivery.anomalies?.length) {
    delivery.anomalies.forEach((a) => {
      if (a.severity === 'high') score -= 15;
      else if (a.severity === 'medium') score -= 8;
    });
  }
  if (delivery.milestones?.every((m) => m.status === 'ok')) score = Math.min(100, score + 8);

  return Math.max(0, Math.min(100, Math.round(score)));
};

export const detectTransitAnomalies = (delivery = {}) => {
  const r = delivery.currentReading || {};
  const zone = {
    id: delivery.vehicleId || 'vehicle',
    type: 'vehicle',
    name: delivery.vehicleName || 'Véhicule livraison',
  };
  const base = detectAnomalies(zone, r, delivery.sensorHistory || []);

  if (r.temperatureC > TRANSIT_IDEAL.temp[1] + 4) {
    base.unshift({
      id: `chain-break-${delivery.id}`,
      type: 'cold_chain_break',
      severity: 'high',
      icon: '🚨',
      title: 'Rupture chaîne du froid',
      message: `Température ${r.temperatureC} °C en transit — seuil max ${TRANSIT_IDEAL.temp[1]} °C dépassé.`,
      at: r.recordedAt || new Date().toISOString(),
    });
  }

  if (delivery.doorOpenDurationMin > 5) {
    base.push({
      id: `door-long-${delivery.id}`,
      type: 'door_open_transit',
      severity: 'medium',
      icon: '🚪',
      title: 'Porte cargo ouverte prolongée',
      message: `Ouverture ${delivery.doorOpenDurationMin} min — risque pour les lots sensibles.`,
      at: r.recordedAt || new Date().toISOString(),
    });
  }

  return base;
};

export const buildDeliveryMilestones = (delivery = {}) => {
  const defaults = [
    { id: 'm1', key: 'warehouse', label: 'Sortie entrepôt', status: 'ok', at: delivery.departedAt },
    { id: 'm2', key: 'loading', label: 'Capteurs activés', status: 'ok', at: delivery.sensorStartedAt },
    { id: 'm3', key: 'transit', label: 'Transmission IoT temps réel', status: delivery.stage === 'transit' ? 'active' : 'ok', at: null },
    { id: 'm4', key: 'arriving', label: 'Approche client', status: delivery.stage === 'arriving' ? 'active' : delivery.stage === 'delivered' ? 'ok' : 'pending', at: null },
    { id: 'm5', key: 'delivered', label: 'Réception & validation qualité', status: delivery.stage === 'delivered' ? 'ok' : 'pending', at: delivery.receivedAt },
  ];
  return delivery.milestones?.length ? delivery.milestones : defaults;
};

export const predictConservationAtDelivery = (delivery = {}) => {
  const batches = delivery.batches || [];
  if (!batches.length) {
    return {
      summary: 'Aucun lot identifié dans ce colis.',
      batches: [],
    };
  }

  const r = delivery.currentReading || {};
  const enriched = batches.map((b) => {
    const prediction = predictShelfLife(b, r);
    const { score } = computeBatchQualityScore(b, delivery.anomalies || []);
    return { ...b, qualityScore: score, prediction };
  });

  const urgent = enriched.filter((b) => b.prediction?.priority === 'urgent').length;
  const summary =
    urgent > 0
      ? `${urgent} lot(s) à consommer en priorité dès réception — surveillance transit dégradée.`
      : `Conservation garantie à la réception — score chaîne ${delivery.chainScore ?? '—'}/100.`;

  return { summary, batches: enriched };
};

export const enrichDelivery = (delivery = {}) => {
  const milestones = buildDeliveryMilestones(delivery);
  const anomalies = detectTransitAnomalies(delivery);
  const chainScore = computeChainIntegrityScore({ ...delivery, anomalies, milestones });
  const conservation = predictConservationAtDelivery({ ...delivery, anomalies, chainScore });

  const stageMeta = DELIVERY_STAGES[delivery.stage] || DELIVERY_STAGES.transit;

  return {
    ...delivery,
    milestones,
    anomalies,
    chainScore,
    conservation,
    stageLabel: stageMeta.label,
    stageIcon: stageMeta.icon,
    aiSummary:
      chainScore >= 85
        ? `Chaîne du froid respectée (${chainScore}/100) — ${delivery.vehicleName} transmet les capteurs en temps réel.`
        : chainScore >= 65
          ? `Surveillance active — écart détecté (${chainScore}/100). ${anomalies[0]?.title || 'Vérification en cours'}.`
          : `Alerte chaîne du froid (${chainScore}/100) — intervention requise avant réception client.`,
  };
};

export const enrichDeliverySurveillancePack = (pack = {}) => {
  const deliveries = (pack.deliveries || []).map(enrichDelivery);
  const active = deliveries.filter((d) => d.stage !== 'delivered');
  const alerts = deliveries.flatMap((d) => d.anomalies || []);

  return {
    ...pack,
    deliveries,
    activeDeliveries: active,
    counts: {
      inTransit: active.length,
      vehiclesOnline: new Set(active.map((d) => d.vehicleId)).size,
      chainAlerts: alerts.filter((a) => a.severity === 'high').length,
      avgChainScore: active.length
        ? Math.round(active.reduce((s, d) => s + d.chainScore, 0) / active.length)
        : 100,
    },
    intelligence: {
      summary:
        active.length === 0
          ? 'Aucune livraison en cours — chaîne du froid prête au prochain départ.'
          : `${active.length} livraison(s) sous surveillance IoT — ${alerts.length} alerte(s) capteurs.`,
    },
  };
};

export default enrichDeliverySurveillancePack;
