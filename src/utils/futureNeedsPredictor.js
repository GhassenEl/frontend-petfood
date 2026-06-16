import { buildReplenishmentPlan } from './smartReplenishment';
import { buildPetNutritionRecommendation } from './petNutritionRecommender';

const daysAhead = (n) => new Date(Date.now() + n * 86400000).toISOString();

/** Prédiction des besoins futurs selon consommation et profil animal */
export const predictFutureNeeds = ({
  pet = {},
  orders = [],
  products = [],
  subscriptions = [],
  feederStats = null,
} = {}) => {
  const nutrition = buildPetNutritionRecommendation(pet);
  const dailyGrams =
    nutrition.calories?.dryFoodGramsPerDay ||
    (pet.type === 'cat' ? 55 : pet.type === 'dog' ? 280 : 80);
  const dailyKcal = nutrition.calories?.dailyKcal || (pet.type === 'cat' ? 240 : 890);

  const basePlans = buildReplenishmentPlan({ orders, products, subscriptions });

  const predictions = basePlans.map((plan) => {
    let adjustedDays = plan.estimatedDaysLeft;
    if (feederStats?.dailyAverage && plan.dailyUsageGrams) {
      adjustedDays = Math.max(
        1,
        Math.round(plan.packGrams / Math.max(feederStats.dailyAverage, plan.dailyUsageGrams)),
      );
    } else if (dailyGrams && plan.productName?.match(/croquette|nourriture/i)) {
      adjustedDays = Math.max(1, Math.round((plan.packGrams || 12000) / dailyGrams));
    }

    const reorderDate = new Date(Date.now() + Math.max(0, adjustedDays - 5) * 86400000);

    return {
      ...plan,
      estimatedDaysLeft: adjustedDays,
      reorderBy: reorderDate.toISOString(),
      petName: pet.name,
      petDailyGrams: dailyGrams,
      petDailyKcal: dailyKcal,
      aiReason: `Basé sur profil ${pet.name || 'animal'} (${dailyGrams} g/jour) et historique d'achats.`,
      urgency:
        adjustedDays <= 3 ? 'critical' : adjustedDays <= 7 ? 'soon' : adjustedDays <= 14 ? 'upcoming' : 'ok',
    };
  });

  const type = pet.type || 'dog';
  const extras = [];

  if (type === 'cat') {
    extras.push({
      id: 'pred-litter',
      category: 'litière',
      productName: 'Litière agglomérante 10 L',
      estimatedDaysLeft: 18,
      reorderBy: daysAhead(13),
      urgency: 'upcoming',
      aiReason: 'Consommation estimée chat d\'intérieur — renouvellement ~3 semaines.',
      petName: pet.name,
    });
  }

  if (type === 'dog' && dailyGrams > 200) {
    extras.push({
      id: 'pred-treats',
      category: 'friandises',
      productName: 'Friandises dentaires chien',
      estimatedDaysLeft: 25,
      reorderBy: daysAhead(20),
      urgency: 'ok',
      aiReason: 'Complément éducation / soins dentaires recommandé pour chien actif.',
      petName: pet.name,
    });
  }

  const vaccineDue = pet.birthDate
    ? {
        id: 'pred-vaccine',
        category: 'santé',
        productName: 'Rappel vaccinal annuel',
        estimatedDaysLeft: 45,
        reorderBy: daysAhead(40),
        urgency: 'upcoming',
        aiReason: 'Anticipation rappel vaccinal selon calendrier et âge.',
        petName: pet.name,
      }
    : null;

  if (vaccineDue) extras.push(vaccineDue);

  const all = [...predictions, ...extras].sort((a, b) => {
    const order = { critical: 0, soon: 1, upcoming: 2, ok: 3 };
    return (order[a.urgency] ?? 9) - (order[b.urgency] ?? 9);
  });

  const critical = all.filter((p) => p.urgency === 'critical' || p.urgency === 'soon');

  return {
    predictions: all,
    criticalCount: critical.length,
    nextReorder: all[0] || null,
    summary: all.length
      ? `${all.length} besoin(s) anticipé(s) — ${critical.length} action(s) prioritaire(s) pour ${pet.name || 'votre animal'}.`
      : 'Pas assez d\'historique — passez commande pour activer les prédictions.',
    petProfile: {
      name: pet.name,
      type,
      dailyGrams,
      dailyKcal,
      weightKg: pet.weightKg ?? pet.weight,
    },
  };
};

export default predictFutureNeeds;
