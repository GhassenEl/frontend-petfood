import { buildPetNutritionRecommendation } from './petNutritionRecommender';
import { petAgeYears } from './petCalorieCalculator';

const lifeStageAt = (type, ageYears) => {
  if (ageYears < 1) return 'young';
  if (type === 'cat' && ageYears >= 10) return 'senior';
  if (type === 'dog' && ageYears >= 7) return 'senior';
  if (ageYears >= 7) return 'senior';
  return 'adult';
};

const STAGE_LABELS = {
  young: 'Croissance',
  adult: 'Adulte',
  senior: 'Senior',
};

/** Prédiction des besoins alimentaires futurs (3, 6, 12 mois). */
export const predictFutureNutritionNeeds = (pet = {}, horizons = [3, 6, 12]) => {
  const type = pet.type || 'dog';
  const ageYears =
    petAgeYears(pet.birthDate) ??
    (pet.ageYears != null ? Number(pet.ageYears) : 2);
  const weight = Number(pet.weight) || 10;
  const isNeutered = pet.isNeutered !== false;

  return horizons.map((months) => {
    const futureAge = Math.round((ageYears + months / 12) * 10) / 10;
    const currentStage = lifeStageAt(type, ageYears);
    const futureStage = lifeStageAt(type, futureAge);
    const stageTransition = currentStage !== futureStage;

    const futurePet = {
      ...pet,
      type,
      weight: String(weight),
      ageYears: futureAge,
      isNeutered,
    };

    const rec = buildPetNutritionRecommendation(futurePet);
    const dailyKcal = rec.mealPlan?.kcalPerDay ?? null;
    const dailyGrams = rec.mealPlan?.gramsPerDay ?? null;

    const currentRec = buildPetNutritionRecommendation({ ...pet, weight: String(weight) });
    const currentKcal = currentRec.mealPlan?.kcalPerDay;
    const kcalDelta = dailyKcal && currentKcal ? dailyKcal - currentKcal : 0;

    const predictions = [];

    if (stageTransition && futureStage === 'senior') {
      predictions.push({
        icon: '🎂',
        priority: 'high',
        label: 'Transition senior',
        detail: `Dans ${months} mois, passage en formule senior — moins de calories, protéines digestibles.`,
      });
    }

    if (stageTransition && futureStage === 'adult' && currentStage === 'young') {
      predictions.push({
        icon: '🐾',
        priority: 'high',
        label: 'Fin de croissance',
        detail: 'Réduction progressive des apports énergétiques — éviter le surpoids post-croissance.',
      });
    }

    if (isNeutered && futureAge >= 2 && futureAge < 6) {
      predictions.push({
        icon: '⚖️',
        priority: 'medium',
        label: 'Contrôle du poids',
        detail: 'Animal stérilisé — surveiller les calories et privilégier une formule light si prise de poids.',
      });
    }

    if (type === 'cat' && futureAge >= 5) {
      predictions.push({
        icon: '💧',
        priority: 'medium',
        label: 'Hydratation & urinaire',
        detail: 'Augmenter l\'humidité alimentaire (pâtée, fontaine) pour prévenir les troubles urinaires.',
      });
    }

    if (type === 'dog' && futureAge >= 5 && weight > 25) {
      predictions.push({
        icon: '🦴',
        priority: 'medium',
        label: 'Articulations',
        detail: 'Grande race — envisager oméga-3 et glucosamine dans l\'alimentation.',
      });
    }

    if (!predictions.length) {
      predictions.push({
        icon: '✅',
        priority: 'low',
        label: 'Besoins stables',
        detail: 'Profil nutritionnel stable — ajuster selon l\'activité et le poids réel.',
      });
    }

    const packKg = 12;
    const dailyGramsNum = dailyGrams || 200;
    const daysUntilReorder = Math.max(7, Math.round((packKg * 1000) / dailyGramsNum));
    const purchasePredictions = [
      {
        icon: '🛒',
        label: 'Réapprovisionnement',
        detail: `Sac ${packKg} kg épuisé dans ~${daysUntilReorder} jours au rythme actuel.`,
      },
    ];
    if (stageTransition) {
      purchasePredictions.push({
        icon: '🔄',
        label: 'Changement de formule',
        detail: `Passage ${STAGE_LABELS[futureStage]} recommandé — prévoir nouvelle formule d'ici ${months} mois.`,
      });
    }
    if (futureAge >= 7 && type === 'dog') {
      purchasePredictions.push({
        icon: '🦴',
        label: 'Besoins senior',
        detail: 'Anticiper croquettes senior + compléments articulaires.',
      });
    }

    return {
      months,
      futureAge,
      lifeStage: futureStage,
      lifeStageLabel: STAGE_LABELS[futureStage],
      stageTransition,
      dailyKcal,
      dailyGrams,
      kcalDelta,
      predictions,
      purchasePredictions,
      recommendedFormula:
        futureStage === 'senior'
          ? `Croquettes senior ${type === 'cat' ? 'chat' : 'chien'}`
          : futureStage === 'young'
            ? `Croquettes ${type === 'cat' ? 'chaton' : 'chiot'}`
            : `Croquettes adulte ${type === 'cat' ? 'chat' : 'chien'}`,
      aiSummary: stageTransition
        ? `D'ici ${months} mois (${futureAge} ans), transition vers stade « ${STAGE_LABELS[futureStage]} » — ${predictions[0]?.detail}`
        : `D'ici ${months} mois, besoins estimés à ~${dailyKcal || '—'} kcal/j (${dailyGrams || '—'} g).`,
    };
  });
};

export default predictFutureNutritionNeeds;
