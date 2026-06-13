/** Données BI démo par rôle (vendeur, modérateur, livreur). */

import { getDemoVendorDashboard } from './vendorDemoData';
import { DEMO_MODERATOR_STATS } from './moderatorDemoData';
import { DEMO_LIVREUR_STATS, DEMO_LIVREUR_DASHBOARD } from './livreurDemoData';

export const ROLE_BI_META = {
  admin: {
    title: 'Power BI & Analytics',
    subtitle: 'Tableaux de bord plateforme, alertes et exports',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
    route: '/admin/powerbi',
    primaryLabel: 'Commandes',
    secondaryLabel: 'CA (DT)',
  },
  vendor: {
    title: 'Dashboard BI — Vendeur',
    subtitle: 'Ventes, stocks, conversion et performance catalogue',
    gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #2dd4bf 100%)',
    route: '/vendor/bi',
    primaryLabel: 'Commandes',
    secondaryLabel: 'CA (DT)',
    tableTitle: 'Top produits',
    tableColumns: [
      { key: 'name', label: 'Produit' },
      { key: 'units', label: 'Unités' },
      { key: 'revenue', label: 'CA (DT)' },
    ],
  },
  moderator: {
    title: 'Dashboard BI — Modération',
    subtitle: 'Qualité contenu, litiges, conformité et délais de traitement',
    gradient: 'linear-gradient(135deg, #92400e 0%, #d97706 50%, #f59e0b 100%)',
    route: '/moderator/bi',
    primaryLabel: 'Actions',
    secondaryLabel: 'Résolus',
    tableTitle: 'Conformité vendeurs',
    tableColumns: [
      { key: 'vendor', label: 'Vendeur' },
      { key: 'score', label: 'Score %' },
      { key: 'issues', label: 'Incidents' },
    ],
  },
  livreur: {
    title: 'Dashboard BI — Livraisons',
    subtitle: 'Performance zones, ponctualité et commissions',
    gradient: 'linear-gradient(135deg, #14532d 0%, #16a34a 50%, #22c55e 100%)',
    route: '/livreur/bi',
    primaryLabel: 'Livraisons',
    secondaryLabel: 'Commission (DT)',
    tableTitle: 'Performance par zone',
    tableColumns: [
      { key: 'zone', label: 'Zone' },
      { key: 'deliveries', label: 'Livrées' },
      { key: 'avgMin', label: 'Temps moy.' },
      { key: 'onTime', label: 'Ponctualité %' },
    ],
  },
  vet: {
    title: 'Dashboard BI — Santé animale',
    subtitle: 'Analyses cliniques, pharmacie et référentiel',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #059669 100%)',
    route: '/vet/bi',
    primaryLabel: 'Cas',
    secondaryLabel: 'Consultations',
  },
};

const vendorBi = () => {
  const dash = getDemoVendorDashboard();
  const k = dash.kpis || {};
  return {
    kpis: [
      { label: 'CA du mois', value: `${k.revenue30d ?? 12480} DT`, icon: '💰', color: '#0d9488' },
      { label: 'Commandes 30j', value: k.orders30d ?? 94, icon: '📦', color: '#0891b2' },
      { label: 'Panier moyen', value: `${k.avgBasket30d ?? 132} DT`, icon: '🛒', color: '#6366f1' },
      { label: 'Taux conversion', value: `${k.conversionRate ?? 4.2}%`, icon: '📈', color: '#16a34a' },
      { label: 'Stock bas', value: k.lowStockCount ?? 2, icon: '⚠️', color: '#d97706' },
      { label: 'Ruptures', value: k.outOfStockCount ?? 1, icon: '🚫', color: '#dc2626' },
    ],
    trend: (dash.salesTrend || []).map((s) => ({ name: s.label, primary: s.orders, secondary: s.revenue })),
    breakdown: (dash.categories || []).map((c) => ({
      name: c.label,
      value: dash.productPerformance?.filter((p) => p.name?.toLowerCase().includes(c.label?.toLowerCase().slice(0, 4))).length
        || Math.floor(Math.random() * 8) + 3,
    })),
    daily: [
      { name: 'Lun', primary: 4, secondary: 520 },
      { name: 'Mar', primary: 6, secondary: 780 },
      { name: 'Mer', primary: 3, secondary: 410 },
      { name: 'Jeu', primary: 8, secondary: 1020 },
      { name: 'Ven', primary: 5, secondary: 650 },
      { name: 'Sam', primary: 7, secondary: 890 },
      { name: 'Dim', primary: 2, secondary: 280 },
    ],
    table: {
      rows: (dash.productPerformance || []).map((p) => ({
        name: p.name,
        units: p.unitsSold,
        revenue: p.revenue,
      })),
    },
    alerts: [
      { severity: 'high', title: 'Rupture stock', message: 'Litière agglomérante 10 L — 0 unité' },
      { severity: 'medium', title: 'Stock bas', message: 'Pâtée chat saumon — 3 unités restantes' },
    ],
  };
};

