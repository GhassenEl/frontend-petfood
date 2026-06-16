import { recommendNutritionForPathology } from './vetClinicalIntelligenceEngine';
import { parsePetHealthFlags, parsePetAllergies } from './petNutritionRecommender';

const PATHOLOGY_PRODUCT_KEYWORDS = {
  Obésité: ['light', 'weight', 'satiety', 'light'],
  Diabète: ['diabetic', 'diabete', 'low carb', 'fibres'],
  'Allergie / dermatite': ['hypoallergenic', 'hypo', 'saumon', 'canard', 'limited'],
  Arthrose: ['mobility', 'articulation', 'glucosamine', 'omega'],
  'Insuffisance rénale': ['renal', 'rein', 'kidney'],
};

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** Alimentation thérapeutique assistée — produits adaptés aux pathologies. */
export const buildClientTherapeuticNutrition = (pet, products = [], recommendation = {}) => {
  const flags = parsePetHealthFlags(pet);
  const allergies = parsePetAllergies(pet);
  const pathologies = flags.map((f) => f.key);

  const pathologyLabels = {
    obesite: 'Obésité',
    diabete: 'Diabète',
    digestif: 'Sensibilité digestive',
    articulation: 'Arthrose',
    renal: 'Insuffisance rénale',
  };

  const activePathologies = flags.length
    ? flags.map((f) => pathologyLabels[f.key] || f.key)
    : recommendation.weightStatus === 'overweight'
      ? ['Obésité']
      : [];

  const plans = activePathologies.length
    ? activePathologies.flatMap((p) =>
        recommendNutritionForPathology({
          pathology: p,
          pet: { ...pet, weightKg: pet.weightKg ?? pet.weight },
          allergies: allergies.join(', '),
        }).plans,
      )
    : recommendNutritionForPathology({ pathology: 'Maintenance', pet }).plans;

  const matchedProducts = (products || [])
    .map((product) => {
      const hay = normalize(
        [product.name, product.description, product.category, product.composition, ...(product.tags || [])].join(' '),
      );
      let matchScore = 0;
      const matchedPlans = [];

      plans.forEach((plan) => {
        const keywords = PATHOLOGY_PRODUCT_KEYWORDS[plan.pathology] || [];
        const hits = keywords.filter((k) => hay.includes(normalize(k)));
        if (hits.length) {
          matchScore += hits.length * 15;
          matchedPlans.push(plan.pathology);
        }
      });

      if (allergies.some((a) => hay.includes(normalize(a)))) matchScore = 0;

      return matchScore > 0
        ? { product, matchScore, matchedPlans: [...new Set(matchedPlans)] }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);

  return {
    petName: pet?.name || 'Animal',
    pathologies: activePathologies,
    plans,
    recommendedProducts: matchedProducts,
    vetNote: 'Alimentation thérapeutique — validation vétérinaire obligatoire avant tout changement.',
    aiSummary:
      activePathologies.length
        ? `${activePathologies.length} pathologie(s) — ${matchedProducts.length} produit(s) thérapeutique(s) suggéré(s).`
        : 'Aucune pathologie signalée — alimentation de maintenance recommandée.',
  };
};

export default buildClientTherapeuticNutrition;
