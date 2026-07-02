import { CLIENT_SIDEBAR_SECTIONS } from './clientSidebarConfig';
import { VET_SIDEBAR_SECTIONS } from './vetSidebarConfig';

/** Sections admin (miroir Sidebar.js) */
const ADMIN_SIDEBAR_SECTIONS = [
  {
    title: 'Tableau de bord',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '📈' },
      { id: 'digital-marketing', label: 'Marketing digital', icon: '📣' },
      { id: 'commercial', label: 'Hub commercial', icon: '💼', route: '/admin/commercial' },
      { id: 'hub', label: 'Hub avancé', icon: '🚀' },
    ],
  },
  {
    title: 'IoT & Embarqué',
    items: [
      { id: 'iot-anomalies', label: 'Command center IoT', icon: '🔌' },
      { id: 'food-quality-cam', label: 'ESP32-CAM', icon: '📷' },
      { id: 'food-quality', label: 'Qualité alimentaire', icon: '🌡️' },
      { id: 'client-iot', label: 'Centre IoT embarqué', icon: '🔌', route: '/client-iot?tab=embedded' },
      { id: 'pet-feeder', label: 'Distributeur ESP32', icon: '🍽️' },
      { id: 'client-hardware-pcb', label: 'Cartes PCB ARES', icon: '🟢', route: '/client-hardware-pcb' },
      { id: 'client-smart-water', label: 'Fontaine connectée', icon: '💧' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { id: 'recommendations', label: 'Recommandations IA', icon: '🎯', route: '/admin/recommendations' },
      { id: 'chat-history', label: 'Historique chatbot', icon: '💬', route: '/admin/chat-history' },
      { id: 'devops', label: 'DevOps', icon: '⚙️' },
      { id: 'performance', label: 'Performance', icon: '⚡' },
      { id: 'nlp-models', label: 'Modèles NLP', icon: '🧠' },
      { id: 'history', label: 'Historique', icon: '📜' },
    ],
  },
  {
    title: 'Gestion',
    items: [
      { id: 'orders', label: 'Commandes', icon: '📦' },
      { id: 'products', label: 'Produits', icon: '🏷️' },
      { id: 'stock', label: 'Stock', icon: '📦' },
      { id: 'users', label: 'Utilisateurs', icon: '👥' },
      { id: 'reviews', label: 'Avis', icon: '⭐' },
      { id: 'complaints', label: 'Réclamations', icon: '⚠️' },
      { id: 'invoices', label: 'Factures', icon: '🧾' },
      { id: 'vendors', label: 'Vendeurs', icon: '🏬' },
    ],
  },
  {
    title: 'Sécurité',
    items: [
      { id: 'security', label: 'Centre sécurité', icon: '🛡️' },
      { id: 'backups', label: 'Sauvegardes', icon: '💾' },
    ],
  },
];

const LIVREUR_ITEMS = [
  { id: 'livreur-dashboard', label: 'Tableau de bord livreur', icon: '🚚', route: '/livreur/dashboard' },
  { id: 'livreur-orders', label: 'Mes livraisons', icon: '📦', route: '/livreur/orders' },
  { id: 'livreur-history', label: 'Historique', icon: '📜', route: '/livreur/history' },
];

const PUBLIC_ITEMS = [
  { id: 'client-products', label: 'Catalogue produits', icon: '🏷️', route: '/client-products', roles: ['client'] },
  { id: 'enterprise', label: 'Fonctionnalités entreprise', icon: '🏢', route: '/enterprise' },
  { id: 'devops', label: 'Plateforme DevOps', icon: '⚙️', route: '/devops' },
  { id: 'cloud', label: 'Cloud AWS', icon: '☁️', route: '/cloud' },
  { id: 'contact', label: 'Contact', icon: '📧', route: '/contact' },
];

function flattenSections(sections, routePrefix, role) {
  return sections.flatMap((section) =>
    section.items
      .filter((item) => item.action !== 'open-chat')
      .map((item) => ({
        type: 'page',
        id: `${role}-${item.id}`,
        label: item.label,
        icon: item.icon || '📄',
        route: item.route || `${routePrefix}${item.id}`,
        section: section.title,
        role,
        keywords: `${item.label} ${item.id} ${section.title}`.toLowerCase(),
      })),
  );
}

const ROLE_INDEX = {
  client: flattenSections(CLIENT_SIDEBAR_SECTIONS, '/', 'client'),
  admin: flattenSections(ADMIN_SIDEBAR_SECTIONS, '/admin/', 'admin'),
  vet: flattenSections(VET_SIDEBAR_SECTIONS, '/vet/', 'vet'),
  livreur: LIVREUR_ITEMS.map((item) => ({
    type: 'page',
    id: item.id,
    label: item.label,
    icon: item.icon,
    route: item.route,
    section: 'Livreur',
    role: 'livreur',
    keywords: `${item.label} ${item.id} livreur`.toLowerCase(),
  })),
};

export const getSearchIndexForRole = (role) => {
  const key = String(role || 'client').toLowerCase();
  const pages = ROLE_INDEX[key] || ROLE_INDEX.client;
  const extras = PUBLIC_ITEMS.filter((p) => !p.roles || p.roles.includes(key));
  return [
    ...pages,
    ...extras.map((p) => ({
      type: 'page',
      id: p.id,
      label: p.label,
      icon: p.icon,
      route: p.route,
      section: 'Plateforme',
      role: key,
      keywords: `${p.label} ${p.id}`.toLowerCase(),
    })),
  ];
};
