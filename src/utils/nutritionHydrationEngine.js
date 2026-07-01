/** Moteur nutrition + hydratation — scores, macros et synergie alimentation/eau. */

import { resolveSpecies, idealWaterRatioFor } from './speciesCatalog';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const SPECIES_KCAL_PER_GRAM = {
  dog: 3.5, cat: 3.8, bird: 3.2, rabbit: 2.5, hamster: 3.4, reptile: 2.8, fish: 2.5, ferret: 3.6, guinea_pig: 2.6, nac: 3.0, default: 3.5,
};

const MACRO_SPLIT = {
  dog: { protein: 26, fat: 14, carbs: 45, fiber: 4 },
  cat: { protein: 32, fat: 18, carbs: 35, fiber: 3 },
  bird: { protein: 18, fat: 8, carbs: 55, fiber: 6 },
  rabbit: { protein: 16, fat: 4, carbs: 60, fiber: 20 },
  hamster: { protein: 16, fat: 6, carbs: 55, fiber: 8 },
  reptile: { protein: 20, fat: 5, carbs: 50, fiber: 5 },
  fish: { protein: 40, fat: 8, carbs: 30, fiber: 2 },
  ferret: { protein: 35, fat: 20, carbs: 25, fiber: 3 },
  guinea_pig: { protein: 16, fat: 4, carbs: 55, fiber: 18 },
  nac: { protein: 20, fat: 8, carbs: 50, fiber: 8 },
};

/** Estimation macros journaliers à partir des grammes consommés. */
export const estimateDailyMacros = (grams = 0, petType = 'dog') => {
  const species = resolveSpecies(petType);
  const split = MACRO_SPLIT[species.id] || MACRO_SPLIT.dog;
  const kcalPerG = SPECIES_KCAL_PER_GRAM[species.id] || SPECIES_KCAL_PER_GRAM.default;
  const totalKcal = Math.round(grams * kcalPerG);
  return {
    totalKcal,
    proteinG: Math.round((grams * split.protein) / 100),
    fatG: Math.round((grams * split.fat) / 100),
    carbsG: Math.round((grams * split.carbs) / 100),
    fiberG: Math.round((grams * split.fiber) / 100),
    split,
  };
};

/** Score nutrition 0–100. */
export const computeNutritionScore = ({
  todayGrams = 0,
  dailyTarget = 95,
  adherencePct = 0,
  missedMeals = 0,
  qualityScore = null,
  reservoirLow = false,
} = {}) => {
  let score = 100;
  const adherence = adherencePct || (dailyTarget > 0 ? Math.round((todayGrams / dailyTarget) * 100) : 0);

  if (adherence < 70) score -= 20;
  else if (adherence < 85) score -= 10;
  else if (adherence > 120) score -= 12;

  score -= missedMeals * 12;
  if (reservoirLow) score -= 8;
  if (qualityScore != null && qualityScore < 50) score -= 25;
  else if (qualityScore != null && qualityScore < 75) score -= 10;

  return clamp(Math.round(score), 0, 100);
};

/** Répartition des repas du jour (graphique). */
export const buildMealBalance = (history = [], schedules = [], plan = {}) => {
  const now = new Date();
  const todayLogs = history.filter((log) => {
    const d = new Date(log.createdAt);
    return d.toDateString() === now.toDateString() && ['dispense', 'manual_request'].includes(log.eventType);
  });

  if (todayLogs.length > 0) {
    return todayLogs.map((log, i) => ({
      label: log.message?.includes('—') ? log.message.split('—')[1]?.trim() || `Repas ${i + 1}` : `Repas ${i + 1}`,
      grams: log.portionGrams || plan.portionGrams || 30,
      time: new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }));
  }

  return (schedules || [])
    .filter((s) => s.enabled !== false)
    .map((s) => ({
      label: s.label || 'Repas',
      grams: s.portionGrams || plan.portionGrams || 30,
      time: s.time,
    }));
};

