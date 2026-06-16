import { buildPetNutritionRecommendation } from './petNutritionRecommender';
import { petAgeYears } from './petCalorieCalculator';

const ACTIVITY_LABELS = { faible: 'faible', moyen: 'modérée', eleve: 'élevée' };

/** Tendance poids sur l'historique (kg/mois approximatif) */
export const computeWeightTrend = (history = []) => {
  const sorted = [...(history || [])]
    .filter((h) => h.weightKg != null)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sorted.length < 2) return { trend: 'stable', deltaKg: 0, deltaPct: 0 };

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const deltaKg = last.weightKg - first.weightKg;
  const days = Math.max(1, (new Date(last.date) - new Date(first.date)) / 86400000);
  const deltaPct = first.weightKg ? (deltaKg / first.weightKg) * 100 : 0;
  const monthly = (deltaKg / days) * 30;

  let trend = 'stable';
  if (monthly > 0.4) trend = 'gain';
  else if (monthly < -0.4) trend = 'loss';

  return {
    trend,
    deltaKg: Math.round(deltaKg * 10) / 10,
    deltaPct: Math.round(deltaPct * 10) / 10,
    monthlyChangeKg: Math.round(monthly * 10) / 10,
    points: sorted,
  };
};

/** Ajuste objectif et calories selon évolution poids, âge et activité */
export const adaptNutritionFromEvolution = ({
  pet,
  weightHistory = [],
  options = {},
  baseRecommendation = null,
}) => {
  const weightTrend = computeWeightTrend(weightHistory);
  const ageYears =
    options.ageYears ??
    petAgeYears(pet?.birthDate) ??
    (pet?.ageYears != null ? Number(pet.ageYears) : null);

  let goal = options.goal || 'maintien';
  let activityLevel = options.activityLevel || 'moyen';
  const adjustments = [];

  if (weightTrend.trend === 'gain' && weightTrend.deltaPct > 3) {
    goal = 'perte';
    adjustments.push({
      id: 'weight-gain',
      priority: 'high',
      title: 'Prise de poids détectée',
      text: `+${weightTrend.deltaKg} kg sur la période — l'IA réduit l'apport calorique (~10 %).`,
    });
  } else if (weightTrend.trend === 'loss' && weightTrend.deltaPct < -3) {
    goal = 'prise';
    adjustments.push({
      id: 'weight-loss',
      priority: 'high',
      title: 'Perte de poids détectée',
      text: `${weightTrend.deltaKg} kg — l'IA augmente légèrement la ration.`,
    });
  }

  if (ageYears != null && ageYears >= 7 && pet?.type === 'dog') {
    adjustments.push({
      id: 'senior-dog',
      priority: 'medium',
      title: 'Senior',
      text: 'Formule senior recommandée — protéines digestibles, moins de calories.',
    });
  }
  if (ageYears != null && ageYears >= 10 && pet?.type === 'cat') {
    adjustments.push({
      id: 'senior-cat',
      priority: 'medium',
      title: 'Chat senior',
      text: 'Hydratation renforcée (pâtée) et kcal ajustées.',
    });
  }

  if (activityLevel === 'eleve') {
    adjustments.push({
      id: 'activity-high',
      priority: 'medium',
      title: 'Activité élevée',
      text: 'MER majoré — fraction glucides/ protéines adaptée à l\'effort.',
    });
  } else if (activityLevel === 'faible') {
    adjustments.push({
      id: 'activity-low',
      priority: 'medium',
      title: 'Activité faible',
      text: 'MER réduit pour éviter la prise de poids.',
    });
  }

  const recommendation =
    baseRecommendation ||
    buildPetNutritionRecommendation(pet, { ...options, goal, activityLevel, ageYears });

  const kcalAdjust =
    goal === 'perte' ? -0.1 : goal === 'prise' ? 0.08 : weightTrend.trend === 'gain' ? -0.05 : 0;

  const adaptedKcal = recommendation.calories?.dailyKcal
    ? Math.round(recommendation.calories.dailyKcal * (1 + kcalAdjust))
    : null;

  const adaptedGrams = recommendation.calories?.dryFoodGramsPerDay && adaptedKcal
    ? Math.round(
        (adaptedKcal / (recommendation.calories.dailyKcal || adaptedKcal)) *
          recommendation.calories.dryFoodGramsPerDay,
      )
    : recommendation.calories?.dryFoodGramsPerDay;

  return {
    ...recommendation,
    goal,
    activityLevel,
    activityLabel: ACTIVITY_LABELS[activityLevel] || activityLevel,
    ageYears,
    weightTrend,
    adaptedKcal,
    adaptedGramsPerDay: adaptedGrams,
    aiAdjustments: adjustments,
    aiSummary: [
      weightTrend.trend !== 'stable' && `Poids : tendance ${weightTrend.trend === 'gain' ? 'à la hausse' : 'à la baisse'}.`,
      ageYears != null && `Âge : ${Math.round(ageYears * 10) / 10} ans.`,
      `Activité : ${ACTIVITY_LABELS[activityLevel] || activityLevel}.`,
      adaptedKcal && `Ration IA : ${adaptedKcal} kcal/j (~${adaptedGrams} g).`,
    ]
      .filter(Boolean)
      .join(' '),
  };
};

export default adaptNutritionFromEvolution;
