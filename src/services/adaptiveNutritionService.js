import { getPets } from './userService';
import { getProducts } from './productService';
import {
  DEMO_NUTRITION_PETS,
  DEMO_PET_WEIGHT_HISTORY,
  DEMO_PET_FOOD_JOURNAL,
  DEMO_PET_FOOD_PREFERENCES,
  DEMO_PET_VET_NUTRITION_RECS,
  DEMO_DIGITAL_TWIN_SNAPSHOTS,
} from '../utils/clientDemoData';
import { buildPetNutritionRecommendation } from '../utils/petNutritionRecommender';
import { adaptNutritionFromEvolution } from '../utils/adaptiveNutritionEngine';
import { generateWeeklyDietPlan } from '../utils/weeklyDietPlanGenerator';
import { scoreProductsForPet } from '../utils/productCompatibilityScore';
import { fetchPetWeightTracking } from './ecosystemService';
import { buildIntelligentNutritionProgram } from '../utils/intelligentNutritionEngine';
import { buildPetNutritionProfile } from '../utils/petNutritionProfileEngine';
import { analyzeTopProductsIngredients } from '../utils/ingredientAnalysisEngine';
import { scoreProductsPetFoodTn } from '../utils/petFoodTnScoreEngine';
import { buildFoodTransitionPlan } from '../utils/foodTransitionEngine';
import { generateMultiProductWeeklyMenus } from '../utils/multiProductMenuGenerator';
import { analyzeFoodJournal } from '../utils/foodJournalEngine';
import { buildClientTherapeuticNutrition } from '../utils/clientTherapeuticNutritionEngine';
import { predictFutureNutritionNeeds } from '../utils/futureNutritionPredictor';

const enrichProductsWithNutrition = (products) =>
  (products || []).map((p) => {
    if (p.nutrition || p.ingredients) return p;
    const name = String(p.name || '').toLowerCase();
    if (/senior|mobilit/i.test(name)) {
      return {
        ...p,
        nutrition: { protein: 24, fat: 11, fiber: 4, kcalPer100g: 340 },
        composition: 'Viande déshydratée, riz, glucosamine, oméga-3, vitamines',
      };
    }
    if (/light|weight/i.test(name)) {
      return {
        ...p,
        nutrition: { protein: 28, fat: 9, fiber: 6, kcalPer100g: 310 },
        composition: 'Viande maigre, fibres, prébiotiques, sans colorant',
      };
    }
    if (/hypo|saumon|canard/i.test(name)) {
      return {
        ...p,
        nutrition: { protein: 26, fat: 14, fiber: 3, kcalPer100g: 355 },
        composition: 'Saumon, patate douce, huile de poisson, vitamines & minéraux',
      };
    }
    if (/renal|rein/i.test(name)) {
      return {
        ...p,
        nutrition: { protein: 18, fat: 12, fiber: 3, kcalPer100g: 330 },
        composition: 'Protéines modérées, phosphore contrôlé, oméga-3',
      };
    }
    return {
      ...p,
      nutrition: p.nutrition || { protein: 26, fat: 12, fiber: 4, kcalPer100g: 360 },
      composition: p.composition || p.description || 'Viande déshydratée, céréales, vitamines & minéraux',
    };
  });

export async function loadAdaptiveNutritionPack(options = {}) {
  const petsRes = await getPets().catch(() => []);
  const pets = (petsRes?.length ? petsRes : DEMO_NUTRITION_PETS).slice(0, 8);
  const rawProducts = (await getProducts().catch(() => [])) || [];
  const products = enrichProductsWithNutrition(rawProducts);

  const enriched = await Promise.all(
    pets.map(async (pet) => {
      const petId = String(pet.id || pet._id);
      let weightHistory = DEMO_PET_WEIGHT_HISTORY[petId] || [];

      try {
        const tracking = await fetchPetWeightTracking(petId);
        if (tracking?.series?.length) {
          weightHistory = tracking.series.map((s) => ({
            date: s.date || s.recordedAt,
            weightKg: s.weightKg ?? s.weight,
          }));
        }
      } catch {
        /* démo */
      }

      const journalEntries =
        DEMO_PET_FOOD_JOURNAL[petId]
        || DEMO_DIGITAL_TWIN_SNAPSHOTS[petId]?.feeding?.history
        || [];

      const base = buildPetNutritionRecommendation(pet, options);
      const adapted = adaptNutritionFromEvolution({
        pet,
        weightHistory,
        options,
        baseRecommendation: base,
      });

      const petContext = {
        type: pet.type,
        allergies: adapted.allergies || [],
        activityLevel: options.activityLevel,
      };

      const weeklyPlan = generateWeeklyDietPlan({ pet, recommendation: adapted });
      const productScores = scoreProductsForPet(products, adapted, pet, options.productLimit || 10);
      const intelligentProgram = buildIntelligentNutritionProgram(pet, adapted, options);

      const nutritionProfile = buildPetNutritionProfile(pet, adapted, {
        activityLevel: options.activityLevel,
        preferences: DEMO_PET_FOOD_PREFERENCES[petId],
        consumptionHistory: journalEntries,
        vetRecommendations: DEMO_PET_VET_NUTRITION_RECS[petId],
      });

      const petFoodTnScores = scoreProductsPetFoodTn(products, petContext, 8);
      const topProductsForAnalysis = petFoodTnScores
        .map((s) => products.find((p) => String(p.id || p._id) === String(s.productId)))
        .filter(Boolean);

      const ingredientAnalyses = analyzeTopProductsIngredients(
        topProductsForAnalysis.length ? topProductsForAnalysis : products,
        adapted.allergies,
        5,
      );

      const topProduct = petFoodTnScores[0];
      const currentFood = journalEntries[0]?.product || 'Aliment actuel';
      const newFood = topProduct?.productName || products[0]?.name || 'Nouvel aliment recommandé';

      const transitionPlan = buildFoodTransitionPlan({
        pet,
        recommendation: adapted,
        currentFood,
        newFood,
        days: pet.type === 'cat' ? 10 : 7,
      });

      const multiProductMenu = generateMultiProductWeeklyMenus({
        pet,
        recommendation: adapted,
        scoredProducts: petFoodTnScores,
      });

      const foodJournal = analyzeFoodJournal({
        entries: journalEntries,
        weightHistory,
        recommendation: adapted,
        pet,
      });

      const therapeuticNutrition = buildClientTherapeuticNutrition(pet, products, adapted);

      const futureTimeline = predictFutureNutritionNeeds(pet, [3, 6, 12]);

      return {
        pet,
        weightHistory,
        recommendation: adapted,
        weeklyPlan,
        productScores,
        intelligentProgram,
        nutritionProfile,
        petFoodTnScores,
        ingredientAnalyses,
        transitionPlan,
        multiProductMenu,
        foodJournal,
        therapeuticNutrition,
        futureTimeline,
      };
    }),
  );

  return { pets: enriched, products };
}

export default loadAdaptiveNutritionPack;
