/** Sections navigation — hubs publics. */

/** @deprecated Espace visiteur retiré — liens vers l'accueil public. */
export const VISITOR_SIDEBAR_SECTIONS = [
  {
    title: '🌐 PetfoodTN',
    items: [
      { id: 'home', label: 'Accueil', icon: '🏠', route: '/' },
      { id: 'register', label: 'Inscription', icon: '✨', route: '/register' },
      { id: 'login', label: 'Connexion', icon: '🔑', route: '/login' },
      { id: 'contact', label: 'Contact', icon: '📧', route: '/contact' },
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
      { id: 'chat', label: 'Assistant NLP', icon: '💬', action: 'open-chat' },
    ],
  },
  {
    title: '🔗 Réseau',
    items: [
      { id: 'partners', label: 'Réseau partenaires', icon: '🤝', route: '/#partenaires' },
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
      { id: 'intelligence', label: 'Intelligence IA', icon: '🧠', route: '/moderator/intelligence' },
      { id: 'intelligence-ai-reviews', label: 'Avis générés IA', icon: '🤖', route: '/moderator/intelligence?tab=ai-reviews' },
      { id: 'intelligence-quality', label: 'Qualité contenu', icon: '📋', route: '/moderator/intelligence?tab=content-quality' },
      { id: 'reviews', label: 'Avis & NLP', icon: '⭐', href: '#avis' },
      { id: 'complaints', label: 'Réclamations', icon: '⚠️', href: '#reclamations' },
      { id: 'events', label: 'Événements', icon: '🎪', href: '#evenements' },
      { id: 'nlp', label: 'Analyse NLP', icon: '🤖', href: '#nlp' },
    ],
  },
  {
    title: '🔗 Espaces liés',
    items: [
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
