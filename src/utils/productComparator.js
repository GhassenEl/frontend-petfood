import { getProductDetailFields, getEffectiveDiscount, getPromoPrice } from './productDetails';
import { analyzeProductReviews } from './reviewInsightAnalyzer';

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const extractNutrition = (product) => {
  const fromFields = product?.nutrition;
  if (fromFields) {
    return {
      proteinPercent: fromFields.proteinPercent ?? fromFields.protein ?? '—',
      fatPercent: fromFields.fatPercent ?? fromFields.fat ?? '—',
      fiberPercent: fromFields.fiberPercent ?? fromFields.fiber ?? '—',
      kcalPer100g: fromFields.kcalPer100g ?? fromFields.kcal ?? '—',
    };
  }

  const comp = normalize(getProductDetailFields(product).composition);
  const pct = (label) => {
    const m = comp.match(new RegExp(`${label}[^\\d]*(\\d+(?:[.,]\\d+)?)\\s*%`));
    return m ? parseFloat(m[1].replace(',', '.')) : null;
  };

  const protein = pct('proteine') ?? pct('poulet') ?? (comp.includes('premium') ? 28 : 22);
  const fat = pct('graisse') ?? pct('lipide') ?? 14;
  const fiber = pct('fibre') ?? 3;
  const kcal = product?.kcalPer100g ?? (comp.includes('light') ? 320 : 360);

  return {
    proteinPercent: protein,
    fatPercent: fat,
    fiberPercent: fiber,
    kcalPer100g: kcal,
  };
};

const qualityScore = (product, reviewInsight) => {
  let score = Number(product.rating_avg || 0) * 20;
  if (reviewInsight?.avgRating) score = reviewInsight.avgRating * 20;
  if (Number(product.rating_count) > 10) score += 5;
  if (getEffectiveDiscount(product) > 0) score += 3;
  return Math.min(100, Math.round(score));
};

const valueIndex = (product) => {
  const price = getPromoPrice(product);
  const packKg = (() => {
    const m = String(product.name || '').match(/(\d+(?:[.,]\d+)?)\s*kg/i);
    return m ? parseFloat(m[1].replace(',', '.')) : 1;
  })();
  const nut = extractNutrition(product);
  const protein = Number(nut.proteinPercent) || 22;
  return Math.round((protein / Math.max(price / packKg, 1)) * 10) / 10;
};

/** Comparateur intelligent : composition, nutrition, prix, avis */
export const compareProductsSmart = (products = [], reviewsByProductId = {}) => {
  const list = (products || []).filter(Boolean);
  if (list.length < 2) return null;

  const rows = list.map((p) => {
    const id = String(p.id || p._id);
    const fields = getProductDetailFields(p);
    const nutrition = extractNutrition(p);
    const price = Number(p.price || 0);
    const promoPrice = getPromoPrice(p);
    const reviewInsight = analyzeProductReviews(reviewsByProductId[id] || []);
    const qScore = qualityScore(p, reviewInsight);

    return {
      id,
      name: p.name,
      price,
      promoPrice,
      discount: getEffectiveDiscount(p),
      composition: fields.composition,
      benefits: fields.benefits,
      nutrition,
      ratingAvg: reviewInsight?.avgRating ?? (Number(p.rating_avg) || null),
      ratingCount: reviewInsight?.count ?? (Number(p.rating_count) || 0),
      reviewSummary: reviewInsight?.summary || 'Pas assez d\'avis',
      reviewStrengths: reviewInsight?.strengths?.map((s) => s.label) || [],
      reviewWeaknesses: reviewInsight?.weaknesses?.map((w) => w.label) || [],
      qualityScore: qScore,
      valueIndex: valueIndex({ ...p, price: promoPrice }),
      stock: p.stock,
      animalType: p.animalType,
      category: p.category,
    };
  });

  const minPrice = Math.min(...rows.map((r) => r.promoPrice));
  const maxProtein = Math.max(...rows.map((r) => Number(r.nutrition.proteinPercent) || 0));
  const maxRating = Math.max(...rows.map((r) => Number(r.ratingAvg) || 0));
  const maxQuality = Math.max(...rows.map((r) => r.qualityScore));
  const maxValue = Math.max(...rows.map((r) => r.valueIndex));

  const winners = {
    price: rows.find((r) => r.promoPrice === minPrice)?.name,
    protein: rows.find((r) => Number(r.nutrition.proteinPercent) === maxProtein)?.name,
    reviews: rows.find((r) => Number(r.ratingAvg) === maxRating && maxRating > 0)?.name,
    quality: rows.find((r) => r.qualityScore === maxQuality)?.name,
    value: rows.find((r) => r.valueIndex === maxValue)?.name,
  };

  const summary = [
    winners.price && `Meilleur prix : ${winners.price}.`,
    winners.protein && `Meilleure teneur protéique : ${winners.protein}.`,
    winners.reviews && `Meilleurs avis clients : ${winners.reviews}.`,
    winners.value && `Meilleur rapport qualité/prix : ${winners.value}.`,
  ].filter(Boolean).join(' ');

  return {
    products: rows,
    winners,
    summary: summary || 'Comparaison disponible ci-dessous.',
    matrix: [
      { label: 'Prix promo', key: 'promoPrice', format: (v) => `${Number(v).toFixed(2)} DT` },
      { label: 'Protéines %', key: 'nutrition.proteinPercent' },
      { label: 'Lipides %', key: 'nutrition.fatPercent' },
      { label: 'Fibres %', key: 'nutrition.fiberPercent' },
      { label: 'kcal/100g', key: 'nutrition.kcalPer100g' },
      { label: 'Note avis', key: 'ratingAvg' },
      { label: 'Qualité /100', key: 'qualityScore' },
      { label: 'Indice valeur', key: 'valueIndex' },
    ],
  };
};

export default compareProductsSmart;
