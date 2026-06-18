/** Données et métadonnées démo — courbes temps réel par rôle. */

import {
  buildDemoOrdersDailyChart,
  buildDemoRevenueChart,
  buildDemoStatusChart,
  withDemoStats,
  DEMO_ADMIN_ORDERS,
} from './adminDemoData';
import { DEMO_MODERATOR_STATS } from './moderatorDemoData';
import { getDemoVendorDashboard } from './vendorDemoData';
import { DEMO_LIVREUR_STATS, DEMO_LIVREUR_DASHBOARD } from './livreurDemoData';
import { buildDemoVetWeekChart } from './vetDemoData';

export const ROLE_REALTIME_META = {
  admin: {
    title: 'Plateforme — temps réel',
    primaryLabel: 'Commandes / min',
    secondaryLabel: 'CA live (DT)',
    accent: '#e67e22',
    accent2: '#27ae60',
    detailLink: '/admin/powerbi',
    detailLabel: 'Power BI',
  },
  vendor: {
    title: 'Boutique — temps réel',
    primaryLabel: 'Commandes / min',
    secondaryLabel: 'CA live (DT)',
    accent: '#14b8a6',
    accent2: '#0d9488',
    detailLink: '/vendor/dashboard',
    detailLabel: 'Tableau de bord',
  },
  moderator: {
    title: 'Modération — temps réel',
    primaryLabel: 'Actions / min',
    secondaryLabel: 'Cas résolus',
    accent: '#d97706',
    accent2: '#059669',
    detailLink: '/moderator/dashboard',
    detailLabel: 'Tableau de bord',
  },
  livreur: {
    title: 'Livraisons — temps réel',
    primaryLabel: 'Courses actives',
    secondaryLabel: 'Gains live (DT)',
    accent: '#27ae60',
    accent2: '#059669',
    detailLink: '/livreur/dashboard',
    detailLabel: 'Dashboard BI',
  },
  vet: {
    title: 'Cabinet — temps réel',
    primaryLabel: 'RDV actifs',
    secondaryLabel: 'Consultations',
    accent: '#0ea5e9',
    accent2: '#6366f1',
    detailLink: '/vet/bi',
    detailLabel: 'Dashboard BI',
  },
};

const jitter = (base, spread = 0.12) => {
  const n = Number(base) || 0;
  const delta = n * spread * (Math.random() - 0.5) * 2;
  return Math.max(0, Math.round((n + delta) * 10) / 10);
};

export const buildLiveSeriesSeed = (count, primaryBase, secondaryBase, stepMs = 10000) => {
  const series = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(Date.now() - i * stepMs);
    series.push({
      time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      primary: jitter(primaryBase, 0.15),
      secondary: jitter(secondaryBase, 0.18),
    });
  }
  return series;
};

export const nextLivePoint = (primaryBase, secondaryBase) => ({
  time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  primary: jitter(primaryBase, 0.2),
  secondary: jitter(secondaryBase, 0.22),
});

const adminDemo = () => {
  const stats = withDemoStats(null);
  const daily = buildDemoOrdersDailyChart(DEMO_ADMIN_ORDERS);
  const pBase = Math.max(1, Math.round((stats.pendingOrders || 3) / 3));
  const sBase = Math.max(10, Math.round((stats.totalRevenue || 500) / 200));
  return {
    kpis: [
      { label: 'Commandes', value: stats.totalOrders, delta: '+4%', icon: '📦' },
      { label: 'CA total', value: `${Number(stats.totalRevenue).toLocaleString('fr-FR')} DT`, delta: '+8%', icon: '💰' },
      { label: 'Utilisateurs', value: stats.totalUsers, delta: '+2', icon: '👥' },
      { label: 'En attente', value: stats.pendingOrders, delta: '-1', icon: '⏳' },
    ],
    livePrimary: pBase,
    liveSecondary: sBase,
    liveSeries: buildLiveSeriesSeed(15, pBase, sBase),
    dailySeries: daily.map((d) => ({ name: d.name, primary: d.commandes, secondary: d.ca })),
    breakdown: buildDemoStatusChart(DEMO_ADMIN_ORDERS),
    monthlySeries: buildDemoRevenueChart(DEMO_ADMIN_ORDERS),
  };
};

const vendorDemo = () => {
  const dash = getDemoVendorDashboard();
  const k = dash.kpis || {};
  const pBase = Math.max(1, Math.round((k.orders30d || 20) / 400));
  const sBase = Math.max(5, Math.round((k.revenue7d || 200) / 40));
  return {
    kpis: [
      { label: 'CA 7 jours', value: `${k.revenue7d ?? 0} DT`, delta: `+${k.revenueGrowthPct ?? 0}%`, icon: '💰' },
      { label: 'Commandes 30j', value: k.orders30d ?? 0, delta: '+6', icon: '📦' },
      { label: 'Panier moyen', value: `${k.avgBasket30d ?? 0} DT`, delta: 'stable', icon: '🛒' },
      { label: 'Stock bas', value: k.lowStockCount ?? 0, delta: `${k.outOfStockCount ?? 0} rupture`, icon: '⚠️' },
    ],
    livePrimary: pBase,
    liveSecondary: sBase,
    liveSeries: buildLiveSeriesSeed(15, pBase, sBase),
    dailySeries: (dash.salesTrend || []).slice(-7).map((s) => ({
      name: s.label,
      primary: s.orders,
      secondary: s.revenue,
    })),
    breakdown: [
      { name: 'Payées', value: dash.recentOrders?.filter((o) => o.status === 'paid').length || 3 },
      { name: 'En attente', value: dash.recentOrders?.filter((o) => o.status === 'pending').length || 1 },
      { name: 'Actifs', value: k.activeProducts ?? 8 },
    ],
    monthlySeries: (dash.salesTrend || []).map((s) => ({ name: s.label, value: s.revenue })),
  };
};

