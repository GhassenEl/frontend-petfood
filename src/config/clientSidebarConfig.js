/** Navigation sidebar — espace client (config dynamique). */

export const CLIENT_SIDEBAR_SECTIONS = [
  {
    title: '🏠 Accueil',
    items: [
      { id: 'client-dashboard', label: 'Tableau de bord', icon: '🏠' },
    ],
  },
  {
    title: '🛒 Boutique',
    items: [
      { id: 'client-products', label: 'Produits', icon: '🏷️' },
      { id: 'client-favorites', label: 'Mes favoris', icon: '❤️' },
      { id: 'client-orders', label: 'Mes commandes', icon: '📦' },
      { id: 'client-invoices', label: 'Mes factures', icon: '🧾' },
      { id: 'client-loyalty', label: 'Fidélité', icon: '🎁' },
      { id: 'client-community', label: 'Communauté', icon: '👥' },
    ],
  },
  {
    title: '📡 IoT & connecté',
    items: [
      { id: 'client-iot', label: 'Centre IoT', icon: '📡' },
      { id: 'pet-feeder', label: 'Distributeur ESP32', icon: '🍽️' },
      { id: 'client-esp32cam-food-quality', label: 'ESP32-CAM & afficheur', icon: '📷', route: '/client-iot?tab=detection' },
      { id: 'client-smart-water', label: 'Consommation eau', icon: '💧' },
      { id: 'client-traceability', label: 'Traçabilité', icon: '🔗' },
      { id: 'mobile-app', label: 'Application mobile', icon: '📱', route: '/mobile#iot' },
    ],
  },
  {
    title: '⭐ Avis & Réclamations',
    items: [
      { id: 'client-reviews', label: 'Mes avis', icon: '⭐' },
      { id: 'client-complaints', label: 'Réclamations', icon: '⚠️' },
    ],
  },
  {
    title: '🐾 Services PetfoodTN',
    items: [
      { id: 'client-rse', label: 'RSE & Écologie', icon: '🌱' },
      { id: 'client-events', label: 'Compétitions & cadeaux', icon: '🏆' },
      { id: 'pet-advice', label: 'Conseils pour pets', icon: '💡' },
      { id: 'found-me', label: 'Find Me', icon: '🔍' },
      { id: 'veterinary', label: 'Santé & Vétérinaire', icon: '🩺' },
      { id: 'client-vet-intelligence', label: 'IA vétérinaire', icon: '💬' },
      { id: 'medical-dossier', label: 'Dossier médical', icon: '📁' },
      { id: 'store-locator', label: 'Nos magasins', icon: '🏪' },
      { id: 'contact', label: 'Contact', icon: '📧' },
    ],
  },
  {
    title: '🤖 IA & Premium',
    items: [
      { id: 'client-intelligence', label: 'NLP & automatisations', icon: '🧠' },
      { id: 'client-recommendations', label: 'Recommandations IA', icon: '🎯' },
      { id: 'client-advanced-ai', label: 'IA avancée', icon: '✨' },
      { id: 'client-explainable-ai', label: 'Explainable AI', icon: '🔬' },
      { id: 'client-product-packs', label: 'Packs produits', icon: '📦' },
      { id: 'client-relay-points', label: 'Points relais', icon: '📍' },
    ],
  },
  {
    title: '⚙️ Compte',
    items: [
      { id: 'client-profile', label: 'Mon profil', icon: '👤' },
      { id: 'change-password', label: 'Mot de passe', icon: '🔐' },
    ],
  },
];
