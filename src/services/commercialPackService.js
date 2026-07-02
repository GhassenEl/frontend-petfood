import api from '../utils/api';
import { fetchDigitalMarketingPack } from './digitalMarketingService';
import {
  DEMO_ADMIN_SALES_KPI,
  DEMO_ADMIN_COUPONS,
  DEMO_ADMIN_VENDORS,
  withDemoFallback,
} from '../utils/adminDemoData';
import { getDemoVendorDashboard } from '../utils/vendorDemoData';

const DEMO_EMAIL_CAMPAIGNS = [
  { id: 'em-1', name: 'Soldes croquettes premium', subject: '🐕 −15 % cette semaine sur les croquettes chien', status: 'sent', sent: 1840, openRate: 41.2, clicks: 312, scheduledAt: '2026-06-14T09:00:00' },
  { id: 'em-2', name: 'Relance paniers abandonnés', subject: 'Votre panier vous attend — livraison offerte', status: 'sent', sent: 420, openRate: 38.5, clicks: 89, scheduledAt: '2026-06-16T18:00:00' },
  { id: 'em-3', name: 'Newsletter nutrition NutriPro', subject: 'Conseils nutrition chat & chien par nos vétos', status: 'scheduled', sent: 0, openRate: 0, clicks: 0, scheduledAt: '2026-06-22T10:00:00' },
  { id: 'em-4', name: 'Bienvenue nouveaux clients', subject: 'Bienvenue chez PetfoodTN — code WELCOME20', status: 'active', sent: 128, openRate: 52.1, clicks: 64, scheduledAt: '2026-06-10T11:00:00' },
];

export async function fetchAdminCommercialPack() {
  const [marketing, ordersRes, statsRes, vendorsRes, couponsRes] = await Promise.all([
    fetchDigitalMarketingPack().catch(() => null),
    api.get('/orders').catch(() => ({ data: [] })),
    api.get('/orders/stats').catch(() => ({ data: {} })),
    api.get('/admin/vendors').catch(() => ({ data: [] })),
    api.get('/admin/coupons').catch(() => ({ data: [] })),
  ]);

  const stats = statsRes?.data || {};
  const vendorsRaw = Array.isArray(vendorsRes?.data) ? vendorsRes.data : vendorsRes?.data?.vendors || [];
  const vendors = withDemoFallback(vendorsRaw, DEMO_ADMIN_VENDORS);
  const coupons = withDemoFallback(couponsRes?.data, DEMO_ADMIN_COUPONS);
  const mk = marketing?.kpis || {};

  const vendorCommissions = vendors.map((v) => ({
    id: v.id || v._id,
    shopName: v.shopName || v.name || 'Boutique',
    region: v.region || '—',
    revenue30d: v.revenue30d ?? v.totalSales ?? 0,
    commissionsPaid: v.commissionsPaid ?? Math.round((v.revenue30d || 0) * 0.12 * 0.85),
    commissionsPending: v.commissionsPending ?? Math.round((v.revenue30d || 0) * 0.12 * 0.15),
    commissionRate: v.commissionRate ?? 0.12,
    status: v.status || v.applicationStatus || 'active',
  }));

  const totalCommissionsPaid = vendorCommissions.reduce((s, v) => s + (v.commissionsPaid || 0), 0);
  const totalCommissionsPending = vendorCommissions.reduce((s, v) => s + (v.commissionsPending || 0), 0);

  return {
    role: 'admin',
    mode: stats.revenue ? 'live' : 'demo',
    kpis: {
      revenueMonth: stats.revenue ?? DEMO_ADMIN_SALES_KPI.revenueMonth,
      ordersWeek: stats.total ?? DEMO_ADMIN_SALES_KPI.ordersWeek,
      conversionRate: mk.conversionRate ?? 4.2,
      adRoas: mk.adRoas ?? 3.6,
      activeVendors: vendors.filter((v) => v.status === 'active' || v.applicationStatus === 'approved').length || 24,
      campaignsActive: mk.campaignsActive ?? 3,
      newsletterSubs: mk.newsletterSubs ?? 420,
      revenueAttributed: mk.revenueAttributed ?? Math.round((stats.revenue || DEMO_ADMIN_SALES_KPI.revenueMonth) * 0.42),
      commissionsPaid: totalCommissionsPaid,
      commissionsPending: totalCommissionsPending,
      activeCoupons: coupons.filter((c) => c.active).length,
    },
    funnel: marketing?.funnel || [],
    pipeline: marketing?.aiRecommendations?.slice(0, 4) || [],
    marketing,
    promotions: coupons,
    vendorCommissions,
    emailCampaigns: DEMO_EMAIL_CAMPAIGNS.map((c) => ({
      ...c,
      conversions: Math.round((c.clicks || 0) * 0.18),
    })),
    newsletter: marketing?.newsletter || { total: mk.newsletterSubs, growth7d: 4.2, recent: [] },
    aiCampaigns: marketing?.campaigns || [],
  };
}

export async function fetchVendorCommercialPack() {
  const demo = getDemoVendorDashboard();
  const dk = demo.kpis || {};
  let history = demo.salesHistory || [];
  let mode = 'demo';

  try {
    const { data } = await api.get('/vendor/sales/history');
    if (data?.history?.length) {
      history = data.history;
      mode = 'live';
    }
  } catch {
    /* demo */
  }

  const total = history.reduce((s, h) => s + (h.total || 0), 0);
  const commission = history.reduce((s, h) => s + (h.commission || (h.total || 0) * 0.12), 0);
  const pendingOrders = demo.recentOrders?.filter((o) => o.status === 'pending').length ?? 3;

  return {
    role: 'vendor',
    mode,
    kpis: {
      revenueTotal: total || dk.revenue30d || demo.totalSales || 12480,
      commissionTotal: commission || dk.paidCommissions || 1498,
      commissionPending: dk.pendingCommissions ?? 186,
      commissionRate: demo.commissionRate ?? 0.12,
      ordersCount: history.length || dk.orders30d || 47,
      avgBasket: history.length ? total / history.length : dk.avgBasket30d || 265,
      pendingOrders,
      stockAlerts: (dk.lowStockCount || 0) + (dk.outOfStockCount || 0) || 2,
      rank: dk.marketplaceRank ?? 12,
      promoCount: (demo.products || []).filter((p) => Number(p.promotionPercent) > 0).length,
    },
    recentSales: history.slice(0, 8),
    promoProducts: (demo.products || []).filter((p) => Number(p.promotionPercent) > 0),
    commissionSchedule: [
      { id: 'pay-1', period: 'Mai 2026', amount: dk.paidCommissions ?? 1420, status: 'paid', paidAt: '2026-06-05' },
      { id: 'pay-2', period: 'Juin 2026 (en cours)', amount: dk.pendingCommissions ?? 186, status: 'pending', paidAt: null },
    ],
  };
}

export async function fetchCommercialPack(role = 'admin') {
  if (role === 'vendor') return fetchVendorCommercialPack();
  return fetchAdminCommercialPack();
}