const moderatorBi = () => {
  const s = DEMO_MODERATOR_STATS;
  return {
    kpis: [
      { label: 'Produits à valider', value: s.pendingProducts, icon: '🏷️', color: '#d97706' },
      { label: 'Avis en attente', value: s.pendingReviews, icon: '⭐', color: '#f59e0b' },
      { label: 'Litiges ouverts', value: s.openDisputes, icon: '⚖️', color: '#dc2626' },
      { label: 'Résolus / jour', value: s.resolvedToday, icon: '✅', color: '#16a34a' },
      { label: 'Délai moyen', value: `${s.avgResponseHours} h`, icon: '⏱️', color: '#6366f1' },
      { label: 'Faux avis', value: s.fakeReviewsFlagged, icon: '🤖', color: '#7c3aed' },
    ],
    trend: [
      { name: 'Jan', primary: 42, secondary: 38 },
      { name: 'Fév', primary: 48, secondary: 44 },
      { name: 'Mar', primary: 55, secondary: 51 },
      { name: 'Avr', primary: 50, secondary: 47 },
      { name: 'Mai', primary: 62, secondary: 58 },
      { name: 'Juin', primary: 58, secondary: 55 },
    ],
    breakdown: [
      { name: 'Produits', value: s.pendingProducts },
      { name: 'Avis', value: s.pendingReviews },
      { name: 'Réclamations', value: s.pendingComplaints },
      { name: 'Litiges', value: s.openDisputes },
    ],
    daily: [
      { name: 'Lun', primary: 14, secondary: 11 },
      { name: 'Mar', primary: 18, secondary: 15 },
      { name: 'Mer', primary: 9, secondary: 12 },
      { name: 'Jeu', primary: 22, secondary: 19 },
      { name: 'Ven', primary: 16, secondary: 14 },
      { name: 'Sam', primary: 6, secondary: 5 },
      { name: 'Dim', primary: 4, secondary: 3 },
    ],
    table: {
      rows: [
        { vendor: 'Animalerie Tunis', score: 92, issues: 1 },
        { vendor: 'Zoo Market Sfax', score: 78, issues: 3 },
        { vendor: 'Pet Shop Sousse', score: 85, issues: 2 },
        { vendor: 'Nour Pets', score: 65, issues: 5 },
      ],
    },
    alerts: [
      { severity: 'high', title: 'Litige ouvert', message: 'Remboursement CMD-9102 — escalade requise' },
      { severity: 'medium', title: 'Faux avis détectés', message: '4 avis signalés par NLP cette semaine' },
    ],
  };
};

const livreurBi = () => {
  const s = { ...DEMO_LIVREUR_STATS, ...DEMO_LIVREUR_DASHBOARD.stats };
  return {
    kpis: [
      { label: 'Total livrées', value: s.totalDelivered ?? 47, icon: '📦', color: '#16a34a' },
      { label: 'Cette semaine', value: s.weekDelivered ?? 12, icon: '📅', color: '#0891b2' },
      { label: 'Gains semaine', value: `${s.weekCommission ?? 60} DT`, icon: '💰', color: '#059669' },
      { label: 'Temps moyen', value: `${s.avgDeliveryMinutes ?? 28} min`, icon: '⏱️', color: '#6366f1' },
      { label: 'Ponctualité', value: `${s.onTimeRate ?? 94}%`, icon: '✓', color: '#e67e22' },
      { label: 'En cours', value: s.activeDeliveries ?? 1, icon: '🚚', color: '#3498db' },
    ],
    trend: (s.dailyChart || []).map((d) => ({ name: d.label?.slice(0, 6), primary: d.count, secondary: d.commission })),
    breakdown: Object.entries(s.statusBreakdown || {}).map(([k, v]) => ({
      name: { pending: 'En attente', shipped: 'En cours', delivered: 'Livrées', cancelled: 'Annulées' }[k] || k,
      value: v,
    })),
    daily: s.dailyChart || [],
    table: {
      rows: [
        { zone: 'La Marsa', deliveries: 18, avgMin: 26, onTime: 96 },
        { zone: 'Ariana', deliveries: 14, avgMin: 30, onTime: 92 },
        { zone: 'Lac 1', deliveries: 9, avgMin: 24, onTime: 98 },
        { zone: 'Carthage', deliveries: 6, avgMin: 32, onTime: 88 },
      ],
    },
    alerts: [
      { severity: 'medium', title: 'Pic de demande', message: 'Zone La Marsa — +40% commandes 17h-19h' },
    ],
  };
};

const BUILDERS = { vendor: vendorBi, moderator: moderatorBi, livreur: livreurBi };

export const getRoleBiDemo = (role) => {
  const build = BUILDERS[role];
  if (!build) return null;
  return { ...build(), updatedAt: new Date().toISOString() };
};
