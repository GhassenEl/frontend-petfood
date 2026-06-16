const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const POSITIVE = ['excellent', 'super', 'parfait', 'adore', 'genial', 'merveilleux', 'top', 'satisfait', 'rapide', 'qualite'];
const NEGATIVE = ['mauvais', 'nul', 'horrible', 'decevant', 'frustr', 'deçu', 'catastrophe', 'refuse', 'retard', 'arnaque', 'dechire'];

const sentimentOfText = (text = '') => {
  const norm = normalize(text);
  const pos = POSITIVE.filter((w) => norm.includes(w)).length;
  const neg = NEGATIVE.filter((w) => norm.includes(w)).length;
  if (neg > pos) return 'negative';
  if (pos > neg) return 'positive';
  return 'neutral';
};

/** Analyse globale de réputation et satisfaction utilisateurs. */
export const analyzePlatformReputation = ({ reviews = [], complaints = [] } = {}) => {
  const sentiments = { positive: 0, negative: 0, neutral: 0 };
  const ratingSum = [];
  const themes = { delivery: 0, quality: 0, price: 0, service: 0 };

  (reviews || []).forEach((r) => {
    const s = sentimentOfText(r.comment || r.content || '');
    sentiments[s] += 1;
    const rating = Number(r.rating);
    if (rating) ratingSum.push(rating);

    const norm = normalize(r.comment || '');
    if (/livraison|livreur|retard|colis/.test(norm)) themes.delivery += 1;
    if (/qualite|defect|cassee|conforme/.test(norm)) themes.quality += 1;
    if (/prix|cher|rapport/.test(norm)) themes.price += 1;
    if (/service|support|client/.test(norm)) themes.service += 1;
  });

  (complaints || []).forEach((c) => {
    const s = sentimentOfText(`${c.subject || ''} ${c.message || ''}`);
    sentiments.negative += 1;
    if (s === 'positive') sentiments.positive += 1;
  });

  const total = sentiments.positive + sentiments.negative + sentiments.neutral || 1;
  const avgRating = ratingSum.length
    ? Math.round((ratingSum.reduce((a, b) => a + b, 0) / ratingSum.length) * 10) / 10
    : null;

  const satisfactionScore = Math.round(
    ((sentiments.positive / total) * 0.5 + ((avgRating || 3) / 5) * 0.5) * 100,
  );

  const negativeReviews = (reviews || []).filter(
    (r) => Number(r.rating) <= 2 || sentimentOfText(r.comment) === 'negative',
  );

  let trend = 'stable';
  if (satisfactionScore >= 75) trend = 'positive';
  else if (satisfactionScore < 55) trend = 'negative';

  const topThemes = Object.entries(themes)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, count]) => ({
      key,
      label: { delivery: 'Livraison', quality: 'Qualité produit', price: 'Prix', service: 'Service client' }[key],
      count,
    }));

  return {
    satisfactionScore,
    trend,
    avgRating,
    sentiments: {
      positive: sentiments.positive,
      negative: sentiments.negative,
      neutral: sentiments.neutral,
      positivePct: Math.round((sentiments.positive / total) * 100),
      negativePct: Math.round((sentiments.negative / total) * 100),
      neutralPct: Math.round((sentiments.neutral / total) * 100),
    },
    negativeReviewCount: negativeReviews.length,
    complaintCount: complaints.length,
    reviewCount: reviews.length,
    topThemes,
    summary:
      trend === 'positive'
        ? 'Satisfaction globale élevée — surveiller les avis négatifs récents.'
        : trend === 'negative'
          ? 'Tension détectée sur la satisfaction — prioriser les réclamations ouvertes.'
          : 'Satisfaction stable — maintenir la qualité de modération.',
  };
};

export default analyzePlatformReputation;
