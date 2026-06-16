/**
 * Détection des risques nutritionnels — obésité, carences, excès, incompatibilités pathologiques.
 */

const SEV = { high: 'high', medium: 'medium', low: 'low' };

export const detectNutritionRisks = (pet, recommendation = {}, weightTrend = {}, options = {}) => {
  const risks = [];
  const rec = recommendation;
  const cal = rec.calories || {};
  const weightStatus = rec.weightStatus || 'unknown';
  const adaptedKcal = rec.adaptedKcal ?? cal.dailyKcal;
  const adaptedGrams = rec.adaptedGramsPerDay ?? cal.dryFoodGramsPerDay;
  const allergies = rec.allergies || [];
  const healthFlags = rec.healthFlags || [];

  if (weightStatus === 'overweight' || weightStatus === 'heavy') {
    risks.push({
      id: 'obesity',
      type: 'obesity',
      severity: weightStatus === 'overweight' ? SEV.high : SEV.medium,
      icon: '⚖️',
      title: 'Risque de surpoids / obésité',
      message: `Poids au-dessus de la fourchette idéale (${rec.weightKg} kg). Réduire friandises et privilégier formule light.`,
      action: 'Objectif perte de poids — ration réduite ~10–15 % sous contrôle vétérinaire.',
    });
  }

  if (weightTrend.trend === 'gain' && (weightTrend.deltaPct || 0) > 2) {
    risks.push({
      id: 'weight-gain-trend',
      type: 'obesity',
      severity: SEV.medium,
      icon: '📈',
      title: 'Prise de poids en cours',
      message: `+${weightTrend.deltaKg} kg sur la période suivie — ajustement automatique de la ration IA.`,
      action: 'Surveiller l\'évolution hebdomadaire et l\'activité.',
    });
  }

  if (weightStatus === 'underweight' || weightTrend.trend === 'loss') {
    risks.push({
      id: 'undernutrition',
      type: 'undernutrition',
      severity: weightStatus === 'underweight' ? SEV.high : SEV.medium,
      icon: '📉',
      title: 'Risque de sous-alimentation',
      message: 'Apport calorique potentiellement insuffisant pour le poids cible.',
      action: 'Augmenter progressivement la ration ou consulter un vétérinaire.',
    });
  }

  if (!cal.supported || !adaptedKcal) {
    risks.push({
      id: 'incomplete-profile',
      type: 'deficiency',
      severity: SEV.medium,
      icon: '📋',
      title: 'Profil incomplet',
      message: 'Poids ou données manquants — impossible de calculer une ration exacte.',
      action: 'Complétez le poids et la race dans le profil animal.',
    });
  }

  if (rec.lifeStage === 'senior' || (rec.ageYears != null && rec.ageYears >= 7 && rec.type === 'dog')) {
    risks.push({
      id: 'senior-deficiency',
      type: 'deficiency',
      severity: SEV.low,
      icon: '🦴',
      title: 'Besoins senior',
      message: 'Animaux âgés : risque de carences en protéines digestibles, oméga-3 et vitamines.',
      action: 'Formule senior enrichie et bilan vétérinaire annuel.',
    });
  }

  if (adaptedKcal && cal.dailyKcal && adaptedKcal > cal.dailyKcal * 1.15) {
    risks.push({
      id: 'caloric-excess',
      type: 'excess',
      severity: SEV.medium,
      icon: '🔥',
      title: 'Excès calorique',
      message: `Ration IA (${adaptedKcal} kcal) au-dessus du MER de base — vérifier friandises et activité.`,
      action: 'Limiter les extras à moins de 10 % de la ration quotidienne.',
    });
  }

  if (adaptedGrams && adaptedGrams < 20 && rec.type === 'dog') {
    risks.push({
      id: 'ration-low',
      type: 'deficiency',
      severity: SEV.low,
      icon: '🥄',
      title: 'Ration très faible',
      message: 'Volume de croquettes bas — risque de carences si l\'aliment n\'est pas très dense.',
      action: 'Choisir un aliment premium dense en nutriments.',
    });
  }

  allergies.forEach((a) => {
    risks.push({
      id: `allergy-${a}`,
      type: 'incompatibility',
      severity: SEV.high,
      icon: '🚫',
      title: `Allergie : ${a}`,
      message: `Exclure ${a} de la ration — risque de réactions cutanées ou digestives.`,
      action: 'Mono-protéine ou formule hypoallergénique vétérinaire.',
    });
  });

  healthFlags.forEach((flag) => {
    risks.push({
      id: `pathology-${flag.key}`,
      type: 'incompatibility',
      severity: SEV.high,
      icon: '🩺',
      title: `Pathologie : ${flag.key}`,
      message: flag.label,
      action: 'Régime thérapeutique validé par votre vétérinaire.',
    });
  });

  if (options.activityLevel === 'faible' && weightStatus !== 'underweight') {
    risks.push({
      id: 'sedentary',
      type: 'obesity',
      severity: SEV.low,
      icon: '🛋️',
      title: 'Sédentarité',
      message: 'Activité faible combinée à un apport standard — favorise la prise de poids.',
      action: 'Enrichir l\'environnement et augmenter les sorties progressives.',
    });
  }

  const score = Math.max(0, 100 - risks.filter((r) => r.severity === 'high').length * 22
    - risks.filter((r) => r.severity === 'medium').length * 10
    - risks.filter((r) => r.severity === 'low').length * 4);

  return {
    risks: risks.sort((a, b) => {
      const p = { high: 3, medium: 2, low: 1 };
      return (p[b.severity] || 0) - (p[a.severity] || 0);
    }),
    riskScore: score,
    riskLevel: score >= 80 ? 'low' : score >= 55 ? 'medium' : 'high',
    summary:
      risks.length === 0
        ? 'Aucun risque nutritionnel majeur détecté — profil équilibré.'
        : `${risks.length} risque(s) identifié(s) — ${risks.filter((r) => r.severity === 'high').length} prioritaire(s).`,
  };
};

export default detectNutritionRisks;
