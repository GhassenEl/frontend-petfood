/** Recommandations vendeur selon profil animal (race, âge, poids). */

const PROFILES = [
  { id: 'puppy-dog', label: 'Chiot (< 1 an)', animal: 'dog', tags: ['croquettes', 'chiot', 'éducation'] },
  { id: 'senior-cat', label: 'Chat senior (> 10 ans)', animal: 'cat', tags: ['senior', 'rénal', 'digestion'] },
  { id: 'large-dog', label: 'Grand chien (> 25 kg)', animal: 'dog', tags: ['XL', 'articulations', 'croquettes'] },
  { id: 'allergy-dog', label: 'Chien allergique', animal: 'dog', tags: ['hypoallergénique', 'sans céréales'] },
];

export const getVendorPetProfileRecommendations = (catalog = []) => {
  return PROFILES.map((profile) => {
    const matches = catalog
      .filter((p) => {
        const text = `${p.name} ${p.category} ${p.tags || ''}`.toLowerCase();
        return profile.tags.some((t) => text.includes(t.toLowerCase()));
      })
      .slice(0, 3);

    const fallback = catalog.slice(0, 3).map((p) => ({ ...p, score: 0.65 }));

    return {
      ...profile,
      recommendations: matches.length ? matches.map((p, i) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        score: 0.92 - i * 0.05,
        reason: `Adapté profil ${profile.label}`,
      })) : fallback,
    };
  });
};

export default { getVendorPetProfileRecommendations };
