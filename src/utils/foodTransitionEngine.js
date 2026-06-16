/** Programme de transition alimentaire progressif (7–10 jours). */
export const buildFoodTransitionPlan = ({
  pet,
  recommendation,
  currentFood = 'ancien aliment',
  newFood = 'nouvel aliment',
  days = 10,
} = {}) => {
  const rec = recommendation || {};
  const totalGrams = rec.adaptedGramsPerDay ?? rec.calories?.dryFoodGramsPerDay ?? 200;
  const petName = pet?.name || rec.name || 'Animal';

  const ratios = days <= 7
    ? [
        { day: 1, oldPct: 75, newPct: 25 },
        { day: 2, oldPct: 75, newPct: 25 },
        { day: 3, oldPct: 50, newPct: 50 },
        { day: 4, oldPct: 50, newPct: 50 },
        { day: 5, oldPct: 25, newPct: 75 },
        { day: 6, oldPct: 25, newPct: 75 },
        { day: 7, oldPct: 0, newPct: 100 },
      ]
    : [
        { day: 1, oldPct: 80, newPct: 20 },
        { day: 2, oldPct: 70, newPct: 30 },
        { day: 3, oldPct: 60, newPct: 40 },
        { day: 4, oldPct: 50, newPct: 50 },
        { day: 5, oldPct: 40, newPct: 60 },
        { day: 6, oldPct: 30, newPct: 70 },
        { day: 7, oldPct: 20, newPct: 80 },
        { day: 8, oldPct: 10, newPct: 90 },
        { day: 9, oldPct: 5, newPct: 95 },
        { day: 10, oldPct: 0, newPct: 100 },
      ];

  const schedule = ratios.map(({ day, oldPct, newPct }) => ({
    day,
    oldFood: currentFood,
    newFood,
    oldGrams: Math.round((totalGrams * oldPct) / 100),
    newGrams: Math.round((totalGrams * newPct) / 100),
    totalGrams,
    mixLabel: `${oldPct} % / ${newPct} %`,
    tips:
      day <= 2
        ? 'Surveiller selles molles — ralentir si diarrhée.'
        : day >= ratios.length - 1
          ? 'Transition terminée — ration 100 % nouveau produit.'
          : 'Maintenir horaires fixes, pas de friandises extra.',
  }));

  const warnings = [];
  if ((rec.allergies || []).length) {
    warnings.push('Animal allergique — vérifier l\'absence d\'allergènes dans le nouvel aliment.');
  }
  if (rec.type === 'cat') {
    warnings.push('Chat : transition plus lente recommandée (10 jours minimum).');
  }
  if (rec.healthFlags?.some((f) => f.key === 'renal' || f.key === 'diabete')) {
    warnings.push('Pathologie métabolique — transition validée par le vétérinaire obligatoire.');
  }

  return {
    petName,
    currentFood,
    newFood,
    durationDays: schedule.length,
    dailyRationGrams: totalGrams,
    schedule,
    warnings,
    aiSummary: `Transition ${schedule.length} jours pour ${petName} : ${currentFood} → ${newFood}, ~${totalGrams} g/j.`,
  };
};

export default buildFoodTransitionPlan;
