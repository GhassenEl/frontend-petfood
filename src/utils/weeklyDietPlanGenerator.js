const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const mealLabels = (count) => {
  if (count <= 1) return ['Repas'];
  if (count === 2) return ['Matin', 'Soir'];
  if (count === 3) return ['Matin', 'Midi', 'Soir'];
  return ['Matin', 'Midi', 'Après-midi', 'Soir'].slice(0, count);
};

/** Plan nutritionnel hebdomadaire adapté au profil animal */
export const generateWeeklyDietPlan = ({ pet, recommendation, startDate = new Date() } = {}) => {
  const rec = recommendation || {};
  const mealPlan = rec.mealPlan || rec.calories;
  const gramsPerDay = rec.adaptedGramsPerDay ?? mealPlan?.gramsPerDay ?? rec.calories?.dryFoodGramsPerDay ?? 0;
  const kcalPerDay = rec.adaptedKcal ?? mealPlan?.kcalPerDay ?? rec.calories?.dailyKcal ?? 0;
  const mealsPerDay = mealPlan?.mealsPerDay ?? rec.calories?.mealCount ?? 2;
  const foodLabel = mealPlan?.foodLabel || rec.calories?.foodLabel || 'croquettes';
  const petName = pet?.name || rec.name || 'Animal';

  if (!gramsPerDay || !kcalPerDay) {
    return {
      petName,
      days: [],
      summary: 'Complétez le poids pour générer un plan hebdomadaire.',
    };
  }

  const gramsPerMeal = Math.round(gramsPerDay / mealsPerDay);
  const labels = mealLabels(mealsPerDay);
  const split = mealPlan?.split || { croquettes: 90, patée: 10 };

  const start = new Date(startDate);
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);

  const days = DAY_NAMES.map((dayName, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const variation = i % 3 === 0 ? 1.02 : i % 3 === 1 ? 0.98 : 1;
    const dayGrams = Math.round(gramsPerDay * variation);
    const dayKcal = Math.round(kcalPerDay * variation);

    const meals = labels.map((label, mi) => ({
      label,
      grams: Math.round((dayGrams / mealsPerDay) * (mi === 0 ? 1.05 : 0.95)),
      kcal: Math.round(dayKcal / mealsPerDay),
      type: mi === labels.length - 1 && split.patée ? 'mixte' : 'croquettes',
    }));

    const notes = [];
    if (i === 6) notes.push('Jour de repos — ration légèrement réduite si sédentaire.');
    if (rec.goal === 'perte' && i % 2 === 0) notes.push('Friandises limitées.');
    if (rec.type === 'cat') notes.push('Pâtée le soir pour l\'hydratation.');
    if (mealPlan?.notes) notes.push(mealPlan.notes);

    return {
      dayName,
      date: date.toISOString().slice(0, 10),
      totalGrams: dayGrams,
      totalKcal: dayKcal,
      meals,
      notes: [...new Set(notes)].slice(0, 2),
      treat: i === 5 ? '1 friandise dentaire (max 10 g)' : null,
    };
  });

  return {
    petName,
    petId: pet?.id || pet?._id || rec.petId,
    weekStart: start.toISOString().slice(0, 10),
    avgKcalPerDay: kcalPerDay,
    avgGramsPerDay: gramsPerDay,
    foodLabel,
    split,
    days,
    summary: `Plan 7 jours pour ${petName} : ~${gramsPerDay} g ${foodLabel}/j, ${kcalPerDay} kcal, ${mealsPerDay} repas.`,
  };
};

export default generateWeeklyDietPlan;
