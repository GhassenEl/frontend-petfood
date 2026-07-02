/**
 * Catalogue hub commercial — admin & vendeur.
 */

export const ADMIN_COMMERCIAL_MODULES = [
  {
    id: 'sales',
    icon: '💰',
    title: 'Ventes & chiffre d\'affaires',
    description: 'CA mensuel, commandes, top produits et graphiques revenus.',
    route: '/admin/sales',
    color: '#e67e22',
  },
  {
    id: 'marketing',
    icon: '📣',
    title: 'Marketing digital',
    description: 'Campagnes IA, SEO, newsletter, réseaux sociaux et entonnoir conversion.',
    route: '/admin/digital-marketing',
    color: '#7c3aed',
  },
  {
    id: 'promotions',
    icon: '🎟️',
    title: 'Promotions & coupons',
    description: 'Codes promo checkout, remises catalogue et campagnes commerciales.',
    route: '/admin/promotions',
    color: '#db2777',
  },
  {
    id: 'vendors',
    icon: '🏬',
    title: 'Vendeurs marketplace',
    description: 'Partenaires, commissions, validation modérateur et performance boutique.',
    route: '/admin/vendors',
    color: '#0d9488',
  },
  {
    id: 'reports',
    icon: '📊',
    title: 'Rapports & BI',
    description: 'Power BI, prévisions ventes et analytics géographiques.',
    route: '/admin/powerbi',
    color: '#2563eb',
  },
  {
    id: 'loyalty',
    icon: '🎁',
    title: 'Fidélité & segmentation',
    description: 'Programme fidélité clients, segments VIP et relance churn.',
    route: '/admin/digital-marketing',
    hash: '#campaigns',
    color: '#059669',
  },
];

export const VENDOR_COMMERCIAL_MODULES = [
  {
    id: 'sales',
    icon: '📈',
    title: 'Historique des ventes',
    description: 'CA, commissions plateforme (12 %) et détail commandes livrées.',
    route: '/vendor/sales',
    color: '#e67e22',
  },
  {
    id: 'marketing',
    icon: '📣',
    title: 'Marketing & réseaux',
    description: 'Campagnes boutique, liens sociaux et candidature partenaire.',
    route: '/vendor/marketing',
    color: '#7c3aed',
  },
  {
    id: 'orders',
    icon: '📦',
    title: 'Commandes actives',
    description: 'Traitement, expédition et suivi des ventes en cours.',
    route: '/vendor/orders',
    color: '#2563eb',
  },
  {
    id: 'purchase-needs',
    icon: '🛒',
    title: 'Besoins d\'achat clients',
    description: 'Demandes clients à convertir en opportunités commerciales.',
    route: '/vendor/purchase-needs',
    color: '#0d9488',
  },
  {
    id: 'ml',
    icon: '🤖',
    title: 'Assistant ML vendeur',
    description: 'Prévisions stock, alertes rupture et conseils promo IA.',
    route: '/vendor/ml',
    color: '#4f46e5',
  },
  {
    id: 'communication',
    icon: '⭐',
    title: 'Avis & communication',
    description: 'Réponses aux avis, messages clients et notifications.',
    route: '/vendor/communication',
    color: '#d97706',
  },
];

export const COMMERCIAL_PIPELINE_STAGES = [
  { id: 'lead', label: 'Prospects', icon: '👀' },
  { id: 'cart', label: 'Paniers', icon: '🛒' },
  { id: 'order', label: 'Commandes', icon: '📦' },
  { id: 'loyal', label: 'Fidèles', icon: '💎' },
];
