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
