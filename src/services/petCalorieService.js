import api from '../utils/api';

export const getAllPetCalories = async (options = {}) => {
  const params = new URLSearchParams();
  if (options.activityLevel) params.set('activityLevel', options.activityLevel);
  if (options.goal) params.set('goal', options.goal);
  if (options.isNeutered === false) params.set('isNeutered', 'false');
  if (options.mealCount) params.set('mealCount', String(options.mealCount));
  if (options.kcalPer100g) params.set('kcalPer100g', String(options.kcalPer100g));
  const qs = params.toString();
  const { data } = await api.get(`/pets/calories${qs ? `?${qs}` : ''}`);
  return data;
};

export const updatePetWeight = async (petId, weight) => {
  const { data } = await api.put(`/pets/${petId}`, { weight: Number(weight) });
  return data;
};
