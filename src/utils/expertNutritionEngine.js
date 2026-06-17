/**
 * Système expert nutrition — moteur de règles forward-chaining (démo).
 */

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const EXPERT_DEMO_PRODUCTS = [
  { id: 'p-light-cat', name: 'Croquettes Light Chat Sénior', brand: 'PetfoodTN', price: 42.9, kcalPer100g: 320, tags: ['chat', 'senior', 'light', 'obesite'] },
  { id: 'p-digest-cat', name: 'Croquettes Digestion Chat', brand: 'PetfoodTN', price: 38.5, kcalPer100g: 350, tags: ['chat', 'digestif'] },
  { id: 'p-puppy-dog', name: 'Croquettes Chiot Premium', brand: 'PetfoodTN', price: 45, kcalPer100g: 380, tags: ['chien', 'chiot', 'junior'] },
  { id: 'p-adult-dog', name: 'Croquettes Adulte Chien Moyen', brand: 'PetfoodTN', price: 39.9, kcalPer100g: 360, tags: ['chien', 'adulte'] },
  { id: 'p-renal-cat', name: 'Croquettes Rénal Chat', brand: 'PetfoodTN', price: 48, kcalPer100g: 330, tags: ['chat', 'renal', 'senior'] },
];

const SPECIES_PATTERNS = [
  { species: 'cat', patterns: ['chat', 'chatte', 'felin', 'félin'] },
  { species: 'dog', patterns: ['chien', 'chienne', 'canin'] },
];

const CONDITION_RULES = [
  { key: 'obesite', patterns: ['obesite', 'obésité', 'surpoids', 'overweight', 'gros'], advice: 'Formule light, portions mesurées, activité modérée.', diet: ['light', 'obesite'], portionFactor: 0.85 },
  { key: 'diabete', patterns: ['diabete', 'diabète', 'glycemie'], advice: 'Ration stable, faible glycémie, repas fractionnés.', diet: ['diabete'], portionFactor: 0.9 },
  { key: 'renal', patterns: ['renal', 'rénal', 'rein', 'insuffisance renale'], advice: 'Protéines et phosphore modérés — formule rénal.', diet: ['renal'], portionFactor: 1 },
  { key: 'digestif', patterns: ['digestion', 'digestif', 'vomissement', 'colite'], advice: 'Haute digestibilité, transition progressive.', diet: ['digestif'], portionFactor: 1 },
];

const parseAgeYears = (query) => {
  const m = normalize(query).match(/(\d+)\s*ans?/);
  return m ? Number(m[1]) : null;
};

const parseSpecies = (query) => {
  const hay = normalize(query);
  const hit = SPECIES_PATTERNS.find((s) => s.patterns.some((p) => hay.includes(p)));
  return hit?.species || null;
};

const parseConditions = (query) => {
  const hay = normalize(query);
  return CONDITION_RULES.filter((r) => r.patterns.some((p) => hay.includes(p)));
};

const lifeStage = (species, ageYears) => {
  if (ageYears == null) return 'adult';
  if (species === 'cat') {
    if (ageYears < 1) return 'kitten';
    if (ageYears >= 7) return 'senior';
    return 'adult';
  }
  if (ageYears < 1) return 'puppy';
  if (ageYears >= 7) return 'senior';
  return 'adult';
};

const matchProducts = ({ species, stage, conditions }) => {
  const dietTags = conditions.flatMap((c) => c.diet || []);
  return EXPERT_DEMO_PRODUCTS.filter((p) => {
    const tags = p.tags || [];
    if (species && !tags.includes(species === 'cat' ? 'chat' : 'chien')) return false;
    if (stage === 'senior' && !tags.includes('senior') && !tags.includes('light') && conditions.length === 0) return true;
    if (dietTags.length && dietTags.some((t) => tags.includes(t))) return true;
    if (!dietTags.length && species) {
      const sp = species === 'cat' ? 'chat' : 'chien';
      return tags.includes(sp) && (stage === 'puppy' || stage === 'kitten' ? tags.includes('chiot') || tags.includes('junior') : true);
    }
    return false;
  }).slice(0, 3);
};

/** Analyse une question en langage naturel et produit un régime adapté. */
export const runExpertNutritionQuery = (query = '') => {
  const trimmed = String(query).trim();
  if (!trimmed) {
    return { ok: false, message: 'Posez une question sur l\'alimentation de votre animal.' };
  }

  const species = parseSpecies(trimmed);
  const ageYears = parseAgeYears(trimmed);
  const conditions = parseConditions(trimmed);
  const stage = lifeStage(species, ageYears);

  const firedRules = [];
  if (species) firedRules.push({ id: 'species', label: `Espèce : ${species === 'cat' ? 'Chat' : 'Chien'}`, confidence: 95 });
  if (ageYears != null) firedRules.push({ id: 'age', label: `Âge : ${ageYears} ans (${stage})`, confidence: 92 });
  conditions.forEach((c) => {
    firedRules.push({ id: c.key, label: c.advice, confidence: 88 });
  });

  const products = matchProducts({ species, stage, conditions });
  const portionFactor = conditions.reduce((f, c) => Math.min(f, c.portionFactor ?? 1), 1);

  const dailyKcal = species === 'cat'
    ? Math.round((ageYears >= 7 ? 45 : 55) * (portionFactor) * 10) / 10
    : Math.round((ageYears >= 7 ? 70 : 85) * portionFactor * 10) / 10;

  const summary = species
    ? `Régime proposé pour ${species === 'cat' ? 'un chat' : 'un chien'}${ageYears != null ? ` de ${ageYears} ans` : ''}${conditions.length ? ` — ${conditions.map((c) => c.key).join(', ')}` : ''}.`
    : 'Profil partiel — précisez espèce et âge pour affiner.';

  return {
    ok: true,
    query: trimmed,
    profile: { species, ageYears, stage, conditions: conditions.map((c) => c.key) },
    firedRules,
    recommendations: products,
    dietPlan: {
      dailyKcalTarget: dailyKcal,
      mealsPerDay: species === 'cat' ? 3 : 2,
      portionNote: conditions.some((c) => c.key === 'obesite')
        ? 'Réduire de 15 % la ration habituelle pendant 4 semaines, puis réévaluer le poids.'
        : 'Ajuster selon activité et courbe de poids.',
      vetNote: 'Validation vétérinaire recommandée avant changement de régime.',
    },
    summary,
  };
};

export default runExpertNutritionQuery;
