/**
 * Calcul calories (RER × MER) — miroir backend pour affichage instantané.
 */

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export const petAgeYears = (birthDate) => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const ms = Date.now() - birth.getTime();
  return ms > 0 ? ms / (365.25 * 24 * 60 * 60 * 1000) : 0;
};

export const calculateRER = (weightKg) => {
  const w = Number(weightKg);
  if (!w || w <= 0) return null;
  return Math.round(70 * w ** 0.75);
};

export const getMERFactor = ({
  type = 'dog',
  ageYears = null,
  activityLevel = 'moyen',
  goal = 'maintien',
  isNeutered = true,
}) => {
  const t = String(type || 'dog').toLowerCase();

  if (t === 'dog') {
    if (ageYears != null && ageYears < 0.5) return 3.0;
    if (ageYears != null && ageYears < 1) return 2.0;
    if (goal === 'perte') return 1.0;
    if (goal === 'prise') return 1.4;
    if (activityLevel === 'eleve') return 2.5;
    if (activityLevel === 'faible') return 1.4;
    return isNeutered ? 1.6 : 1.8;
  }

  if (t === 'cat') {
    if (ageYears != null && ageYears < 1) return 2.5;
    if (goal === 'perte') return 0.8;
    if (goal === 'prise') return 1.2;
    if (activityLevel === 'eleve') return 1.4;
    return isNeutered ? 1.2 : 1.4;
  }

  if (t === 'rabbit') return goal === 'perte' ? 0.9 : goal === 'prise' ? 1.15 : 1.0;

  return null;
};

export const estimateDryFoodGrams = (dailyKcal, kcalPer100g = 350) => {
  const kcal = Number(kcalPer100g) || 350;
  return Math.round((dailyKcal / kcal) * 100);
};

export const calculatePetCalories = (pet, options = {}) => {
  const type = String(pet?.type || pet?.animalType || 'dog').toLowerCase();
  const weight = Number(pet?.weight ?? pet?.weightKg ?? 0);
  const name = pet?.name || 'Animal';
  const ageYears =
    options.ageYears != null && !Number.isNaN(Number(options.ageYears))
      ? Number(options.ageYears)
      : petAgeYears(pet?.birthDate);
  const activityLevel = options.activityLevel || 'moyen';
  const goal = options.goal || 'maintien';
  const isNeutered = options.isNeutered !== false;
  const mealCount = clamp(Number(options.mealCount) || 2, 1, 6);
  const kcalPer100g = clamp(Number(options.kcalPer100g) || 350, 250, 450);

  if (!weight || weight <= 0) {
    return {
      petId: pet?.id || pet?._id || null,
      name,
      type,
      supported: false,
      needsWeight: true,
      message: 'Renseignez le poids (kg) de l’animal pour calculer les calories.',
    };
  }

  const rer = calculateRER(weight);
  const merFactor = getMERFactor({ type, ageYears, activityLevel, goal, isNeutered });

  if (merFactor == null || (type !== 'dog' && type !== 'cat' && type !== 'rabbit')) {
    const rough = type === 'bird' ? Math.round(weight * 40) : type === 'fish' ? Math.round(weight * 25) : null;
    return {
      petId: pet?.id || pet?._id || null,
      name,
      type,
      weightKg: weight,
      supported: false,
      estimateOnly: rough != null,
      dailyKcal: rough,
      message: 'Estimation indicative — consultez un vétérinaire pour une ration précise.',
    };
  }

  const dailyKcal = Math.round(rer * merFactor);
  const dryFoodGramsPerDay = estimateDryFoodGrams(dailyKcal, kcalPer100g);
  const gramsPerMeal = Math.round(dryFoodGramsPerDay / mealCount);

  let lifeStage = 'adulte';
  if (ageYears != null) {
    if (type === 'dog' && ageYears < 1) lifeStage = 'chiot';
    else if (type === 'cat' && ageYears < 1) lifeStage = 'chaton';
    else if (ageYears >= 8) lifeStage = 'senior';
  }

  return {
    petId: pet?.id || pet?._id || null,
    name,
    type,
    weightKg: weight,
    ageYears: ageYears != null ? Math.round(ageYears * 10) / 10 : null,
    lifeStage,
    supported: true,
    rer,
    merFactor,
    dailyKcal,
    dryFoodGramsPerDay,
    mealCount,
    gramsPerMeal,
    kcalPer100g,
    activityLevel,
    goal,
    isNeutered,
    message:
      'Estimation à ajuster selon l’état corporel et l’avis vétérinaire. Les friandises comptent dans l’apport calorique.',
  };
};

export const PET_TYPE_LABELS = {
  dog: 'Chien',
  cat: 'Chat',
  bird: 'Oiseau',
  fish: 'Poisson',
  rabbit: 'Lapin / NAC',
  other: 'Autre',
};
