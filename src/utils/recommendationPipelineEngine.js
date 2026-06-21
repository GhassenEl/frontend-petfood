import { scoreProductCompatibility } from './productCompatibilityScore';
import { ROLE_PIPELINE_META } from './recommendationDemoData';

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const jaccard = (a = [], b = []) => {
  const setA = new Set(a);
  const setB = new Set(b);
  if (!setA.size && !setB.size) return 0;
  let inter = 0;
  setA.forEach((x) => { if (setB.has(x)) inter += 1; });
  return inter / (setA.size + setB.size - inter);
};

/** Profil contenu depuis préférences + historique */
export const buildContentProfile = ({
  userId,
  petType,
  categories = [],
  tags = [],
  preferences = [],
  historyItemIds = [],
  favoriteCategories = [],
  focus = [],
  role = 'client',
} = {}) => ({
  userId,
  role,
  petType: petType || null,
  categories: [...new Set(categories)],
  tags: [...new Set(tags)],
  preferences: [...new Set(preferences)],
  historyItemIds: [...new Set(historyItemIds)],
  favoriteCategories: [...new Set(favoriteCategories)],
  focus: [...new Set(focus)],
});

/** Score contenu 0–1 selon adéquation item ↔ profil */
export const scoreContentBased = (item, profile = {}) => {
  if (!item) return { score: 0, reasons: [] };

  const reasons = [];
  let score = 0;

  const hay = normalize(
    `${item.name} ${item.description || ''} ${item.category || ''} ${item.type || ''} ${item.animalType || ''} ${(item.tags || []).join(' ')}`,
  );

  if (profile.petType && item.animalType === profile.petType) {
    score += 0.28;
    reasons.push(`Espèce ${profile.petType}`);
  }

  if (profile.categories?.length && profile.categories.includes(item.category)) {
    score += 0.18;
    reasons.push(`Catégorie ${item.category}`);
  }

  if (profile.favoriteCategories?.length && profile.favoriteCategories.includes(item.category)) {
    score += 0.12;
    reasons.push('Catégorie favorite');
  }

  const tagHits = (profile.tags || []).filter((t) => hay.includes(normalize(t)));
  if (tagHits.length) {
    score += Math.min(0.15, tagHits.length * 0.05);
    reasons.push(`Tags : ${tagHits.slice(0, 2).join(', ')}`);
  }

  const prefHits = (profile.preferences || []).filter((p) => hay.includes(normalize(p)));
  if (prefHits.length) {
    score += Math.min(0.12, prefHits.length * 0.04);
    reasons.push('Préférences historiques');
  }

  if (profile.historyItemIds?.includes(item.id)) {
    score -= 0.25;
    reasons.push('Déjà acheté / consulté');
  }

  const focusHits = (profile.focus || []).filter((f) => hay.includes(normalize(f)));
  if (focusHits.length) {
    score += Math.min(0.2, focusHits.length * 0.08);
    reasons.push(`Focus : ${focusHits[0]}`);
  }

  if (Number(item.rating_avg) >= 4) {
    score += 0.08;
    reasons.push('Bien noté');
  }

  if (Number(item.popularity) > 50) {
    score += 0.06;
    reasons.push('Populaire');
  }

  if (item.product && profile.petType) {
    const compat = scoreProductCompatibility(item.product, { type: profile.petType }, { type: profile.petType });
    if (compat?.score >= 70) {
      score += 0.1;
      reasons.push(`Compatibilité ${compat.score}%`);
    }
  }

  return {
    score: Math.max(0, Math.min(1, Math.round(score * 1000) / 1000)),
    reasons: reasons.slice(0, 3),
    method: 'content_based',
  };
};

