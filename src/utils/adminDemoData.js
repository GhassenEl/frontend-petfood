/** Données de démonstration lorsque l'API renvoie des listes vides (espace admin). */

import {
  DEMO_ORDERS,
  DEMO_INVOICES,
  DEMO_REVIEWS,
  DEMO_COMPLAINTS,
  withDemoFallback,
} from './clientDemoData';
import { DEMO_LIVREUR_LEAVE_REQUESTS } from './livreurDemoData';

export { withDemoFallback };

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();

export const DEMO_ADMIN_USERS = [
  { _id: 'demo-admin-1', id: 'demo-admin-1', name: 'Ghassen Admin', email: 'admin@petfood.tn', role: 'admin', phone: '+216 71 000 001', isActive: true, createdAt: daysAgo(400) },
  { _id: 'demo-client-1', id: 'demo-client-1', name: 'Sami Ben Ali', email: 'client@petfood.tn', role: 'client', phone: '+216 22 111 222', address: 'La Marsa', isActive: true, createdAt: daysAgo(90) },
  { _id: 'demo-client-2', id: 'demo-client-2', name: 'Ines Trabelsi', email: 'ines.trabelsi@email.tn', role: 'client', phone: '+216 98 333 444', address: 'Ariana', isActive: true, createdAt: daysAgo(60) },
  { _id: 'demo-client-3', id: 'demo-client-3', name: 'Youssef Gharbi', email: 'youssef.gharbi@email.tn', role: 'client', phone: '+216 55 777 888', address: 'Lac 1', isActive: true, createdAt: daysAgo(45) },
  { _id: 'demo-livreur-1', id: 'demo-livreur-1', name: 'Karim Mansouri', email: 'livreur@petfood.tn', role: 'livreur', phone: '+216 20 999 111', region: 'Grand Tunis', isActive: true, createdAt: daysAgo(120) },
  { _id: 'demo-livreur-2', id: 'demo-livreur-2', name: 'Mohamed B.', email: 'mohamed.livreur@petfood.tn', role: 'livreur', phone: '+216 27 456 789', region: 'Ariana', isActive: true, createdAt: daysAgo(80) },
  { _id: 'demo-vet-1', id: 'demo-vet-1', name: 'Dr. Amira Khelifi', email: 'vet@petfood.tn', role: 'vet', phone: '+216 71 222 333', address: 'Clinique VetCare, Tunis', isActive: true, createdAt: daysAgo(200) },
  { _id: 'demo-vet-2', id: 'demo-vet-2', name: 'Dr. Hichem Sassi', email: 'hichem.vet@petfood.tn', role: 'vet', phone: '+216 50 123 456', address: 'Carthage Vétérinaire', isActive: true, createdAt: daysAgo(150) },
  { _id: 'demo-vendor-1', id: 'demo-vendor-1', name: 'Leila Mansouri', email: 'vendor@petfood.tn', role: 'vendor', phone: '+216 21 444 555', region: 'Tunis', isActive: true, createdAt: daysAgo(180) },
  { _id: 'demo-vendor-2', id: 'demo-vendor-2', name: 'Ridha Ben Ammar', email: 'ridha.animalerie@email.tn', role: 'vendor', phone: '+216 26 888 999', region: 'Sfax', isActive: true, createdAt: daysAgo(95) },
  { _id: 'demo-vendor-3', id: 'demo-vendor-3', name: 'Nour Haddad', email: 'nour.pets@sousse.tn', role: 'vendor', phone: '+216 29 111 222', region: 'Sousse', isActive: false, createdAt: daysAgo(40) },
  { _id: 'demo-moderator-1', id: 'demo-moderator-1', name: 'Nour Modération', email: 'moderator@petfood.tn', role: 'moderator', phone: '+216 21 555 666', isActive: true, createdAt: daysAgo(70) },
  { _id: 'demo-support-1', id: 'demo-support-1', name: 'Sonia Service Client', email: 'support@petfood.tn', role: 'support', phone: '+216 71 888 999', isActive: true, createdAt: daysAgo(50) },
];

export const DEMO_ADMIN_USER_STATS = {
  count: DEMO_ADMIN_USERS.length,
  active: DEMO_ADMIN_USERS.filter((u) => u.isActive !== false).length,
  inactive: 0,
  byRole: {
    admin: 1,
    client: 3,
    livreur: 2,
    vet: 2,
    vendor: 3,
    moderator: 1,
    support: 1,
  },
};

