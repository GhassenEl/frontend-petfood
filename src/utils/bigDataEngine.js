/**
 * Moteur Big Data — métriques pipeline démo (Spark, Hadoop, Kafka).
 */

import { BIG_DATA_PIPELINES } from '../config/bigDataCatalog';

const jitter = (base, pct = 0.05) => Math.round(base * (1 + (Math.random() - 0.5) * pct * 2));

export const buildBigDataMetrics = () => {
  const now = new Date().toISOString();
  return {
    mode: 'demo',
    updatedAt: now,
    summary: {
      ordersPerDay: jitter(12450),
      iotEventsPerDay: jitter(847000),
      behaviorEventsPerDay: jitter(3200000),
      esp32CamImagesGb: jitter(2140, 0.02),
      esp32CamImageCount: jitter(4800000, 0.01),
      kafkaThroughputMsgMin: jitter(26000),
      sparkJobsRunning: 3,
      hdfsUsedTb: 2.34,
    },
    pipelines: BIG_DATA_PIPELINES,
    behaviorInsights: [
      { segment: 'Clients actifs 7j', value: '2 840', trend: '+12 %', action: 'Promo personnalisée' },
      { segment: 'Panier moyen', value: '78.4 TND', trend: '+4 %', action: 'Cross-sell IA' },
      { segment: 'Taux réachat 30j', value: '34 %', trend: '+2 %', action: 'Fidélité gamification' },
      { segment: 'Sessions IoT connectées', value: '1 126', trend: '+18 %', action: 'Alertes qualité CAM' },
    ],
    recentBatches: [
      { id: 'batch-orders-20260316', job: 'Hadoop — export commandes', status: 'completed', records: 12450, duration: '4m 12s' },
      { id: 'batch-cam-20260316', job: 'Hadoop — ingest ESP32-CAM', status: 'running', records: 4820, duration: '—' },
      { id: 'spark-behavior-20260316', job: 'Spark — agrégation comportements', status: 'completed', records: 3200000, duration: '2m 48s' },
    ],
    kafkaLag: [
      { group: 'spark-orders', topic: 'petfood.orders', lag: jitter(120) },
      { group: 'spark-iot', topic: 'petfood.iot.telemetry', lag: jitter(890) },
      { group: 'hadoop-ingest', topic: 'petfood.esp32cam.metadata', lag: jitter(45) },
      { group: 'spark-behavior', topic: 'petfood.client.behavior', lag: jitter(2100) },
    ],
  };
};

export default buildBigDataMetrics;
