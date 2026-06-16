import { buildPetNutritionRecommendation, parsePetAllergies, parsePetHealthFlags } from './petNutritionRecommender';

const PREF_BY_TYPE = {
  dog: ['Croquettes', 'Friandises dentaires', 'Os à mâcher'],
  cat: ['Croquettes', 'Pâtée', 'Friandises lyophilisées'],
  bird: ['Graines', 'Granulés', 'Légumes frais'],
  rabbit: ['Foin timothy', 'Granulés', 'Légumes verts'],
};

/** Profil nutritionnel dynamique par animal. */
export const buildPetNutritionProfile = (pet, recommendation = {}, context = {}) => {
  const rec = recommendation;
  const petId = String(pet?.id || pet?._id || '');
  const preferences = context.preferences || pet?.foodPreferences || PREF_BY_TYPE[pet?.type] || ['Croquettes'];
  const consumptionHistory = context.consumptionHistory || [];
  const vetRecs = context.vetRecommendations || [];

  const energyNeeds = {
    dailyKcal: rec.adaptedKcal ?? rec.calories?.dailyKcal,
    dailyGrams: rec.adaptedGramsPerDay ?? rec.calories?.dryFoodGramsPerDay,
    merFactor: rec.calories?.merFactor,
    goal: rec.goal,
    activityLevel: rec.activityLevel || context.activityLevel,
    lifeStage: rec.lifeStageLabel || rec.lifeStage,
  };

  const avgDailyGrams = consumptionHistory.length
    ? Math.round(
        consumptionHistory.reduce((s, e) => s + (e.grams || 0), 0) / consumptionHistory.length,
      )
    : null;

  const adherence =
    avgDailyGrams && energyNeeds.dailyGrams
      ? Math.min(1, Math.round((avgDailyGrams / energyNeeds.dailyGrams) * 100) / 100)
      : null;

  return {
    petId,
    petName: pet?.name || rec.name || 'Animal',
    updatedAt: new Date().toISOString(),
    energyNeeds,
    preferences: preferences.map((p, i) => ({
      id: `pref-${i}`,
      label: p,
      source: pet?.foodPreferences ? 'owner' : 'inferred',
    })),
    consumptionHistory: consumptionHistory.slice(0, 14),
    consumptionSummary: {
      entries: consumptionHistory.length,
      avgDailyGrams,
      adherence,
      lastMeal: consumptionHistory[0]?.date || null,
    },
    vetRecommendations: vetRecs.length
      ? vetRecs
      : buildDefaultVetRecs(pet, rec),
    allergies: parsePetAllergies(pet),
    healthFlags: parsePetHealthFlags(pet),
    profileScore: computeProfileScore(rec, adherence, vetRecs),
    aiSummary: buildProfileSummary(pet, rec, adherence),
  };
};

const buildDefaultVetRecs = (pet, rec) => {
  const recs = [];
  const flags = parsePetHealthFlags(pet);
  if (flags.some((f) => f.key === 'obesite')) {
    recs.push({ id: 'vet-obesity', source: 'vétérinaire', text: 'Régime hypocalorique — contrôle mensuel du poids.', date: null });
  }
  if (flags.some((f) => f.key === 'renal')) {
    recs.push({ id: 'vet-renal', source: 'vétérinaire', text: 'Alimentation rénale stade IRIS — phosphore contrôlé.', date: null });
  }
  if (parsePetAllergies(pet).length) {
    recs.push({ id: 'vet-allergy', source: 'vétérinaire', text: 'Éviter les protéines allergènes — formule hypoallergénique.', date: null });
  }
  if (!recs.length && rec.weightStatus === 'overweight') {
    recs.push({ id: 'vet-weight', source: 'IA PetfoodTN', text: 'Surveillance pondérale recommandée — formule light.', date: null });
  }
  if (!recs.length) {
    recs.push({ id: 'vet-routine', source: 'IA PetfoodTN', text: 'Bilan nutritionnel annuel et mise à jour du poids.', date: null });
  }
  return recs;
};

const computeProfileScore = (rec, adherence, vetRecs) => {
  let score = 70;
  if (rec.calories?.supported) score += 10;
  if (rec.weightStatus === 'ideal') score += 10;
  if (adherence != null && adherence >= 0.85 && adherence <= 1.1) score += 10;
  if (vetRecs.length) score += 5;
  if (rec.weightStatus === 'overweight') score -= 15;
  return Math.max(0, Math.min(100, score));
};

const buildProfileSummary = (pet, rec, adherence) => {
  const parts = [`Profil ${pet?.name || rec.name} : ${rec.adaptedKcal ?? rec.calories?.dailyKcal ?? '—'} kcal/j.`];
  if (adherence != null) parts.push(`Adhérence alimentaire ~${Math.round(adherence * 100)} %.`);
  if ((rec.healthFlags || []).length) parts.push(`${rec.healthFlags.length} pathologie(s) prise(s) en compte.`);
  return parts.join(' ');
};

export default buildPetNutritionProfile;