/** Courbe consommation 7 j avec objectif. */
export const buildNutritionWeeklyChart = (consumptionByDay = [], dailyTarget = 95) =>
  consumptionByDay.map((d) => {
    const date = new Date(d.date);
    return {
      day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      grams: d.grams ?? 0,
      target: dailyTarget,
      adherence: dailyTarget > 0 ? Math.round(((d.grams ?? 0) / dailyTarget) * 100) : 0,
    };
  });

/** Score hydratation 0–100. */
export const computeHydrationScore = ({
  todayMl = 0,
  targetMl = 550,
  avg7dMl = 0,
  filterDaysLeft = 30,
  reservoirPct = 100,
  online = true,
} = {}) => {
  let score = 100;
  const pct = targetMl > 0 ? (todayMl / targetMl) * 100 : 0;

  if (pct < 50) score -= 35;
  else if (pct < 70) score -= 20;
  else if (pct < 85) score -= 8;

  if (avg7dMl > 0 && targetMl > 0 && avg7dMl < targetMl * 0.75) score -= 12;
  if (filterDaysLeft <= 3) score -= 15;
  else if (filterDaysLeft <= 7) score -= 8;
  if (reservoirPct < 20) score -= 15;
  else if (reservoirPct < 35) score -= 6;
  if (!online) score -= 20;

  return clamp(Math.round(score), 0, 100);
};

/** Heures de pic de consommation d'eau. */
export const buildWaterPeakHours = (hourlyToday = []) => {
  const sorted = [...hourlyToday].sort((a, b) => (b.volumeMl || 0) - (a.volumeMl || 0));
  const peaks = sorted.filter((h) => (h.volumeMl || 0) > 0).slice(0, 4);
  const maxVol = Math.max(...hourlyToday.map((h) => h.volumeMl || 0), 1);

  return hourlyToday.map((h) => ({
    ...h,
    intensity: Math.round(((h.volumeMl || 0) / maxVol) * 100),
    isPeak: peaks.some((p) => p.hour === h.hour),
  }));
};

/** Comparaison multi-animaux (aperçu). */
export const buildPetsHydrationOverview = (petsTracking = []) =>
  petsTracking.map((t) => ({
    petId: t.petId,
    petName: t.petName,
    petType: t.petType,
    todayMl: t.todayMl,
    targetMl: t.targetMl,
    percentOfTarget: t.percentOfTarget ?? (t.targetMl ? Math.round((t.todayMl / t.targetMl) * 100) : 0),
    score: computeHydrationScore({
      todayMl: t.todayMl,
      targetMl: t.targetMl,
      avg7dMl: t.stats?.avg7dMl,
      filterDaysLeft: t.monitor?.filterDaysLeft,
      reservoirPct: t.monitor?.reservoirCapacityMl
        ? Math.round((t.monitor.reservoirMl / t.monitor.reservoirCapacityMl) * 100)
        : 100,
      online: t.monitor?.online,
    }),
    alert: (t.alerts || []).some((a) => a.severity === 'high'),
  }));

