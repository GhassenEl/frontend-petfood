/** Sections navigation — hubs publics. */

export const VISITOR_SIDEBAR_SECTIONS = [
  {
    title: '👀 Découverte',
    items: [
      { id: 'hub', label: 'Hub visiteur', icon: '🏠', route: '/visitor' },
      { id: 'home', label: 'Accueil marketing', icon: '🌐', route: '/' },
      { id: 'services', label: 'Catalogue services', icon: '📋', route: '/#services' },
      { id: 'acteurs', label: 'Tous les acteurs', icon: '👥', route: '/#acteurs' },
      { id: 'how', label: 'Comment ça marche', icon: '📖', route: '/#comment-ca-marche' },
    ],
  },
  {
    title: '⭐ Contenu & avis',
    items: [
      { id: 'testimonials', label: 'Avis clients', icon: '⭐', route: '/#temoignages' },
      { id: 'tarifs', label: 'Tarifs soins', icon: '💰', route: '/#tarifs' },
      { id: 'faq', label: 'FAQ', icon: '❓', href: '#faq-visiteur' },
      { id: 'faq-home', label: 'FAQ accueil', icon: '📚', route: '/#faq' },
    ],
  },
  {
    title: '📡 Écosystème',
    items: [
      { id: 'iot', label: 'IoT & connecté', icon: '📡', route: '/#iot' },
      { id: 'partners', label: 'Partenaires & refuges', icon: '🤝', route: '/#partenaires' },
      { id: 'vendor', label: 'Espace vendeur', icon: '🏬', route: '/vendor' },
      { id: 'moderator', label: 'Espace modération', icon: '🛡️', route: '/moderator' },
      { id: 'events', label: 'Compétitions & cadeaux', icon: '🏆', route: '/login' },
    ],
  },
  {
    title: '🔑 Compte',
    items: [
      { id: 'register', label: 'Créer un compte', icon: '✨', route: '/register' },
      { id: 'login', label: 'Connexion', icon: '🔑', route: '/login' },
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
