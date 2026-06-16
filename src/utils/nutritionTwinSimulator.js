import { detectNutritionRisks } from './nutritionRiskEngine';
import { computePetFoodTnScore } from './petFoodTnScoreEngine';
import { buildPetNutritionRecommendation, getWeightStatus } from './petNutritionRecommender';
import { extractNutritionFromProduct } from './productNutritionExtract';

const SCENARIOS = [
  { id: 'light', label: 'Formule light (-15 % kcal)', kcalFactor: 0.85, foodLabel: 'Croquettes light' },
  { id: 'senior', label: 'Formule senior (-8 % kcal)', kcalFactor: 0.92, foodLabel: 'Croquettes senior' },
  { id: 'premium', label: 'Premium haute digestibilité', kcalFactor: 1, foodLabel: 'Croquettes premium' },
  { id: 'increase', label: 'Augmentation ration (+12 %)', kcalFactor: 1.12, foodLabel: 'Ration majorée' },
  { id: 'hypo', label: 'Hypoallergénique (saumon)', kcalFactor: 1, foodLabel: 'Croquettes hypo saumon' },
];

/** ~7500 kcal cumulées ≈ 1 kg chez le chien/chat (approximation MER). */
const KCAL_PER_KG = 7500;

const nutritionBalanceScore = (nutrition = {}, type = 'dog') => {
  const protein = Number(nutrition.proteinPercent) || 22;
  const fat = Number(nutrition.fatPercent) || 14;
  const fiber = Number(nutrition.fiberPercent) || 3;
  const idealProtein = type === 'cat' ? 30 : 24;
  const idealFat = type === 'cat' ? 16 : 14;
  const proteinScore = Math.max(0, 100 - Math.abs(protein - idealProtein) * 6);
  const fatScore = Math.max(0, 100 - Math.abs(fat - idealFat) * 8);
  const fiberScore = fiber >= 2 && fiber <= 6 ? 90 : 60;
  return Math.round((proteinScore + fatScore + fiberScore) / 3);
};

const projectWeightTimeline = (startKg, kcalDelta, weeks = 12) => {
  const kgPerWeek = (kcalDelta * 7) / KCAL_PER_KG;
  const points = [];
  for (let w = 0; w <= weeks; w += 2) {
    points.push({
      week: w,
      label: w === 0 ? 'Aujourd\'hui' : `+${w} sem.`,
      weightKg: Math.round((startKg + kgPerWeek * w) * 10) / 10,
    });
  }
  return { points, kgPerWeek: Math.round(kgPerWeek * 100) / 100 };
};

