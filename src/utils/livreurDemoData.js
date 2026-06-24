/** Données de démonstration lorsque l'API renvoie des listes vides (espace livreur). */

import { allowDemoFallback } from '../config/liveDataPolicy';
import { withDemoFallback } from './liveDataResolver';

export const COMMISSION_PER_DELIVERY = 5;

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();

export const getLivreurCommission = (order) =>
  order?.commission ?? COMMISSION_PER_DELIVERY;

const buildDailyChart = () => {
  const counts = [3, 5, 2, 4, 6, 3, 4];
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const count = counts[i];
    return {
      label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      count,
      commission: count * COMMISSION_PER_DELIVERY,
    };
  });
};

/** Normalise les séries API (clés variables) pour Recharts. */
export const normalizeLivreurDailyChart = (series) => {
  if (!Array.isArray(series) || series.length === 0) {
    return allowDemoFallback() ? buildDailyChart() : [];
  }

  const normalized = series.map((d, i) => {
    const count = Number(
      d?.count ?? d?.deliveries ?? d?.total ?? d?.value ?? d?.primary ?? 0,
    );
    const commission = Number(
      d?.commission ?? d?.earnings ?? d?.gains ?? d?.secondary
        ?? count * COMMISSION_PER_DELIVERY,
    );
    let label = d?.label ?? d?.name ?? d?.day ?? d?.date;
    if (!label && d?.at) {
      label = new Date(d.at).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    }
    if (!label) {
      const d0 = new Date();
      d0.setDate(d0.getDate() - (series.length - 1 - i));
      label = d0.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    }
    return { label: String(label), count, commission };
  });

  const hasActivity = normalized.some((d) => d.count > 0 || d.commission > 0);
  if (!hasActivity && !allowDemoFallback()) return normalized;
  return hasActivity ? normalized : buildDailyChart();
};

export const LIVREUR_STATUS_LABELS = {
  pending: 'En attente',
  shipped: 'En cours',
  delivered: 'Livrées',
  cancelled: 'Annulées',
  paid: 'Payées',
};

const STATUS_COLOR_MAP = {
  pending: '#f39c12',
  shipped: '#3498db',
  delivered: '#27ae60',
  cancelled: '#e74c3c',
  paid: '#059669',
};

const DEFAULT_STATUS_BREAKDOWN = {
  pending: 2,
  shipped: 3,
  delivered: 47,
  cancelled: 3,
  paid: 12,
};

/** Données camembert — objet API, tableau ou fallback démo. */
export const normalizeLivreurStatusBreakdown = (breakdown) => {
  const base = DEFAULT_STATUS_BREAKDOWN;
  let raw = { ...base };

  if (Array.isArray(breakdown) && breakdown.length > 0) {
    raw = {};
    breakdown.forEach((row) => {
      const key = String(row.status || row.key || row.name || '').toLowerCase();
      const val = Number(row.count ?? row.value ?? row.total ?? 0);
      if (key) raw[key] = (raw[key] || 0) + val;
    });
  } else if (breakdown && typeof breakdown === 'object' && Object.keys(breakdown).length > 0) {
    raw = breakdown;
  }

  const hasValues = Object.values(raw).some((v) => Number(v) > 0);
  if (!hasValues) raw = base;

  const pie = Object.entries(raw)
    .map(([key, value]) => ({
      key,
      name: LIVREUR_STATUS_LABELS[key] || key,
      value: Number(value) || 0,
      color: STATUS_COLOR_MAP[key] || '#94a3b8',
    }))
    .filter((d) => d.value > 0);

  if (pie.length > 0) return pie;

  if (!allowDemoFallback()) return [];

  return [
    { key: 'delivered', name: LIVREUR_STATUS_LABELS.delivered, value: base.delivered || 1, color: STATUS_COLOR_MAP.delivered },
    { key: 'shipped', name: LIVREUR_STATUS_LABELS.shipped, value: base.shipped || 1, color: STATUS_COLOR_MAP.shipped },
  ];
};

const item = (name, qty, price) => ({
  quantity: qty,
  price,
  productId: { name },
});

