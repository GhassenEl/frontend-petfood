/** Référentiel espèces — tous animaux de compagnie (chiens, chats, NAC…). */

const SPECIES = {
  dog: { id: 'dog', labelFr: 'Chien', emoji: '🐕', idealWaterRatio: 5, mlPerKgDay: 50, usesAquarium: false,
    hydrationTip: 'Un chien actif a besoin d\'environ 50 ml/kg/jour. Eau fraîche après l\'exercice.' },
  chien: { id: 'dog', labelFr: 'Chien', emoji: '🐕', idealWaterRatio: 5, mlPerKgDay: 50, usesAquarium: false,
    hydrationTip: 'Un chien actif a besoin d\'environ 50 ml/kg/jour. Eau fraîche après l\'exercice.' },
  cat: { id: 'cat', labelFr: 'Chat', emoji: '🐈', idealWaterRatio: 4, mlPerKgDay: 45, usesAquarium: false,
    hydrationTip: 'Les chats boivent peu : une fontaine augmente la consommation.' },
  chat: { id: 'cat', labelFr: 'Chat', emoji: '🐈', idealWaterRatio: 4, mlPerKgDay: 45, usesAquarium: false,
    hydrationTip: 'Les chats boivent peu : une fontaine augmente la consommation.' },
  bird: { id: 'bird', labelFr: 'Oiseau', emoji: '🐦', idealWaterRatio: 10, mlPerKgDay: 80, usesAquarium: false,
    hydrationTip: 'Changez l\'eau des oiseaux 2×/jour — évitez les abreuvoirs sales.' },
  oiseau: { id: 'bird', labelFr: 'Oiseau', emoji: '🐦', idealWaterRatio: 10, mlPerKgDay: 80, usesAquarium: false,
    hydrationTip: 'Changez l\'eau des oiseaux 2×/jour — évitez les abreuvoirs sales.' },
  fish: { id: 'fish', labelFr: 'Poisson', emoji: '🐠', idealWaterRatio: 0, mlPerKgDay: 0, usesAquarium: true,
    hydrationTip: 'Surveillez la qualité de l\'eau d\'aquarium (pH, température, nitrites).' },
  poisson: { id: 'fish', labelFr: 'Poisson', emoji: '🐠', idealWaterRatio: 0, mlPerKgDay: 0, usesAquarium: true,
    hydrationTip: 'Surveillez la qualité de l\'eau d\'aquarium (pH, température, nitrites).' },
  rabbit: { id: 'rabbit', labelFr: 'Lapin', emoji: '🐰', idealWaterRatio: 7, mlPerKgDay: 100, usesAquarium: false,
    hydrationTip: 'Les lapins boivent beaucoup — bol lourd stable et eau fraîche quotidienne.' },
  lapin: { id: 'rabbit', labelFr: 'Lapin', emoji: '🐰', idealWaterRatio: 7, mlPerKgDay: 100, usesAquarium: false,
    hydrationTip: 'Les lapins boivent beaucoup — bol lourd stable et eau fraîche quotidienne.' },
  hamster: { id: 'hamster', labelFr: 'Hamster', emoji: '🐹', idealWaterRatio: 8, mlPerKgDay: 120, usesAquarium: false,
    hydrationTip: 'Biberon propre chaque jour — les hamsters déshydratent vite en cage chaude.' },
  reptile: { id: 'reptile', labelFr: 'Reptile', emoji: '🦎', idealWaterRatio: 3, mlPerKgDay: 30, usesAquarium: false,
    hydrationTip: 'Bain tiède + bol d\'eau — l\'humidité du terrarium compte autant que la boisson.' },
  ferret: { id: 'ferret', labelFr: 'Furet', emoji: '🦡', idealWaterRatio: 5, mlPerKgDay: 55, usesAquarium: false,
    hydrationTip: 'Les furets sont actifs : plusieurs points d\'eau dans la pièce.' },
  furet: { id: 'ferret', labelFr: 'Furet', emoji: '🦡', idealWaterRatio: 5, mlPerKgDay: 55, usesAquarium: false,
    hydrationTip: 'Les furets sont actifs : plusieurs points d\'eau dans la pièce.' },
  guinea_pig: { id: 'guinea_pig', labelFr: 'Cochon d\'Inde', emoji: '🐹', idealWaterRatio: 7, mlPerKgDay: 100, usesAquarium: false,
    hydrationTip: 'Cochons d\'Inde : eau + foin humide — surveillez le biberon quotidiennement.' },
  cochon_dinde: { id: 'guinea_pig', labelFr: 'Cochon d\'Inde', emoji: '🐹', idealWaterRatio: 7, mlPerKgDay: 100, usesAquarium: false,
    hydrationTip: 'Cochons d\'Inde : eau + foin humide — surveillez le biberon quotidiennement.' },
  nac: { id: 'nac', labelFr: 'NAC', emoji: '🐾', idealWaterRatio: 6, mlPerKgDay: 60, usesAquarium: false,
    hydrationTip: 'Adaptez bol ou biberon à la taille de votre NAC — consultez un vétérinaire NAC.' },
  other: { id: 'other', labelFr: 'Autre', emoji: '🐾', idealWaterRatio: 5, mlPerKgDay: 50, usesAquarium: false,
    hydrationTip: 'Objectif hydratation personnalisé selon espèce et poids — avis vétérinaire recommandé.' },
  autre: { id: 'other', labelFr: 'Autre', emoji: '🐾', idealWaterRatio: 5, mlPerKgDay: 50, usesAquarium: false,
    hydrationTip: 'Objectif hydratation personnalisé selon espèce et poids — avis vétérinaire recommandé.' },
};

export const resolveSpecies = (raw) => {
  const key = (raw || 'dog').toLowerCase().trim();
  return SPECIES[key] || SPECIES.other;
};

export const speciesEmoji = (raw) => resolveSpecies(raw).emoji;
export const speciesLabel = (raw) => resolveSpecies(raw).labelFr;
export const idealWaterRatioFor = (raw) => resolveSpecies(raw).idealWaterRatio;

export const estimateTargetMl = (species, weightKg) => {
  const info = resolveSpecies(species);
  if (info.usesAquarium) return 0;
  if (weightKg > 0) return Math.min(5000, Math.max(20, Math.round(weightKg * info.mlPerKgDay)));
  const defaults = { bird: 40, hamster: 15, rabbit: 350, reptile: 80, ferret: 200, guinea_pig: 200, cat: 250 };
  return defaults[info.id] ?? 550;
};

export const PET_EMOJI = Object.fromEntries(
  Object.entries(SPECIES).map(([k, v]) => [k, v.emoji]),
);

export default { resolveSpecies, speciesEmoji, speciesLabel, idealWaterRatioFor, estimateTargetMl, PET_EMOJI };
