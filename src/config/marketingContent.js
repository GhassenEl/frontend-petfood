/** Contenu marketing public — témoignages et partenaires PetfoodTN */

export const MARKETING_TESTIMONIALS = [
  {
    id: 't1',
    name: 'Amira B.',
    city: 'Tunis · La Marsa',
    pet: 'Max, Labrador',
    petEmoji: '🐕',
    rating: 5,
    service: 'Nutrition & commandes',
    quote:
      'La calculatrice calories m’a aidée à stabiliser le poids de Max. Les croquettes recommandées arrivent en 24 h — plus besoin de courir les magasins.',
  },
  {
    id: 't2',
    name: 'Karim M.',
    city: 'Sfax',
    pet: 'Luna, chat tunisien',
    petEmoji: '🐈',
    rating: 5,
    service: 'Santé & vétérinaire',
    quote:
      'RDV vétérinaire en ligne et rappels vaccins automatiques. Le dossier médical de Luna est toujours à jour, même quand je voyage.',
  },
  {
    id: 't3',
    name: 'Salma K.',
    city: 'Sousse',
    pet: 'Pico, perruche',
    petEmoji: '🐦',
    rating: 5,
    service: 'Nutrition multi-espèces',
    quote:
      'Enfin une app qui comprend les oiseaux ! Ration en graines adaptée au poids de Pico, avec des conseils clairs en français.',
  },
  {
    id: 't4',
    name: 'Youssef H.',
    city: 'Ariana',
    pet: 'Aziza, Sloughi',
    petEmoji: '🐕',
    rating: 5,
    service: 'Toilettage & fidélité',
    quote:
      'Toilettage réservé en deux clics, forfait bien-être top. Les points fidélité me font économiser sur chaque sac de croquettes.',
  },
  {
    id: 't5',
    name: 'Nadia R.',
    city: 'Bizerte',
    pet: 'Coco, lapin nain',
    petEmoji: '🐰',
    rating: 4,
    service: 'NAC & soins',
    quote:
      'Granulés lapin et foin livrés à domicile. L’assistant IA m’a rassurée sur l’alimentation de Coco avant la visite chez le vétérinaire NAC.',
  },
  {
    id: 't6',
    name: 'Mehdi T.',
    city: 'Nabeul',
    pet: 'Carthage, tortue grecque',
    petEmoji: '🦎',
    rating: 5,
    service: 'Réhabilitation refuges',
    quote:
      'J’ai adopté via un refuge partenaire. PetfoodTN suit la réhabilitation et propose l’alimentation adaptée dès l’arrivée à la maison.',
  },
];

export const MARKETING_PARTNERS = [
  {
    id: 'p1',
    name: 'Refuge Les Amis à Quatre Pattes',
    type: 'Refuge & adoption',
    city: 'Sousse',
    icon: '🏠',
    description: 'Réhabilitation et adoption — chiens et chats recueillis.',
  },
  {
    id: 'p2',
    name: 'Clinique Vétérinaire Médina',
    type: 'Santé animale',
    city: 'Tunis',
    icon: '🩺',
    description: 'Consultations, vaccins et urgences NAC partenaires.',
  },
  {
    id: 'p4',
    name: 'Club Colombophile Tunis',
    type: 'Oiseaux & colombophilie',
    city: 'Tunis',
    icon: '🕊️',
    description: 'Pigeons voyageurs — nutrition et grains spécialisés.',
  },
  {
    id: 'p5',
    name: 'Happy Paws Toilettage',
    type: 'Soins & grooming',
    city: 'La Marsa',
    icon: '✂️',
    description: 'Toilettage, bain et forfaits bien-être sur réservation.',
  },
  {
    id: 'p6',
    name: 'AquaTunis Pro',
    type: 'Aquariophilie',
    city: 'Sfax',
    icon: '🐟',
    description: 'Flocons, aquariums et conseils poissons tropicaux.',
  },
  {
    id: 'p7',
    name: 'PetFeed IoT Lab',
    type: 'Technologie',
    city: 'Tunis',
    icon: '📡',
    description: 'Distributeurs connectés et monitoring hydratation.',
  },
  {
    id: 'p8',
    name: 'Association Sloughi Tunisie',
    type: 'Race patrimoniale',
    city: 'Kairouan',
    icon: '🐕',
    description: 'Préservation lévriers arabes — nutrition et sport.',
  },
];

export const MARKETING_PARTNER_TYPES = [
  'Refuges',
  'Vétérinaires',
  'Fournisseurs',
  'Toilettage',
  'Colombophilie',
  'IoT',
];