export const DEMO_ADMIN_ORDERS = [
  ...DEMO_ORDERS,
  {
    _id: 'adm-order-201',
    id: 'adm-order-201',
    status: 'delivered',
    total: 156.0,
    createdAt: daysAgo(7),
    paymentMethod: 'stripe',
    address: '45 Av. Habib Bourguiba, Ariana',
    phone: '+216 98 333 444',
    region: 'Ariana',
    items: [{ quantity: 1, price: 156.0, productId: { name: 'Pack starter chiot' } }],
    user: { email: 'ines.trabelsi@email.tn', name: 'Ines Trabelsi' },
  },
  {
    _id: 'adm-order-202',
    id: 'adm-order-202',
    status: 'shipped',
    total: 67.5,
    createdAt: daysAgo(1),
    paymentMethod: 'wallet',
    address: '12 Rue de la Liberté, La Marsa',
    phone: '+216 22 111 222',
    region: 'La Marsa',
    items: [{ quantity: 1, price: 67.5, productId: { name: 'Croquettes Premium 12 kg' } }],
    user: { email: 'client@petfood.tn', name: 'Sami Ben Ali' },
  },
  {
    _id: 'adm-order-203',
    id: 'adm-order-203',
    status: 'pending',
    total: 89.9,
    createdAt: hoursAgo(3),
    paymentMethod: 'cash',
    address: 'Immeuble Les Palmiers, Lac 1',
    phone: '+216 55 777 888',
    region: 'Lac 1',
    items: [{ quantity: 1, price: 89.9, productId: { name: 'Arbre à chat + litière' } }],
    user: { email: 'youssef.gharbi@email.tn', name: 'Youssef Gharbi' },
  },
];

export const DEMO_ADMIN_INVOICES = [
  ...DEMO_INVOICES,
  {
    _id: 'adm-inv-201',
    id: 'adm-inv-201',
    amount: 156.0,
    status: 'paid',
    paymentMethod: 'stripe',
    issuedAt: daysAgo(7),
    userId: { email: 'ines.trabelsi@email.tn' },
    order: { _id: 'adm-order-201', items: DEMO_ADMIN_ORDERS[3].items },
  },
  {
    _id: 'adm-inv-202',
    id: 'adm-inv-202',
    amount: 67.5,
    status: 'pending',
    paymentMethod: 'wallet',
    issuedAt: daysAgo(1),
    userId: { email: 'client@petfood.tn' },
    order: { _id: 'adm-order-202', items: DEMO_ADMIN_ORDERS[4].items },
  },
];

const STATUS_LABELS = {
  pending: 'En attente',
  paid: 'Payée',
  shipped: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export const buildDemoStatusChart = (orders = DEMO_ADMIN_ORDERS) => {
  const counts = {};
  orders.forEach((o) => {
    counts[o.status] = (counts[o.status] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({
    name: STATUS_LABELS[name] || name,
    rawStatus: name,
    value,
  }));
};

export const buildDemoRevenueChart = (orders = DEMO_ADMIN_ORDERS) => {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getMonth() + 1}/${d.getFullYear()}`,
      name: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      value: 0,
    });
  }
  const byKey = Object.fromEntries(months.map((m) => [m.key, m]));
  orders.forEach((o) => {
    const date = new Date(o.createdAt);
    const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
    if (byKey[key]) byKey[key].value += o.total || 0;
  });
  if (months.every((m) => m.value === 0)) {
    return [
      { name: 'Jan 26', value: 420 },
      { name: 'Fév 26', value: 580 },
      { name: 'Mar 26', value: 710 },
      { name: 'Avr 26', value: 650 },
      { name: 'Mai 26', value: 890 },
      { name: 'Juin 26', value: 1240 },
    ];
  }
  return months.map(({ name, value }) => ({ name, value: Math.round(value * 100) / 100 }));
};

export const buildDemoOrdersDailyChart = (orders = DEMO_ADMIN_ORDERS) => {
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      key,
      name: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      commandes: 0,
      ca: 0,
    });
  }
  const byKey = Object.fromEntries(days.map((day) => [day.key, day]));
  orders.forEach((o) => {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (byKey[key]) {
      byKey[key].commandes += 1;
      byKey[key].ca += Number(o.total || 0);
    }
  });
  if (days.every((d) => d.commandes === 0)) {
    return [
      { name: 'Lun', commandes: 5, ca: 412 },
      { name: 'Mar', commandes: 7, ca: 538 },
      { name: 'Mer', commandes: 4, ca: 290 },
      { name: 'Jeu', commandes: 9, ca: 720 },
      { name: 'Ven', commandes: 6, ca: 455 },
      { name: 'Sam', commandes: 11, ca: 890 },
      { name: 'Dim', commandes: 3, ca: 210 },
    ];
  }
  return days.map(({ name, commandes, ca }) => ({
    name,
    commandes,
    ca: Math.round(ca * 100) / 100,
  }));
};

export const buildDemoUsersGrowthChart = (users = DEMO_ADMIN_USERS) => {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getMonth() + 1}/${d.getFullYear()}`,
      name: d.toLocaleDateString('fr-FR', { month: 'short' }),
      utilisateurs: 0,
    });
  }
  const byKey = Object.fromEntries(months.map((m) => [m.key, m]));
  users.forEach((u) => {
    if (!u.createdAt) return;
    const date = new Date(u.createdAt);
    const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
    if (byKey[key]) byKey[key].utilisateurs += 1;
  });
  if (months.every((m) => m.utilisateurs === 0)) {
    return [
      { name: 'Jan', utilisateurs: 12 },
      { name: 'Fév', utilisateurs: 18 },
      { name: 'Mar', utilisateurs: 24 },
      { name: 'Avr', utilisateurs: 31 },
      { name: 'Mai', utilisateurs: 28 },
      { name: 'Juin', utilisateurs: 35 },
    ];
  }
  return months.map(({ name, utilisateurs }) => ({ name, utilisateurs }));
};

