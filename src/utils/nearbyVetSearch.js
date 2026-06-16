/** Distance Haversine en km entre deux coordonnées */
export const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Recherche intelligente : classe les vétérinaires par disponibilité,
 * proximité et pertinence régionale.
 */
export const rankNearbyVets = (vets = [], context = {}) => {
  const { lat, lng, region } = context;

  return [...vets]
    .map((vet) => {
      let score = 50;
      const reasons = [];

      const dist =
        vet.distance ??
        (lat != null && vet.lat != null
          ? Math.round(haversineKm(lat, lng, Number(vet.lat), Number(vet.lng)) * 10) / 10
          : null);

      if (dist != null) {
        if (dist <= 2) {
          score += 25;
          reasons.push('Très proche');
        } else if (dist <= 5) {
          score += 18;
          reasons.push('À proximité');
        } else if (dist <= 15) {
          score += 10;
        } else {
          score -= Math.min(15, Math.floor(dist / 5));
        }
      }

      if (vet.availableNow) {
        score += 20;
        reasons.push('Disponible maintenant');
      }
      if (vet.teleconsult) {
        score += 8;
        reasons.push('Téléconsultation');
      }
      if (vet.sameRegion || (region && vet.region === region)) {
        score += 12;
        reasons.push('Votre région');
      }
      if (vet.openUntil) {
        score += 4;
      }
      if ((vet.specialties || []).includes('urgence')) {
        score += 6;
        reasons.push('Urgences');
      }

      return {
        ...vet,
        distance: dist,
        intelligenceScore: Math.min(100, Math.max(0, Math.round(score))),
        matchReasons: reasons.slice(0, 3),
        recommended: score >= 75,
      };
    })
    .sort((a, b) => b.intelligenceScore - a.intelligenceScore);
};

export const getIntelligentVetRecommendations = (vets, context) => {
  const ranked = rankNearbyVets(vets, context);
  return {
    vets: ranked,
    best: ranked[0] || null,
    availableCount: ranked.filter((v) => v.availableNow).length,
    summary: ranked.length
      ? `${ranked.filter((v) => v.recommended).length} vétérinaire(s) recommandé(s) sur ${ranked.length} — tri par disponibilité et proximité.`
      : 'Aucun vétérinaire trouvé dans votre zone.',
  };
};

export default rankNearbyVets;
