import api from '../utils/api';
import { buildPetNutritionRecommendation } from '../utils/petNutritionRecommender';
import { generateWeeklyDietPlan } from '../utils/weeklyDietPlanGenerator';
import { calculatePetCalories, petAgeYears } from '../utils/petCalorieCalculator';
import { getVetNutritionRecommendation } from './vetService';

const normalizePet = (raw = {}) => {
  const type = String(raw.type || raw.animalType || 'dog').toLowerCase();
  const weightKg = Number(raw.weightKg ?? raw.weight ?? 0) || null;
  const ageYears =
    raw.ageYears != null
      ? Number(raw.ageYears)
      : raw.age != null
        ? Number(raw.age)
        : petAgeYears(raw.birthDate);

  return {
    id: raw.id || raw._id || null,
    name: raw.name || raw.petName || 'Animal',
    type,
    breed: raw.breed || '',
    weightKg,
    weight: weightKg,
    birthDate: raw.birthDate,
    ageYears: ageYears != null && !Number.isNaN(ageYears) ? ageYears : null,
    allergies: raw.allergies || raw.allergyNotes || '',
    notes: raw.notes || raw.healthNotes || '',
    chronicConditions: raw.chronicConditions || [],
    isNeutered: raw.isNeutered !== false,
  };
};

export const buildLocalNutritionPlan = (rawPet, options = {}) => {
  const pet = normalizePet(rawPet);
  const recommendation = buildPetNutritionRecommendation(pet, options);
  const calories = recommendation.calories || calculatePetCalories(pet, options);
  const weeklyPlan = generateWeeklyDietPlan({ pet, recommendation });

  const mealPlan = buildMealPlanArray(recommendation, calories);

  const tips = (recommendation.recommendations || [])
    .map((r) => r.text)
    .filter(Boolean)
    .slice(0, 8);

  const warnings = [];
  if (recommendation.allergies?.length) {
    warnings.push(`Allergies : ${recommendation.allergies.join(', ')}`);
  }
  if (recommendation.disclaimer) warnings.push(recommendation.disclaimer);

  return {
    petName: pet.name,
    petType: pet.type,
    petProfile: {
      species: pet.type,
      weightKg: pet.weightKg,
      ageYears: pet.ageYears,
      breed: pet.breed,
      activity: options.activityLevel || 'moyen',
      condition: options.bodyCondition || 'ideal',
    },
    summary: recommendation.explanation?.summary
      || `Apport estimé : ${calories.dailyKcal || '—'} kcal/jour`
        + (calories.dryFoodGramsPerDay ? ` (~${calories.dryFoodGramsPerDay} g/jour, ${calories.gramsPerMeal || '—'} g × ${calories.mealCount || 2} repas).` : '.'),
    calories,
    macros: recommendation.macros || {},
    mealPlan,
    weeklyPlan,
    recommendations: recommendation.recommendations || [],
    productRecommendations: recommendation.suggestedProducts
      ? { food: recommendation.suggestedProducts.map((p) => ({ name: p.name, reason: p.reason || p.compatibilityReason })) }
      : { food: [] },
    tips: tips.length ? tips : (recommendation.tips || []),
    warnings: warnings.length ? warnings : (recommendation.warnings || []),
    hydration: recommendation.hydration || calories.hydration,
    source: 'local',
  };
};

const buildMealPlanFromCalories = (calories) => {
  if (!calories?.supported || !calories.dailyKcal) return [];
  const count = calories.mealCount || 2;
  const grams = calories.gramsPerMeal || Math.round((calories.dryFoodGramsPerDay || 0) / count);
  const kcalPerMeal = Math.round(calories.dailyKcal / count);
  const times = count === 3 ? ['08:00', '13:00', '19:30'] : count === 1 ? ['09:00'] : ['08:00', '19:00'];
  const labels = count === 3 ? ['Matin', 'Midi', 'Soir'] : count === 1 ? ['Repas unique'] : ['Matin', 'Soir'];

  return times.map((time, i) => ({
    time,
    label: labels[i] || `Repas ${i + 1}`,
    portion: `${grams} g`,
    kcal: kcalPerMeal,
  }));
};

