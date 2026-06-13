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

  if (t === 'hamster') {
    if (goal === 'perte') return 0.9;
    if (goal === 'prise') return 1.2;
    return 1.3;
  }

  if (t === 'bird') {
    if (ageYears != null && ageYears < 0.5) return 1.6;
    if (goal === 'perte') return 1.0;
    if (goal === 'prise') return 1.3;
    if (activityLevel === 'eleve') return 1.5;
    return 1.25;
  }

  if (t === 'reptile') {
    if (goal === 'perte') return 0.85;
    if (goal === 'prise') return 1.1;
    return 1.0;
  }

  if (t === 'fish') return 1.0;

  if (t === 'other') return goal === 'perte' ? 0.95 : goal === 'prise' ? 1.15 : 1.1;

  return null;
};

/** kcal/jour — oiseaux (poids en kg, ex. 0.05 = 50 g). */
export const calculateBirdKcal = (weightKg) => {
  const wg = Number(weightKg) * 1000;
  if (!wg || wg <= 0) return null;
  if (wg < 80) return Math.round(wg * 1.15);
  if (wg < 500) return Math.round(70 * weightKg ** 0.75 * 1.35);
  return Math.round(70 * weightKg ** 0.75 * 1.55);
};

/** kcal/jour — poissons d'aquarium (biomasse individuelle en kg). */
export const calculateFishKcal = (weightKg) => {
  const w = Number(weightKg);
  if (!w || w <= 0) return null;
  return Math.round(w * 1000 * 0.22);
};

const FOOD_DEFAULTS = {
  dog: { kcalPer100g: 350, label: 'croquettes' },
  cat: { kcalPer100g: 360, label: 'croquettes' },
  rabbit: { kcalPer100g: 280, label: 'granulés + foin' },
  hamster: { kcalPer100g: 340, label: 'mélange graines' },
  bird: { kcalPer100g: 350, label: 'graines / granulés' },
  fish: { kcalPer100g: 280, label: 'flocons / granulés' },
  reptile: { kcalPer100g: 300, label: 'aliment reptile' },
  other: { kcalPer100g: 300, label: 'aliment adapté' },
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
  const foodDefaults = FOOD_DEFAULTS[type] || FOOD_DEFAULTS.other;
  const kcalPer100g = clamp(Number(options.kcalPer100g) || foodDefaults.kcalPer100g, 150, 500);
  const foodLabel = foodDefaults.label;

  if (!weight || weight <= 0) {
    return {
      petId: pet?.id || pet?._id || null,
      name,
      type,
      supported: false,
      needsWeight: true,
      message: type === 'fish'
        ? 'Renseignez le poids (kg, ex. 0.02 pour 20 g) ou la taille pour estimer la ration.'
        : 'Renseignez le poids (kg) de l’animal pour calculer les calories.',
    };
  }

  let dailyKcal = null;
  let merFactor = null;
  let rer = null;
  let calculationMethod = 'rer_mer';

  if (type === 'bird') {
    dailyKcal = calculateBirdKcal(weight);
    calculationMethod = 'avian';
    merFactor = getMERFactor({ type, ageYears, activityLevel, goal, isNeutered });
    if (dailyKcal && merFactor) dailyKcal = Math.round(dailyKcal * (merFactor / 1.25));
  } else if (type === 'fish') {
    dailyKcal = calculateFishKcal(weight);
    calculationMethod = 'fish_biomass';
    merFactor = 1;
  } else {
    rer = calculateRER(weight);
    merFactor = getMERFactor({ type, ageYears, activityLevel, goal, isNeutered });
    if (merFactor != null) dailyKcal = Math.round(rer * merFactor);
  }

  const supportedTypes = ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'fish', 'reptile', 'other'];

  if (dailyKcal == null || !supportedTypes.includes(type)) {
    return {
      petId: pet?.id || pet?._id || null,
      name,
      type,
      weightKg: weight,
      supported: false,
      message: 'Espèce non prise en charge — consultez un vétérinaire NAC.',
    };
  }

  const dryFoodGramsPerDay = estimateDryFoodGrams(dailyKcal, kcalPer100g);
  const gramsPerMeal = Math.round(dryFoodGramsPerDay / mealCount);

  let lifeStage = 'adulte';
  if (ageYears != null) {
    if (type === 'dog' && ageYears < 1) lifeStage = 'chiot';
    else if (type === 'cat' && ageYears < 1) lifeStage = 'chaton';
    else if (type === 'rabbit' && ageYears < 1) lifeStage = 'jeune';
    else if (type === 'bird' && ageYears < 1) lifeStage = 'jeune';
    else if (type === 'hamster' && ageYears < 1) lifeStage = 'jeune';
    else if (ageYears >= 8 && ['dog', 'cat'].includes(type)) lifeStage = 'senior';
    else if (ageYears >= 5 && ['rabbit', 'bird', 'hamster'].includes(type)) lifeStage = 'senior';
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
    foodLabel,
    calculationMethod,
    activityLevel,
    goal,
    isNeutered,
    message:
      type === 'fish'
        ? 'Ration journalière indicative (1–2 % du poids corporel). Ajustez selon température de l\'eau et activité.'
        : type === 'bird'
          ? 'Variez graines, granulés et légumes sûrs. Évitez avocat, chocolat et sel.'
          : 'Estimation à ajuster selon l’état corporel et l’avis vétérinaire. Les friandises comptent dans l’apport calorique.',
  };
};

export const PET_TYPE_LABELS = {
  dog: 'Chien',
  cat: 'Chat',
  bird: 'Oiseau',
  fish: 'Poisson',
  rabbit: 'Lapin / NAC',
  hamster: 'Hamster',
  reptile: 'Reptile',
  other: 'Autre NAC',
};