export const DEMO_LIVREUR_ORDERS = [
  {
    _id: 'liv-order-101',
    id: 'liv-order-101',
    status: 'shipped',
    total: 67.5,
    commission: COMMISSION_PER_DELIVERY,
    region: 'La Marsa',
    address: '12 Rue de la Liberté, La Marsa',
    phone: '+216 22 111 222',
    paymentMethod: 'wallet',
    createdAt: hoursAgo(2),
    deliveryNote: 'Sonnette 2B — laisser devant la porte si absent',
    urgent: true,
    deliveryWindowEnd: new Date(Date.now() + 3600000).toISOString(),
    deliveryLocation: { lat: 36.8781, lng: 10.3252 },
    items: [item('Croquettes Premium Chien 12 kg', 1, 54.9), item('Friandises dentaires', 1, 12.6)],
  },
  {
    _id: 'liv-order-102',
    id: 'liv-order-102',
    status: 'pending',
    total: 42.0,
    commission: COMMISSION_PER_DELIVERY,
    region: 'Ariana',
    address: '45 Av. Habib Bourguiba, Ariana',
    phone: '+216 98 333 444',
    paymentMethod: 'stripe',
    createdAt: hoursAgo(4),
    deliveryWindowEnd: new Date(Date.now() + 7200000).toISOString(),
    deliveryLocation: { lat: 36.8625, lng: 10.1956 },
    items: [item('Pâtée chat saumon 400 g', 2, 21.0)],
  },
  {
    _id: 'liv-order-103',
    id: 'liv-order-103',
    status: 'pending',
    total: 89.9,
    commission: COMMISSION_PER_DELIVERY,
    region: 'Lac 1',
    address: 'Immeuble Les Palmiers, Lac 1',
    phone: '+216 55 777 888',
    paymentMethod: 'cash',
    createdAt: hoursAgo(5),
    deliveryLocation: { lat: 36.8322, lng: 10.2422 },
    items: [item('Litière agglomérante 10 L', 1, 29.9), item('Arbre à chat', 1, 60.0)],
  },
  {
    _id: 'liv-order-104',
    id: 'liv-order-104',
    status: 'delivered',
    total: 54.9,
    commission: COMMISSION_PER_DELIVERY,
    region: 'Carthage',
    address: '7 Rue Hannibal, Carthage Byrsa',
    phone: '+216 20 999 111',
    paymentMethod: 'wallet',
    createdAt: daysAgo(1),
    deliveredAt: daysAgo(1),
    deliveryLocation: { lat: 36.8528, lng: 10.3233 },
    items: [item('Croquettes Premium Chien 12 kg', 1, 54.9)],
  },
  {
    _id: 'liv-order-105',
    id: 'liv-order-105',
    status: 'delivered',
    total: 34.6,
    commission: COMMISSION_PER_DELIVERY,
    region: 'La Marsa',
    address: '3 Rue du Phare, La Marsa Plage',
    phone: '+216 27 456 789',
    paymentMethod: 'stripe',
    createdAt: daysAgo(2),
    deliveredAt: daysAgo(2),
    deliveryLocation: { lat: 36.8855, lng: 10.3301 },
    items: [item('Manteau chien taille M', 1, 34.6)],
  },
  {
    _id: 'liv-order-106',
    id: 'liv-order-106',
    status: 'delivered',
    total: 78.0,
    commission: COMMISSION_PER_DELIVERY,
    region: 'Manouba',
    address: 'Zone industrielle, Manouba',
    phone: '+216 50 123 456',
    paymentMethod: 'cash',
    createdAt: daysAgo(3),
    deliveredAt: daysAgo(3),
    deliveryLocation: { lat: 36.8081, lng: 10.0972 },
    items: [item('Nourriture chiot 8 kg', 1, 48.0), item('Gamelle inox', 2, 15.0)],
  },
  {
    _id: 'liv-order-107',
    id: 'liv-order-107',
    status: 'delivered',
    total: 25.5,
    commission: COMMISSION_PER_DELIVERY,
    region: 'Ariana',
    address: 'Résidence Ennasr, Bloc C',
    phone: '+216 93 222 333',
    paymentMethod: 'wallet',
    createdAt: daysAgo(5),
    deliveredAt: daysAgo(5),
    deliveryLocation: { lat: 36.869, lng: 10.164 },
    items: [item('Lait pour chaton 200 ml', 3, 8.5)],
  },
  {
    _id: 'liv-order-108',
    id: 'liv-order-108',
    status: 'cancelled',
    total: 120.0,
    commission: 0,
    region: 'La Marsa',
    address: 'Av. de la République, La Marsa',
    phone: '+216 21 888 999',
    paymentMethod: 'stripe',
    createdAt: daysAgo(4),
    items: [item('Cage transport chat', 1, 120.0)],
  },
];

