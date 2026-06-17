/**
 * IoT avancé & Smart Pet Digital Twin — fonctionnalités premium PFE.
 */

export const ADVANCED_IOT_FEATURES = [
  {
    id: 'esp32-cam',
    icon: '📷',
    label: 'ESP32-CAM qualité alimentaire',
    description: 'IA vision — moisissures, couleur, insectes, score qualité temps réel.',
    route: '/client-iot?tab=food-quality',
    metric: 'Score 72–94/100',
    status: 'actif',
  },
  {
    id: 'temp-humidity',
    icon: '🌡️',
    label: 'Capteurs température & humidité',
    description: 'DHT22 / chaîne du froid — bac, entrepôt, véhicule livraison.',
    route: '/client-iot?tab=advanced',
    metric: '24°C · 58 % HR',
    status: 'actif',
    anchor: 'sensors',
  },
  {
    id: 'smart-scale',
    icon: '⚖️',
    label: 'Balance connectée consommation',
    description: 'Mesure grammes/jour, adhérence ration, sync jumeau numérique.',
    route: '/client-iot?tab=advanced',
    metric: '65 g/jour Max',
    status: 'actif',
    anchor: 'scale',
  },
  {
    id: 'smart-fridge',
    icon: '🧊',
    label: 'Réfrigérateur intelligent',
    description: 'Conservation aliments frais/pâtées — alertes porte ouverte, péremption.',
    route: '/client-iot?tab=advanced',
    metric: '4°C · Lot OK',
    status: 'actif',
    anchor: 'fridge',
  },
  {
    id: 'mobile-alerts',
    icon: '📱',
    label: 'Alertes temps réel smartphone',
    description: 'Push IoT qualité, stock bas, hydratation — app Flutter + web.',
    route: '/mobile',
    metric: '5 alertes actives',
    status: 'actif',
    anchor: 'push',
  },
];

export const DIGITAL_TWIN_PREMIUM_FEATURES = [
  {
    id: 'food-history',
    icon: '📋',
    label: 'Historique alimentaire',
    description: 'Repas, portions, kcal et adhérence régime sur 90 jours.',
    route: '/client-digital-twin?tab=nutrition',
    status: 'actif',
  },
  {
    id: 'weight-evolution',
    icon: '📈',
    label: 'Évolution du poids',
    description: 'Courbe de poids, tendance IA, alertes prise/perte anormale.',
    route: '/client-digital-twin?tab=nutrition',
    status: 'actif',
  },
  {
    id: 'physical-activity',
    icon: '🏃',
    label: 'Activité physique',
    description: 'Pas, sessions jeu, sommeil estimé — score activité jumeau.',
    route: '/client-digital-twin?tab=activity',
    status: 'actif',
  },
  {
    id: 'ai-recommendations',
    icon: '🤖',
    label: 'Recommandations IA personnalisées',
    description: 'Nutrition, produits, ajustement ration — explainable AI.',
    route: '/client-digital-twin?tab=ai',
    status: 'actif',
  },
  {
    id: 'health-alerts',
    icon: '🔔',
    label: 'Alertes santé préventives',
    description: 'Détection précoce risques — poids, alimentation, vaccins.',
    route: '/client-digital-twin?tab=medical',
    status: 'actif',
  },
  {
    id: 'vet-dashboard',
    icon: '🩺',
    label: 'Tableau de bord vétérinaire intelligent',
    description: 'Vue agrégée jumeaux patients — alertes IoT + dossiers cliniques.',
    route: '/vet/dashboard',
    status: 'actif',
    anchor: 'digital-twins',
  },
];

export const DEMO_ADVANCED_IOT_DEVICES = {
  sensors: { temperature: 22.4, humidity: 48, location: 'Bac croquettes Max', status: 'ok' },
  scale: { petName: 'Max', todayGrams: 65, targetGrams: 70, adherence: 93, lastWeigh: new Date().toISOString() },
  fridge: { temperature: 4.2, doorClosed: true, batchCode: 'PF-TN-2026-A042', expiryDays: 45, humidity: 42 },
  mobilePush: { enabled: true, unread: 3, lastAlert: 'Qualité croquettes — score 87%' },
};

export const DEMO_VET_TWIN_PATIENTS = [
  { petId: 'max', name: 'Max', species: 'chien', wellness: 84, alert: 'Poids +0.3 kg/sem', iotScore: 87, lastVisit: '2026-03-10' },
  { petId: 'luna', name: 'Luna', species: 'chat', wellness: 78, alert: 'Hydratation 66 %', iotScore: 72, lastVisit: '2026-02-28' },
  { petId: 'rocky', name: 'Rocky', species: 'chien', wellness: 91, alert: null, iotScore: 94, lastVisit: '2026-03-05' },
];

export default { ADVANCED_IOT_FEATURES, DIGITAL_TWIN_PREMIUM_FEATURES };
