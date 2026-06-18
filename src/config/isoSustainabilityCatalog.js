/**
 * Référentiel ISO & développement durable — aligné cahier des charges PetfoodTN.
 */

export const ISO_CORE_FEATURES = [
  {
    id: 'iso-27001',
    code: 'ISO/IEC 27001',
    label: 'Sécurité de l\'information',
    description: 'Gestion des risques, contrôle d\'accès, chiffrement, journalisation et continuité.',
    route: '/admin/intelligent-security',
    controls: ['Politique sécurité', 'JWT + 2FA', 'Chiffrement BCrypt', 'IDS SQL/XSS', 'Logs audit'],
    status: 'conforme',
  },
  {
    id: 'iso-9001',
    code: 'ISO 9001',
    label: 'Gestion de la qualité',
    description: 'Processus qualité, amélioration continue, satisfaction client et traçabilité lots.',
    route: '/qualite-iso',
    controls: ['SAV & réclamations', 'Contrôle fournisseurs', 'Audits qualité', 'KPI satisfaction', 'Amélioration continue'],
    status: 'conforme',
  },
  {
    id: 'traceability',
    code: 'Traçabilité',
    label: 'Traçabilité complète des opérations',
    description: 'Blockchain SHA-256, Merkle, ancrage IoT — chaque lot vérifiable.',
    route: '/client-traceability',
    controls: ['5 blocs supply chain', 'Vérification lot QR', 'Certifications lot', 'Ancrage ESP32-CAM'],
    status: 'actif',
  },
  {
    id: 'rbac',
    code: 'RBAC',
    label: 'Gestion des accès basée sur les rôles',
    description: 'Admin, client, vétérinaire, livreur, vendeur, modérateur.',
    route: '/capabilities',
    controls: ['Routes protégées', 'JWT rôles', 'Capacités par acteur', 'Sessions actives'],
    status: 'actif',
  },
];

export const SUSTAINABILITY_FEATURES = [
  {
    id: 'waste-ia',
    icon: '🤖',
    label: 'Réduction gaspillage alimentaire (IA)',
    description: 'Prédiction demande, redistribution lots proches péremption, don associations.',
    route: '/food-quality-surveillance',
    metric: '1 240 kg évités',
    status: 'actif',
  },
  {
    id: 'expiry',
    icon: '📅',
    label: 'Surveillance dates de péremption',
    description: 'ESP32-CAM PetFoodIoT, alertes client et vétérinaire en temps réel.',
    route: '/food-quality-surveillance',
    metric: '89 alertes traitées',
    status: 'actif',
  },
  {
    id: 'delivery-co2',
    icon: '🛣️',
    label: 'Optimisation trajets livraison (CO₂)',
    description: 'Routes éco IA, regroupement colis, réduction kilomètres à vide.',
    route: '/livreur/intelligence',
    metric: '−30 % objectif 2027',
    status: 'actif',
  },
  {
    id: 'eco-pack',
    icon: '📦',
    label: 'Emballages écologiques',
    description: 'Matériaux recyclables, réduction plastique, certification FSC.',
    route: '/compliance',
    metric: '78 % recyclables',
    status: 'actif',
    anchor: 'packaging',
  },
  {
    id: 'carbon-stats',
    icon: '🌍',
    label: 'Empreinte carbone livraisons',
    description: 'Statistiques CO₂ par tournée, compensation et tableau de bord vert.',
    route: '/compliance',
    metric: '0,82 kg CO₂ / livraison',
    status: 'actif',
    anchor: 'carbon',
  },
];

export const CARBON_DELIVERY_STATS = {
  period: '30 derniers jours',
  totalDeliveries: 2847,
  totalCo2Kg: 2334,
  savedCo2Kg: 420,
  avgPerDelivery: 0.82,
  ecoRoutesPct: 67,
  byZone: [
    { zone: 'Grand Tunis', deliveries: 1120, co2Kg: 890, saved: 180 },
    { zone: 'Sahel', deliveries: 680, co2Kg: 520, saved: 95 },
    { zone: 'Centre', deliveries: 540, co2Kg: 445, saved: 78 },
    { zone: 'Sud', deliveries: 507, co2Kg: 479, saved: 67 },
  ],
};

export default { ISO_CORE_FEATURES, SUSTAINABILITY_FEATURES, CARBON_DELIVERY_STATS };
