import { expandAllergenTerms, parsePetAllergies } from './petNutritionRecommender';

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** Score 0–100 d'adéquation produit ↔ profil animal */
export const scoreProductCompatibility = (product, recommendation = {}, pet = {}) => {
  if (!product) return null;

  const type = recommendation.type || pet?.type || 'dog';
  const hay = normalize(
    `${product.name} ${product.description || ''} ${product.category || ''} ${product.animalType || ''} ${(product.tags || []).join(' ')} ${product.composition || ''}`,
  );
  const keywords = (recommendation.productKeywords || []).map(normalize);
  const allergenTerms = expandAllergenTerms([
    ...(recommendation.allergies || []),
    ...parsePetAllergies(pet),
  ]);

  const factors = [];
  let raw = 0;
  const maxRaw = 28;

  if (product.animalType === type || product.petType === type) {
    raw += 6;
    factors.push({ label: 'Espèce compatible', pts: 6, max: 6 });
  } else {
    factors.push({ label: 'Espèce', pts: 0, max: 6 });
  }

  let kwScore = 0;
  keywords.forEach((kw) => {
    if (kw && hay.includes(kw)) kwScore += 2;
  });
  kwScore = Math.min(8, kwScore);
  raw += kwScore;
  factors.push({ label: 'Profil nutritionnel', pts: kwScore, max: 8 });

  if (recommendation.goal === 'perte' && hay.includes('light')) {
    raw += 4;
    factors.push({ label: 'Objectif perte de poids', pts: 4, max: 4 });
  } else if (recommendation.lifeStage === 'senior' && hay.includes('senior')) {
    raw += 4;
    factors.push({ label: 'Formule senior', pts: 4, max: 4 });
  } else {
    factors.push({ label: 'Objectif / stade', pts: 0, max: 4 });
  }

  const allergenHit = allergenTerms.filter((t) => t && hay.includes(t));
  if (allergenHit.length) {
    raw -= allergenHit.length * 10;
    factors.push({ label: 'Allergènes', pts: -allergenHit.length * 10, max: 0, warn: allergenHit.join(', ') });
  } else if (allergenTerms.length && (hay.includes('hypoallerg') || hay.includes('mono-proteine'))) {
    raw += 5;
    factors.push({ label: 'Hypoallergénique', pts: 5, max: 5 });
  }

  if (Number(product.rating_avg) >= 4) {
    raw += 2;
    factors.push({ label: 'Avis clients', pts: 2, max: 2 });
  }

  if (Number(product.stock ?? product.quantity ?? 0) <= 0) {
    raw -= 5;
    factors.push({ label: 'Stock', pts: -5, max: 0, warn: 'Rupture' });
  }

  const score = Math.max(0, Math.min(100, Math.round((raw / maxRaw) * 100)));
  let level = 'faible';
  if (score >= 85) level = 'excellent';
  else if (score >= 70) level = 'bon';
  else if (score >= 50) level = 'moyen';

  return {
    productId: product.id || product._id,
    productName: product.name,
    score,
    level,
    factors,
    compatible: score >= 50 && !allergenHit.length,
    summary:
      score >= 85
        ? 'Très adapté au profil de votre animal'
        : score >= 70
          ? 'Bonne adéquation globale'
          : score >= 50
            ? 'Acceptable avec réserves'
            : allergenHit.length
              ? 'Non recommandé — allergène détecté'
              : 'Faible compatibilité',
  };
};

export const scoreProductsForPet = (products = [], recommendation = {}, pet = {}, limit = 12) =>
  (products || [])
    .map((p) => ({
      product: p,
      compatibility: scoreProductCompatibility(p, recommendation, pet),
    }))
    .filter((x) => x.compatibility)
    .sort((a, b) => b.compatibility.score - a.compatibility.score)
    .slice(0, limit);

export default scoreProductCompatibility;
