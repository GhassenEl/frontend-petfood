/**
 * Catalogue Big Data PetfoodTN — Spark, Hadoop, Kafka.
 */

export const BIG_DATA_PIPELINES = [
  {
    id: 'kafka',
    tech: 'Apache Kafka',
    icon: '⚡',
    color: '#e11d48',
    role: 'Ingestion temps réel',
    description: 'Flux commandes, télémétrie IoT et événements comportement clients.',
    topics: [
      { name: 'petfood.orders', partitions: 12, rate: '2.4k msg/min', consumers: ['spark-orders', 'analytics-bi'] },
      { name: 'petfood.iot.telemetry', partitions: 8, rate: '18k msg/min', consumers: ['spark-iot', 'anomaly-detector'] },
      { name: 'petfood.esp32cam.metadata', partitions: 6, rate: '480 msg/min', consumers: ['hadoop-ingest', 'quality-ml'] },
      { name: 'petfood.client.behavior', partitions: 10, rate: '5.1k msg/min', consumers: ['spark-behavior', 'recommendation-engine'] },
    ],
  },
  {
    id: 'spark',
    tech: 'Apache Spark',
    icon: '🔥',
    color: '#f59e0b',
    role: 'Analyse temps réel',
    description: 'Structured Streaming — comportements clients, agrégations commandes et alertes IoT.',
    jobs: [
      { name: 'ClientBehaviorStream', mode: 'streaming', latency: '< 3 s', status: 'running' },
      { name: 'OrderAggregationHourly', mode: 'micro-batch', latency: '5 min', status: 'running' },
      { name: 'IoTAnomalyScoring', mode: 'streaming', latency: '< 8 s', status: 'running' },
      { name: 'PersonalizedPromoEngine', mode: 'batch', latency: '1 h', status: 'scheduled' },
    ],
  },
  {
    id: 'hadoop',
    tech: 'Apache Hadoop',
    icon: '🗄️',
    color: '#0369a1',
    role: 'Stockage massif & batch',
    description: 'HDFS — archives commandes, images ESP32-CAM et logs IoT historiques.',
    storage: [
      { path: '/data/orders/parquet', size: '48 GB', files: '1.2M', format: 'Parquet' },
      { path: '/data/iot/telemetry', size: '126 GB', files: '8.4M', format: 'ORC' },
      { path: '/data/esp32cam/images', size: '2.1 TB', files: '4.8M', format: 'JPEG + metadata JSON' },
      { path: '/data/client/behavior', size: '32 GB', files: '920k', format: 'Avro' },
    ],
  },
];

export const BIG_DATA_USE_CASES = [
  {
    id: 'orders',
    title: 'Milliers de commandes',
    desc: 'Ingestion Kafka → Spark agrégation → entrepôt BI admin.',
    metric: '12 450 cmd/jour',
    tech: ['Kafka', 'Spark'],
  },
  {
    id: 'iot',
    title: 'Données IoT massives',
    desc: 'MQTT Mosquitto → Kafka → Spark streaming anomalies capteurs.',
    metric: '847k événements/jour',
    tech: ['Kafka', 'Spark'],
  },
  {
    id: 'behavior',
    title: 'Comportements clients temps réel',
    desc: 'Clics, paniers, navigation — analyse Spark Structured Streaming.',
    metric: '3.2M événements/jour',
    tech: ['Kafka', 'Spark'],
  },
  {
    id: 'cam-images',
    title: 'Images ESP32-CAM',
    desc: 'Stockage HDFS Hadoop + métadonnées qualité alimentaire.',
    metric: '2.1 To images',
    tech: ['Hadoop', 'Kafka'],
  },
];

export default { BIG_DATA_PIPELINES, BIG_DATA_USE_CASES };
