/** Données démo marketplace vendeur lorsque l'API ecosystem est indisponible. */

import { DEMO_ADMIN_VENDORS } from './adminDemoData';

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

export const DEMO_VENDOR_DASHBOARD = {
  id: 'demo_vendor',
  shopName: 'Animalerie Tunis — Démo',
  region: 'Tunis',
  commissionRate: 0.12,
  totalSales: 12480,
  paidCommissions: 1420,
  pendingCommissions: 186,
  kpis: {
    revenue7d: 2180,
    revenue30d: 12480,
    revenueGrowthPct: 12.4,
    orders30d: 94,
    avgBasket30d: 132.8,
    paidCommissions: 1420,
    pendingCommissions: 186,
    lowStockCount: 2,
    outOfStockCount: 1,
    activeProducts: 8,
    marketplaceRank: 3,
    marketplaceTotal: 24,
    conversionRate: 4.2,
  },
  salesTrend: [
    { label: 'Jan', revenue: 820, orders: 12 },
    { label: 'Fév', revenue: 960, orders: 14 },
    { label: 'Mar', revenue: 1100, orders: 16 },
    { label: 'Avr', revenue: 980, orders: 13 },
    { label: 'Mai', revenue: 1350, orders: 18 },
    { label: 'Juin', revenue: 1240, orders: 17 },
  ],
  products: [
    { id: 'vp1', name: 'Croquettes premium chien 15 kg', stock: 22, price: 89 },
    { id: 'vp2', name: 'Pâtée chat saumon 12×400 g', stock: 3, price: 42 },
    { id: 'vp3', name: 'Litière agglomérante 10 L', stock: 0, price: 28 },
    { id: 'vp4', name: 'Jouet corde résistant', stock: 45, price: 18 },
    { id: 'vp5', name: 'Fontaine eau chat 2 L', stock: 8, price: 65 },
  ],
  productPerformance: [
    { productId: 'vp1', name: 'Croquettes premium chien 15 kg', unitsSold: 38, revenue: 3382, stock: 22, trend: 'up' },
    { productId: 'vp2', name: 'Pâtée chat saumon', unitsSold: 29, revenue: 1218, stock: 3, trend: 'up' },
    { productId: 'vp5', name: 'Fontaine eau chat 2 L', unitsSold: 12, revenue: 780, stock: 8, trend: 'stable' },
  ],
  recentOrders: [
    { id: 'vo1', orderId: 'CMD-8842', total: 156, commission: 18.72, status: 'paid', createdAt: daysAgo(0) },
    { id: 'vo2', orderId: 'CMD-8831', total: 89, commission: 10.68, status: 'paid', createdAt: daysAgo(1) },
    { id: 'vo3', orderId: 'CMD-8819', total: 42, commission: 5.04, status: 'pending', createdAt: daysAgo(2) },
    { id: 'vo4', orderId: 'CMD-8805', total: 210, commission: 25.2, status: 'paid', createdAt: daysAgo(4) },
  ],
  categories: [
    { id: 'cat-dog', label: 'Chien', icon: '🐕' },
    { id: 'cat-cat', label: 'Chat', icon: '🐈' },
    { id: 'cat-access', label: 'Accessoires', icon: '🎾' },
    { id: 'cat-hygiene', label: 'Hygiène', icon: '🧴' },
  ],
  catalogProducts: [
    {
      id: 'vp1', name: 'Croquettes premium chien 15 kg', categoryId: 'cat-dog',
      stock: 22, price: 89, promotionPercent: 0, description: 'Croquettes sans céréales, riche en protéines.',
      imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=300&fit=crop',
      unitsSold: 38,
    },
    {
      id: 'vp2', name: 'Pâtée chat saumon 12×400 g', categoryId: 'cat-cat',
      stock: 3, price: 42, promotionPercent: 10, description: 'Pâtée humide au saumon pour chat adulte.',
      imageUrl: 'https://images.unsplash.com/photo-1574158622682-6d4d4b86bb96?w=400&h=300&fit=crop',
      unitsSold: 29,
    },
    {
      id: 'vp3', name: 'Litière agglomérante 10 L', categoryId: 'cat-hygiene',
      stock: 0, price: 28, promotionPercent: 0, description: 'Litière minérale agglomérante parfumée.',
      imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=300&fit=crop',
      unitsSold: 15,
    },
    {
      id: 'vp4', name: 'Jouet corde résistant', categoryId: 'cat-access',
      stock: 45, price: 18, promotionPercent: 15, description: 'Corde en coton pour chien, résistante.',
      imageUrl: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop',
      unitsSold: 22,
    },
    {
      id: 'vp5', name: 'Fontaine eau chat 2 L', categoryId: 'cat-cat',
      stock: 8, price: 65, promotionPercent: 0, description: 'Fontaine filtrante silencieuse 2 litres.',
      imageUrl: 'https://images.unsplash.com/photo-1574158622682-6d4d4b86bb96?w=400&h=300&fit=crop',
      unitsSold: 12,
    },
  ],
  vendorOrders: [
    {
      id: 'ord-1', orderId: 'CMD-9102', clientName: 'Amira B.', clientEmail: 'amira@mail.tn',
      items: [{ productId: 'vp1', name: 'Croquettes premium chien 15 kg', qty: 1, price: 89 }],
      total: 89, commission: 10.68, status: 'pending', deliveryStatus: 'awaiting',
      createdAt: daysAgo(0), trackingCode: null,
    },
    {
      id: 'ord-2', orderId: 'CMD-9098', clientName: 'Karim M.', clientEmail: 'karim@mail.tn',
      items: [{ productId: 'vp2', name: 'Pâtée chat saumon', qty: 2, price: 42 }],
      total: 84, commission: 10.08, status: 'accepted', deliveryStatus: 'preparing',
      createdAt: daysAgo(1), trackingCode: null,
    },
    {
      id: 'ord-3', orderId: 'CMD-9085', clientName: 'Salma K.', clientEmail: 'salma@mail.tn',
      items: [{ productId: 'vp5', name: 'Fontaine eau chat 2 L', qty: 1, price: 65 }],
      total: 65, commission: 7.8, status: 'preparing', deliveryStatus: 'preparing',
      createdAt: daysAgo(2), trackingCode: null,
    },
    {
      id: 'ord-4', orderId: 'CMD-9071', clientName: 'Youssef T.', clientEmail: 'youssef@mail.tn',
      items: [{ productId: 'vp4', name: 'Jouet corde résistant', qty: 3, price: 18 }],
      total: 54, commission: 6.48, status: 'shipped', deliveryStatus: 'in_transit',
      createdAt: daysAgo(3), trackingCode: 'TN-LIV-78421',
    },
    {
      id: 'ord-5', orderId: 'CMD-8842', clientName: 'Nadia F.', clientEmail: 'nadia@mail.tn',
      items: [
        { productId: 'vp1', name: 'Croquettes premium chien 15 kg', qty: 1, price: 89 },
        { productId: 'vp4', name: 'Jouet corde résistant', qty: 2, price: 18 },
      ],
      total: 125, commission: 15, status: 'delivered', deliveryStatus: 'delivered',
      createdAt: daysAgo(5), trackingCode: 'TN-LIV-77201',
    },
    {
      id: 'ord-6', orderId: 'CMD-8819', clientName: 'Hedi R.', clientEmail: 'hedi@mail.tn',
      items: [{ productId: 'vp3', name: 'Litière agglomérante 10 L', qty: 1, price: 28 }],
      total: 28, commission: 3.36, status: 'rejected', deliveryStatus: 'cancelled',
      createdAt: daysAgo(6), trackingCode: null, rejectReason: 'Rupture de stock',
    },
  ],
  salesHistory: [
    { id: 'sh-1', orderId: 'CMD-8842', date: daysAgo(2), total: 125, items: 3, status: 'delivered', commission: 15, clientName: 'Nadia F.' },
    { id: 'sh-2', orderId: 'CMD-8805', date: daysAgo(5), total: 210, items: 4, status: 'delivered', commission: 25.2, clientName: 'Youssef T.' },
    { id: 'sh-3', orderId: 'CMD-8790', date: daysAgo(9), total: 89, items: 1, status: 'delivered', commission: 10.68, clientName: 'Amira B.' },
    { id: 'sh-4', orderId: 'CMD-8775', date: daysAgo(12), total: 156, items: 2, status: 'delivered', commission: 18.72, clientName: 'Leila S.' },
    { id: 'sh-5', orderId: 'CMD-8760', date: daysAgo(16), total: 42, items: 1, status: 'paid', commission: 5.04, clientName: 'Karim M.' },
    { id: 'sh-6', orderId: 'CMD-8744', date: daysAgo(22), total: 198, items: 3, status: 'delivered', commission: 23.76, clientName: 'Salma K.' },
    { id: 'sh-7', orderId: 'CMD-8720', date: daysAgo(28), total: 65, items: 1, status: 'delivered', commission: 7.8, clientName: 'Omar B.' },
  ],
  returns: [
    {
      id: 'ret-1', orderId: 'CMD-8775', clientName: 'Leila S.', productName: 'Fontaine eau chat 2 L',
      reason: 'Produit défectueux — pompe ne fonctionne pas', status: 'pending', createdAt: daysAgo(1),
    },
    {
      id: 'ret-2', orderId: 'CMD-8720', clientName: 'Omar B.', productName: 'Jouet corde résistant',
      reason: 'Article différent de la photo', status: 'approved', createdAt: daysAgo(4),
    },
    {
      id: 'ret-3', orderId: 'CMD-8699', clientName: 'Ines M.', productName: 'Croquettes premium chien 15 kg',
      reason: 'Changement d\'avis', status: 'rejected', createdAt: daysAgo(7),
    },
  ],
  vendorReviews: [
    {
      id: 'vr-1', clientName: 'Amira B.', productName: 'Croquettes premium chien 15 kg',
      rating: 5, comment: 'Excellent produit, livraison rapide !', createdAt: daysAgo(2),
      vendorReply: null,
    },
    {
      id: 'vr-2', clientName: 'Karim M.', productName: 'Pâtée chat saumon',
      rating: 4, comment: 'Mon chat adore, emballage un peu abîmé.', createdAt: daysAgo(5),
      vendorReply: 'Merci pour votre retour, nous améliorons l\'emballage.',
    },
    {
      id: 'vr-3', clientName: 'Salma K.', productName: 'Fontaine eau chat 2 L',
      rating: 2, comment: 'La pompe est bruyante la nuit.', createdAt: daysAgo(1),
      vendorReply: null,
    },
  ],
  clientMessages: [
    {
      id: 'msg-1', clientName: 'Amira B.', clientId: 'cli-1',
      lastMessage: 'Est-ce que les croquettes 15 kg sont disponibles ?',
      unread: true, updatedAt: daysAgo(0),
    },
    {
      id: 'msg-2', clientName: 'Karim M.', clientId: 'cli-2',
      lastMessage: 'Merci pour la préparation rapide !',
      unread: false, updatedAt: daysAgo(1),
    },
    {
      id: 'msg-3', clientName: 'Salma K.', clientId: 'cli-3',
      lastMessage: 'Pouvez-vous m\'envoyer la facture CMD-9085 ?',
      unread: true, updatedAt: daysAgo(2),
    },
  ],
  messageThreads: {
    'cli-1': [
      { id: 't1', from: 'client', text: 'Bonjour, est-ce que les croquettes 15 kg sont disponibles ?', at: daysAgo(0) },
    ],
    'cli-2': [
      { id: 't2', from: 'client', text: 'Commande bien reçue, merci !', at: daysAgo(2) },
      { id: 't3', from: 'vendor', text: 'Avec plaisir, bon appétit à votre chat !', at: daysAgo(1) },
      { id: 't4', from: 'client', text: 'Merci pour la préparation rapide !', at: daysAgo(1) },
    ],
    'cli-3': [
      { id: 't5', from: 'client', text: 'Pouvez-vous m\'envoyer la facture CMD-9085 ?', at: daysAgo(2) },
    ],
  },
  notifications: [
    { id: 'vn-1', type: 'order', text: 'Nouvelle commande CMD-9102 — 89 DT', read: false, at: daysAgo(0) },
    { id: 'vn-2', type: 'review', text: 'Nouvel avis 2★ sur Fontaine eau chat', read: false, at: daysAgo(1) },
    { id: 'vn-3', type: 'return', text: 'Demande de retour CMD-8775', read: true, at: daysAgo(1) },
  ],
  mlAgent: {
    groqPowered: true,
    pythonPowered: true,
    mlPowered: true,
    summary: 'Votre boutique progresse bien ce mois-ci. Les croquettes chien et la pâtée chat concentrent 68 % du CA. Anticipez un pic de demande sur les fontaines avant l\'été.',
    tip: 'Réapprovisionnez la litière (rupture) et augmentez le stock pâtée chat sous 7 jours.',
    forecast: {
      nextMonthRevenue: 13850,
      model: 'trend_linear_v1',
      confidence: 0.82,
    },
    actionHints: [
      { type: 'restock', label: 'Réappro. litière', priority: 'high' },
      { type: 'promo', label: 'Promo fontaines -10 %', priority: 'medium' },
      { type: 'bundle', label: 'Pack chat eau + pâtée', priority: 'low' },
    ],
    stockAlerts: [
      { productId: 'vp3', name: 'Litière agglomérante 10 L', stock: 0, action: 'commander fournisseur', riskScore: 0.95 },
      { productId: 'vp2', name: 'Pâtée chat saumon', stock: 3, action: 'alerte réassort', riskScore: 0.72 },
    ],
    productDemand: [
      { productId: 'vp1', productName: 'Croquettes premium chien', predictedUnitsNextMonth: 42, lastMonthUnits: 38, trend: 'up' },
      { productId: 'vp2', productName: 'Pâtée chat saumon', predictedUnitsNextMonth: 34, lastMonthUnits: 29, trend: 'up' },
      { productId: 'vp5', productName: 'Fontaine eau chat', predictedUnitsNextMonth: 18, lastMonthUnits: 12, trend: 'up' },
    ],
  },
};