/** Synergie nutrition ↔ hydratation pour un animal. */
export const buildNutritionWaterSynergy = ({
  petName = 'Animal',
  todayGrams = 0,
  dailyTarget = 95,
  todayMl = 0,
  targetMl = 550,
  petType = 'dog',
} = {}) => {
  const foodPct = dailyTarget > 0 ? Math.round((todayGrams / dailyTarget) * 100) : 0;
  const waterPct = targetMl > 0 ? Math.round((todayMl / targetMl) * 100) : 0;
  const ratio = todayGrams > 0 ? Math.round(todayMl / todayGrams) : 0;
  const species = resolveSpecies(petType);
  const idealRatio = idealWaterRatioFor(petType);

  const tips = [];
  let status = 'balanced';
  let message = `${petName} : alimentation ${foodPct} % et hydratation ${waterPct} % des objectifs.`;

  if (species.usesAquarium) {
    status = 'aquarium';
    message = `${petName} (aquarium) : surveillez qualité eau et température.`;
    tips.push({ icon: '🐠', text: 'Poissons : pH et nitrites plus critiques que le volume bu.' });
  } else if (foodPct >= 85 && waterPct < 65) {
    status = 'dehydration_risk';
    message = `Apport alimentaire correct (${foodPct} %) mais hydratation insuffisante (${waterPct} %). Proposez de l'eau fraîche après chaque repas.`;
    tips.push({ icon: '💧', text: 'Placez la fontaine à moins de 2 m du distributeur de croquettes.' });
    tips.push({ icon: '🍽️', text: 'Les croquettes sèches augmentent le besoin en eau — surveillez la consommation.' });
  } else if (waterPct >= 80 && foodPct < 60) {
    status = 'low_food';
    message = `Hydratation bonne (${waterPct} %) mais ration alimentaire basse (${foodPct} %).`;
    tips.push({ icon: '🩺', text: 'Consultez un vétérinaire si baisse d\'appétit persistante.' });
  } else if (foodPct >= 85 && waterPct >= 80) {
    status = 'optimal';
    message = `Équilibre nutrition/hydratation optimal pour ${petName}.`;
    tips.push({ icon: '✅', text: 'Maintenez les horaires de repas et renouvelez l\'eau 2× par jour.' });
  } else {
    tips.push({ icon: '📊', text: `Ratio eau/nourriture : ${ratio} ml/g (idéal ~${idealRatio} ml/g pour un ${species.labelFr}).` });
  }

  return {
    status,
    message,
    foodPct,
    waterPct,
    ratio,
    idealRatio,
    tips,
    combinedScore: Math.round((computeNutritionScore({ todayGrams, dailyTarget, adherencePct: foodPct })
      + computeHydrationScore({ todayMl, targetMl })) / 2),
  };
};

/** Conseils nutrition personnalisés. */
export const generateNutritionTips = (habit = {}, plan = {}, synergy = {}) => {
  const tips = [...(synergy.tips || [])];
  const petName = plan?.pet?.name || 'Votre animal';

  if (habit.missedMealsCount > 0) {
    tips.unshift({
      icon: '⏰',
      priority: 'high',
      text: `${habit.missedMealsCount} repas manqué(s) aujourd'hui — vérifiez le distributeur ESP32.`,
    });
  }
  if (habit.todayGrams < (habit.dailyTarget || 95) * 0.7) {
    tips.push({
      icon: '📉',
      priority: 'medium',
      text: `${petName} n'a consommé que ${habit.todayGrams} g sur ${habit.dailyTarget} g prévus.`,
    });
  }
  (plan.tips || []).slice(0, 2).forEach((t, i) => {
    tips.push({ icon: '💡', priority: 'low', text: t, id: `plan-tip-${i}` });
  });
  return tips.slice(0, 5);
};

/** Conseils hydratation personnalisés. */
export const generateHydrationTips = (tracking = {}, synergy = {}) => {
  const tips = [...(tracking.insights || []).map((i) => ({ icon: i.icon, text: i.text, priority: 'low' }))];
  (synergy.tips || []).forEach((t) => {
    if (!tips.some((x) => x.text === t.text)) tips.unshift({ ...t, priority: 'medium' });
  });

  const pct = tracking.percentOfTarget ?? 0;
  if (pct < 70) {
    tips.unshift({
      icon: '🚨',
      priority: 'high',
      text: `Hydratation à ${pct} % — ajoutez des points d'eau fraîche et nettoyez la fontaine.`,
    });
  }
  if (tracking.monitor?.filterDaysLeft <= 7) {
    tips.push({
      icon: '🔧',
      priority: 'medium',
      text: `Filtre fontaine : ${tracking.monitor.filterDaysLeft} j restants — impact sur le goût de l'eau.`,
    });
  }
  return tips.slice(0, 6);
};

export default {
  estimateDailyMacros,
  computeNutritionScore,
  buildMealBalance,
  buildNutritionWeeklyChart,
  computeHydrationScore,
  buildWaterPeakHours,
  buildPetsHydrationOverview,
  buildNutritionWaterSynergy,
  generateNutritionTips,
  generateHydrationTips,
};
