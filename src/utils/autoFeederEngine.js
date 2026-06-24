/**
 * Distribution automatique intelligente — portions adaptatives et planning.
 */

export const computeSuggestedPortion = ({
  plan = {},
  stats = {},
  slots = [],
  reservoirLow = false,
} = {}) => {
  const base = Number(plan.portionGrams) || 30;
  const dailyTarget = Number(plan.dailyGrams) || Number(stats.dailyAverage) || 90;
  const todayGrams = Number(stats.todayGrams) || 0;
  const remaining = Math.max(0, dailyTarget - todayGrams);

  const upcoming = slots.filter((s) => s.status === 'upcoming' && s.enabled !== false);
  const missed = slots.filter((s) => s.status === 'missed' && s.enabled !== false);

  if (reservoirLow) {
    return { grams: Math.min(base, 20), reason: 'Réservoir bas — portion réduite pour préserver le stock.' };
  }

  if (missed.length > 0 && remaining > 0) {
    const boost = Math.min(15, Math.round(remaining / Math.max(upcoming.length + missed.length, 1) * 0.4));
    const grams = Math.min(200, base + boost);
    return {
      grams,
      reason: `${missed.length} repas manqué(s) — portion ajustée (+${boost} g) pour rattraper l'objectif.`,
      compensateMissed: true,
    };
  }

  if (remaining > 0 && upcoming.length > 0) {
    const fairShare = Math.round(remaining / upcoming.length);
    if (fairShare > base + 5) {
      const grams = Math.min(200, fairShare);
      return {
        grams,
        reason: `Objectif journalier : ${remaining} g restants répartis sur ${upcoming.length} repas.`,
      };
    }
  }

  if (todayGrams > dailyTarget * 1.1) {
    const grams = Math.max(10, base - 5);
    return { grams, reason: 'Apport déjà au-dessus de l\'objectif — portion légèrement réduite.' };
  }

  return { grams: base, reason: 'Portion standard selon le plan nutritionnel.' };
};

export const buildDefaultAutoSchedules = (plan = {}) => {
  const portion = Number(plan.portionGrams) || 30;
  const meals = Number(plan.mealsPerDay) || 3;
  const templates = [
    { time: '08:00', label: 'Matin' },
    { time: '12:30', label: 'Midi' },
    { time: '19:00', label: 'Soir' },
    { time: '16:00', label: 'Goûter' },
  ];
  return templates.slice(0, Math.min(meals, 4)).map((t, i) => ({
    id: `auto-sch-${i + 1}`,
    time: t.time,
    portionGrams: i === templates.length - 1 ? portion + 5 : portion,
    label: t.label,
    enabled: true,
  }));
};

export const getTodayAdherence = (todayGrams = 0, dailyTarget = 90) => {
  if (!dailyTarget) return { pct: 0, status: 'unknown' };
  const pct = Math.min(150, Math.round((todayGrams / dailyTarget) * 100));
  let status = 'on_track';
  if (pct < 50) status = 'low';
  else if (pct < 85) status = 'behind';
  else if (pct > 115) status = 'high';
  return { pct, status, remaining: Math.max(0, dailyTarget - todayGrams) };
};

export const formatCountdown = (minutesUntil = 0) => {
  if (minutesUntil <= 0) return 'Imminent';
  if (minutesUntil < 60) return `${minutesUntil} min`;
  const h = Math.floor(minutesUntil / 60);
  const m = minutesUntil % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
};