const buildMealPlanArray = (recommendation, calories) => {
  if (Array.isArray(recommendation?.mealPlan) && recommendation.mealPlan.length) {
    return recommendation.mealPlan;
  }
  const mp = recommendation?.mealPlan;
  if (mp?.mealsPerDay && calories?.supported) {
    return buildMealPlanFromCalories(calories);
  }
  return buildMealPlanFromCalories(calories);
};

export const fetchVetNutritionPlan = async (ownerId, petName) => {
  const data = await getVetNutritionRecommendation(ownerId, petName);
  return { ...data, source: 'vet-api' };
};

export const fetchClientNutritionPlanForPet = async (pet, options = {}) => {
  const petId = pet?.id || pet?._id;
  const params = new URLSearchParams();
  if (petId) params.set('petId', petId);
  if (options.activityLevel) params.set('activityLevel', options.activityLevel);
  if (options.goal) params.set('goal', options.goal);
  if (options.mealCount) params.set('mealCount', String(options.mealCount));

  try {
    const { data } = await api.get(`/pets/nutrition?${params}`);
    const match = (data?.pets || []).find(
      (p) => String(p.petId || p.id) === String(petId) || p.name === pet.name
    );
    if (match) return { ...match, source: 'client-api' };
  } catch {
    /* fallback local */
  }

  return buildLocalNutritionPlan(pet, options);
};

export const generateNutritionPlan = async ({
  pet,
  ownerId,
  options = {},
  useAi = false,
  aiContext,
  aiMessage,
}) => {
  const normalized = normalizePet(pet);

  let plan;
  if (ownerId && normalized.name) {
    try {
      plan = await fetchVetNutritionPlan(ownerId, normalized.name);
    } catch {
      plan = buildLocalNutritionPlan(normalized, options);
    }
  } else if (normalized.id) {
    plan = await fetchClientNutritionPlanForPet(normalized, options);
  } else {
    plan = buildLocalNutritionPlan(normalized, options);
  }

  if (!useAi) return plan;

  try {
    const res = await api.post('/chat/pet', {
      message: aiMessage || 'Génère un plan alimentaire professionnel personnalisé pour cet animal.',
      context: aiContext,
    });
    const aiText = res.data?.message || res.data?.content || '';
    return {
      ...plan,
      aiPlan: aiText,
      aiProducts: res.data?.products || [],
      shouldShowVetCTA: !!res.data?.shouldShowVetCTA,
      source: `${plan.source}+ai`,
    };
  } catch {
    return {
      ...plan,
      aiPlan: formatPlanAsText(plan),
      source: `${plan.source}+local-fallback`,
    };
  }
};

export const formatPlanAsText = (plan) => {
  const lines = [
    `Plan nutritionnel — ${plan.petName || 'Animal'}`,
    plan.summary || '',
    plan.calories?.supported
      ? `Calories : ${plan.calories.dailyKcal} kcal/j · ${plan.calories.dryFoodGramsPerDay || '—'} g/jour`
      : '',
  ];

  (plan.mealPlan || []).forEach((m) => {
    lines.push(`${m.time} ${m.label} : ${m.portion} (~${m.kcal} kcal)`);
  });

  (plan.tips || []).slice(0, 4).forEach((t) => lines.push(`• ${t}`));
  (plan.warnings || []).slice(0, 3).forEach((w) => lines.push(`⚠ ${w}`));

  return lines.filter(Boolean).join('\n');
};

export const persistNutritionPlan = async ({
  planText,
  pet,
  goal = 'maintien',
  metadata = {},
  source = 'adaptive-nutrition',
}) => {
  try {
    await api.post('/nutrition/plans', {
      planText,
      petName: pet?.name,
      petType: pet?.type,
      goal,
      metadata,
      source,
    });
    return true;
  } catch {
    return false;
  }
};

export { normalizePet };