export const DEMO_LIVREUR_STATS = {
  region: 'Grand Tunis',
  commissionPerDelivery: COMMISSION_PER_DELIVERY,
  totalDelivered: 47,
  totalCommission: 47 * COMMISSION_PER_DELIVERY,
  weekDelivered: 12,
  weekCommission: 12 * COMMISSION_PER_DELIVERY,
  avgDeliveryMinutes: 28,
  onTimeRate: 94,
  statusBreakdown: { ...DEFAULT_STATUS_BREAKDOWN },
  dailyChart: buildDailyChart(),
};

export const DEMO_LIVREUR_DASHBOARD = {
  livreur: {
    name: 'Karim Mansouri',
    region: 'Grand Tunis',
    isAvailable: true,
  },
  stats: {
    todayDeliveries: 3,
    todayEarnings: 15,
    activeDeliveries: 1,
    pendingPool: 2,
  },
  alerts: [
    {
      level: 'info',
      message: 'Pic de commandes prévu entre 17h et 19h dans la zone La Marsa.',
    },
    {
      level: 'warning',
      message: 'Commande #102 — client joignable uniquement par SMS avant 18h.',
    },
  ],
  pool: DEMO_LIVREUR_ORDERS.filter((o) => o.status === 'pending'),
  active: DEMO_LIVREUR_ORDERS.filter((o) => o.status === 'shipped'),
};

export const DEMO_LIVREUR_ROUTE = {
  summary: {
    stopCount: 3,
    estimatedKm: 14.2,
    estimatedMinutes: 52,
  },
  stops: [
    { order: DEMO_LIVREUR_ORDERS[0], sequence: 1, etaMinutes: 12 },
    { order: DEMO_LIVREUR_ORDERS[1], sequence: 2, etaMinutes: 28 },
    { order: DEMO_LIVREUR_ORDERS[2], sequence: 3, etaMinutes: 45 },
  ],
};

export const DEMO_LIVREUR_LEAVE_REQUESTS = [
  {
    id: 'leave-liv-1',
    _id: 'leave-liv-1',
    type: 'conge',
    startDate: '2026-07-01',
    endDate: '2026-07-05',
    reason: 'Vacances familiales — couverture assurée par Mohamed B.',
    status: 'approved',
    adminNote: 'Validé — bonnes vacances !',
  },
  {
    id: 'leave-liv-2',
    _id: 'leave-liv-2',
    type: 'maladie',
    startDate: '2026-03-12',
    endDate: '2026-03-14',
    reason: 'Grippe — certificat médical transmis par e-mail.',
    status: 'approved',
    adminNote: 'Repos bienvenu, reprenez quand vous êtes prêt.',
  },
  {
    id: 'leave-liv-3',
    _id: 'leave-liv-3',
    type: 'conge',
    startDate: '2026-06-20',
    endDate: '2026-06-21',
    reason: 'Mariage d\'un proche à Sousse.',
    status: 'pending',
  },
];

export const DEMO_LIVREUR_MESSAGE_PARTNERS = [
  { id: 'demo_admin', _id: 'demo_admin', name: 'Administration PetfoodTN', role: 'admin' },
  { id: 'demo-client-1', _id: 'demo-client-1', name: 'Sami Ben Ali', role: 'client', region: 'La Marsa' },
  { id: 'demo-client-2', _id: 'demo-client-2', name: 'Ines Trabelsi', role: 'client', region: 'Ariana' },
  { id: 'demo-client-3', _id: 'demo-client-3', name: 'Youssef Gharbi', role: 'client', region: 'Lac 1' },
];

