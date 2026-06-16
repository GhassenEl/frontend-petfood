import { computeWeightTrend } from './adaptiveNutritionEngine';

const REACTION_LABELS = {
  good: { icon: '✅', label: 'Bonne tolérance' },
  soft_stool: { icon: '⚠️', label: 'Selles molles' },
  vomiting: { icon: '🔴', label: 'Vomissements' },
  itching: { icon: '🐾', label: 'Démangeaisons' },
  refused: { icon: '❌', label: 'Refus alimentaire' },
};

/** Analyse journal alimentaire + conseils IA personnalisés. */
export const analyzeFoodJournal = ({
  entries = [],
  weightHistory = [],
  recommendation = {},
  pet = {},
} = {}) => {
  const rec = recommendation;
  const targetGrams = rec.adaptedGramsPerDay ?? rec.calories?.dryFoodGramsPerDay;
  const weightTrend = computeWeightTrend(weightHistory);

  const totalGrams = entries.reduce((s, e) => s + (e.grams || 0), 0);
  const days = new Set(entries.map((e) => e.date?.slice?.(0, 10) || e.date)).size || 1;
  const avgDailyGrams = Math.round(totalGrams / days);

  const reactions = entries.filter((e) => e.reaction && e.reaction !== 'good');
  const advice = [];

  if (targetGrams && avgDailyGrams > targetGrams * 1.15) {
    advice.push({
      id: 'overfeed',
      priority: 'high',
      title: 'Surconsommation',
      text: `Moyenne ${avgDailyGrams} g/j vs cible ${targetGrams} g — réduire friandises.`,
    });
  }
  if (targetGrams && avgDailyGrams < targetGrams * 0.85) {
    advice.push({
      id: 'underfeed',
      priority: 'high',
      title: 'Sous-consommation',
      text: `Apport moyen insuffisant — vérifier appétit ou fractionner les repas.`,
    });
  }
  if (reactions.some((e) => e.reaction === 'soft_stool' || e.reaction === 'vomiting')) {
    advice.push({
      id: 'digestive',
      priority: 'high',
      title: 'Troubles digestifs',
      text: 'Réactions digestives signalées — transition alimentaire progressive ou consultation vétérinaire.',
    });
  }
  if (reactions.some((e) => e.reaction === 'itching')) {
    advice.push({
      id: 'allergy',
      priority: 'high',
      title: 'Suspicion allergie',
      text: 'Démangeaisons post-repas — vérifier protéines et additifs du produit.',
    });
  }
  if (weightTrend.trend === 'gain') {
    advice.push({
      id: 'weight-gain',
      priority: 'medium',
      title: 'Prise de poids',
      text: `+${weightTrend.deltaKg} kg — ajuster ration ou augmenter l'activité.`,
    });
  }
  if (!advice.length) {
    advice.push({
      id: 'stable',
      priority: 'low',
      title: 'Régime stable',
      text: 'Consommation et réactions dans la norme — maintenir le programme actuel.',
    });
  }

  return {
    petName: pet?.name || rec?.name || 'Animal',
    entries: entries.slice(0, 20),
    stats: {
      entriesCount: entries.length,
      avgDailyGrams,
      targetGrams,
      adherencePct: targetGrams ? Math.round((avgDailyGrams / targetGrams) * 100) : null,
      reactionCount: reactions.length,
    },
    weightTrend,
    advice,
    reactionLabels: REACTION_LABELS,
    aiSummary: `${entries.length} repas enregistrés — ${advice[0]?.title || 'Suivi en cours'}.`,
  };
};

export default analyzeFoodJournal;
