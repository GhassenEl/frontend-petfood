import api from '../utils/api';
import { fetchAdminMlInsights } from './mlService';
import { INTELLIGENCE_PILLARS } from '../config/intelligencePillarsCatalog';

const DEMO_METRICS = {
  'sales-analysis': {
    topProductShare: 35,
    topProductName: 'Croquettes Premium Chat',
    peakMonth: 'Décembre',
    forecastRevenue: 42800,
    insight: 'Les croquettes pour chats représentent 35 % des ventes mensuelles.',
  },
  'stock-forecast': {
    stockoutRisk: 3,
    modelsCompared: ['xgboost', 'random_forest', 'linear_regression'],
    insight: 'Croquettes Premium Chien — rupture prévue dans 6 jours (XGBoost).',
  },
  recommendations: {
    recommendationCount: 12,
    topScore: 0.92,
    insight: 'Formule senior chien 7+ — score 0.92 (content + historique achats).',
  },
  sentiment: {
    positivePct: 78,
    avgConfidence: 0.95,
    sampleReview: 'Excellent produit, mon chien adore.',
    insight: 'Sentiment : Positif — Score : 95 %',
  },
  'iot-analysis': {
    activeSensors: 12,
    anomalyCount: 2,
    insight: 'Humidité 78 % — risque détérioration sur distributeur #3.',
  },
  'computer-vision': {
    camerasOnline: 3,
    qualityScore: 87,
    insight: 'Qualité alimentaire : 87/100 — aucune moisissure détectée.',
  },
  'bi-dashboard': {
    revenueGrowth: 12,
    satisfaction: 4.6,
    deliveriesOnTime: 94,
    insight: 'CA mensuel +12 % — satisfaction 4.6/5 — 12 capteurs actifs.',
  },
  'nutrition-profile': {
    petsProfiled: 8,
    avgKcal: 1840,
    insight: 'Max (Berger Allemand, 4 ans, 32 kg) — 1 840 kcal/j, activité élevée.',
  },
  'fraud-detection': {
    fraudAlerts: 4,
    suspiciousReviews: 2,
    insight: 'Commande #4821 — montant atypique (LOF score -2.4).',
  },
  'digital-twin': {
    twinsActive: 6,
    preventiveActions: 3,
    insight: 'Risque surpoids modéré — réduire ration de 8 % sur 14 jours.',
  },
};

const mapMlToMetrics = (ml) => {
  if (!ml) return {};
  const demand = ml.productDemand?.[0];
  const revenue = ml.nextMonthRevenue?.forecastRevenue;
  const anomalies = ml.anomalyDetection?.fraudAlerts?.length ?? 0;
  const lofCount = ml.anomalyDetection?.lofAlerts?.length ?? 0;
  const sales = ml.salesAnalysis;

  return {
    'sales-analysis': {
      topProductShare: sales?.topProductSharePct ?? (demand ? 28 : 35),
      topProductName: sales?.topProductName ?? demand?.productName ?? 'Croquettes Premium Chat',
      peakMonth: sales?.peakDemandMonth ?? 'Décembre',
      forecastRevenue: revenue ?? 42800,
      insight: sales?.insight ?? `Les croquettes pour chats représentent ${sales?.topProductSharePct ?? 35} % des ventes mensuelles.`,
    },
    'stock-forecast': {
      stockoutRisk: ml.stockForecasts?.filter((s) => s.risk === 'high')?.length ?? 3,
      modelsCompared: ml.stockForecasts?.[0]?.models?.map((m) => m.model) ?? ['xgboost', 'random_forest', 'linear_regression'],
      insight: demand
        ? `${demand.productName} — tendance ${demand.trend} (modèle ${demand.model})`
        : DEMO_METRICS['stock-forecast'].insight,
    },
    recommendations: {
      recommendationCount: ml.seniorDogRanking?.length ?? 12,
      topScore: ml.seniorDogRanking?.[0]?.score ?? 0.92,
      insight: ml.seniorDogRanking?.[0]
        ? `${ml.seniorDogRanking[0].productName} — score ${ml.seniorDogRanking[0].score}`
        : DEMO_METRICS.recommendations.insight,
    },
    sentiment: {
      positivePct: ml.sentimentAnalysis?.positivePct ?? 78,
      avgConfidence: ml.sentimentAnalysis?.avgConfidence ?? 0.95,
      insight: ml.sentimentAnalysis?.example ?? DEMO_METRICS.sentiment.insight,
    },
    'iot-analysis': {
      activeSensors: ml.iotAnalysis?.activeSensors ?? 12,
      anomalyCount: ml.iotAnalysis?.anomalyCount ?? 2,
      insight: ml.iotAnalysis?.insight ?? DEMO_METRICS['iot-analysis'].insight,
    },
    'computer-vision': {
      camerasOnline: ml.visionAnalysis?.camerasOnline ?? 3,
      qualityScore: ml.visionAnalysis?.qualityScore ?? 87,
      insight: ml.visionAnalysis?.insight ?? DEMO_METRICS['computer-vision'].insight,
    },
    'bi-dashboard': {
      revenueGrowth: sales?.revenueGrowthPct ?? 12,
      satisfaction: 4.6,
      deliveriesOnTime: 94,
      insight: DEMO_METRICS['bi-dashboard'].insight,
    },
    'nutrition-profile': {
      petsProfiled: ml.nutritionProfiles?.length ?? 6,
      avgKcal: ml.nutritionProfiles?.[0]?.dailyKcal ?? 1840,
      insight: ml.nutritionProfiles?.[0]?.insight ?? DEMO_METRICS['nutrition-profile'].insight,
    },
    'fraud-detection': {
      fraudAlerts: anomalies + lofCount,
      suspiciousReviews: 2,
      insight: ml.anomalyDetection?.fraudAlerts?.[0]
        ? `Commande ${ml.anomalyDetection.fraudAlerts[0].orderId} — ${ml.anomalyDetection.fraudAlerts[0].reason}`
        : DEMO_METRICS['fraud-detection'].insight,
    },
    'digital-twin': {
      twinsActive: ml.digitalTwinRisks?.length ?? 6,
      preventiveActions: ml.digitalTwinRisks?.filter((r) => r.action)?.length ?? 3,
      insight: ml.digitalTwinRisks?.[0]?.recommendation ?? DEMO_METRICS['digital-twin'].insight,
    },
  };
};

export const loadIntelligencePlatformPack = async () => {
  let ml = null;
  let pythonPowered = false;

  try {
    ml = await fetchAdminMlInsights();
    pythonPowered = Boolean(ml?.pythonPowered);
  } catch {
    try {
      const { data } = await api.get('/ml/intelligence/pack');
      ml = data;
      pythonPowered = Boolean(data?.pythonPowered);
    } catch {
      /* demo */
    }
  }

  const metricsByPillar = { ...DEMO_METRICS, ...mapMlToMetrics(ml) };

  const pillars = INTELLIGENCE_PILLARS.map((pillar) => ({
    ...pillar,
    metrics: metricsByPillar[pillar.id] || DEMO_METRICS[pillar.id],
    live: pythonPowered,
  }));

  return {
    pillars,
    pythonPowered,
    mlRaw: ml,
    generatedAt: ml?.generatedAt || new Date().toISOString(),
    summary: {
      pillars: pillars.length,
      algorithms: countAlgorithms(),
      liveModels: ml?.modelsUsed?.length ?? 0,
    },
  };
};

const countAlgorithms = () => {
  const set = new Set();
  INTELLIGENCE_PILLARS.forEach((p) => p.algorithms.forEach((a) => set.add(a)));
  return set.size;
};

export default loadIntelligencePlatformPack;
