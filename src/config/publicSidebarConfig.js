/** Sections navigation — hubs publics. */

export const VISITOR_SIDEBAR_SECTIONS = [
  {
    title: '👀 Découverte',
    items: [
      { id: 'hub', label: 'Hub visiteur', icon: '🏠', route: '/visitor' },
      { id: 'home', label: 'Accueil marketing', icon: '🌐', route: '/' },
      { id: 'services', label: 'Catalogue services', icon: '📋', route: '/#services' },
    ],
  },
  {
    title: '🛒 Consultation',
    items: [
      { id: 'products', label: 'Parcourir les produits', icon: '🏷️', route: '/visitor/products' },
      { id: 'promos', label: 'Voir les promotions', icon: '🔥', route: '/visitor/products?tab=promos' },
    ],
  },
  {
    title: '📚 Informations',
    items: [
      { id: 'nutrition', label: 'Conseils nutritionnels', icon: '🥗', route: '/visitor/info?tab=nutrition' },
      { id: 'vet', label: 'Services vétérinaires', icon: '🩺', route: '/visitor/info?tab=vet' },
      { id: 'faq', label: 'FAQ', icon: '❓', route: '/visitor/info?tab=faq' },
      { id: 'reviews', label: 'Avis clients', icon: '⭐', route: '/visitor/info?tab=reviews' },
    ],
  },
  {
    title: '🧪 Outils PetFoodTN',
    items: [
      { id: 'simulator', label: 'Simulateur nutrition', icon: '🔥', route: '/visitor/tools?tab=simulator' },
      { id: 'packs', label: 'Packs alimentaires', icon: '📦', route: '/visitor/tools?tab=packs' },
      { id: 'breeds', label: 'Races & besoins', icon: '🐾', route: '/visitor/tools?tab=breeds' },
    ],
  },
  {
    title: '📡 Écosystème',
    items: [
      { id: 'vendor', label: 'Espace vendeur', icon: '🏬', route: '/vendor' },
      { id: 'moderator', label: 'Espace modération', icon: '🛡️', route: '/moderator' },
      { id: 'partners', label: 'Partenaires & refuges', icon: '🤝', route: '/#partenaires' },
    ],
  },
  {
    title: '🔑 Compte',
    items: [
      { id: 'register', label: 'Créer un compte', icon: '✨', route: '/register' },
      { id: 'login', label: 'Se connecter', icon: '🔑', route: '/login' },
      { id: 'forgot', label: 'Mot de passe oublié', icon: '🔐', route: '/forgot-password' },
    ],
  },
];

export const VENDOR_PUBLIC_SIDEBAR_SECTIONS = [
  {
    title: '🏬 Marketplace',
    items: [
      { id: 'hub', label: 'Hub vendeur', icon: '🏠', route: '/vendor' },
      { id: 'marketplace', label: 'Marketplace', icon: '🛒', route: '/#partenaires' },
      { id: 'commissions', label: 'Commissions', icon: '💰', href: '#commissions' },
      { id: 'ml', label: 'Assistant ML', icon: '🤖', href: '#ml-vendeur' },
      { id: 'onboarding', label: 'Devenir partenaire', icon: '✨', href: '#devenir-partenaire' },
    ],
  },
  {
    title: '🔗 Réseau',
    items: [
      { id: 'partners', label: 'Réseau partenaires', icon: '🤝', route: '/#partenaires' },
      { id: 'visitor', label: 'Espace visiteur', icon: '👀', route: '/visitor' },
      { id: 'moderator', label: 'Espace modération', icon: '🛡️', route: '/moderator' },
      { id: 'home', label: 'Accueil marketing', icon: '🌐', route: '/' },
    ],
  },
  {
    title: '🔑 Accès pro',
    items: [
      { id: 'login', label: 'Connexion vendeur', icon: '🔑', route: '/login' },
      { id: 'dashboard', label: 'Tableau de bord', icon: '📊', route: '/login' },
      { id: 'register', label: 'Demande partenaire', icon: '📝', href: '#devenir-partenaire' },
    ],
  },
];

export const MODERATOR_PUBLIC_SIDEBAR_SECTIONS = [
  {
    title: '🛡️ Modération',
    items: [
      { id: 'hub', label: 'Hub modération', icon: '🏠', route: '/moderator' },
      { id: 'reviews', label: 'Avis & NLP', icon: '⭐', href: '#avis' },
      { id: 'complaints', label: 'Réclamations', icon: '⚠️', href: '#reclamations' },
      { id: 'events', label: 'Événements', icon: '🎪', href: '#evenements' },
      { id: 'nlp', label: 'Analyse NLP', icon: '🤖', href: '#nlp' },
    ],
  },
  {
    title: '🔗 Espaces liés',
    items: [
      { id: 'visitor', label: 'Espace visiteur', icon: '👀', route: '/visitor' },
      { id: 'vendor', label: 'Espace vendeur', icon: '🏬', route: '/vendor' },
      { id: 'home', label: 'Accueil marketing', icon: '🌐', route: '/' },
      { id: 'acteurs', label: 'Acteurs plateforme', icon: '👥', route: '/#acteurs' },
    ],
  },
  {
    title: '🔑 Accès pro',
    items: [
      { id: 'login', label: 'Connexion modérateur', icon: '🔑', route: '/login' },
      { id: 'dashboard', label: 'Tableau de bord', icon: '📊', route: '/login' },
      { id: 'access', label: 'Demande accès', icon: '📝', href: '#devenir-moderateur' },
    ],
  },
];
