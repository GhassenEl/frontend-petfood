const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const STRENGTH_THEMES = [
  { id: 'quality', label: 'Bonne qualité', keywords: ['qualite', 'premium', 'excellent', 'super', 'parfait'] },
  { id: 'appetite', label: 'Appétence', keywords: ['adore', 'appet', 'mange', 'gourmand', 'friand', 'apprecie'] },
  { id: 'digestibility', label: 'Digestibilité', keywords: ['digest', 'estomac', 'transit', 'selles', 'facile'] },
  { id: 'value', label: 'Rapport qualité-prix', keywords: ['rapport', 'prix', 'economique', 'bon plan', 'valeur'] },
  { id: 'delivery', label: 'Livraison rapide', keywords: ['livraison', 'livre', 'rapide', 'recu', 'colis'] },
  { id: 'coat', label: 'Pelage / peau', keywords: ['pelage', 'poil', 'poils', 'peau', 'brillant'] },
  { id: 'energy', label: 'Énergie / vitalité', keywords: ['energie', 'vital', 'actif', 'dynamique', 'forme'] },
];

const WEAKNESS_THEMES = [
  { id: 'price', label: 'Prix élevé', keywords: ['cher', 'couteux', 'coûteux', 'prix eleve'] },
  { id: 'smell', label: 'Odeur', keywords: ['odeur', 'sent', 'puant', 'fetide'] },
  { id: 'packaging', label: 'Emballage', keywords: ['emballage', 'sachet', 'boite', 'abime', 'dechire'] },
  { id: 'refusal', label: 'Refus alimentaire', keywords: ['refuse', 'n aime pas', 'gout', 'appetence faible'] },
  { id: 'digest_issue', label: 'Troubles digestifs', keywords: ['vomit', 'diarr', 'diarrhee', 'ballonnement', 'colique'] },
  { id: 'delay', label: 'Retard livraison', keywords: ['retard', 'attente', 'trop long'] },
];

const countThemeHits = (text, themes) => {
  const hits = [];
  themes.forEach((theme) => {
    const count = theme.keywords.filter((kw) => text.includes(kw)).length;
    if (count > 0) hits.push({ ...theme, count });
  });
  return hits.sort((a, b) => b.count - a.count);
};

const reviewProductId = (r) => {
  const p = r?.productId || r?.product;
  if (!p) return '';
  return String(p._id || p.id || p);
};

/**
 * Analyse agrégée des avis d'un produit : points forts, faiblesses, note moyenne.
 */
export const analyzeProductReviews = (reviews = []) => {
  const list = (reviews || []).filter((r) => String(r.comment || '').trim().length >= 5);
  if (!list.length) return null;

  const ratings = list.map((r) => Number(r.rating || 0)).filter(Boolean);
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  const positive = list.filter((r) => Number(r.rating) >= 4);
  const negative = list.filter((r) => Number(r.rating) <= 2);

  const strengthMap = new Map();
  const weaknessMap = new Map();

  positive.forEach((r) => {
    const text = normalize(r.comment);
    countThemeHits(text, STRENGTH_THEMES).forEach(({ id, label, count }) => {
      const prev = strengthMap.get(id) || { id, label, count: 0 };
      strengthMap.set(id, { ...prev, count: prev.count + count });
    });
  });

  negative.forEach((r) => {
    const text = normalize(r.comment);
    countThemeHits(text, WEAKNESS_THEMES).forEach(({ id, label, count }) => {
      const prev = weaknessMap.get(id) || { id, label, count: 0 };
      weaknessMap.set(id, { ...prev, count: prev.count + count });
    });
  });

  const toRanked = (map, total) =>
    [...map.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((item) => ({
        ...item,
        pct: total ? Math.round((item.count / total) * 100) : 0,
      }));

  const strengths = toRanked(strengthMap, positive.length || 1);
  const weaknesses = toRanked(weaknessMap, negative.length || 1);

  const emotionCounts = list.reduce((acc, r) => {
    const e = r.emotion || 'neutral';
    acc[e] = (acc[e] || 0) + 1;
    return acc;
  }, {});
  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

  let summary = '';
  if (avgRating >= 4.5) summary = 'Produit très bien noté par les clients.';
  else if (avgRating >= 3.5) summary = 'Retours globalement positifs avec quelques réserves.';
  else if (avgRating >= 2.5) summary = 'Avis mitigés — lisez les détails avant achat.';
  else summary = 'Retours clients plutôt négatifs.';

  if (strengths[0]) summary += ` Point fort : ${strengths[0].label.toLowerCase()}.`;
  if (weaknesses[0]) summary += ` Point faible : ${weaknesses[0].label.toLowerCase()}.`;

  return {
    count: list.length,
    avgRating,
    positiveCount: positive.length,
    negativeCount: negative.length,
    topEmotion,
    strengths,
    weaknesses,
    summary,
  };
};

export const filterReviewsByProduct = (reviews, productId) => {
  const pid = String(productId || '');
  if (!pid) return [];
  return (reviews || []).filter((r) => reviewProductId(r) === pid);
};

export default analyzeProductReviews;
