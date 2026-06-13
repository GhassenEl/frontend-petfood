import api from '../utils/api';
import {
  buildMedicationRecommendations,
  mergeApiRecommendations,
  calculateLocalDose,
  recommendationToMedicationRow,
} from '../utils/vetMedicationRecommender';
import { postVetClinicalAnalyze } from './mlService';
import { DEMO_VET_PHARMACY_MEDS, withDemoFallback } from '../utils/vetDemoData';

export const fetchPharmacyCatalog = async () => {
  try {
    const { data } = await api.get('/vet/pharmacy/medications');
    return withDemoFallback(data, DEMO_VET_PHARMACY_MEDS);
  } catch {
    return DEMO_VET_PHARMACY_MEDS;
  }
};

export const fetchMedicationRecommendations = async ({
  diagnosis = '',
  symptoms = '',
  animalType = '',
  weightKg = null,
  petName = '',
  breed = '',
  ageYears = null,
} = {}) => {
  const catalog = await fetchPharmacyCatalog();
  const context = { diagnosis, symptoms, animalType, weightKg, petName, breed, ageYears };

  const localResult = buildMedicationRecommendations(context, catalog);
  let recommendations = localResult.recommendations;
  let sources = ['protocole'];

  try {
    const apiCalls = [];

    if (diagnosis?.trim()) {
      apiCalls.push(
        api
          .get('/vet/pharmacy/suggest', { params: { diagnosis: diagnosis.trim(), animalType } })
          .then((r) => r.data)
          .catch(() => []),
      );
    }

    if (symptoms?.trim() || diagnosis?.trim()) {
      apiCalls.push(
        postVetClinicalAnalyze({
          petName: petName || 'Patient',
          animalType,
          symptoms: [symptoms, diagnosis].filter(Boolean).join(' — '),
          weightKg,
        })
          .then((data) => data?.recommendedMedications || [])
          .catch(() => []),
      );
    }

    if (apiCalls.length) {
      const apiResults = await Promise.all(apiCalls);
      const flatApi = apiResults.flat().filter(Boolean);
      if (flatApi.length) {
        recommendations = mergeApiRecommendations(recommendations, flatApi);
        sources.push('api');
      }
    }
  } catch {
    /* local only */
  }

  return {
    ...localResult,
    recommendations,
    catalogSize: catalog.length,
    source: sources.includes('api') ? 'hybrid' : 'local',
    sources,
  };
};

export const calculateMedicationDose = async ({
  medicationName,
  weightKg,
  animalType,
}) => {
  try {
    const { data } = await api.post('/vet/pharmacy/calculate-dose', {
      medicationName,
      weightKg: Number(weightKg),
      animalType,
    });
    return { ...data, source: 'api' };
  } catch {
    const local = calculateLocalDose(medicationName, weightKg);
    if (local) return { ...local, source: 'local' };
    throw new Error('Calcul de dose indisponible pour ce médicament.');
  }
};

export const applyRecommendationsToRows = (recommendations) =>
  (recommendations || []).map(recommendationToMedicationRow);

export default fetchMedicationRecommendations;
