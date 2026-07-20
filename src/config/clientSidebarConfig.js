/** Navigation sidebar — espace client (config dynamique). */

export const CLIENT_SIDEBAR_SECTIONS = [
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
      { id: 'veterinary', label: 'Santé & Vétérinaire', icon: '🩺' },
      { id: 'bilan-nutritionnel', label: 'Bilan nutritionnel', icon: '🥗', route: '/veterinary?prefill=bilan' },
      { id: 'medical-dossier', label: 'Dossier médical', icon: '📁' },
      { id: 'client-services', label: 'Services animaliers', icon: '🐕' },
      { id: 'store-locator', label: 'Nos magasins', icon: '🏪' },
      { id: 'contact', label: 'Contact', icon: '📧' },
      { id: 'support-agent', label: 'PetBot conseiller', icon: '🤖', route: '/support-agent' },
      { id: 'carte-visite', label: 'Carte de visite', icon: '💳', route: '/carte-visite' },
    ],
  },
  {
    title: '🤖 IA & Premium',
    items: [
      { id: 'recommendations', label: 'Recommandations IA', icon: '🎯', route: '/client-recommendations' },
      { id: 'client-relay-points', label: 'Points relais', icon: '📍' },
    ],
  },
  {
    title: '🔌 Maison connectée',
    items: [
      { id: 'client-iot', label: 'Centre IoT', icon: '📡' },
      { id: 'pet-feeder', label: 'Gamelle intelligente', icon: '🍽️', route: '/pet-feeder' },
    ],
  },
  {
    title: '⚙️ Compte',
    items: [
      { id: 'client-profile', label: 'Mon profil', icon: '👤' },
      { id: 'client-security', label: 'Sécurité', icon: '🛡️' },
      { id: 'change-password', label: 'Mot de passe', icon: '🔐' },
    ],
  },
];
