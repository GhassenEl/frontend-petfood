import api from './api';
import { analyzePetHealthRecommendations } from '../utils/petHealthRecommendationEngine';
import { DEMO_NUTRITION_PETS } from '../utils/clientDemoData';

const demoPetProfile = (petId) => {
  const p = DEMO_NUTRITION_PETS.find((x) => x.id === petId || x._id === petId);
  if (!p) return { id: petId, name: 'Max', type: 'dog', weightKg: 28, petType: 'dog' };
  return {
    id: p.id || p._id,
    name: p.name,
    type: p.type,
    petType: p.type,
    weightKg: p.weightKg || p.weight,
    breed: p.breed,
    chronicConditions: p.chronicConditions || (p.chronicDiseases ? [p.chronicDiseases] : []),
    overdueVaccines: p.overdueVaccines || [],
  };
};

export async function analyzePetHealth(input = {}) {
  try {
    const { data } = await api.post('/client/pet-health/analyze', input);
    if (data?.detectedSymptoms || data?.treatments) {
      return { ...data, mode: data.mode || 'live' };
    }
  } catch {
    /* fallback démo */
  }

  const pet = input.pet?.id ? input.pet : demoPetProfile(input.petId || 'demo-nut-1');
  return {
    ...analyzePetHealthRecommendations({ ...input, pet }),
    mode: 'demo',
  };
}

export async function fetchPetHealthHistory(petId) {
  try {
    const { data } = await api.get(`/client/pet-health/history/${petId}`);
    if (data?.analyses?.length) return data;
  } catch {
    /* démo */
  }
  return { analyses: [], mode: 'demo' };
}

export default { analyzePetHealth, fetchPetHealthHistory };
