/**
 * Gamification — points, badges, récompenses après achats.
 */

export const GAMIFICATION_BADGES = [
  { id: 'first-order', icon: '🛒', label: 'Premier achat', desc: '1ère commande validée', unlocked: true, earnedAt: '2026-01-12' },
  { id: 'loyal-3', icon: '⭐', label: 'Client fidèle', desc: '3 commandes en 90 jours', unlocked: true, earnedAt: '2026-02-28' },
  { id: 'iot-pioneer', icon: '📡', label: 'Pionnier IoT', desc: 'Distributeur connecté actif', unlocked: true, earnedAt: '2026-03-05' },
  { id: 'community', icon: '👥', label: 'Ambassadeur', desc: '5 posts communauté', unlocked: false, progress: 3, target: 5 },
  { id: 'wellness', icon: '💚', label: 'Bien-être 80+', desc: 'Score bien-être animal ≥ 80', unlocked: true, earnedAt: '2026-03-10' },
  { id: 'streak-7', icon: '🔥', label: 'Série 7 jours', desc: 'Connexion 7 jours consécutifs', unlocked: false, progress: 4, target: 7 },
];

export const DEMO_GAMIFICATION_PROFILE = {
  points: 1240,
  tier: 'Argent',
  nextTierAt: 1500,
  ordersCount: 8,
  streakDays: 4,
  rewardsAvailable: 3,
  badges: GAMIFICATION_BADGES,
  recentRewards: [
    { id: 'rw-1', title: '+50 points — achat récurrent', date: '2026-03-12', points: 50 },
    { id: 'rw-2', title: 'Badge Pionnier IoT débloqué', date: '2026-03-05', points: 100 },
    { id: 'rw-3', title: '−10 % promo personnalisée', date: '2026-02-20', points: 0 },
  ],
};

export const tierProgress = (points = 0) => {
  if (points >= 2000) return { tier: 'Or', pct: 100, next: null };
  if (points >= 1500) return { tier: 'Or', pct: Math.round(((points - 1500) / 500) * 100), next: 2000 };
  if (points >= 500) return { tier: 'Argent', pct: Math.round(((points - 500) / 1000) * 100), next: 1500 };
  return { tier: 'Bronze', pct: Math.round((points / 500) * 100), next: 500 };
};

export default DEMO_GAMIFICATION_PROFILE;
