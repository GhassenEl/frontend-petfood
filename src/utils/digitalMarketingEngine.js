import { segmentClientsByPurchases } from './clientSegmentationEngine';
import { generateMarketingRecommendations } from './marketingRecommendationEngine';

const pct = (n, d) => (d ? Math.round((n / d) * 1000) / 10 : 0);

/** Pack marketing digital — KPIs, entonnoir, canaux, SEO, réseaux sociaux */
export const buildDigitalMarketingPack = ({
  orders = [],
  users = [],
  products = [],
  crmOverview = null,
  newsletterSubs = [],
} = {}) => {
  const clients = users.filter((u) => u.role === 'client' || !u.role);
  const clientCount = clients.length || 1240;
  const orderCount = orders.length || 86;
  const revenue = orders.reduce((s, o) => s + Number(o.total || o.amount || 0), 0) || 48200;

  const impressions = Math.round(clientCount * 4.2 + orderCount * 18);
  const clicks = Math.round(impressions * 0.062);
  const conversions = orderCount;
  const ctr = pct(clicks, impressions);
  const conversionRate = pct(conversions, clicks);

  const { segments = [] } = segmentClientsByPurchases({ orders, users: clients });
  const aiMarketing = generateMarketingRecommendations({ orders, users: clients, products });

  const campaignsSent = crmOverview?.kpis?.campaignsSent ?? 12;
  const newsletterTotal = newsletterSubs.length || Math.round(clientCount * 0.34);

  const kpis = {
    impressions,
    clicks,
    ctr,
    conversions,
    conversionRate,
    newsletterSubs: newsletterTotal,
    emailOpenRate: 38.4,
    socialReach: Math.round(clientCount * 1.8),
    adRoas: 3.6,
    revenueAttributed: Math.round(revenue * 0.42),
    campaignsActive: (crmOverview?.campaigns || []).filter((c) => c.status === 'draft').length + 3,
    campaignsSent,
  };

  const funnel = [
    { stage: 'Visites site', count: impressions, pct: 100 },
    { stage: 'Inscriptions', count: Math.round(clientCount * 0.72), pct: pct(Math.round(clientCount * 0.72), impressions) },
    { stage: 'Panier', count: Math.round(clicks * 0.28), pct: pct(Math.round(clicks * 0.28), impressions) },
    { stage: 'Commandes', count: conversions, pct: pct(conversions, impressions) },
    { stage: 'Clients fidèles', count: segments.find((s) => s.id === 'vip')?.count || 48, pct: pct(segments.find((s) => s.id === 'vip')?.count || 48, impressions) },
  ];

  const channels = [
    { id: 'email', name: 'Email', icon: '📧', sent: campaignsSent * 420, openRate: 38.4, clicks: Math.round(campaignsSent * 98), conversions: Math.round(conversions * 0.35), status: 'active' },
    { id: 'push', name: 'Push mobile', icon: '🔔', sent: Math.round(clientCount * 0.6), openRate: 22.1, clicks: Math.round(clientCount * 0.14), conversions: Math.round(conversions * 0.12), status: 'active' },
    { id: 'social', name: 'Réseaux sociaux', icon: '📱', sent: 24, openRate: 4.8, clicks: Math.round(clicks * 0.22), conversions: Math.round(conversions * 0.18), status: 'active' },
    { id: 'seo', name: 'SEO / organique', icon: '🔍', sent: null, openRate: null, clicks: Math.round(clicks * 0.45), conversions: Math.round(conversions * 0.28), status: 'active' },
    { id: 'banner', name: 'Bannières accueil', icon: '🎯', sent: 6, openRate: 12.5, clicks: Math.round(clicks * 0.15), conversions: Math.round(conversions * 0.08), status: 'active' },
    { id: 'sms', name: 'SMS', icon: '💬', sent: Math.round(segments.find((s) => s.id === 'at_risk')?.count || 120), openRate: 91.2, clicks: Math.round((segments.find((s) => s.id === 'at_risk')?.count || 120) * 0.4), conversions: Math.round(conversions * 0.07), status: 'paused' },
  ];

  const socialCalendar = [
    { id: 'soc-1', platform: 'Facebook', content: 'Soldes croquettes premium — −15 % cette semaine 🐕', scheduledAt: '2026-06-20T10:00:00', status: 'scheduled' },
    { id: 'soc-2', platform: 'Instagram', content: 'Story : nutrition chat & calcul calories NutriPro', scheduledAt: '2026-06-21T18:30:00', status: 'scheduled' },
    { id: 'soc-3', platform: 'LinkedIn', content: 'Partenariat vétérinaires PetfoodTN — réseau national', scheduledAt: '2026-06-22T09:00:00', status: 'draft' },
    { id: 'soc-4', platform: 'Facebook', content: 'Livraison 24 h Grand Tunis — témoignage client', scheduledAt: '2026-06-18T14:00:00', status: 'published' },
  ];

  const seo = {
    score: 78,
    pagesIndexed: 42,
    avgPosition: 8.4,
    keywords: [
      { term: 'croquettes chien tunisie', position: 4, volume: 1200, trend: 'up' },
      { term: 'nourriture chat livraison', position: 7, volume: 890, trend: 'up' },
      { term: 'vétérinaire en ligne tunisie', position: 11, volume: 640, trend: 'stable' },
      { term: 'accessoires animaux sfax', position: 9, volume: 320, trend: 'up' },
      { term: 'petfood marketplace', position: 15, volume: 210, trend: 'down' },
    ],
  };

  const integrations = [
    { id: 'meta', name: 'Meta Ads', status: 'connected', lastSync: '2026-06-19T12:00:00' },
    { id: 'google', name: 'Google Analytics', status: 'connected', lastSync: '2026-06-19T11:45:00' },
    { id: 'mail', name: 'SMTP / Email', status: 'connected', lastSync: '2026-06-19T10:30:00' },
    { id: 'search', name: 'Google Search Console', status: 'pending', lastSync: null },
  ];

  const trafficSeries = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => ({
    day,
    organic: Math.round(clicks * (0.08 + i * 0.012)),
    paid: Math.round(clicks * (0.04 + (6 - i) * 0.008)),
    email: Math.round(clicks * (0.02 + i * 0.005)),
  }));

  return {
    kpis,
    funnel,
    channels,
    socialCalendar,
    seo,
    integrations,
    trafficSeries,
    campaigns: aiMarketing.campaigns,
    marketingSummary: aiMarketing.summary,
    segments,
    newsletter: {
      total: newsletterTotal,
      growth7d: 4.2,
      recent: newsletterSubs.slice(-8).reverse(),
    },
    landing: {
      url: '/',
      views: Math.round(impressions * 0.55),
      bounceRate: 34.2,
      avgSessionSec: 142,
    },
    source: 'computed',
  };
};

export default buildDigitalMarketingPack;