export const MARKETING_HOW_IT_WORKS = [
  {
    step: '1',
    icon: '📝',
    title: 'Créez votre profil',
    text: 'Inscription gratuite en 2 min : type d\'animal, âge, préférences alimentaires et ville.',
  },
  {
    step: '2',
    icon: '🎯',
    title: 'Personnalisez',
    text: 'Recommandations ML, nutrition multi-espèces, IoT et assistant chat — tout s\'adapte à votre compagnon.',
  },
  {
    step: '3',
    icon: '📦',
    title: 'Commandez & suivez',
    text: 'Boutique, RDV soins, livraison prédictive, factures et avis 5★ depuis un seul compte.',
  },
];

export const MARKETING_IOT_FEATURES = [
  {
    icon: '📡',
    title: 'Centre IoT',
    text: 'Tableau de bord unifié : alertes, statuts et accès rapide à tous vos appareils connectés.',
  },
  {
    icon: '🍽️',
    title: 'Distributeur ESP32',
    text: 'Portions automatiques, horaires, capteurs niveau et température — pilotage depuis l\'app.',
  },
  {
    icon: '💧',
    title: 'Fontaine connectée',
    text: 'Suivi hydratation, réservoir, filtres et courbes de consommation par animal.',
  },
  {
    icon: '🔗',
    title: 'Traçabilité blockchain',
    text: 'Origine des aliments, certifications et chaîne d\'approvisionnement vérifiée (SHA-256).',
  },
];

export const MARKETING_TRUST_BADGES = [
  { icon: '🔒', label: 'Paiement sécurisé', sub: 'Stripe · PayPal · Wallet' },
  { icon: '⭐', label: 'Avis 5 étoiles', sub: 'Produits & services notés' },
  { icon: '🧠', label: 'Analyse NLP', sub: 'Émotions & sentiments clients' },
  { icon: '🚚', label: 'Livraison TN', sub: '24–48 h Grand Tunis' },
  { icon: '🇹🇳', label: '100 % Tunisie', sub: 'Races & refuges locaux' },
];

export const MARKETING_PROMO_CODES = [
  { code: 'CHAT10', label: '−10 % chats', min: '30 DT' },
  { code: 'BIENVENUE20', label: '−20 DT bienvenue', min: '80 DT' },
  { code: 'FIDELITE15', label: '−15 % fidélité', min: '50 DT' },
];

export const MARKETING_FAQ = [
  {
    q: 'PetfoodTN est-il gratuit ?',
    a: 'L\'inscription et l\'accès au catalogue sont gratuits. Vous payez uniquement vos achats, services réservés ou abonnements choisis.',
  },
  {
    q: 'Quels animaux sont pris en charge ?',
    a: 'Chien, chat, oiseau, poisson, lapin, hamster, reptile et NAC — avec nutrition dédiée et conseils par espèce.',
  },
  {
    q: 'Comment fonctionne le distributeur IoT ?',
    a: 'Créez un distributeur dans l\'app, copiez la clé appareil, flashez le firmware ESP32 avec votre Wi-Fi et suivez le statut En ligne.',
  },
  {
    q: 'Puis-je noter un service après toilettage ou livraison ?',
    a: 'Oui — notes 1 à 5★ sur produits et services (toilettage, livraison, véto…). L\'analyse NLP détecte émotion et sentiment.',
  },
  {
    q: 'Livraison partout en Tunisie ?',
    a: 'Oui — 24 à 48 h sur Grand Tunis, 2 à 4 jours ailleurs. Suivi en temps réel dans Mes commandes.',
  },
  {
    q: 'Je suis vétérinaire ou refuge — comment devenir partenaire ?',
    a: 'Écrivez à partenaires@petfoodtn.tn pour un accès professionnel (clinique, marketplace, refuges).',
  },
];

/** Raccourcis cliquables — hub visiteur (toutes sections publiques). */
export const VISITOR_QUICK_LINKS = [
  { id: 'products', icon: '🏷️', label: 'Produits', route: '/visitor/products' },
  { id: 'promos', icon: '🔥', label: 'Promotions', route: '/visitor/products?tab=promos' },
  { id: 'tools', icon: '🧪', label: 'Outils nutrition', route: '/visitor/tools' },
  { id: 'info', icon: '📚', label: 'Infos & FAQ', route: '/visitor/info' },
  { id: 'reviews', icon: '⭐', label: 'Avis clients', route: '/visitor/info' },
  { id: 'vendor', icon: '🏬', label: 'Espace vendeur', route: '/vendor' },
  { id: 'register', icon: '✨', label: 'Inscription', route: '/register' },
  { id: 'login', icon: '🔑', label: 'Connexion', route: '/login' },
];