export const DEMO_ADMIN_STATS = {
  totalOrders: DEMO_ADMIN_ORDERS.length,
  totalRevenue: DEMO_ADMIN_ORDERS.reduce((s, o) => s + (o.total || 0), 0),
  totalUsers: DEMO_ADMIN_USER_STATS.count,
  totalReviews: DEMO_REVIEWS.length + 3,
  totalComplaints: DEMO_COMPLAINTS.length + 1,
  pendingOrders: DEMO_ADMIN_ORDERS.filter((o) => o.status === 'pending').length,
};

export const buildDemoRecentActivity = () => [
  { type: 'order', icon: '📦', text: 'Commande #203 — 89.90 DT (En attente)', time: hoursAgo(3), color: '#e67e22' },
  { type: 'order', icon: '📦', text: 'Commande #202 — 67.50 DT (En livraison)', time: daysAgo(1), color: '#3498db' },
  { type: 'review', icon: '⭐', text: 'Avis 5/5 — Manteau chien taille M', time: daysAgo(10), color: '#f39c12' },
  { type: 'complaint', icon: '⚠️', text: 'Réclamation: Paiement ou facture', time: daysAgo(3), color: '#e74c3c' },
  { type: 'order', icon: '📦', text: 'Commande #201 — 156.00 DT (Livrée)', time: daysAgo(7), color: '#27ae60' },
  { type: 'invoice', icon: '🧾', text: 'Facture payée — 89.50 DT', time: daysAgo(11), color: '#059669' },
  { type: 'review', icon: '⭐', text: 'Avis 4/5 — Croquettes Premium Chien', time: daysAgo(8), color: '#f39c12' },
  { type: 'complaint', icon: '⚠️', text: 'Réclamation résolue — Produit abîmé', time: daysAgo(20), color: '#94a3b8' },
];

export const DEMO_ADMIN_REVIEWS = DEMO_REVIEWS.map((r, i) => ({
  ...r,
  user: { name: i === 0 ? 'Sami Ben Ali' : 'Ines Trabelsi', email: i === 0 ? 'client@petfood.tn' : 'ines.trabelsi@email.tn' },
}));

export const DEMO_ADMIN_COMPLAINTS = DEMO_COMPLAINTS.map((c, i) => ({
  ...c,
  user: { name: i === 0 ? 'Sami Ben Ali' : 'Ines Trabelsi', email: i === 0 ? 'client@petfood.tn' : 'ines.trabelsi@email.tn' },
}));

export const DEMO_ADMIN_VET_RECORDS = [
  {
    _id: 'vet-rec-1',
    id: 'vet-rec-1',
    petName: 'Max',
    animalType: 'dog',
    ownerId: { _id: 'demo-client-1', email: 'client@petfood.tn', name: 'Sami Ben Ali' },
    diagnosis: 'Contrôle annuel — bon état général',
    treatment: 'Vaccin rage + vermifuge',
    vetNotes: 'Prochain rappel dans 12 mois',
    nextVisit: daysAgo(-30),
    weight: 28,
    temperature: 38.5,
    status: 'active',
  },
  {
    _id: 'vet-rec-2',
    id: 'vet-rec-2',
    petName: 'Mimi',
    animalType: 'cat',
    ownerId: { _id: 'demo-client-2', email: 'ines.trabelsi@email.tn', name: 'Ines Trabelsi' },
    diagnosis: 'Dermatite légère',
    treatment: 'Crème apaisante + croquettes hypoallergéniques',
    vetNotes: 'Amélioration constatée après 2 semaines',
    nextVisit: daysAgo(-14),
    weight: 4.2,
    temperature: 38.2,
    status: 'active',
  },
  {
    _id: 'vet-rec-3',
    id: 'vet-rec-3',
    petName: 'Rex',
    animalType: 'dog',
    ownerId: { _id: 'demo-client-3', email: 'youssef.gharbi@email.tn', name: 'Youssef Gharbi' },
    diagnosis: 'Entorse patte avant',
    treatment: 'Repos + anti-inflammatoire 5 jours',
    vetNotes: 'Suivi réhabilitation terminé',
    nextVisit: null,
    weight: 22,
    temperature: 38.4,
    status: 'completed',
  },
];

export const DEMO_ADMIN_LEAVE_REQUESTS = [
  ...DEMO_LIVREUR_LEAVE_REQUESTS.map((r) => ({ ...r, staffName: 'Karim Mansouri', staffRole: 'livreur' })),
  {
    id: 'leave-vet-1',
    _id: 'leave-vet-1',
    type: 'conge',
    startDate: '2026-08-10',
    endDate: '2026-08-15',
    reason: 'Congrès vétérinaire à Sfax',
    status: 'pending',
    staffName: 'Dr. Amira Khelifi',
    staffRole: 'vet',
  },
  {
    id: 'leave-vet-2',
    _id: 'leave-vet-2',
    type: 'maladie',
    startDate: '2026-04-02',
    endDate: '2026-04-03',
    reason: 'Indisposition — remplacement Dr. Sassi',
    status: 'approved',
    adminNote: 'Validé — bon rétablissement.',
    staffName: 'Dr. Amira Khelifi',
    staffRole: 'vet',
  },
];

export const DEMO_ADMIN_REGIONS = ['Grand Tunis', 'Ariana', 'La Marsa', 'Lac 1', 'Carthage', 'Manouba', 'Tunis', 'Sfax', 'Sousse', 'Nabeul'];

