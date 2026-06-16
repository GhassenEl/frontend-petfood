import { detectNutritionRisks } from './nutritionRiskEngine';
import { PET_TYPE_LABELS } from './petCalorieCalculator';

const GOAL_LABELS = {
  maintien: 'Maintien du poids',
  perte: 'Perte de poids',
  prise: 'Prise de masse',
};

const ACTIVITY_LABELS = {
  faible: 'Faible',
  moyen: 'Modérée',
  eleve: 'Élevée',
};

/** Programme alimentaire IA personnalisé (profil complet). */
export const buildIntelligentNutritionProgram = (pet, recommendation = {}, options = {}) => {
  const rec = recommendation;
  const riskAnalysis = detectNutritionRisks(pet, rec, rec.weightTrend || {}, options);

  const factors = [
    {
      id: 'age',
      icon: '🎂',
      label: 'Âge',
      value: rec.ageYears != null ? `${rec.ageYears} ans (${rec.lifeStageLabel || rec.lifeStage})` : '—',
    },
    {
      id: 'breed',
      icon: '🐾',
      label: 'Race',
      value: rec.breedProfile?.label || rec.breed || 'Non renseignée',
    },
    {
      id: 'weight',
      icon: '⚖️',
      label: 'Poids',
      value: rec.weightKg ? `${rec.weightKg} kg (${rec.weightStatus})` : 'À compléter',
    },
    {
      id: 'activity',
      icon: '🏃',
      label: 'Activité',
      value: ACTIVITY_LABELS[rec.activityLevel || options.activityLevel] || 'Modérée',
    },
    {
      id: 'allergies',
      icon: '🚫',
      label: 'Allergies',
      value: (rec.allergies || []).length ? rec.allergies.join(', ') : 'Aucune connue',
    },
    {
      id: 'pathologies',
      icon: '🩺',
      label: 'Pathologies',
      value: (rec.healthFlags || []).length
        ? rec.healthFlags.map((f) => f.key).join(', ')
        : 'Aucune signalée',
    },
  ];

  const dailyRation = rec.adaptedKcal || rec.calories?.dailyKcal
    ? {
        kcalPerDay: rec.adaptedKcal ?? rec.calories?.dailyKcal,
        gramsPerDay: rec.adaptedGramsPerDay ?? rec.calories?.dryFoodGramsPerDay,
        gramsPerMeal: rec.calories?.gramsPerMeal,
        mealsPerDay: rec.calories?.mealCount ?? rec.mealPlan?.mealsPerDay ?? 2,
        foodLabel: rec.mealPlan?.foodLabel || rec.calories?.foodLabel || 'aliment',
        goal: GOAL_LABELS[rec.goal] || rec.goal,
        prevents: [
          rec.weightStatus === 'overweight' || rec.weightStatus === 'heavy' ? 'Surpoids' : null,
          rec.weightStatus === 'underweight' ? 'Sous-alimentation' : null,
          (rec.allergies || []).length ? 'Réactions allergiques' : null,
          'Carences majeures (ration calculée)',
        ].filter(Boolean),
      }
    : null;

  return {
    factors,
    dailyRation,
    mealPlan: rec.mealPlan,
    recommendations: rec.recommendations || [],
    aiProgramSummary: [
      `Programme ${PET_TYPE_LABELS[rec.type] || rec.type} — ${rec.name}.`,
      dailyRation && `${dailyRation.kcalPerDay} kcal/j (~${dailyRation.gramsPerDay} g, ${dailyRation.mealsPerDay} repas).`,
      rec.aiSummary,
    ].filter(Boolean).join(' '),
    riskAnalysis,
    evolution: {
      weightTrend: rec.weightTrend,
      adjustments: rec.aiAdjustments || [],
      behaviorHint:
        rec.weightTrend?.trend === 'gain'
          ? 'Comportement alimentaire : surveiller quémandage et friandises entre les repas.'
          : rec.weightTrend?.trend === 'loss'
            ? 'Comportement alimentaire : appétit possiblement réduit — fractionner les repas.'
            : 'Comportement alimentaire stable — maintenir les horaires de repas.',
    },
  };
};

export default buildIntelligentNutritionProgram;
