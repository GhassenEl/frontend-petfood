import api from '../utils/api';

export const getVetClinicalReport = async (ownerId, petName) => {
  const { data } = await api.get('/vet/clinical-report', {
    params: { ownerId, petName },
  });
  return data;
};

export const getVetNutritionRecommendation = async (ownerId, petName) => {
  const { data } = await api.get('/vet/nutrition-recommendation', {
    params: { ownerId, petName },
  });
  return data;
};
