import api from '../utils/api';
import { getPets } from './userService';
import { getProducts } from './productService';
import { DEMO_NUTRITION_PETS, DEMO_PET_WEIGHT_HISTORY } from '../utils/clientDemoData';
import { buildPetNutritionRecommendation } from '../utils/petNutritionRecommender';
import { adaptNutritionFromEvolution } from '../utils/adaptiveNutritionEngine';
import { generateWeeklyDietPlan } from '../utils/weeklyDietPlanGenerator';
import { scoreProductsForPet } from '../utils/productCompatibilityScore';
import { fetchPetWeightTracking } from './ecosystemService';

export async function loadAdaptiveNutritionPack(options = {}) {
  const petsRes = await getPets().catch(() => []);
  const pets = (petsRes?.length ? petsRes : DEMO_NUTRITION_PETS).slice(0, 8);
  const products = (await getProducts().catch(() => [])) || [];

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

      const base = buildPetNutritionRecommendation(pet, options);
      const adapted = adaptNutritionFromEvolution({
        pet,
        weightHistory,
        options,
        baseRecommendation: base,
      });
      const weeklyPlan = generateWeeklyDietPlan({ pet, recommendation: adapted });
      const productScores = scoreProductsForPet(products, adapted, pet, options.productLimit || 10);

      return {
        pet,
        weightHistory,
        recommendation: adapted,
        weeklyPlan,
        productScores,
      };
    }),
  );

  return { pets: enriched, products };
}

export default loadAdaptiveNutritionPack;