export const DEMO_ADMIN_VENDORS = [
  {
    id: 'v-1',
    userId: 'demo-vendor-1',
    shopName: 'Animalerie Tunis',
    ownerName: 'Leila Mansouri',
    ownerEmail: 'vendor@petfood.tn',
    region: 'Tunis',
    status: 'active',
    productsCount: 42,
    revenue30d: 12480,
    commissionsPaid: 1420,
    commissionsPending: 186,
    commissionRate: 0.12,
    lowStockCount: 2,
    outOfStockCount: 1,
    rank: 1,
    createdAt: daysAgo(180),
  },
  {
    id: 'v-2',
    userId: 'demo-vendor-2',
    shopName: 'Pets & Co Sfax',
    ownerName: 'Ridha Ben Ammar',
    ownerEmail: 'ridha.animalerie@email.tn',
    region: 'Sfax',
    status: 'active',
    productsCount: 28,
    revenue30d: 8920,
    commissionsPaid: 980,
    commissionsPending: 124,
    commissionRate: 0.12,
    lowStockCount: 1,
    outOfStockCount: 0,
    rank: 2,
    createdAt: daysAgo(95),
  },
  {
    id: 'v-3',
    userId: 'demo-vendor-3',
    shopName: 'Boutique Nour Pets',
    ownerName: 'Nour Haddad',
    ownerEmail: 'nour.pets@sousse.tn',
    region: 'Sousse',
    status: 'suspended',
    productsCount: 12,
    revenue30d: 1240,
    commissionsPaid: 210,
    commissionsPending: 0,
    commissionRate: 0.12,
    lowStockCount: 0,
    outOfStockCount: 0,
    rank: 8,
    createdAt: daysAgo(40),
  },
  {
    id: 'v-4',
    userId: null,
    shopName: 'Zoo Market Nabeul',
    ownerName: '—',
    ownerEmail: 'contact@zoomarket.tn',
    region: 'Nabeul',
    status: 'pending',
    productsCount: 0,
    revenue30d: 0,
    commissionsPaid: 0,
    commissionsPending: 0,
    commissionRate: 0.12,
    lowStockCount: 0,
    outOfStockCount: 0,
    rank: null,
    createdAt: daysAgo(2),
  },
];

export const DEMO_MARKETPLACE_STATS = {
  totalVendors: 24,
  activeVendors: 21,
  pendingVendors: 2,
  suspendedVendors: 1,
  totalRevenue30d: 186420,
  totalCommissionsPaid: 22416,
  totalCommissionsPending: 3180,
  avgCommissionRate: 0.12,
  topRegion: 'Tunis',
};

export const DEMO_PARTNERS_OVERVIEW = {
  mode: 'demo',
  counts: {
    supplySuppliers: 3,
    marketplaceVendors: 4,
    shelters: 2,
    relayPoints: 5,
    vetPartners: 8,
    petCareProviders: 3,
    pendingApplications: 1,
  },
  supplySuppliers: [
    { id: 'sup-1', name: 'NutriPet Distribution', category: 'alimentation', region: 'Tunis', leadTimeDays: 5, minOrderDt: 500, rating: 4.8, isActive: true },
    { id: 'sup-2', name: 'MediVet Grossiste', category: 'pharmacie', region: 'Sfax', leadTimeDays: 3, minOrderDt: 200, rating: 4.6, isActive: true },
    { id: 'sup-3', name: 'Accessoires Plus', category: 'accessoires', region: 'Sousse', leadTimeDays: 7, minOrderDt: 150, rating: 4.2, isActive: true },
  ],
  shelters: [
    { id: 'sh1', name: 'Refuge Les Amis à Quatre Pattes', region: 'Tunis', animalsCount: 12, isActive: true },
    { id: 'sh2', name: 'Association Bien-être Animal Sfax', region: 'Sfax', animalsCount: 8, isActive: true },
  ],
  relayPoints: [
    { id: 'relay_anim_1', name: 'Animalerie Les Pattes Heureuses', type: 'pet_shop', region: 'Tunis', isActive: true },
    { id: 'relay_vet_1', name: 'Clinique Vétérinaire Carthage', type: 'vet_clinic', region: 'Tunis', isActive: true },
    { id: 'relay_anim_3', name: 'Animalerie Sfax Centre', type: 'pet_shop', region: 'Sfax', isActive: true },
  ],
  vetPartners: [
    { id: 'demo-vet-1', name: 'Dr. Amira Khelifi', region: 'Tunis', clinic: 'Clinique VetCare', isActive: true },
    { id: 'demo-vet-2', name: 'Dr. Hichem Sassi', region: 'Sousse', clinic: 'Carthage Vétérinaire', isActive: true },
  ],
  petCareProviders: [
    { id: 'pc-1', displayName: 'Toilettage Royal', types: 'grooming', region: 'Tunis', certified: true, isActive: true },
    { id: 'pc-2', displayName: 'Promenade & Co', types: 'walking', region: 'Ariana', certified: false, isActive: true },
  ],
  marketplaceVendors: DEMO_ADMIN_VENDORS,
};