export const buildDemoLivreurMessages = (livreurId = 'livreur-demo') => [
  {
    _id: 'liv-msg-1',
    senderId: 'demo_admin',
    receiverId: livreurId,
    senderType: 'admin',
    message: 'Bonjour Karim, 3 nouvelles commandes sont disponibles dans votre zone. La #102 est prioritaire (client absent après 18h).',
    createdAt: hoursAgo(3),
    isRead: true,
  },
  {
    _id: 'liv-msg-2',
    senderId: livreurId,
    receiverId: 'demo_admin',
    senderType: 'livreur',
    message: 'Bien reçu, je prends la #102 en premier. Je signale si problème d\'accès.',
    createdAt: hoursAgo(2.8),
    isRead: true,
  },
  {
    _id: 'liv-msg-3',
    senderId: 'demo_admin',
    receiverId: livreurId,
    senderType: 'admin',
    message: 'Parfait. Pensez à activer le GPS pendant la tournée pour le suivi client.',
    createdAt: hoursAgo(2.5),
    isRead: true,
  },
  {
    _id: 'liv-msg-4',
    senderId: 'demo-client-1',
    receiverId: livreurId,
    senderType: 'client',
    message: 'Bonjour, est-ce que ma commande #101 arrive avant 19h ? Je serai au travail après.',
    createdAt: hoursAgo(1.5),
    isRead: false,
  },
  {
    _id: 'liv-msg-5',
    senderId: livreurId,
    receiverId: 'demo-client-1',
    senderType: 'livreur',
    message: 'Bonjour M. Ben Ali, oui je suis en route — arrivée estimée 18h15. Je peux déposer devant la porte (sonnette 2B).',
    createdAt: hoursAgo(1.2),
    isRead: true,
  },
  {
    _id: 'liv-msg-6',
    senderId: 'demo-client-1',
    receiverId: livreurId,
    senderType: 'client',
    message: 'Parfait merci ! Laissez devant la porte si je ne réponds pas.',
    createdAt: hoursAgo(1),
    isRead: true,
  },
  {
    _id: 'liv-msg-7',
    senderId: 'demo-client-2',
    receiverId: livreurId,
    senderType: 'client',
    message: 'Bonjour, l\'adresse est bien Immeuble Ennasr bloc C, 3ème étage. Code porte 4521.',
    createdAt: hoursAgo(4),
    isRead: true,
  },
  {
    _id: 'liv-msg-8',
    senderId: livreurId,
    receiverId: 'demo-client-2',
    senderType: 'livreur',
    message: 'Merci pour la précision, je note le code. Livraison prévue demain matin.',
    createdAt: hoursAgo(3.5),
    isRead: true,
  },
  {
    _id: 'liv-msg-9',
    senderId: 'demo-client-3',
    receiverId: livreurId,
    senderType: 'client',
    message: 'Le chat est craintif — sonnez doucement svp 😺',
    createdAt: hoursAgo(6),
    isRead: true,
  },
];

export { withDemoFallback };

export const withDemoStats = (data) => {
  if (!allowDemoFallback()) {
    if (!data) {
      return { dailyChart: [], statusPie: [], statusBreakdown: {} };
    }
    const dailyChart = normalizeLivreurDailyChart(data.dailyChart);
    const statusPie = normalizeLivreurStatusBreakdown(data.statusBreakdown);
    return {
      ...data,
      dailyChart,
      statusPie,
      statusBreakdown: Object.fromEntries(statusPie.map((d) => [d.key, d.value])),
    };
  }

  const base = DEMO_LIVREUR_STATS;
  if (!data) {
    return {
      ...base,
      statusPie: normalizeLivreurStatusBreakdown(base.statusBreakdown),
    };
  }

  const dailyChart = normalizeLivreurDailyChart(data.dailyChart);
  const statusPie = normalizeLivreurStatusBreakdown(data.statusBreakdown);
  const statusBreakdown = Object.fromEntries(statusPie.map((d) => [d.key, d.value]));

  return {
    ...base,
    ...data,
    dailyChart,
    statusPie,
    statusBreakdown,
    totalDelivered: data.totalDelivered ?? base.totalDelivered,
    totalCommission: data.totalCommission ?? base.totalCommission,
    weekDelivered: data.weekDelivered ?? base.weekDelivered,
    weekCommission: data.weekCommission ?? base.weekCommission,
    onTimeRate: data.onTimeRate ?? base.onTimeRate,
    avgDeliveryMinutes: data.avgDeliveryMinutes ?? base.avgDeliveryMinutes,
    commissionPerDelivery: data.commissionPerDelivery ?? base.commissionPerDelivery,
  };
};

export const withDemoDashboard = (data) => {
  if (data?.stats && (data.pool?.length || data.active?.length || data.stats.todayDeliveries > 0)) {
    return data;
  }
  return allowDemoFallback() ? DEMO_LIVREUR_DASHBOARD : (data || { stats: {}, pool: [], active: [] });
};

export const withDemoRoute = (data) => {
  if (data?.stops?.length) return data;
  return allowDemoFallback() ? DEMO_LIVREUR_ROUTE : (data || { stops: [] });
};