/** Utilisateurs similaires via Jaccard sur items + tags */
export const findSimilarUsers = (userId, interactions = [], topK = 5) => {
  const target = interactions.find((u) => u.userId === userId);
  if (!target) return [];

  const targetItems = target.itemIds || [];
  const targetTags = [...(target.tags || []), ...(target.categories || []), ...(target.focus || [])];

  return interactions
    .filter((u) => u.userId !== userId)
    .map((u) => {
      const itemSim = jaccard(targetItems, u.itemIds || []);
      const metaSim = jaccard(targetTags, [...(u.tags || []), ...(u.categories || []), ...(u.focus || [])]);
      const petBonus = target.petType && u.petType === target.petType ? 0.15 : 0;
      const similarity = Math.min(1, itemSim * 0.7 + metaSim * 0.2 + petBonus);
      return { userId: u.userId, similarity, itemIds: u.itemIds || [] };
    })
    .filter((u) => u.similarity > 0.08)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
};

/** Score collaboratif : items aimés par utilisateurs similaires */
export const scoreCollaborative = (item, similarUsers = [], interactions = []) => {
  if (!item || !similarUsers.length) {
    return { score: 0, reasons: [], method: 'collaborative_filtering', similarUsers: [] };
  }

  let score = 0;
  const reasons = [];
  const contributors = [];

  similarUsers.forEach(({ userId, similarity, itemIds }) => {
    if (itemIds.includes(item.id)) {
      score += similarity * 0.35;
      contributors.push(userId);
    }
  });

  const coCount = interactions.filter(
    (u) => (u.itemIds || []).includes(item.id) && similarUsers.some((s) => s.userId === u.userId),
  ).length;

  if (coCount >= 2) {
    score += 0.15;
    reasons.push('Co-achat fréquent');
  }

  if (contributors.length) {
    reasons.push(`${contributors.length} profil(s) similaire(s)`);
  }

  return {
    score: Math.max(0, Math.min(1, Math.round(score * 1000) / 1000)),
    reasons,
    method: 'collaborative_filtering',
    similarUsers: contributors,
  };
};

/** Pipeline hybride complet */
export const runRecommendationPipeline = ({
  role = 'client',
  userId,
  items = [],
  profile,
  interactions = [],
  limit = 12,
  contentWeight,
  collabWeight,
} = {}) => {
  const meta = ROLE_PIPELINE_META[role] || ROLE_PIPELINE_META.client;
  const wContent = contentWeight ?? meta.contentWeight;
  const wCollab = collabWeight ?? meta.collabWeight;
  const totalW = wContent + wCollab || 1;

  const similarUsers = findSimilarUsers(userId, interactions);

  const ranked = items
    .map((item) => {
      const content = scoreContentBased(item, profile);
      const collab = scoreCollaborative(item, similarUsers, interactions);
      const hybridScore = Math.round(
        ((content.score * wContent + collab.score * wCollab) / totalW) * 1000,
      ) / 1000;

      const reasons = [
        ...content.reasons.map((r) => `[Contenu] ${r}`),
        ...collab.reasons.map((r) => `[Collab] ${r}`),
      ].slice(0, 4);

      return {
        ...item,
        contentScore: content.score,
        collaborativeScore: collab.score,
        hybridScore,
        reasons,
        recommendedReason: reasons[0]?.replace(/^\[(Contenu|Collab)\]\s*/, '') || 'Recommandé pour vous',
      };
    })
    .filter((i) => i.hybridScore > 0.05)
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, limit);

  return {
    role,
    userId,
    meta,
    profile,
    similarUsers,
    pipeline: {
      steps: [
        { id: 'profile', label: 'Profil contenu', status: 'done', detail: `${profile.historyItemIds?.length || 0} interactions historiques` },
        { id: 'similar', label: 'Utilisateurs similaires', status: similarUsers.length ? 'done' : 'skip', detail: `${similarUsers.length} profils` },
        { id: 'content', label: 'Filtrage contenu', status: 'done', weight: wContent },
        { id: 'collab', label: 'Filtrage collaboratif', status: 'done', weight: wCollab },
        { id: 'fusion', label: 'Fusion hybride', status: 'done', detail: `${ranked.length} recommandations` },
      ],
      weights: { content: wContent, collaborative: wCollab },
    },
    recommendations: ranked,
    generatedAt: new Date().toISOString(),
  };
};

export default {
  buildContentProfile,
  scoreContentBased,
  findSimilarUsers,
  scoreCollaborative,
  runRecommendationPipeline,
};