const moderatorDemo = () => {
  const s = DEMO_MODERATOR_STATS;
  const pBase = Math.max(1, Math.round((s.pendingProducts + s.pendingReviews) / 8));
  const sBase = Math.max(1, s.resolvedToday / 4);
  return {
    kpis: [
      { label: 'À valider', value: s.pendingProducts, delta: 'urgent', icon: '🏷️' },
      { label: 'Avis en attente', value: s.pendingReviews, delta: `${s.fakeReviewsFlagged} faux`, icon: '⭐' },
      { label: 'Litiges', value: s.openDisputes, delta: 'ouverts', icon: '⚖️' },
      { label: 'Résolus / jour', value: s.resolvedToday, delta: `${s.avgResponseHours}h délai`, icon: '✅' },
    ],
    livePrimary: pBase,
    liveSecondary: sBase,
    liveSeries: buildLiveSeriesSeed(15, pBase, sBase),
    dailySeries: [
      { name: 'Lun', primary: 8, secondary: 6 },
      { name: 'Mar', primary: 12, secondary: 9 },
      { name: 'Mer', primary: 6, secondary: 11 },
      { name: 'Jeu', primary: 14, secondary: 10 },
      { name: 'Ven', primary: 9, secondary: 12 },
      { name: 'Sam', primary: 5, secondary: 4 },
      { name: 'Dim', primary: 3, secondary: 2 },
    ],
    breakdown: [
      { name: 'Produits', value: s.pendingProducts },
      { name: 'Avis', value: s.pendingReviews },
      { name: 'Réclamations', value: s.pendingComplaints },
      { name: 'Litiges', value: s.openDisputes },
    ],
  };
};

const livreurDemo = () => {
  const s = { ...DEMO_LIVREUR_STATS, ...DEMO_LIVREUR_DASHBOARD.stats };
  const pBase = Math.max(1, s.activeDeliveries ?? 2);
  const sBase = Math.max(1, (s.todayEarnings ?? 15) / 3);
  return {
    kpis: [
      { label: 'Livrées aujourd\'hui', value: s.todayDeliveries ?? 4, delta: '+1', icon: '📦' },
      { label: 'Gains du jour', value: `${s.todayEarnings ?? 20} DT`, delta: '+5 DT', icon: '💰' },
      { label: 'En cours', value: s.activeDeliveries ?? 2, delta: 'live', icon: '🚚' },
      { label: 'Ponctualité', value: `${s.onTimeRate ?? 95}%`, delta: `${s.avgDeliveryMinutes ?? 28} min`, icon: '⏱️' },
    ],
    livePrimary: pBase,
    liveSecondary: sBase,
    liveSeries: buildLiveSeriesSeed(15, pBase, sBase),
    dailySeries: (s.dailyChart || []).map((d) => ({
      name: d.label,
      primary: d.count,
      secondary: d.commission,
    })),
    breakdown: Object.entries(s.statusBreakdown || {}).map(([name, value]) => ({
      name: { pending: 'En attente', shipped: 'En cours', delivered: 'Livrées', cancelled: 'Annulées', paid: 'Payées' }[name] || name,
      value,
    })),
  };
};

const vetDemo = () => {
  const week = buildDemoVetWeekChart();
  const last = week[week.length - 1] || { rdv: 3, consultations: 2 };
  const pBase = Math.max(1, last.rdv);
  const sBase = Math.max(1, last.consultations);
  return {
    kpis: [
      { label: 'RDV aujourd\'hui', value: last.rdv + 1, delta: '+1', icon: '📅' },
      { label: 'Consultations', value: last.consultations + 2, delta: 'semaine', icon: '🩺' },
      { label: 'Patients actifs', value: 24, delta: '+3', icon: '🐾' },
      { label: 'Demandes contact', value: 2, delta: 'en attente', icon: '📩' },
    ],
    livePrimary: pBase,
    liveSecondary: sBase,
    liveSeries: buildLiveSeriesSeed(15, pBase, sBase),
    dailySeries: week.map((d) => ({ name: d.name, primary: d.rdv, secondary: d.consultations })),
    breakdown: [
      { name: 'Planifié', value: 4 },
      { name: 'Terminé', value: 6 },
      { name: 'Téléconsult', value: 2 },
    ],
  };
};

const BUILDERS = {
  admin: adminDemo,
  vendor: vendorDemo,
  moderator: moderatorDemo,
  livreur: livreurDemo,
  vet: vetDemo,
};

export const getRoleRealtimeDemo = (role) => {
  const build = BUILDERS[role];
  if (!build) return null;
  return {
    ...build(),
    updatedAt: new Date().toISOString(),
    demo: true,
  };
};

export const tickRoleRealtimeDemo = (role, prev) => {
  const base = prev || getRoleRealtimeDemo(role);
  if (!base) return null;
  const point = nextLivePoint(base.livePrimary, base.liveSecondary);
  const liveSeries = [...(base.liveSeries || []), point].slice(-20);
  return {
    ...base,
    liveSeries: liveSeries.length ? liveSeries : getRoleRealtimeDemo(role)?.liveSeries || [],
    updatedAt: new Date().toISOString(),
    demo: base.demo !== false,
  };
};
