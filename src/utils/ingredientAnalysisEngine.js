import { getProductDetailFields } from './productDetails';
import { expandAllergenTerms } from './petNutritionRecommender';

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const BENEFICIAL = [
  { patterns: ['saumon', 'poisson', 'huile de poisson'], label: 'Oméga-3', benefit: 'Peau, pelage et anti-inflammatoire.' },
  { patterns: ['glucosamine', 'chondroitine'], label: 'Articulations', benefit: 'Soutien cartilagineux.' },
  { patterns: ['prebiotique', 'probiotique', 'fibre'], label: 'Digestion', benefit: 'Flore intestinale et transit.' },
  { patterns: ['vitamine', 'mineral', 'taurine'], label: 'Micronutriments', benefit: 'Équilibre vitaminique et minéral.' },
  { patterns: ['riz complet', 'patate douce', 'patate'], label: 'Glucides digestibles', benefit: 'Énergie progressive.' },
];

const CONTROVERSIAL = [
  { patterns: ['colorant', 'e102', 'e110', 'e124'], label: 'Colorants artificiels', risk: 'Peu utiles — préférer sans colorant.' },
  { patterns: ['bha', 'bht', 'ethoxyquin'], label: 'Conservateurs controversés', risk: 'Antioxydants synthétiques — alternatives naturelles préférables.' },
  { patterns: ['sucre', 'sirop', 'melasse'], label: 'Sucres ajoutés', risk: 'Apport glucidique inutile — risque surpoids.' },
  { patterns: ['sous-produit', 'subproduct', 'farine animale'], label: 'Sous-produits animaux', risk: 'Qualité variable — vérifier la source.' },
];

const parseIngredientList = (product) => {
  if (Array.isArray(product?.ingredients)) return product.ingredients;
  const comp = getProductDetailFields(product).composition || product?.composition || '';
  if (!comp) return [];
  return comp.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
};

/** Analyse IA de la composition d'un aliment. */
export const analyzeProductIngredients = (product, petAllergies = []) => {
  const ingredients = parseIngredientList(product);
  const hay = normalize(ingredients.join(' ') + ' ' + getProductDetailFields(product).composition);
  const allergenTerms = expandAllergenTerms(petAllergies);

  const beneficial = [];
  BENEFICIAL.forEach(({ patterns, label, benefit }) => {
    if (patterns.some((p) => hay.includes(normalize(p)))) {
      beneficial.push({ label, benefit, icon: '✅' });
    }
  });

  const allergens = [];
  allergenTerms.forEach((term) => {
    if (term && hay.includes(term)) {
      allergens.push({ term, severity: 'high', message: `Allergène déclaré pour l'animal : ${term}.` });
    }
  });
  (product?.allergens || []).forEach((a) => {
    if (!allergens.some((x) => normalize(x.term) === normalize(a))) {
      allergens.push({ term: a, severity: 'medium', message: `Allergène produit : ${a}.` });
    }
  });

  const controversial = [];
  CONTROVERSIAL.forEach(({ patterns, label, risk }) => {
    if (patterns.some((p) => hay.includes(normalize(p)))) {
      controversial.push({ label, risk, icon: '⚠️' });
    }
  });

  const proteinSource = ingredients.find((i) =>
    /viande|poulet|saumon|agneau|canard|poisson|turkey|beef/i.test(i),
  );

  let qualityScore = 50;
  if (proteinSource && !/farine|meal|sous-produit/i.test(proteinSource)) qualityScore += 15;
  if (beneficial.length >= 2) qualityScore += 15;
  if (controversial.length === 0) qualityScore += 10;
  if (allergens.length) qualityScore -= allergens.length * 20;
  if (ingredients.length >= 5 && ingredients.length <= 15) qualityScore += 5;
  qualityScore = Math.max(0, Math.min(100, qualityScore));

  const qualityLevel =
    qualityScore >= 80 ? 'excellent' : qualityScore >= 65 ? 'good' : qualityScore >= 45 ? 'medium' : 'low';

  return {
    productId: product?.id || product?._id,
    productName: product?.name,
    ingredients,
    beneficial,
    allergens,
    controversial,
    qualityScore,
    qualityLevel,
    proteinSource: proteinSource || ingredients[0] || '—',
    summary:
      allergens.length
        ? `Attention : ${allergens.length} allergène(s) détecté(s). Qualité globale ${qualityLevel}.`
        : `Composition ${qualityLevel} — ${beneficial.length} ingrédient(s) bénéfique(s), ${controversial.length} point(s) d'attention.`,
  };
};

export const analyzeTopProductsIngredients = (products = [], petAllergies = [], limit = 5) =>
  (products || [])
    .slice(0, limit)
    .map((p) => analyzeProductIngredients(p, petAllergies));

export default analyzeProductIngredients;
