import { buildPetNutritionRecommendation } from './petNutritionRecommender';
import { adaptNutritionFromEvolution } from './adaptiveNutritionEngine';
import { detectEarlyHealthRisks } from './earlyHealthRiskDetector';
import { explainProductList } from './recommendationExplainer';
import {
  computePetWellnessScore,
  buildWellnessInputsFromTwin,
} from './petWellnessScore';

const petEmoji = (type) =>
  ({ dog: '🐕', cat: '🐈', bird: '🐦', rabbit: '🐰', fish: '🐠', hamster: '🐹', reptile: '🦎' })[type] || '🐾';

/** Assemble le profil jumeau numérique complet d'un animal */
export const buildDigitalTwin = ({
  pet = {},
  weightHistory = [],
  medical = {},
  feeding = {},
  activity = {},
  veterinary = {},
  orders = [],
  products = [],
  passport = null,
} = {}) => {
  const petId = String(pet.id || pet._id || 'unknown');
  const baseRec = buildPetNutritionRecommendation(pet);
  const adaptedRec = adaptNutritionFromEvolution({
    pet,
    weightHistory,
    baseRecommendation: baseRec,
  });

  const healthRisks = detectEarlyHealthRisks({
    pet,
    weightHistory,
    orders,
    medicalRecord: medical,
    feedingLogs: feeding.logs || [],
  });

  const wellnessInputs = buildWellnessInputsFromTwin({
    weightHistory,
    feeding,
    veterinary,
    activity,
    medical,
    healthRisks,
  });

  const wellness = computePetWellnessScore(wellnessInputs);

  const topProducts = (products || []).slice(0, 3);
  const explained = explainProductList(topProducts, pet, adaptedRec);
  const aiRecommendations = explained.slice(0, 4).map((r, i) => ({
    id: `ai-${r.product?.id || r.product?._id || i}`,
    type: 'nutrition',
    title: r.product?.name || 'Produit recommandé',
    detail: r.explanation?.summary || r.explanation?.reasons?.[0]?.text || 'Compatible avec le profil nutritionnel.',
    priority: 'medium',
  }));

  const twinRecommendations = [
    ...aiRecommendations.map((r) => ({
      id: `ai-${r.productId || r.name}`,
      type: 'nutrition',
      title: r.name || r.productName,
      detail: r.summary || r.reason,
      priority: 'medium',
    })),
    ...healthRisks.slice(0, 3).map((risk) => ({
      id: risk.id,
      type: 'health',
      title: risk.title,
      detail: risk.action || risk.detail,
      priority: risk.severity === 'high' ? 'high' : 'medium',
    })),
  ];

  if (wellness.dimensions.activity < 60) {
    twinRecommendations.push({
      id: 'act-more',
      type: 'activity',
      title: 'Augmenter l\'activité physique',
      detail: 'Objectif : 20 min de promenade ou jeu interactif par jour.',
      priority: 'medium',
    });
  }

  if (wellness.dimensions.veterinary < 65) {
    twinRecommendations.push({
      id: 'vet-check',
      type: 'veterinary',
      title: 'Planifier une consultation',
      detail: 'Dernier contrôle datant de plus de 6 mois — bilan recommandé.',
      priority: 'high',
    });
  }

  return {
    id: `twin-${petId}`,
    petId,
    identity: {
      name: pet.name || 'Animal',
      type: pet.type || pet.animalType || 'dog',
      breed: pet.breed || null,
      emoji: passport?.identity?.emoji || petEmoji(pet.type),
      ageYears: adaptedRec.ageYears,
      weightKg: pet.weightKg ?? pet.weight,
      passportNumber: passport?.identity?.passportNumber || null,
    },
    wellness,
    medical: {
      vaccines: medical.vaccines || passport?.vaccines || [],
      consultations: medical.consultations || passport?.medicalHistory || [],
      prescriptions: medical.prescriptions || [],
      allergies: pet.allergies || passport?.identity?.allergies || null,
      chronicConditions: medical.chronicConditions || [],
      lastCheckup: veterinary.lastCheckup || null,
    },
    feeding: {
      currentDiet: feeding.currentDiet || adaptedRec.mealPlan?.foodLabel || 'Croquettes premium',
      dailyKcal: adaptedRec.calories?.dailyKcal || feeding.dailyKcal,
      gramsPerDay: adaptedRec.calories?.dryFoodGramsPerDay || feeding.gramsPerDay,
      mealCount: adaptedRec.mealPlan?.mealsPerDay || feeding.mealCount || 2,
      history: feeding.history || [],
      adherence: feeding.adherence ?? wellnessInputs.nutrition.mealPlanAdherence,
      logs: feeding.logs || [],
    },
    activity: {
      weeklyMinutes: activity.weeklyMinutes ?? 0,
      dailyGoalMin: activity.dailyGoalMin ?? 30,
      dailyGoalMetPct: activity.dailyGoalMetPct ?? 0,
      sessions: activity.sessions || [],
      source: activity.source || 'manual',
    },
    veterinary: {
      lastConsultDaysAgo: veterinary.lastConsultDaysAgo,
      vaccinesUpToDate: veterinary.vaccinesUpToDate,
      upcomingAppointment: veterinary.upcomingAppointment,
      vetReferent: passport?.identity?.vetReferent || veterinary.vetReferent || null,
    },
    nutritionRecommendation: adaptedRec,
    healthRisks,
    aiRecommendations: twinRecommendations.slice(0, 6),
    weightHistory,
    lastSync: new Date().toISOString(),
    twinVersion: 1,
  };
};

export default buildDigitalTwin;