/** Raccourcis cliquables — hub vendeur marketplace. */
export const VENDOR_QUICK_LINKS = [
  { id: 'marketplace', icon: '🛒', label: 'Marketplace', route: '/#partenaires' },
  { id: 'commissions', icon: '💰', label: 'Commissions', route: '/vendor#commissions' },
  { id: 'ml', icon: '🤖', label: 'ML vendeur', route: '/vendor#ml-vendeur' },
  { id: 'onboarding', icon: '✨', label: 'Devenir partenaire', route: '/vendor#devenir-partenaire' },
  { id: 'partners', icon: '🤝', label: 'Réseau', route: '/#partenaires' },
  { id: 'visitor', icon: '👀', label: 'Espace visiteur', route: '/visitor' },
  { id: 'login', icon: '🔑', label: 'Connexion pro', route: '/login' },
  { id: 'register', icon: '📝', label: 'Demande accès', route: '/vendor#devenir-partenaire' },
];

/** Raccourcis cliquables — hub modérateur communauté. */
export const MODERATOR_QUICK_LINKS = [
  { id: 'reviews', icon: '⭐', label: 'Avis NLP', route: '/moderator#avis' },
  { id: 'complaints', icon: '⚠️', label: 'Réclamations', route: '/moderator#reclamations' },
  { id: 'events', icon: '🎪', label: 'Événements', route: '/moderator#evenements' },
  { id: 'nlp', icon: '🤖', label: 'Analyse NLP', route: '/moderator#nlp' },
  { id: 'visitor', icon: '👀', label: 'Espace visiteur', route: '/visitor' },
  { id: 'vendor', icon: '🏬', label: 'Espace vendeur', route: '/vendor' },
  { id: 'login', icon: '🔑', label: 'Connexion pro', route: '/login' },
  { id: 'access', icon: '📝', label: 'Demande accès', route: '/moderator#devenir-moderateur' },
];

/** Acteurs de la plateforme — section marketing (visiteur & modérateur mis en avant). */
export const MARKETING_PLATFORM_ACTORS = [
  {
    id: 'visiteur',
    icon: '👀',
    title: 'Visiteur',
    tagline: 'Découvrir sans compte',
    description:
      'Parcourez le catalogue public, les témoignages et la présentation IoT. Inscrivez-vous quand vous êtes prêt à commander ou réserver.',
    highlights: ['Aperçu services', 'FAQ & avis', 'Inscription en 2 min'],
    ctaLabel: 'Espace visiteur',
    ctaRoute: '/visitor',
    accent: '#0ea5e9',
    featured: true,
  },
  {
    id: 'client',
    icon: '🐾',
    title: 'Client',
    tagline: 'Propriétaire d\'animaux',
    description:
      'Boutique, nutrition multi-espèces, RDV vétérinaire, IoT, fidélité et livraison prédictive.',
    highlights: ['Commandes & factures', 'Dossier médical', 'Compétitions'],
    ctaLabel: 'Créer un compte',
    ctaRoute: '/register',
    accent: '#2563eb',
  },
  {
    id: 'vet',
    icon: '🩺',
    title: 'Vétérinaire',
    tagline: 'Clinique partenaire',
    description:
      'Agenda, ordonnances, détection précoce ML et dashboard BI pour le suivi de vos patients.',
    highlights: ['Calendrier RDV', 'Ordonnances', 'BI clinique'],
    ctaLabel: 'Connexion pro',
    ctaRoute: '/login',
    accent: '#4f46e5',
  },
  {
    id: 'livreur',
    icon: '🛵',
    title: 'Livreur',
    tagline: 'Logistique last-mile',
    description:
      'Tournées optimisées, preuve de livraison, gains et assistant ML pour la charge du jour.',
    highlights: ['Itinéraire', 'Gains', 'Disponibilité'],
    ctaLabel: 'Espace livreur',
    ctaRoute: '/login',
    accent: '#059669',
  },
  {
    id: 'vendor',
    icon: '🏬',
    title: 'Vendeur',
    tagline: 'Marketplace',
    description:
      'Vendez croquettes et accessoires certifiés sur la marketplace PetfoodTN. Dashboard, ML et commissions intégrés.',
    highlights: ['Catalogue vendeur', 'Commandes', 'Stats ventes'],
    ctaLabel: 'Espace vendeur',
    ctaRoute: '/vendor',
    accent: '#0d9488',
    featured: true,
  },
  {
    id: 'moderator',
    icon: '🛡️',
    title: 'Modérateur',
    tagline: 'Communauté & contenus',
    description:
      'Validez les avis, traitez les signalements, supervisez les événements et maintenez la qualité des échanges.',
    highlights: ['Avis NLP', 'Réclamations', 'Événements'],
    ctaLabel: 'Espace modération',
    ctaRoute: '/moderator',
    accent: '#d97706',
    featured: true,
  },
  {
    id: 'admin',
    icon: '⚙️',
    title: 'Administrateur',
    tagline: 'Pilotage plateforme',
    description:
      'KPIs, CRM, stock BI, fournisseurs et configuration globale de PetfoodTN.',
    highlights: ['Dashboard', 'CRM', 'Power BI'],
    ctaLabel: 'Administration',
    ctaRoute: '/login',
    accent: '#dc2626',
  },
];
