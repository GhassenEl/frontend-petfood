/**
 * Catalogue des 10 piliers Intelligence PetfoodTN (PFE / BI / ML / IA).
 */

export const INTELLIGENCE_PILLARS = [
  {
    id: 'sales-analysis',
    icon: '📊',
    title: 'Analyse des ventes',
    color: '#e67e22',
    algorithms: ['Agrégation temporelle', 'RFM', 'XGBoost CA'],
    goals: [
      'Produits les plus vendus',
      'Périodes de forte demande',
      'Habitudes d\'achat clients',
      'Prévision du chiffre d\'affaires',
    ],
    example: {
      label: 'Insight',
      text: 'Les croquettes pour chats représentent 35 % des ventes mensuelles.',
    },
    routes: [
      { label: 'Ventes admin', path: '/admin/sales', roles: ['admin'] },
      { label: 'BI décisionnel', path: '/admin/business-intelligence', roles: ['admin'] },
      { label: 'Agent ML', path: '/admin/ml-agent', roles: ['admin'] },
    ],
    metricKeys: ['topProductShare', 'peakMonth', 'forecastRevenue'],
  },
  {
    id: 'stock-forecast',
    icon: '📦',
    title: 'Prévision des stocks (ML)',
    color: '#2980b9',
    algorithms: ['Random Forest', 'XGBoost', 'Régression linéaire'],
    goals: [
      'Prévision des ruptures de stock',
      'Réapprovisionnement intelligent',
      'Réduction des pertes',
    ],
    example: {
      label: 'Alerte',
      text: 'Croquettes Premium Chien — rupture prévue dans 6 jours (XGBoost).',
    },
    routes: [
      { label: 'Stock BI', path: '/admin/stock-bi', roles: ['admin'] },
      { label: 'Gestion stock', path: '/admin/stock', roles: ['admin'] },
    ],
    metricKeys: ['stockoutRisk', 'modelsCompared'],
  },
  {
    id: 'recommendations',
    icon: '🎯',
    title: 'Système de recommandation',
    color: '#8e44ad',
    algorithms: ['Collaborative Filtering', 'Content-Based Filtering', 'XGBoost ranking'],
    goals: [
      'Aliments adaptés à l\'âge',
      'Produits selon la race',
      'Produits similaires aux achats précédents',
    ],
    example: {
      label: 'Recommandation',
      text: 'Formule senior chien 7+ — score 0.92 (content + historique achats).',
    },
    routes: [
      { label: 'Produits client', path: '/client-products', roles: ['client'] },
      { label: 'Nutrition adaptative', path: '/pet-adaptive-nutrition', roles: ['client'] },
    ],
    metricKeys: ['recommendationCount', 'topScore'],
  },
  {
    id: 'sentiment',
    icon: '💬',
    title: 'Analyse des sentiments',
    color: '#27ae60',
    algorithms: ['BERT', 'Sentence-BERT', 'TF-IDF + SVM'],
    goals: [
      'Analyse automatique des avis clients',
      'Score de confiance sentiment',
      'Détection émotions (positif / négatif)',
    ],
    example: {
      label: 'Avis',
      text: '"Excellent produit, mon chien adore." → Sentiment : Positif — Score : 95 %',
    },
    routes: [
      { label: 'Avis admin', path: '/admin/reviews', roles: ['admin'] },
      { label: 'Hub modération', path: '/moderator/intelligence', roles: ['moderator'] },
      { label: 'NLP modèles', path: '/admin/nlp-models', roles: ['admin'] },
    ],
    metricKeys: ['positivePct', 'avgConfidence'],
  },
  {
    id: 'iot-analysis',
    icon: '📡',
    title: 'Analyse des données IoT',
    color: '#16a085',
    algorithms: ['Z-score anomalies', 'Régression consommation', 'Seuils qualité'],
    goals: [
      'Température & humidité',
      'Consommation alimentaire',
      'Détection d\'anomalies',
      'Prévision de consommation',
      'Aliments détériorés',
    ],
    example: {
      label: 'Capteur',
      text: 'Humidité 78 % — risque détérioration détecté sur distributeur #3.',
    },
    routes: [
      { label: 'Centre IoT', path: '/client-iot', roles: ['client'] },
      { label: 'Anomalies IoT', path: '/admin/iot-anomalies', roles: ['admin'] },
      { label: 'Grafana', path: '/admin/performance', roles: ['admin'] },
    ],
    metricKeys: ['activeSensors', 'anomalyCount'],
  },
  {
    id: 'computer-vision',
    icon: '📷',
    title: 'Vision par ordinateur (ESP32-CAM)',
    color: '#c0392b',
    algorithms: ['CNN', 'YOLO', 'MobileNet'],
    goals: [
      'Détection de moisissures',
      'Détection d\'insectes',
      'Évaluation qualité alimentaire',
    ],
    example: {
      label: 'ESP32-CAM',
      text: 'Qualité alimentaire : 87/100 — aucune moisissure détectée.',
    },
    routes: [
      { label: 'ESP32-CAM qualité', path: '/client-iot?tab=food-quality', roles: ['client'] },
      { label: 'Surveillance admin', path: '/admin/food-quality-cam', roles: ['admin'] },
    ],
    metricKeys: ['camerasOnline', 'qualityScore'],
  },
  {
    id: 'bi-dashboard',
    icon: '📈',
    title: 'Tableau de bord BI',
    color: '#2c3e50',
    algorithms: ['Power BI', 'Tableau', 'Grafana'],
    goals: [
      'Ventes & stocks',
      'Livraisons',
      'Données IoT',
      'Satisfaction client',
    ],
    example: {
      label: 'KPI',
      text: 'CA mensuel +12 % — satisfaction client 4.6/5 — 12 capteurs actifs.',
    },
    routes: [
      { label: 'Power BI', path: '/admin/powerbi', roles: ['admin'] },
      { label: 'Hub BI', path: '/admin/business-intelligence', roles: ['admin'] },
      { label: 'Grafana (monitoring)', path: '/admin/performance', roles: ['admin'] },
    ],
    metricKeys: ['revenueGrowth', 'satisfaction', 'deliveriesOnTime'],
  },
  {
    id: 'nutrition-profile',
    icon: '🥗',
    title: 'Profil nutritionnel intelligent',
    color: '#d35400',
    algorithms: ['RER/MER', 'Profil adaptatif', 'Règles vétérinaires'],
    goals: [
      'Besoins nutritionnels par animal',
      'Historique alimentaire',
      'Recommandations personnalisées (âge, race, poids, activité)',
    ],
    example: {
      label: 'Profil',
      text: 'Max (Berger Allemand, 4 ans, 32 kg) — 1 840 kcal/j, activité élevée.',
    },
    routes: [
      { label: 'Calories par animal', path: '/pet-calories', roles: ['client'] },
      { label: 'Nutrition adaptative', path: '/pet-adaptive-nutrition', roles: ['client'] },
      { label: 'Agent nutrition IA', path: '/smart-food-agent', roles: ['client'] },
    ],
    metricKeys: ['petsProfiled', 'avgKcal'],
  },
  {
    id: 'fraud-detection',
    icon: '🛡️',
    title: 'Détection de fraude',
    color: '#922b21',
    algorithms: ['Isolation Forest', 'Local Outlier Factor (LOF)', 'Règles métier'],
    goals: [
      'Commandes anormales',
      'Avis suspects',
      'Transactions suspectes',
    ],
    example: {
      label: 'Alerte',
      text: 'Commande #4821 — montant atypique (LOF score -2.4).',
    },
    routes: [
      { label: 'Centre fraude', path: '/moderator/fraud', roles: ['moderator'] },
      { label: 'Sécurité intelligente', path: '/admin/intelligent-security', roles: ['admin'] },
    ],
    metricKeys: ['fraudAlerts', 'suspiciousReviews'],
  },
  {
    id: 'digital-twin',
    icon: '🧬',
    title: 'Jumeau numérique (Digital Twin)',
    color: '#6c3483',
    algorithms: ['Simulation nutrition', 'Prédiction risques', 'IA préventive'],
    goals: [
      'Profil numérique animal (santé, alimentation, activité)',
      'Historique vétérinaire',
      'Prédiction risques & actions préventives',
    ],
    example: {
      label: 'Twin IA',
      text: 'Risque surpoids modéré — réduire ration de 8 % sur 14 jours.',
    },
    routes: [
      { label: 'Jumeau numérique', path: '/client-digital-twin', roles: ['client'] },
      { label: 'Dossier médical', path: '/medical-dossier', roles: ['client'] },
    ],
    metricKeys: ['twinsActive', 'preventiveActions'],
  },
];

export const countIntelligencePillars = () => ({
  total: INTELLIGENCE_PILLARS.length,
  algorithms: [...new Set(INTELLIGENCE_PILLARS.flatMap((p) => p.algorithms))].length,
});
