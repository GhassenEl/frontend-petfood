import api from '../utils/api';
import {
  buildAllPetNutritionRecommendations,
  buildPetNutritionRecommendation,
  matchProductsForPet,
} from '../utils/petNutritionRecommender';
import { DEMO_NUTRITION_PETS } from '../utils/clientDemoData';

export const getPetNutritionRecommendations = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.activityLevel) params.set('activityLevel', options.activityLevel);
    if (options.goal) params.set('goal', options.goal);
    if (options.isNeutered === false) params.set('isNeutered', 'false');
    if (options.mealCount) params.set('mealCount', String(options.mealCount));
    if (options.productLimit) params.set('productLimit', String(options.productLimit));
    const qs = params.toString();
    const { data } = await api.get(`/pets/nutrition${qs ? `?${qs}` : ''}`);
    return data;
  } catch {
    const petsRes = await api.get('/pets').catch(() => ({ data: [] }));
    const pets = (petsRes.data || []).length ? petsRes.data : DEMO_NUTRITION_PETS;
    return {
      pets: buildAllPetNutritionRecommendations(pets, options),
      source: 'local',
    };
  }
};

export const getPetNutritionWithProducts = async (options = {}) => {
  const [nutrition, productsRes] = await Promise.all([
    getPetNutritionRecommendations(options),
    api.get('/products').catch(() => ({ data: [] })),
  ]);

  const products = productsRes.data || [];
  const pets = (nutrition.pets || []).map((rec) => ({
    ...rec,
    suggestedProducts: matchProductsForPet(products, rec, options.productLimit || 3),
  }));

  return { ...nutrition, pets };
};

export const getSinglePetNutrition = (pet, options = {}) =>
  buildPetNutritionRecommendation(pet, options);

export default getPetNutritionRecommendations;
