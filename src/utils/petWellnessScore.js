import { computeWeightTrend } from './adaptiveNutritionEngine';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/**
 * Score de bien-être animal calculé automatiquement à partir de :
 * alimentation, consultations vétérinaires, activité physique, suivi médical.
 */
export const computePetWellnessScore = ({
  nutrition = {},
  veterinary = {},
  activity = {},
  medical = {},
} = {}) => {
  const factors = [];

  let nutritionScore = 48;
  const adherence = nutrition.mealPlanAdherence ?? 0.75;
  if (adherence >= 0.85) {
    nutritionScore += 28;
    factors.push({ dim: 'nutrition', label: 'Régime alimentaire respecté', pts: 28 });
  } else if (adherence >= 0.65) {
    nutritionScore += 16;
    factors.push({ dim: 'nutrition', label: 'Alimentation globalement régulière', pts: 16 });
  } else {
    nutritionScore -= 8;
    factors.push({ dim: 'nutrition', label: 'Régime à stabiliser', pts: -8 });
  }

  const trend = nutrition.weightTrend || 'stable';
  if (trend === 'stable') {
    nutritionScore += 14;
    factors.push({ dim: 'nutrition', label: 'Poids stable', pts: 14 });
  } else if (trend === 'gain') {
    nutritionScore -= 12;
    factors.push({ dim: 'nutrition', label: 'Prise de poids détectée', pts: -12 });
  } else if (trend === 'loss') {
    nutritionScore -= 18;
    factors.push({ dim: 'nutrition', label: 'Perte de poids', pts: -18 });
  }

  if ((nutrition.feedingConsistency ?? 0.7) >= 0.75) {
    nutritionScore += 10;
    factors.push({ dim: 'nutrition', label: 'Horaires de repas réguliers', pts: 10 });
  }

  let vetScore = 42;
  const lastConsult = veterinary.lastConsultDaysAgo ?? 999;
  if (lastConsult <= 90) {
    vetScore += 28;
    factors.push({ dim: 'veterinary', label: 'Consultation récente', pts: 28 });
  } else if (lastConsult <= 180) {
    vetScore += 14;
    factors.push({ dim: 'veterinary', label: 'Suivi vétérinaire à jour', pts: 14 });
  } else {
    vetScore -= 10;
    factors.push({ dim: 'veterinary', label: 'Consultation à planifier', pts: -10 });
  }

  if (veterinary.vaccinesUpToDate) {
    vetScore += 22;
    factors.push({ dim: 'veterinary', label: 'Vaccins à jour', pts: 22 });
  } else {
    vetScore -= 15;
    factors.push({ dim: 'veterinary', label: 'Vaccins en retard', pts: -15 });
  }

  if (veterinary.upcomingAppointment) {
    vetScore += 8;
    factors.push({ dim: 'veterinary', label: 'RDV vétérinaire planifié', pts: 8 });
  }

  let activityScore = 44;
  const weeklyMin = activity.weeklyMinutes ?? 0;
  if (weeklyMin >= 180) {
    activityScore += 32;
    factors.push({ dim: 'activity', label: 'Activité physique élevée', pts: 32 });
  } else if (weeklyMin >= 120) {
    activityScore += 22;
    factors.push({ dim: 'activity', label: 'Bonne activité hebdomadaire', pts: 22 });
  } else if (weeklyMin >= 60) {
    activityScore += 12;
    factors.push({ dim: 'activity', label: 'Activité modérée', pts: 12 });
  } else {
    activityScore -= 6;
    factors.push({ dim: 'activity', label: 'Activité insuffisante', pts: -6 });
  }

  const goalPct = activity.dailyGoalMetPct ?? 0.6;
  if (goalPct >= 0.75) {
    activityScore += 14;
    factors.push({ dim: 'activity', label: 'Objectif quotidien atteint', pts: 14 });
  }

  let medicalScore = 46;
  if (medical.followUpComplete) {
    medicalScore += 22;
    factors.push({ dim: 'medical', label: 'Suivi médical complet', pts: 22 });
  }
  if (medical.noOverdueVaccines !== false) {
    medicalScore += 12;
    factors.push({ dim: 'medical', label: 'Carnet vaccinal conforme', pts: 12 });
  }
  if (medical.chronicManaged) {
    medicalScore += 10;
    factors.push({ dim: 'medical', label: 'Pathologies chroniques suivies', pts: 10 });
  }

  const riskCount = medical.riskCount ?? 0;
  if (riskCount === 0) {
    medicalScore += 10;
    factors.push({ dim: 'medical', label: 'Aucun risque détecté', pts: 10 });
  } else {
    medicalScore -= riskCount * 9;
    factors.push({ dim: 'medical', label: `${riskCount} risque(s) identifié(s)`, pts: -riskCount * 9 });
  }

  const dimensions = {
    nutrition: clamp(Math.round(nutritionScore), 0, 100),
    veterinary: clamp(Math.round(vetScore), 0, 100),
    activity: clamp(Math.round(activityScore), 0, 100),
    medical: clamp(Math.round(medicalScore), 0, 100),
  };

  const overall = clamp(
    Math.round(
      dimensions.nutrition * 0.3 +
        dimensions.veterinary * 0.25 +
        dimensions.activity * 0.2 +
        dimensions.medical * 0.25,
    ),
    0,
    100,
  );

  let level = 'attention';
  let levelLabel = 'À surveiller';
  let levelColor = '#dc2626';
  if (overall >= 85) {
    level = 'excellent';
    levelLabel = 'Excellent';
    levelColor = '#059669';
  } else if (overall >= 70) {
    level = 'good';
    levelLabel = 'Bon';
    levelColor = '#0f766e';
  } else if (overall >= 55) {
    level = 'fair';
    levelLabel = 'Correct';
    levelColor = '#d97706';
  }

  return {
    overall,
    dimensions,
    level,
    levelLabel,
    levelColor,
    factors: factors.slice(0, 8),
    summary:
      overall >= 85
        ? 'Profil de bien-être optimal — continuez le suivi régulier.'
        : overall >= 70
          ? 'Bon équilibre global — quelques axes d\'amélioration possibles.'
          : overall >= 55
            ? 'Bien-être correct — renforcez activité ou suivi vétérinaire.'
            : 'Attention requise — consultez les recommandations IA.',
  };
};

