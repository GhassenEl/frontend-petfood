import { haversineKm } from './nearbyVetSearch';

export const VET_SPECIALTY_LABELS = {
  vaccination: 'Vaccination',
  chirurgie: 'Chirurgie',
  dermatologie: 'Dermatologie',
  urgence: 'Urgences 24h',
  dentaire: 'Dentaire',
  nutrition: 'Nutrition',
  comportement: 'Comportement',
  ophtalmologie: 'Ophtalmologie',
};

/**
 * Marketplace vétérinaire intelligente — recommandation selon
 * spécialité, localisation, disponibilités et avis.
 */
export const rankVetMarketplace = (vets = [], context = {}) => {
  const { specialty, lat, lng, region } = context;
  const specNorm = specialty ? String(specialty).toLowerCase() : null;

  return [...vets]
    .map((vet) => {
      let score = 40;
      const reasons = [];

      const dist =
        vet.distance ??
        (lat != null && vet.lat != null
          ? Math.round(haversineKm(lat, lng, Number(vet.lat), Number(vet.lng)) * 10) / 10
          : null);

      if (specNorm) {
        const specs = (vet.specialties || []).map((s) => s.toLowerCase());
        if (specs.includes(specNorm)) {
          score += 30;
          reasons.push(`Spécialité : ${VET_SPECIALTY_LABELS[specNorm] || specialty}`);
        } else if (specs.some((s) => s.includes(specNorm) || specNorm.includes(s))) {
          score += 15;
          reasons.push('Spécialité proche');
        } else {
          score -= 12;
        }
      }

      const rating = Number(vet.rating_avg) || 4.0;
      const reviewCount = Number(vet.rating_count) || 0;
      score += Math.min(25, rating * 5);
      if (rating >= 4.5 && reviewCount >= 10) {
        reasons.push(`${rating}/5 (${reviewCount} avis)`);
      } else if (rating >= 4) {
        reasons.push(`Bien noté (${rating}/5)`);
      }

      if (dist != null) {
        if (dist <= 3) {
          score += 20;
          reasons.push(`${dist} km — très proche`);
        } else if (dist <= 8) {
          score += 12;
          reasons.push(`${dist} km`);
        } else {
          score += Math.max(0, 8 - Math.floor(dist / 5));
        }
      }

      if (vet.availableNow) {
        score += 18;
        reasons.push('Disponible maintenant');
      }
      if (vet.teleconsult) {
        score += 6;
        reasons.push('Téléconsultation');
      }
      if (vet.sameRegion || (region && vet.region === region)) {
        score += 8;
      }

      return {
        ...vet,
        distance: dist,
        marketplaceScore: Math.min(100, Math.max(0, Math.round(score))),
        matchReasons: reasons.slice(0, 4),
        topPick: score >= 78,
      };
    })
    .sort((a, b) => b.marketplaceScore - a.marketplaceScore);
};

export const getMarketplaceRecommendation = (vets, context) => {
  const ranked = rankVetMarketplace(vets, context);
  return {
    vets: ranked,
    best: ranked[0] || null,
    summary: ranked.length
      ? `Meilleur match : ${ranked[0]?.name} (score ${ranked[0]?.marketplaceScore}/100) — ${ranked[0]?.matchReasons?.[0] || 'recommandé'}.`
      : 'Aucun vétérinaire trouvé pour ces critères.',
  };
};

export default rankVetMarketplace;
