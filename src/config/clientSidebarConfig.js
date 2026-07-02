/** Navigation sidebar — espace client (config dynamique). */

export const CLIENT_SIDEBAR_SECTIONS = [
  {
    title: '🔌 Embarqué & IoT',
    badge: 'EDGE',
    items: [
      { id: 'client-iot', label: 'Centre IoT embarqué', icon: '🔌', route: '/client-iot?tab=embedded' },
      { id: 'pet-feeder', label: 'Distributeur ESP32', icon: '🍽️' },
      { id: 'client-hardware-pcb', label: 'Cartes PCB ARES', icon: '🟢', route: '/client-hardware-pcb' },
      { id: 'client-smart-water', label: 'Fontaine connectée', icon: '💧' },
      { id: 'client-traceability', label: 'Traçabilité capteurs', icon: '🔗' },
      { id: 'mobile-app', label: 'App mobile IoT', icon: '📱', route: '/mobile#iot' },
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
      { id: 'medical-dossier', label: 'Dossier médical', icon: '📁' },
      { id: 'client-services', label: 'Services animaliers', icon: '🐕' },
      { id: 'store-locator', label: 'Nos magasins', icon: '🏪' },
      { id: 'contact', label: 'Contact', icon: '📧' },
    ],
  },
  {
    title: '🤖 IA & Premium',
    items: [
      { id: 'recommendations', label: 'Recommandations IA', icon: '🎯', route: '/client-recommendations' },
      { id: 'client-chat-history', label: 'Historique chatbot', icon: '📜', route: '/client/chat-history' },
      { id: 'client-relay-points', label: 'Points relais', icon: '📍' },
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
