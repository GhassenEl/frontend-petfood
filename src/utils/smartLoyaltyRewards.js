/** Récompenses fidélité personnalisées par IA selon comportement client */
export const generateSmartLoyaltyRewards = ({
  points = 0,
  orders = [],
  posts = [],
  petProfile = {},
  tier = 'standard',
} = {}) => {
  const rewards = [];
  const orderCount = (orders || []).length;
  const totalSpent = (orders || []).reduce((s, o) => s + (Number(o.total) || 0), 0);
  const communityActive = (posts || []).length >= 2;

  if (orderCount >= 3 && totalSpent >= 100) {
    rewards.push({
      id: 'reward-vip-discount',
      type: 'discount',
      title: '−15 % sur votre prochaine commande',
      description: 'Client fidèle — IA détecte un panier récurrent croquettes.',
      pointsCost: 0,
      auto: true,
      reason: 'Historique d\'achats régulier',
      priority: 'high',
    });
  }

  if (communityActive) {
    rewards.push({
      id: 'reward-community-bonus',
      type: 'points',
      title: '+25 points bonus communauté',
      description: 'Merci pour vos conseils et photos partagés sur PetFoodTN.',
      pointsCost: 0,
      auto: true,
      reason: 'Engagement communautaire',
      priority: 'medium',
    });
  }

  const animalType = petProfile.type || 'dog';
  if (animalType === 'dog') {
    rewards.push({
      id: 'reward-dog-snack',
      type: 'product',
      title: 'Friandise dentaire offerte',
      description: 'Suggestion IA selon profil chien actif.',
      pointsCost: 80,
      auto: false,
      reason: 'Profil animal',
      priority: 'medium',
    });
  } else if (animalType === 'cat') {
    rewards.push({
      id: 'reward-cat-patee',
      type: 'product',
      title: '−10 % pâtée premium chat',
      description: 'Hydratation recommandée pour chat d\'intérieur.',
      pointsCost: 60,
      auto: false,
      reason: 'Profil animal',
      priority: 'medium',
    });
  }

  if (points >= 100) {
    rewards.push({
      id: 'reward-redeem-100',
      type: 'voucher',
      title: 'Bon 10 DT',
      description: 'Échangez 100 points contre 10 DT de réduction.',
      pointsCost: 100,
      auto: false,
      reason: 'Solde points suffisant',
      priority: 'low',
    });
  }

  if (orderCount === 0) {
    rewards.push({
      id: 'reward-welcome',
      type: 'points',
      title: 'Bienvenue — 20 points offerts',
      description: 'Première commande : doublez vos points ce mois-ci.',
      pointsCost: 0,
      auto: true,
      reason: 'Nouveau client',
      priority: 'high',
    });
  }

  if (tier === 'gold' || totalSpent >= 300) {
    rewards.push({
      id: 'reward-gold-shipping',
      type: 'perk',
      title: 'Livraison express gratuite',
      description: 'Statut Gold — livraison offerte sur commande > 50 DT.',
      pointsCost: 0,
      auto: true,
      reason: 'Statut fidélité élevé',
      priority: 'high',
    });
  }

  return {
    points,
    tier,
    rewards: rewards.sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return (p[a.priority] ?? 9) - (p[b.priority] ?? 9);
    }),
    aiSummary: rewards.length
      ? `${rewards.filter((r) => r.auto).length} récompense(s) automatique(s) et ${rewards.filter((r) => !r.auto).length} à échanger selon votre profil.`
      : 'Passez commande ou participez à la communauté pour débloquer des récompenses.',
  };
};

export default generateSmartLoyaltyRewards;