/** Simule l'impact d'un changement alimentaire sur le jumeau nutritionnel. */
export const simulateNutritionTwinChange = ({
  pet = {},
  twin = {},
  scenarioId = 'premium',
  product = null,
  weeks = 12,
} = {}) => {
  const rec = twin.nutritionRecommendation || buildPetNutritionRecommendation(pet);
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[2];
  const type = pet.type || twin.identity?.type || 'dog';
  const currentWeight = Number(pet.weightKg ?? pet.weight ?? twin.identity?.weightKg) || 10;
  const currentKcal = twin.feeding?.dailyKcal ?? rec.adaptedKcal ?? rec.calories?.dailyKcal ?? 300;
  const currentGrams = twin.feeding?.gramsPerDay ?? rec.adaptedGramsPerDay ?? rec.calories?.dryFoodGramsPerDay ?? 200;

  let newKcal = Math.round(currentKcal * scenario.kcalFactor);
  let newGrams = Math.round(currentGrams * scenario.kcalFactor);
  let newFoodLabel = scenario.foodLabel;
  let nutrition = { proteinPercent: 26, fatPercent: 12, fiberPercent: 4 };

  if (product) {
    const pScore = computePetFoodTnScore(product, { type, allergies: rec.allergies });
    nutrition = extractNutritionFromProduct(product);
    const productKcal = Number(nutrition.kcalPer100g) || 360;
    newGrams = Math.round((newKcal / (rec.calories?.dailyKcal || newKcal)) * (rec.calories?.dryFoodGramsPerDay || currentGrams));
    if (productKcal && newKcal) newGrams = Math.round((newKcal / productKcal) * 100);
    newFoodLabel = product.name || scenario.foodLabel;
    nutrition.petFoodTnScore = pScore.overall;
  }

  const kcalDelta = newKcal - currentKcal;
  const { points: weightTimeline, kgPerWeek } = projectWeightTimeline(currentWeight, kcalDelta, weeks);
  const projectedWeight = weightTimeline[weightTimeline.length - 1]?.weightKg ?? currentWeight;

  const idealRange = rec.idealWeightKg || rec.breedProfile?.idealWeightKg;
  const currentWeightStatus = rec.weightStatus || getWeightStatus(currentWeight, idealRange);
  const projectedWeightStatus = getWeightStatus(projectedWeight, idealRange);

  const baselineBalance = nutritionBalanceScore(
    extractNutritionFromProduct({ nutrition: { protein: 26, fat: 12, fiber: 4 } }),
    type,
  );
  const simulatedBalance = nutritionBalanceScore(nutrition, type);

  const baselineRisks = detectNutritionRisks(pet, rec, rec.weightTrend || {}, {});
  const simulatedRec = {
    ...rec,
    adaptedKcal: newKcal,
    adaptedGramsPerDay: newGrams,
    weightKg: projectedWeight,
    weightStatus: projectedWeightStatus,
    mealPlan: { ...rec.mealPlan, foodLabel: newFoodLabel, kcalPerDay: newKcal, gramsPerDay: newGrams },
  };
  const simulatedRisks = detectNutritionRisks(
    { ...pet, weightKg: projectedWeight, weight: projectedWeight },
    simulatedRec,
    rec.weightTrend || {},
    {},
  );

  const newRiskIds = new Set(simulatedRisks.risks.map((r) => r.id));
  const resolvedRisks = baselineRisks.risks.filter((r) => !newRiskIds.has(r.id));
  const addedRisks = simulatedRisks.risks.filter(
    (r) => !baselineRisks.risks.some((b) => b.id === r.id),
  );

  const healthImpact =
    simulatedRisks.riskScore > baselineRisks.riskScore
      ? 'positive'
      : simulatedRisks.riskScore < baselineRisks.riskScore
        ? 'negative'
        : 'neutral';

  return {
    scenario: { id: scenario.id, label: scenario.label, foodLabel: newFoodLabel },
    baseline: {
      weightKg: currentWeight,
      weightStatus: currentWeightStatus,
      dailyKcal: currentKcal,
      dailyGrams: currentGrams,
      diet: twin.feeding?.currentDiet || 'Régime actuel',
      nutritionBalance: baselineBalance,
      riskScore: baselineRisks.riskScore,
      riskCount: baselineRisks.risks.length,
    },
    simulated: {
      weightKg: projectedWeight,
      weightStatus: projectedWeightStatus,
      dailyKcal: newKcal,
      dailyGrams: newGrams,
      diet: newFoodLabel,
      nutritionBalance: simulatedBalance,
      riskScore: simulatedRisks.riskScore,
      riskCount: simulatedRisks.risks.length,
      proteinPercent: nutrition.proteinPercent,
      fatPercent: nutrition.fatPercent,
    },
    deltas: {
      weightKg: Math.round((projectedWeight - currentWeight) * 10) / 10,
      kcal: kcalDelta,
      kcalPct: currentKcal ? Math.round((kcalDelta / currentKcal) * 100) : 0,
      nutritionBalance: simulatedBalance - baselineBalance,
      riskScore: simulatedRisks.riskScore - baselineRisks.riskScore,
      kgPerWeek,
    },
    weightTimeline,
    risks: {
      baseline: baselineRisks.risks.slice(0, 5),
      simulated: simulatedRisks.risks.slice(0, 5),
      resolved: resolvedRisks.slice(0, 3),
      added: addedRisks.slice(0, 3),
      healthImpact,
    },
    aiSummary: buildSimulationSummary({
      scenario,
      kcalDelta,
      projectedWeight,
      currentWeight,
      healthImpact,
      simulatedBalance,
      baselineBalance,
      weeks,
    }),
  };
};

const buildSimulationSummary = ({
  scenario,
  kcalDelta,
  projectedWeight,
  currentWeight,
  healthImpact,
  simulatedBalance,
  baselineBalance,
  weeks,
}) => {
  const parts = [
    `Simulation « ${scenario.label} » sur ${weeks} semaines.`,
    kcalDelta > 0
      ? `Apport +${kcalDelta} kcal/j — prise estimée ${projectedWeight - currentWeight > 0 ? '+' : ''}${Math.round((projectedWeight - currentWeight) * 10) / 10} kg.`
      : kcalDelta < 0
        ? `Apport ${kcalDelta} kcal/j — perte estimée ~${Math.abs(Math.round((projectedWeight - currentWeight) * 10) / 10)} kg.`
        : 'Apport calorique stable.',
    `Équilibre nutritionnel ${simulatedBalance >= baselineBalance ? 'amélioré' : 'à surveiller'} (${simulatedBalance}/100).`,
    healthImpact === 'positive'
      ? 'Risques santé réduits selon le modèle IA.'
      : healthImpact === 'negative'
        ? 'Attention : nouveaux risques détectés — consulter un vétérinaire.'
        : 'Profil de risque stable.',
  ];
  return parts.join(' ');
};

export const NUTRITION_TWIN_SCENARIOS = SCENARIOS;

export default simulateNutritionTwinChange;
