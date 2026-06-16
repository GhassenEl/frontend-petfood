import { detectReviewAnomalies } from './contentAnomalyDetector';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/** Réputation utilisateur selon qualité des contributions */
export const computeUserReputation = ({
  posts = [],
  reviews = [],
  likesReceived = 0,
  helpfulVotes = 0,
} = {}) => {
  let score = 40;
  const factors = [];

  const qualityPosts = posts.filter((p) => String(p.content || p.text || '').trim().length >= 30);
  score += qualityPosts.length * 4;
  if (qualityPosts.length) {
    factors.push({ label: 'Publications détaillées', pts: qualityPosts.length * 4 });
  }

  const photoPosts = posts.filter((p) => p.type === 'photo');
  score += photoPosts.length * 2;
  if (photoPosts.length) factors.push({ label: 'Photos partagées', pts: photoPosts.length * 2 });

  const tips = posts.filter((p) => p.type === 'tip');
  score += tips.length * 5;
  if (tips.length) factors.push({ label: 'Conseils utiles', pts: tips.length * 5 });

  (reviews || []).forEach((r) => {
    const anomaly = detectReviewAnomalies(r);
    if (!anomaly.suspicious && Number(r.rating) >= 4) {
      score += 6;
    } else if (anomaly.suspicious) {
      score -= 8;
    }
  });
  if (reviews.length) {
    factors.push({ label: 'Avis produits', pts: reviews.length * 3 });
  }

  score += Math.min(30, likesReceived * 0.5);
  score += Math.min(20, helpfulVotes * 2);
  if (likesReceived) factors.push({ label: 'Appréciations reçues', pts: Math.min(30, Math.round(likesReceived * 0.5)) });

  score = clamp(Math.round(score), 0, 100);

  let level = 'nouveau';
  let levelLabel = 'Nouveau membre';
  if (score >= 85) {
    level = 'expert';
    levelLabel = 'Expert communauté';
  } else if (score >= 70) {
    level = 'trusted';
    levelLabel = 'Contributeur de confiance';
  } else if (score >= 50) {
    level = 'actif';
    levelLabel = 'Membre actif';
  }

  return {
    score,
    level,
    levelLabel,
    factors,
    stats: {
      posts: posts.length,
      reviews: reviews.length,
      likesReceived,
      helpfulVotes,
    },
    summary:
      score >= 70
        ? 'Contributions de qualité reconnues par la communauté.'
        : score >= 50
          ? 'Continuez à partager pour monter en réputation.'
          : 'Partagez photos, conseils et avis pour gagner en crédibilité.',
  };
};

export const rankCommunityMembers = (members = []) =>
  [...members]
    .map((m) => ({
      ...m,
      reputation: computeUserReputation(m),
    }))
    .sort((a, b) => b.reputation.score - a.reputation.score);

export default computeUserReputation;