export const DEMO_ADMIN_ANALYTICS = {
  alertCounts: { total: 4, high: 1, pharmacy: 2, incident: 0 },
  alerts: [
    {
      id: 'alert-1',
      type: 'stock',
      severity: 'high',
      title: 'Stock critique — Antiparasitaire chat',
      message: 'Il reste 3 unités. Réapprovisionnement recommandé sous 48h.',
      link: '/admin/products',
    },
    {
      id: 'alert-2',
      type: 'pharmacy',
      severity: 'medium',
      title: 'Ordonnance en attente de validation',
      message: '2 ordonnances vétérinaires à valider avant retrait client.',
      link: '/admin/veterinary',
    },
    {
      id: 'alert-3',
      type: 'pharmacy',
      severity: 'low',
      title: 'Lot vaccin — date limite proche',
      message: 'Lot VAC-2026-04 expire dans 15 jours.',
      link: '/admin/veterinary',
    },
    {
      id: 'alert-4',
      type: 'orders',
      severity: 'medium',
      title: '3 commandes en attente > 24h',
      message: 'Zone Grand Tunis — assigner un livreur disponible.',
      link: '/admin/orders',
    },
  ],
  powerBi: {
    embedUrl: '',
    setupSteps: [
      'Exporter les CSV depuis la section Exports ci-dessous',
      'Dans Power BI Desktop : Obtenir des données → Texte/CSV',
      'Actualiser quotidiennement via l\'API /analytics/export/{table}',
      'Publier sur Power BI Service et copier l\'URL d\'intégration',
    ],
  },
  quickLinks: [
    { path: '/admin/orders', label: 'Commandes' },
    { path: '/admin/invoices', label: 'Factures' },
    { path: '/admin/users', label: 'Utilisateurs' },
  ],
  kpiSummary: {
    revenueMonth: 1240,
    ordersMonth: 47,
    activeClients: 128,
    avgOrderValue: 68.5,
    deliveryOnTime: 94,
    pendingInvoices: 2,
  },
};

export const DEMO_ADMIN_DATASETS = {
  datasets: [
    { id: 'orders', label: 'Commandes' },
    { id: 'invoices', label: 'Factures' },
    { id: 'users', label: 'Utilisateurs' },
    { id: 'reviews', label: 'Avis' },
    { id: 'complaints', label: 'Réclamations' },
  ],
};

export const DEMO_PLATFORM_PERFORMANCE = {
  collectedAt: new Date().toISOString(),
  mode: 'demo',
  health: 'healthy',
  score: 92,
  uptime: { seconds: 86400, formatted: '1j 0h 12m', startedAt: daysAgo(1) },
  server: {
    nodeVersion: 'v20.x',
    platform: 'win32',
    cpus: 8,
    loadAvg: [0.42, 0.38, 0.35],
    memory: {
      heapUsedMb: 128,
      heapTotalMb: 192,
      rssMb: 210,
      systemFreeMb: 4096,
      systemTotalMb: 16384,
      usagePercent: 42,
    },
  },
  api: {
    totalRequests: 1842,
    avgMs: 48,
    p95Ms: 124,
    errorRate: 0.8,
    errors4xx: 12,
    errors5xx: 2,
    requestsLast5m: 34,
    requestSeries: [
      { label: '09:00', count: 28 },
      { label: '09:05', count: 31 },
      { label: '09:10', count: 36 },
      { label: '09:15', count: 34 },
      { label: '09:20', count: 42 },
    ],
    latencySeries: [
      { label: '1', ms: 42 },
      { label: '2', ms: 55 },
      { label: '3', ms: 38 },
      { label: '4', ms: 61 },
      { label: '5', ms: 47 },
    ],
    slowest: [
      { method: 'GET', path: '/api/analytics/hub', status: 200, ms: 186 },
      { method: 'GET', path: '/api/orders', status: 200, ms: 142 },
    ],
  },
  database: { ok: true, mode: 'demo', latencyMs: 3 },
  realtime: {
    socketConnections: 6,
    ordersToday: 8,
    pendingOrders: 3,
    activeDeliveries: 2,
    lowStockProducts: 4,
    pendingComplaints: 2,
  },
  security: {
    idsEnabled: true,
    eventsLast24h: 4,
    bySeverity: { medium: 2, low: 2 },
    monitoredIps: 12,
  },
  ml: { ok: true, service: 'python_ml' },
  entities: {
    users: 142,
    orders: 318,
    products: 86,
    complaints: 12,
    activeUsers24h: 38,
  },
};

export const DEMO_ADMIN_MESSAGE_PARTNERS = DEMO_ADMIN_USERS.filter((u) => u.role !== 'admin');

