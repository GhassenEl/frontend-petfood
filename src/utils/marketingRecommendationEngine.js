import { segmentClientsByPurchases } from './clientSegmentationEngine';
import { detectMarketTrends } from './marketTrendDetector';

/** Recommandations marketing ciblées selon comportement clients */
export const generateMarketingRecommendations = ({
  orders = [],
  users = [],
  products = [],
} = {}) => {
  const { segments = [] } = segmentClientsByPurchases({ orders, users });
  const trends = detectMarketTrends({ orders, products });

  const campaigns = [];

  segments.forEach((seg) => {
    if (seg.id === 'vip') {
      campaigns.push({
        id: 'camp-vip',
        title: 'Offre exclusive clients VIP',
        target: seg.label,
        channel: 'email + push',
        offer: '−15 % sur croquettes premium + livraison offerte',
        expectedLift: '+12 % CA',
        priority: 'high',
        reason: `${seg.count || 0} client(s) à fort panier moyen`,
      });
    }
    if (seg.id === 'at_risk') {
      campaigns.push({
        id: 'camp-winback',
        title: 'Campagne réactivation',
        target: seg.label,
        channel: 'email',
        offer: 'Bon 10 DT + rappel fidélité',
        expectedLift: '+8 % retours',
        priority: 'medium',
        reason: 'Réengager les comptes sans commande récente',
      });
    }
  });

  (trends.risingCategories || []).slice(0, 2).forEach((t) => {
    campaigns.push({
      id: `camp-trend-${t.category}`,
      title: `Promo tendance : ${t.label}`,
      target: 'Tous clients',
      channel: 'bannière accueil',
      offer: `−10 % catégorie ${t.label}`,
      expectedLift: `+${Math.abs(t.growthUnitsPct || 15)} % ventes catégorie`,
      priority: 'high',
      reason: t.insight || 'Croissance marché détectée',
    });
  });

  if (!campaigns.length) {
    campaigns.push({
      id: 'camp-default',
      title: 'Soldes saisonnières croquettes',
      target: 'Clients chiens & chats',
      channel: 'newsletter',
      offer: '−12 % sur sélection 12 kg',
      expectedLift: '+10 % volume',
      priority: 'medium',
      reason: 'Campagne générique selon historique ventes',
    });
  }

  return {
    campaigns: campaigns.sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return (p[a.priority] ?? 9) - (p[b.priority] ?? 9);
    }),
    segmentCount: segments.length,
    summary: `${campaigns.length} campagne(s) suggérée(s) selon segments clients et tendances marché.`,
  };
};

export default generateMarketingRecommendations;
