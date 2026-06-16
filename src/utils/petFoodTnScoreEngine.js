import { extractNutritionFromProduct } from './productNutritionExtract';
import { analyzeProductIngredients } from './ingredientAnalysisEngine';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/** Score nutritionnel PetFoodTN (0–100) — protéines, lipides, vitamines, minéraux, digestibilité. */
export const computePetFoodTnScore = (product, petContext = {}) => {
  const nut = extractNutritionFromProduct(product);
  const ingredientAnalysis = analyzeProductIngredients(product, petContext.allergies || []);
  const type = petContext.type || 'dog';

  const protein = Number(nut.proteinPercent) || 22;
  const fat = Number(nut.fatPercent) || 14;
  const fiber = Number(nut.fiberPercent) || 3;
  const kcal = Number(nut.kcalPer100g) || 360;

  const proteinScore = clamp(
    type === 'cat' ? (protein - 20) * 4 + 50 : (protein - 18) * 3.5 + 50,
    0,
    100,
  );
  const fatScore = clamp(100 - Math.abs(fat - (type === 'cat' ? 16 : 14)) * 8, 0, 100);
  const fiberScore = clamp(fiber >= 2 && fiber <= 6 ? 85 : 55, 0, 100);
  const vitaminScore = ingredientAnalysis.beneficial.some((b) => /vitamine|mineral|micronutrim/i.test(b.label))
    ? 88
    : /vitamine|mineral/i.test(String(product?.composition || ''))
      ? 75
      : 60;
  const mineralScore = /calcium|phosphore|zinc|taurine|sel/i.test(String(product?.composition || '')) ? 82 : 65;
  const digestibilityScore = clamp(
    100
      - ingredientAnalysis.controversial.length * 12
      - (ingredientAnalysis.allergens.length ? 25 : 0)
      + (ingredientAnalysis.beneficial.length * 5),
    0,
    100,
  );

  const weights = { protein: 0.28, fat: 0.18, vitamins: 0.15, minerals: 0.12, digestibility: 0.27 };
  const overall = Math.round(
    proteinScore * weights.protein
      + fatScore * weights.fat
      + vitaminScore * weights.vitamins
      + mineralScore * weights.minerals
      + digestibilityScore * weights.digestibility,
  );

  const grade =
    overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 55 ? 'C' : overall >= 40 ? 'D' : 'E';

  return {
    productId: product?.id || product?._id,
    productName: product?.name,
    overall,
    grade,
    breakdown: {
      protein: { score: Math.round(proteinScore), value: `${protein} %`, label: 'Qualité protéines' },
      fat: { score: Math.round(fatScore), value: `${fat} %`, label: 'Matières grasses' },
      vitamins: { score: Math.round(vitaminScore), value: 'Analysé', label: 'Vitamines' },
      minerals: { score: Math.round(mineralScore), value: 'Analysé', label: 'Minéraux' },
      digestibility: { score: Math.round(digestibilityScore), value: `${kcal} kcal/100g`, label: 'Digestibilité' },
    },
    ingredientAnalysis,
    summary: `Score PetFoodTN ${overall}/100 (grade ${grade}) — ${product?.name || 'Produit'}.`,
  };
};

export const scoreProductsPetFoodTn = (products = [], petContext = {}, limit = 8) =>
  (products || [])
    .map((p) => computePetFoodTnScore(p, petContext))
    .sort((a, b) => b.overall - a.overall)
    .slice(0, limit);

export default computePetFoodTnScore;
