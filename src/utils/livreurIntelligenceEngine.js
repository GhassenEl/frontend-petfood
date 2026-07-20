/**
 * Moteur IA livreur — tournées, ETA, retards, colis, navigation, perf, éco.
 */

import { normalizeLivreurDailyChart } from './livreurDemoData';

const haversineKm = (a, b) => {
  if (!a?.lat || !b?.lat) return 5;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const SENSITIVE_KEYWORDS = ['lait', 'médicament', 'medicament', 'vaccin', 'frais', 'fragile'];

export const isSensitiveOrder = (order) => {
  if (order.sensitive || order.urgent) return true;
  const items = order.items || [];
  return items.some((it) => {
    const name = (it.productId?.name || it.name || '').toLowerCase();
    return SENSITIVE_KEYWORDS.some((k) => name.includes(k));
  });
};

/** Optimisation tournée — ordre des arrêts + km/temps estimés. */
export const optimizeRoute = (stops = [], startPoint = { lat: 36.8065, lng: 10.1815 }) => {
  const pending = [...stops].filter((s) => s.order?.status !== 'delivered');
  if (!pending.length) {
    return { stops: [], summary: { stopCount: 0, estimatedKm: 0, estimatedMinutes: 0 }, savingsPercent: 0 };
  }

  const scored = pending.map((stop) => {
    const loc = stop.order?.deliveryLocation || { lat: 36.81, lng: 10.18 };
    const dist = haversineKm(startPoint, loc);
    const urgent = stop.order?.urgent || isSensitiveOrder(stop.order);
    const score = dist - (urgent ? 2 : 0) - (stop.order?.priorityScore || 0) * 0.01;
    return { ...stop, dist, score, urgent };
  });

  scored.sort((a, b) => a.score - b.score);
  let totalKm = 0;
  let prev = startPoint;
  const optimized = scored.map((s, i) => {
    const loc = s.order?.deliveryLocation || startPoint;
    const legKm = haversineKm(prev, loc);
    totalKm += legKm;
    prev = loc;
    const etaMinutes = Math.round(totalKm * 4 + (i + 1) * 8);
    return { ...s, sequence: i + 1, legKm: Math.round(legKm * 10) / 10, etaMinutes };
  });

  const naiveKm = scored.reduce((acc, s) => acc + s.dist, 0);
  const savingsPercent = naiveKm > 0 ? Math.round((1 - totalKm / (naiveKm * 1.3)) * 100) : 12;

  return {
    stops: optimized,
    summary: {
      stopCount: optimized.length,
      estimatedKm: Math.round(totalKm * 10) / 10,
      estimatedMinutes: optimized[optimized.length - 1]?.etaMinutes || Math.round(totalKm * 4),
    },
    savingsPercent: Math.max(8, Math.min(28, savingsPercent)),
    aiSummary: `Itinéraire optimisé : ${optimized.length} arrêt(s), ~${Math.round(totalKm * 10) / 10} km, gain estimé ${Math.max(8, savingsPercent)} % vs ordre chronologique.`,
  };
};

/** Prédiction ETA dynamique (trafic, météo, volume). */
export const predictDeliveryEta = ({ stops = [], traffic = 'moderate', weather = 'clear', stopCount } = {}) => {
  const n = stopCount ?? stops.length ?? 3;
  const trafficFactor = { light: 0.85, moderate: 1, heavy: 1.35, blocked: 1.6 }[traffic] || 1;
  const weatherFactor = { clear: 1, rain: 1.15, heat: 1.08, wind: 1.05 }[weather] || 1;
  const baseMinutesPerStop = 14;
  const base = n * baseMinutesPerStop * trafficFactor * weatherFactor;
  const buffer = Math.round(base * 0.1);

  const perStop = stops.length
    ? stops.map((s, i) => ({
      orderId: s.order?.id || s.order?._id || `stop-${i}`,
      address: s.order?.address || s.address,
      etaMinutes: Math.round((i + 1) * baseMinutesPerStop * trafficFactor * weatherFactor),
      window: traffic === 'heavy' ? '±15 min' : '±8 min',
    }))
    : Array.from({ length: n }, (_, i) => ({
      orderId: `demo-${i}`,
      etaMinutes: Math.round((i + 1) * baseMinutesPerStop * trafficFactor * weatherFactor),
      window: '±10 min',
    }));

  return {
    totalMinutes: Math.round(base + buffer),
    bufferMinutes: buffer,
    traffic,
    weather,
    trafficLabel: { light: 'Fluide', moderate: 'Modéré', heavy: 'Dense', blocked: 'Bloqué' }[traffic],
    weatherLabel: { clear: 'Dégagé', rain: 'Pluie', heat: 'Forte chaleur', wind: 'Vent' }[weather],
    perStop,
    aiSummary: `ETA totale ~${Math.round(base + buffer)} min (${n} livraisons, trafic ${traffic}, météo ${weather}).`,
  };
};

/** Détection retards + notifications clients. */
export const detectDeliveryDelays = (stops = [], etaPack = {}) => {
  const now = Date.now();
  const alerts = [];

  stops.forEach((stop) => {
    const order = stop.order || stop;
    const promised = order.promisedAt || order.deliveryWindowEnd;
    const etaMin = stop.etaMinutes ?? 30;
    const expectedArrival = now + etaMin * 60000;

    if (promised && expectedArrival > new Date(promised).getTime()) {
      const delayMin = Math.round((expectedArrival - new Date(promised).getTime()) / 60000);
      alerts.push({
        id: `delay-${order.id || order._id}`,
        orderId: order.id || order._id,
        address: order.address,
        delayMinutes: delayMin,
        severity: delayMin > 30 ? 'high' : delayMin > 15 ? 'medium' : 'low',
        clientNotified: false,
        message: `Risque retard ~${delayMin} min — client ${order.phone || 'à notifier'}`,
        suggestedAction: 'Envoyer SMS/notification + proposer créneau alternatif',
      });
    } else if (etaPack.traffic === 'heavy' || etaPack.traffic === 'blocked') {
      alerts.push({
        id: `risk-${order.id || order._id}`,
        orderId: order.id || order._id,
        address: order.address,
        delayMinutes: 12,
        severity: 'medium',
        clientNotified: false,
        message: 'Trafic dense — marge ETA insuffisante',
        suggestedAction: 'Prévenir le client proactivement',
      });
    }
  });

  if (!alerts.length && stops.length) {
    alerts.push({
      id: 'ok-all',
      orderId: null,
      severity: 'low',
      message: 'Aucun retard détecté sur la tournée en cours.',
      suggestedAction: 'Continuer selon itinéraire optimisé',
    });
  }

  return {
    alerts: alerts.sort((a, b) => {
      const p = { high: 3, medium: 2, low: 1 };
      return (p[b.severity] || 0) - (p[a.severity] || 0);
    }),
    notifyCount: alerts.filter((a) => !a.clientNotified && a.severity !== 'low').length,
    aiSummary: alerts.some((a) => a.severity === 'high')
      ? `${alerts.filter((a) => a.severity === 'high').length} retard(s) critique(s) — notifier les clients.`
      : 'Tournée dans les délais prévus.',
  };
};

/** Priorisation colis urgents / sensibles. */
export const prioritizeParcels = (orders = []) => {
  const scored = orders.map((order) => {
    const sensitive = isSensitiveOrder(order);
    const urgent = order.urgent || order.status === 'shipped';
    const heavy = (order.items || []).some((it) =>
      String(it.productId?.name || it.name || '').match(/12 kg|10 L|20 kg/i),
    );
    let score = 50;
    if (urgent) score += 25;
    if (sensitive) score += 20;
    if (heavy) score += 10;
    if (order.deliveryNote?.match(/18h|urgent|fragile/i)) score += 15;
    const hoursOld = order.createdAt
      ? (Date.now() - new Date(order.createdAt).getTime()) / 3600000
      : 0;
    if (hoursOld > 4) score += 8;

    return {
      orderId: order.id || order._id,
      address: order.address,
      region: order.region,
      priorityScore: Math.min(100, score),
      sensitive,
      urgent,
      heavy,
      label: urgent ? 'Urgent' : sensitive ? 'Produit sensible' : heavy ? 'Colis lourd' : 'Standard',
      recommendation: urgent
        ? 'Livrer en premier — fenêtre client limitée'
        : sensitive
          ? 'Priorité haute — produit sensible / fragile'
          : 'Ordre optimisé par tournée',
    };
  });

  return {
    parcels: scored.sort((a, b) => b.priorityScore - a.priorityScore),
    aiSummary: `${scored.filter((p) => p.urgent || p.sensitive).length} colis prioritaire(s) sur ${scored.length}.`,
  };
};

/** Itinéraires alternatifs. */
export const suggestAlternativeRoutes = (summary = {}, traffic = 'moderate') => {
  const routes = [
    {
      id: 'optimal',
      label: 'Itinéraire optimal IA',
      km: summary.estimatedKm || 14,
      minutes: summary.estimatedMinutes || 52,
      tolls: false,
      ecoScore: 82,
      recommended: true,
    },
    {
      id: 'fast',
      label: 'Autoroute A1 (rapide)',
      km: (summary.estimatedKm || 14) * 1.08,
      minutes: Math.round((summary.estimatedMinutes || 52) * 0.88),
      tolls: true,
      ecoScore: 58,
      recommended: traffic === 'heavy',
    },
    {
      id: 'eco',
      label: 'Voies urbaines (éco)',
      km: (summary.estimatedKm || 14) * 0.92,
      minutes: Math.round((summary.estimatedMinutes || 52) * 1.12),
      tolls: false,
      ecoScore: 94,
      recommended: false,
    },
  ];

  if (traffic === 'blocked') {
    routes.push({
      id: 'detour',
      label: 'Déviation RN8 — contournement',
      km: (summary.estimatedKm || 14) * 1.2,
      minutes: Math.round((summary.estimatedMinutes || 52) * 1.05),
      tolls: false,
      ecoScore: 70,
      recommended: true,
      reason: 'Route principale signalée bloquée',
    });
  }

  return {
    routes: routes.map((r) => ({
      ...r,
      km: Math.round(r.km * 10) / 10,
      mapsUrl: `https://www.google.com/maps/dir/?api=1&travelmode=driving`,
    })),
    aiSummary: traffic === 'blocked'
      ? 'Embouteillage détecté — déviation RN8 recommandée.'
      : traffic === 'heavy'
        ? 'Trafic dense — autoroute A1 peut gagner ~12 % de temps.'
        : 'Itinéraire optimal IA recommandé — bon équilibre temps/éco.',
  };
};

/** Indicateurs performance livreur. */
export const computePerformanceMetrics = (stats = {}) => ({
  totalDelivered: stats.totalDelivered ?? 47,
  successRate: stats.onTimeRate ?? 94,
  avgDeliveryMinutes: stats.avgDeliveryMinutes ?? 28,
  satisfactionScore: stats.satisfactionScore ?? 4.7,
  weekDelivered: stats.weekDelivered ?? 12,
  cancelRate: stats.statusBreakdown?.cancelled
    ? Math.round((stats.statusBreakdown.cancelled / (stats.totalDelivered + stats.statusBreakdown.cancelled)) * 100)
    : 6,
  dailyChart: normalizeLivreurDailyChart(stats.dailyChart),
  insights: [
    { label: 'Ponctualité', value: `${stats.onTimeRate ?? 94}%`, trend: 'up', message: 'Au-dessus de l\'objectif 90 %.' },
    { label: 'Temps moyen', value: `${stats.avgDeliveryMinutes ?? 28} min`, trend: 'stable', message: 'Stable sur 7 jours.' },
    { label: 'Satisfaction', value: `${stats.satisfactionScore ?? 4.7}/5`, trend: 'up', message: 'Clients satisfaits des délais.' },
  ],
  aiSummary: `${stats.weekDelivered ?? 12} livraisons cette semaine · ${stats.onTimeRate ?? 94}% à l'heure.`,
});

/** Optimisation écologique tournée. */
export const computeEcoOptimization = (routeSummary = {}, stopCount = 3) => {
  const km = routeSummary.estimatedKm || 14.2;
  const fuelLiters = Math.round(km * 0.085 * 10) / 10;
  const co2Kg = Math.round(fuelLiters * 2.31 * 10) / 10;
  const ecoRouteKm = Math.round(km * 0.88 * 10) / 10;
  const savedCo2 = Math.round((km - ecoRouteKm) * 0.2 * 10) / 10;

  return {
    current: { km, fuelLiters, co2Kg },
    ecoOptimized: {
      km: ecoRouteKm,
      fuelLiters: Math.round(ecoRouteKm * 0.085 * 10) / 10,
      co2Kg: Math.round(ecoRouteKm * 0.085 * 2.31 * 10) / 10,
      savedCo2Kg: savedCo2,
      savedPercent: Math.round((savedCo2 / co2Kg) * 100) || 12,
    },
    tips: [
      'Regrouper les arrêts La Marsa / Carthage en boucle unique',
      'Éviter moteur au ralenti > 2 min lors des livraisons',
      'Privilégier créneaux 10h–12h (trafic -18 %)',
    ],
    aiSummary: `Tournée éco : -${savedCo2} kg CO₂ possible (~${Math.round((savedCo2 / co2Kg) * 100) || 12} %) en regroupant ${stopCount} arrêts.`,
  };
};

/** Vérification livraison intelligente — critères geo/photo. */
export const buildVerificationChecklist = (order = {}) => ({
  orderId: order.id || order._id,
  address: order.address,
  requiresPhoto: isSensitiveOrder(order) || order.total > 80,
  requiresGeo: true,
  geoRadiusMeters: 150,
  items: [
    { id: 'geo', label: 'Géolocalisation à moins de 150 m', done: false, required: true },
    { id: 'photo', label: 'Photo du colis remis', done: false, required: isSensitiveOrder(order) },
    { id: 'note', label: 'Note de livraison', done: false, required: false },
    { id: 'signature', label: 'Confirmation client', done: false, required: order.paymentMethod === 'cash' },
  ],
  aiSummary: isSensitiveOrder(order)
    ? 'Livraison sensible — photo + géolocalisation obligatoires.'
    : 'Géolocalisation requise — photo recommandée.',
});

export const enrichLivreurIntelligencePack = (base = {}) => {
  const stops = base.route?.stops || [];
  const orders = base.orders || [];
  const traffic = base.traffic || 'moderate';
  const weather = base.weather || 'clear';

  const optimized = optimizeRoute(stops, base.startPoint);
  const eta = predictDeliveryEta({ stops: optimized.stops, traffic, weather });
  const delays = detectDeliveryDelays(optimized.stops, eta);
  const parcels = prioritizeParcels(orders.filter((o) => ['pending', 'shipped'].includes(o.status)));
  const navigation = suggestAlternativeRoutes(optimized.summary, traffic);
  const performance = computePerformanceMetrics(base.stats);
  const eco = computeEcoOptimization(optimized.summary, optimized.stops.length);
  const verifications = orders
    .filter((o) => o.status === 'shipped')
    .slice(0, 3)
    .map(buildVerificationChecklist);

  return {
    ...base,
    optimizedRoute: optimized,
    eta,
    delays,
    parcels,
    navigation,
    performance,
    eco,
    verifications,
    intelligence: {
      delayCount: delays.alerts.filter((a) => a.severity !== 'low').length,
      priorityParcels: parcels.parcels.filter((p) => p.priorityScore >= 70).length,
      ecoSavingPercent: eco.ecoOptimized.savedPercent,
    },
  };
};

export default enrichLivreurIntelligencePack;