/** Prépare les entrées score à partir des données brutes du jumeau */
export const buildWellnessInputsFromTwin = ({
  weightHistory = [],
  feeding = {},
  veterinary = {},
  activity = {},
  medical = {},
  healthRisks = [],
} = {}) => {
  const weightTrend = computeWeightTrend(weightHistory);

  return {
    nutrition: {
      mealPlanAdherence: feeding.adherence ?? 0.78,
      weightTrend: weightTrend.trend === 'gain' ? 'gain' : weightTrend.trend === 'loss' ? 'loss' : 'stable',
      feedingConsistency: feeding.consistency ?? 0.72,
    },
    veterinary: {
      lastConsultDaysAgo: veterinary.lastConsultDaysAgo ?? 120,
      vaccinesUpToDate: veterinary.vaccinesUpToDate ?? true,
      upcomingAppointment: veterinary.upcomingAppointment ?? false,
    },
    activity: {
      weeklyMinutes: activity.weeklyMinutes ?? 90,
      dailyGoalMetPct: activity.dailyGoalMetPct ?? 0.65,
    },
    medical: {
      followUpComplete: medical.followUpComplete ?? true,
      noOverdueVaccines: medical.noOverdueVaccines ?? true,
      chronicManaged: medical.chronicManaged ?? false,
      riskCount: healthRisks.length,
    },
  };
};

export default computePetWellnessScore;