export const getDemoVendorDashboard = () => JSON.parse(JSON.stringify(DEMO_VENDOR_DASHBOARD));

/** Store mutable pour mode démo vendeur (CRUD session). */
export const getDemoVendorStore = () => {
  const dash = getDemoVendorDashboard();
  return {
    categories: dash.categories,
    products: dash.catalogProducts,
    orders: dash.vendorOrders,
    salesHistory: dash.salesHistory,
    returns: dash.returns,
    reviews: dash.vendorReviews,
    messages: dash.clientMessages,
    threads: dash.messageThreads,
    notifications: dash.notifications,
  };
};

export const getDemoAdminVendorDetail = (vendorId) => {
  const summary = DEMO_ADMIN_VENDORS.find((v) => v.id === vendorId);
  if (!summary) return null;
  const dash = getDemoVendorDashboard();
  dash.id = summary.id;
  dash.shopName = summary.shopName;
  dash.region = summary.region;
  dash.commissionRate = summary.commissionRate ?? 0.12;
  dash.totalSales = summary.revenue30d ?? 0;
  dash.paidCommissions = summary.commissionsPaid ?? 0;
  dash.pendingCommissions = summary.commissionsPending ?? 0;
  dash.kpis = {
    ...dash.kpis,
    revenue30d: summary.revenue30d ?? 0,
    paidCommissions: summary.commissionsPaid ?? 0,
    pendingCommissions: summary.commissionsPending ?? 0,
    activeProducts: summary.productsCount ?? dash.kpis.activeProducts,
    marketplaceRank: summary.rank ?? dash.kpis.marketplaceRank,
    lowStockCount: summary.lowStockCount ?? 0,
    outOfStockCount: summary.outOfStockCount ?? 0,
  };
  dash.status = summary.status;
  dash.ownerName = summary.ownerName;
  dash.ownerEmail = summary.ownerEmail;
  dash.userId = summary.userId;
  return dash;
};
