/** Espèces vendues et prises en charge (produits + animaux + IoT). */
export const SPECIES = [
  { id: 'dog', label: 'Chien', emoji: '🐕', feederDefaultGrams: 35 },
  { id: 'cat', label: 'Chat', emoji: '🐈', feederDefaultGrams: 25 },
  { id: 'bird', label: 'Oiseau', emoji: '🐦', feederDefaultGrams: 8 },
  { id: 'fish', label: 'Poisson', emoji: '🐟', feederDefaultGrams: 3 },
  { id: 'rabbit', label: 'Lapin', emoji: '🐰', feederDefaultGrams: 15 },
  { id: 'hamster', label: 'Hamster', emoji: '🐹', feederDefaultGrams: 5 },
  { id: 'reptile', label: 'Reptile', emoji: '🦎', feederDefaultGrams: 4 },
  { id: 'other', label: 'Autre', emoji: '🐾', feederDefaultGrams: 20 },
];

export const SPECIES_MAP = Object.fromEntries(SPECIES.map((s) => [s.id, s]));

export const gramsForPet = (pet) => {
  const base = SPECIES_MAP[pet?.type]?.feederDefaultGrams ?? 20;
  const w = Number(pet?.weight);
  if (!w || w <= 0) return base;
  if (pet.type === 'dog') return Math.min(80, Math.round(w * 1.8));
  if (pet.type === 'cat') return Math.min(55, Math.round(w * 2.2));
  if (pet.type === 'rabbit') return Math.min(40, Math.round(w * 3));
  return base;
};
