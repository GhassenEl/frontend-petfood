/** Navigation sidebar — espace client (config dynamique). */

export const CLIENT_SIDEBAR_SECTIONS = [
  {
    title: '🏠 Accueil',
    items: [
      { id: 'client-dashboard', label: 'Tableau de bord', icon: '🏠' },
      { id: 'client-family', label: 'Mode famille', icon: '👨‍👩‍👧' },
      { id: 'client-subscriptions', label: 'Auto-réappro', icon: '🔄' },
    ],
  },
  {
    title: '🛒 Boutique',
    items: [
      { id: 'client-products', label: 'Produits', icon: '🏷️' },
      { id: 'client-smart-commerce', label: 'E-commerce IA', icon: '🛒' },
      { id: 'client-purchase-needs', label: 'Besoins d\'achat', icon: '📢' },
      { id: 'client-favorites', label: 'Mes favoris', icon: '❤️' },
      { id: 'client-orders', label: 'Mes commandes', icon: '📦' },
      { id: 'client-invoices', label: 'Mes factures', icon: '🧾' },
      { id: 'client-history', label: 'Historique', icon: '📜' },
      { id: 'client-loyalty', label: 'Fidélité', icon: '🎁' },
      { id: 'client-community', label: 'Communauté', icon: '👥' },
    ],
  },
  {
    title: '📡 IoT & connecté',
    items: [
      { id: 'client-iot', label: 'Centre IoT', icon: '📡' },
      { id: 'client-esp32cam-food-quality', label: 'ESP32-CAM qualité', icon: '📷', route: '/client-iot?tab=food-quality' },
      { id: 'pet-feeder', label: 'Distributeur IoT', icon: '🍽️' },
      { id: 'client-smart-water', label: 'Fontaine connectée', icon: '💧' },
      { id: 'client-smart-delivery', label: 'Livraison prédictive', icon: '🚚' },
      { id: 'client-traceability', label: 'Traçabilité blockchain', icon: '🔗' },
    ],
  },
  {
    title: '⭐ Avis & Réclamations',
    items: [
      { id: 'client-reviews', label: 'Mes avis', icon: '⭐' },
      { id: 'client-complaints', label: 'Réclamations', icon: '⚠️' },
      { id: 'client-returns', label: 'Demande de retour', icon: '↩️' },
    ],
  },
  {
    title: '🐾 Services PetfoodTN',
    items: [
      { id: 'client-pets', label: 'Mes animaux', icon: '🐾' },
      { id: 'client-events', label: 'Compétitions & cadeaux', icon: '🏆' },
      { id: 'platform-services', label: 'Catalogue services', icon: '📋' },
      { id: 'client-services', label: 'Mes services & SAV', icon: '✂️' },
      { id: 'client-pet-passport', label: 'Passeport numérique', icon: '🛂' },
      { id: 'client-digital-twin', label: 'Jumeau numérique', icon: '🧬' },
      { id: 'pet-calories', label: 'Nutrition par animal', icon: '🥗' },
      { id: 'pet-adaptive-nutrition', label: 'Profil nutritionnel IA', icon: '🧬' },
      { id: 'pet-advice', label: 'Conseils pour pets', icon: '💡' },
      { id: 'found-me', label: 'Retrouvé Moi', icon: '🔍' },
      { id: 'veterinary', label: 'Santé & Vétérinaire', icon: '🩺' },
      { id: 'client-vet-intelligence', label: 'IA vétérinaire', icon: '💬' },
      { id: 'medical-dossier', label: 'Dossier médical', icon: '📁' },
      { id: 'client-teleconsult', label: 'Téléconsultation', icon: '📹' },
      { id: 'client-geo-services', label: 'Services géolocalisés', icon: '🗺️' },
      { id: 'store-locator', label: 'Magasin le plus proche', icon: '📍' },
      { id: 'client-cities', label: 'Nos villes', icon: '🏙️' },
      { id: 'contact', label: 'Contact', icon: '📧' },
    ],
  },
  {
    title: '🤖 IA & Premium',
    items: [
      { id: '__open-chat__', label: 'Assistant IA', icon: '💬', action: 'open-chat' },
      { id: 'client-smart-hub', label: 'Hub intelligent', icon: '✨' },
      { id: 'client-ecosystem', label: 'Hub écosystème', icon: '🌐' },
      { id: 'client-ai', label: 'Agent IA', icon: '🤖' },
      { id: 'client-advanced-ai', label: 'IA avancée', icon: '✨' },
      { id: 'client-explainable-ai', label: 'Explainable AI', icon: '🔬' },
      { id: 'client-ml-agent', label: 'Agent ML', icon: '🧠' },
      { id: 'client-wellness', label: 'Bien-être', icon: '💚' },
      { id: 'smart-food-agent', label: 'Agent nutrition IA', icon: '🍽️' },
      { id: 'nutripro-history', label: 'Historique NutriPro', icon: '📊' },
      { id: 'client-emotions', label: 'Émotions & sentiment', icon: '💭' },
      { id: 'client-product-packs', label: 'Packs produits', icon: '📦' },
      { id: 'client-relay-points', label: 'Points relais', icon: '📍' },
      { id: 'client-rehabilitation', label: 'Réhabilitation', icon: '🏥' },
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