export const buildDemoAdminMessages = (adminId = 'demo-admin-1') => [
  {
    _id: 'adm-msg-1',
    senderId: 'demo-client-1',
    receiverId: adminId,
    senderType: 'client',
    message: 'Bonjour, pouvez-vous confirmer le délai de livraison pour ma commande #202 ?',
    createdAt: hoursAgo(2),
    isRead: false,
  },
  {
    _id: 'adm-msg-2',
    senderId: adminId,
    receiverId: 'demo-client-1',
    senderType: 'admin',
    message: 'Bonjour M. Ben Ali, votre commande est en livraison — arrivée estimée ce soir 18h-19h.',
    createdAt: hoursAgo(1.5),
    isRead: true,
  },
  {
    _id: 'adm-msg-3',
    senderId: 'demo-livreur-1',
    receiverId: adminId,
    senderType: 'livreur',
    message: 'Client injoignable sur commande #102 — puis-je laisser le colis au gardien ?',
    createdAt: hoursAgo(4),
    isRead: true,
  },
  {
    _id: 'adm-msg-4',
    senderId: adminId,
    receiverId: 'demo-livreur-1',
    senderType: 'admin',
    message: 'Oui, avec photo de preuve et SMS au client. Merci Karim.',
    createdAt: hoursAgo(3.5),
    isRead: true,
  },
  {
    _id: 'adm-msg-5',
    senderId: 'demo-client-2',
    receiverId: adminId,
    senderType: 'client',
    message: 'Facture en double sur ma dernière commande — merci de vérifier svp.',
    createdAt: daysAgo(1),
    isRead: true,
  },
  {
    _id: 'adm-msg-6',
    senderId: 'demo-vet-1',
    receiverId: adminId,
    senderType: 'vet',
    message: 'Demande congés du 10 au 15 août pour congrès — couverture assurée par Dr. Sassi.',
    createdAt: daysAgo(2),
    isRead: true,
  },
];

export const withDemoStats = (data) => {
  if (data?.totalOrders > 0 || data?.totalRevenue > 0) return data;
  return DEMO_ADMIN_STATS;
};

export const withDemoUserStats = (data) => {
  if (data?.count > 0) return data;
  return DEMO_ADMIN_USER_STATS;
};

