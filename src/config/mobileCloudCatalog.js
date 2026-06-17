/**
 * Catalogue Mobile Flutter & Cloud Computing PetfoodTN.
 */

export const MOBILE_CLOUD_DOMAINS = [
  {
    id: 'mobile',
    label: 'Application Mobile',
    icon: '📱',
    color: '#059669',
    features: [
      {
        id: 'flutter-app',
        label: 'Application Flutter Android / iOS',
        description: 'App native Material 3 — BI, IoT PetFoodIoT, boutique et sécurité.',
        route: '/mobile',
        status: 'implemented',
      },
      {
        id: 'push-notif',
        label: 'Notifications push',
        description: 'Alertes IoT, livraison et qualité alimentaire sur l\'appareil.',
        route: '/mobile',
        status: 'implemented',
        anchor: 'push',
      },
      {
        id: 'qr-scan',
        label: 'Scan QR Code produits',
        description: 'Authentification lot blockchain PF-TN-XXXX depuis l\'emballage.',
        route: '/mobile',
        status: 'implemented',
        anchor: 'qr',
      },
      {
        id: 'delivery-track',
        label: 'Suivi livraisons temps réel',
        description: 'Statut commande, ETA livreur et chaîne du froid.',
        route: '/mobile',
        status: 'implemented',
        anchor: 'delivery',
      },
      {
        id: 'iot-mobile',
        label: 'Consultation données IoT',
        description: 'ESP32-CAM qualité alimentaire, distributeur et capteurs.',
        route: '/mobile',
        status: 'implemented',
        anchor: 'iot',
      },
      {
        id: 'pet-profile',
        label: 'Gestion profil animal',
        description: 'CRUD animaux, espèce, race, poids — synchronisé avec le web.',
        route: '/mobile',
        status: 'implemented',
        anchor: 'pets',
      },
    ],
  },
  {
    id: 'cloud',
    label: 'Cloud Computing',
    icon: '☁️',
    color: '#1e40af',
    features: [
      {
        id: 'cloud-deploy',
        label: 'Déploiement AWS, Azure ou Google Cloud',
        description: 'Docker portable — compatible ECS, AKS, GKE et Render.',
        route: '/cloud',
        status: 'partial',
      },
      {
        id: 'postgres',
        label: 'Base de données cloud PostgreSQL',
        description: 'PostgreSQL 16 — Render managed DB, Docker Compose, VPS.',
        route: '/cloud',
        status: 'implemented',
        anchor: 'postgres',
      },
      {
        id: 'auto-backup',
        label: 'Sauvegarde automatique des données',
        description: 'pg_dump planifié, snapshots volume et panel admin.',
        route: '/admin/backups',
        status: 'partial',
      },
      {
        id: 'cam-storage',
        label: 'Stockage images ESP32-CAM cloud',
        description: 'Télémétrie API + bucket S3/GCS/Azure Blob (architecture prête).',
        route: '/cloud',
        status: 'partial',
        anchor: 'storage',
      },
      {
        id: 'autoscale',
        label: 'Scalabilité automatique',
        description: 'Conteneurs stateless, health checks, scaling horizontal K8s/Render.',
        route: '/cloud',
        status: 'partial',
        anchor: 'scale',
      },
    ],
  },
];

export const countMobileCloudFeatures = () => {
  const all = MOBILE_CLOUD_DOMAINS.flatMap((d) => d.features);
  return {
    total: all.length,
    implemented: all.filter((f) => f.status === 'implemented').length,
    partial: all.filter((f) => f.status === 'partial').length,
  };
};

export default MOBILE_CLOUD_DOMAINS;