export const buildDemoHistoryEntries = () => {
  const entries = [
    ...DEMO_ADMIN_ORDERS.map((order) => ({
      id: `order-${order._id}`,
      date: order.createdAt,
      title: `Commande #${String(order._id).slice(-6)}`,
      description: `${order.user?.email || 'client@petfood.tn'} — ${order.total} DT — ${order.status}`,
      type: 'order',
    })),
    ...DEMO_ADMIN_INVOICES.map((invoice) => ({
      id: `invoice-${invoice._id}`,
      date: invoice.issuedAt,
      title: `Facture #${String(invoice._id).slice(-6)}`,
      description: `${invoice.userId?.email || 'client'} — ${invoice.amount} DT — ${invoice.status}`,
      type: 'invoice',
    })),
    ...DEMO_ADMIN_REVIEWS.map((review) => ({
      id: `review-${review._id}`,
      date: review.createdAt,
      title: `Avis sur ${review.productId?.name || 'produit'}`,
      description: `${review.user?.email || 'client'} — note ${review.rating}/5`,
      type: 'review',
    })),
    ...DEMO_ADMIN_COMPLAINTS.map((complaint) => ({
      id: `complaint-${complaint._id}`,
      date: complaint.createdAt,
      title: `Réclamation: ${complaint.subject}`,
      description: `${complaint.user?.email || 'client'} — ${complaint.status}`,
      type: 'complaint',
    })),
  ];
  return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const DEMO_ADMIN_STOCK = [
  { id: 'stk-1', name: 'Croquettes Premium Chien 12 kg', sku: 'CRO-CH-12', stock: 4, minStock: 15, maxStock: 80, reorderQty: 40, velocityPerDay: 2.1, category: 'nourriture', location: 'Entrepôt A' },
  { id: 'stk-2', name: 'Antiparasitaire chat spot-on', sku: 'ANT-CH-01', stock: 0, minStock: 10, maxStock: 50, reorderQty: 25, velocityPerDay: 1.8, category: 'santé', location: 'Pharmacie' },
  { id: 'stk-3', name: 'Litière agglomérante 10 L', sku: 'LIT-10L', stock: 22, minStock: 12, maxStock: 60, reorderQty: 30, velocityPerDay: 0.9, category: 'hygiène', location: 'Entrepôt B' },
  { id: 'stk-4', name: 'Manteau chien taille M', sku: 'MAN-M', stock: 7, minStock: 8, maxStock: 30, reorderQty: 15, velocityPerDay: 0.4, category: 'accessoire', location: 'Boutique' },
  { id: 'stk-5', name: 'Jouet interactif chat', sku: 'JOU-CH', stock: 45, minStock: 10, maxStock: 100, reorderQty: 20, velocityPerDay: 1.2, category: 'jouet', location: 'Entrepôt A' },
  { id: 'stk-6', name: 'Shampoing dermatologique', sku: 'SHA-DER', stock: 3, minStock: 6, maxStock: 24, reorderQty: 12, velocityPerDay: 0.6, category: 'santé', location: 'Pharmacie' },
];

export const DEMO_ADMIN_STOCK_MOVEMENTS = [
  { id: 'mv-1', productName: 'Croquettes Premium Chien 12 kg', type: 'sortie', qty: -2, reason: 'Commande #202', date: hoursAgo(5), user: 'Système' },
  { id: 'mv-2', productName: 'Antiparasitaire chat spot-on', type: 'sortie', qty: -1, reason: 'Commande #201', date: daysAgo(1), user: 'Système' },
  { id: 'mv-3', productName: 'Litière agglomérante 10 L', type: 'entrée', qty: 20, reason: 'Réapprovisionnement fournisseur', date: daysAgo(3), user: 'Ghassen Admin' },
  { id: 'mv-4', productName: 'Shampoing dermatologique', type: 'ajustement', qty: -2, reason: 'Inventaire — casse', date: daysAgo(7), user: 'Ghassen Admin' },
];

export const DEMO_ADMIN_STOCK_ALERTS = DEMO_ADMIN_STOCK
  .filter((p) => p.stock <= p.minStock)
  .map((p) => ({
    productId: p.id,
    name: p.name,
    stock: p.stock,
    minStock: p.minStock,
    severity: p.stock <= 0 ? 'critical' : 'warning',
    daysOfStock: p.velocityPerDay > 0 ? Math.round(p.stock / p.velocityPerDay) : 0,
    reorderSuggested: p.reorderQty,
    message: p.stock <= 0 ? 'Rupture de stock — réappro urgent' : `Stock bas (${p.stock} / min ${p.minStock})`,
  }));

export const DEMO_ADMIN_TOP_PRODUCTS = [
  { id: 'tp-1', name: 'Croquettes Premium Chien 12 kg', units: 48, revenue: 1920, trend: '+12%' },
  { id: 'tp-2', name: 'Litière agglomérante 10 L', units: 36, revenue: 540, trend: '+8%' },
  { id: 'tp-3', name: 'Antiparasitaire chat spot-on', units: 31, revenue: 465, trend: '+22%' },
  { id: 'tp-4', name: 'Manteau chien taille M', units: 18, revenue: 810, trend: '-3%' },
  { id: 'tp-5', name: 'Jouet interactif chat', units: 15, revenue: 225, trend: '+5%' },
];

export const DEMO_ADMIN_SALES_KPI = {
  revenueToday: 156.5,
  revenueWeek: 892.4,
  revenueMonth: 3240.8,
  ordersToday: 3,
  ordersWeek: 18,
  avgBasket: 68.5,
  conversionRate: 4.2,
  topCategory: 'Nourriture',
};

export const DEMO_ADMIN_COUPONS = [
  { id: 'cp-1', code: 'PETFOOD10', label: '10 % sur commande', type: 'percent', value: 10, minOrder: 50, maxUses: 200, usedCount: 47, active: true, expiresAt: '2026-12-31' },
  { id: 'cp-2', code: 'WELCOME20', label: 'Bienvenue -20 DT', type: 'fixed', value: 20, minOrder: 80, maxUses: 500, usedCount: 128, active: true, expiresAt: '2026-09-30' },
  { id: 'cp-3', code: 'CHAT15', label: '15 % produits chat', type: 'percent', value: 15, minOrder: 40, maxUses: 100, usedCount: 22, active: true, expiresAt: '2026-08-15' },
  { id: 'cp-4', code: 'ETE2025', label: 'Promo été (expirée)', type: 'percent', value: 25, minOrder: 60, maxUses: 50, usedCount: 50, active: false, expiresAt: '2025-08-31' },
];

export const mergeAdminStock = (apiItems) => {
  if (Array.isArray(apiItems) && apiItems.length > 0) {
    return apiItems.map((p) => ({
      id: p._id || p.id,
      name: p.name,
      sku: p.sku || `SKU-${String(p._id || p.id).slice(-4)}`,
      stock: p.stock ?? 0,
      minStock: p.minStock ?? 10,
      maxStock: p.maxStock ?? 100,
      reorderQty: p.reorderQty ?? 20,
      velocityPerDay: p.velocityPerDay ?? 1,
      category: p.category || '—',
      location: p.location || 'Entrepôt',
    }));
  }
  return DEMO_ADMIN_STOCK;
};

export const buildStockAlerts = (items) => {
  const list = items?.length ? items : DEMO_ADMIN_STOCK;
  return list
    .filter((p) => p.stock <= p.minStock)
    .map((p) => ({
      productId: p.id,
      name: p.name,
      stock: p.stock,
      minStock: p.minStock,
      severity: p.stock <= 0 ? 'critical' : 'warning',
      daysOfStock: p.velocityPerDay > 0 ? Math.round(p.stock / p.velocityPerDay) : 0,
      reorderSuggested: p.reorderQty,
      message: p.stock <= 0 ? 'Rupture de stock' : `Stock bas (${p.stock}/${p.minStock})`,
    }));
};

/** Configuration système plateforme (démo admin). */
export const DEMO_SYSTEM_CONFIG = {
  platformName: 'PetfoodTN',
  platformTagline: 'Nutrition & soins pour vos compagnons',
  defaultLanguage: 'fr',
  timezone: 'Africa/Tunis',
  maintenanceMode: false,
  maintenanceMessage: '',
  vendorCommissionRate: 12,
  autoModerationNlpThreshold: 0.85,
  maxProductsPerVendor: 200,
  minVendorRating: 3,
  emailNotificationsEnabled: true,
  smsNotificationsEnabled: false,
  pushNotificationsEnabled: true,
  sessionTimeoutMinutes: 60,
  maxLoginAttempts: 5,
  requireEmailVerification: true,
  defaultCurrency: 'DT',
  supportEmail: 'support@petfoodtn.tn',
  supportPhone: '+216 71 000 000',
  allowVendorSelfRegistration: false,
  allowClientSelfRegistration: true,
  allowGuestBrowsing: true,
  requireModeratorApproval: true,
  autoApproveVendors: false,
  freeShippingThreshold: 150,
  maxOrderAmount: 5000,
  defaultDeliveryDays: 3,
  logRetentionDays: 90,
  backupEnabled: true,
  apiVersion: 'v1',
  groqAssistantEnabled: true,
  nlpModelsEnabled: true,
  iotFeaturesEnabled: true,
  cookieConsentRequired: true,
  antivirusScanEnabled: true,
  blockThreatsAutomatically: true,
  updatedAt: daysAgo(2),
};

/** Journal d'activité démo — tous les acteurs. */
export const DEMO_ACTIVITY_LOGS = [
  { id: 'log-1', at: hoursAgo(0), actorRole: 'admin', actorName: 'Ghassen Admin', action: 'config_update', target: 'Commission vendeur', details: 'Taux 12 %', module: 'admin' },
  { id: 'log-2', at: hoursAgo(1), actorRole: 'moderator', actorName: 'Nour Modération', action: 'approve_product', target: 'Croquettes chiot premium 8 kg', module: 'moderation' },
  { id: 'log-3', at: hoursAgo(2), actorRole: 'vendor', actorName: 'Leila Mansouri', action: 'create_product', target: 'Jouet interactif chat', module: 'vendor' },
  { id: 'log-4', at: hoursAgo(3), actorRole: 'moderator', actorName: 'Nour Modération', action: 'suspend_user', target: 'Youssef Gharbi', module: 'moderation' },
  { id: 'log-5', at: hoursAgo(4), actorRole: 'client', actorName: 'Amira B.', action: 'place_order', target: 'CMD-9102', details: '89 DT', module: 'boutique' },
  { id: 'log-6', at: hoursAgo(5), actorRole: 'livreur', actorName: 'Karim Mansouri', action: 'delivery_complete', target: 'CMD-9085', module: 'livraison' },
  { id: 'log-7', at: hoursAgo(6), actorRole: 'vet', actorName: 'Dr. Amira Khelifi', action: 'appointment_confirm', target: 'RDV Luna', module: 'sante' },
  { id: 'log-8', at: hoursAgo(8), actorRole: 'admin', actorName: 'Ghassen Admin', action: 'vendor_approve', target: 'Pets & Co Sfax', module: 'admin' },
  { id: 'log-9', at: hoursAgo(10), actorRole: 'moderator', actorName: 'Nour Modération', action: 'reject_review', target: 'Avis spam #fr-1', module: 'moderation' },
  { id: 'log-10', at: hoursAgo(12), actorRole: 'vendor', actorName: 'Ridha Ben Ammar', action: 'update_stock', target: 'Pâtée chat saumon', details: 'Stock 3 → 15', module: 'vendor' },
  { id: 'log-11', at: daysAgo(1), actorRole: 'admin', actorName: 'Ghassen Admin', action: 'moderator_create', target: 'moderator@petfood.tn', module: 'admin' },
  { id: 'log-12', at: daysAgo(1), actorRole: 'client', actorName: 'Karim M.', action: 'submit_complaint', target: 'Produit endommagé', module: 'boutique' },
  { id: 'log-13', at: daysAgo(2), actorRole: 'moderator', actorName: 'Nour Modération', action: 'resolve_dispute', target: 'CMD-8755', module: 'moderation' },
  { id: 'log-14', at: daysAgo(2), actorRole: 'vendor', actorName: 'Leila Mansouri', action: 'accept_order', target: 'CMD-9098', module: 'vendor' },
  { id: 'log-15', at: daysAgo(3), actorRole: 'system', actorName: 'Système NLP', action: 'fake_review_detected', target: 'Croquettes premium', details: 'Spam 94 %', module: 'moderation' },
  { id: 'log-16', at: daysAgo(4), actorRole: 'livreur', actorName: 'Mohamed B.', action: 'route_start', target: 'Tournée Grand Tunis', module: 'livraison' },
  { id: 'log-17', at: daysAgo(5), actorRole: 'admin', actorName: 'Ghassen Admin', action: 'vendor_suspend', target: 'Boutique Nour Pets', module: 'admin' },
  { id: 'log-18', at: daysAgo(6), actorRole: 'vet', actorName: 'Dr. Hichem Sassi', action: 'prescription_issue', target: 'Max — antibiotique', module: 'sante' },
];

/** Configuration espace visiteur (admin uniquement). */
export const DEMO_VISITOR_ADMIN_CONFIG = {
  hubEnabled: true,
  productsPublic: true,
  toolsPublic: true,
  infoPublic: true,
  allowGuestCheckout: false,
  showRegistrationCta: true,
  showVendorCta: true,
  showModeratorCta: false,
  maintenanceMessage: '',
  maxProductsPreview: 50,
  updatedAt: daysAgo(1),
};

export const DEMO_VISITOR_STATS = {
  dailyVisitors: 1240,
  weeklyVisitors: 8650,
  productViews: 34200,
  toolUses: 1890,
  registrationConversions: 4.2,
  topPages: [
    { path: '/visitor/products', label: 'Catalogue produits', views: 12800 },
    { path: '/visitor/tools', label: 'Outils nutrition', views: 5200 },
    { path: '/visitor/info', label: 'Infos & FAQ', views: 4100 },
    { path: '/visitor', label: 'Hub visiteur', views: 12100 },
  ],
};

