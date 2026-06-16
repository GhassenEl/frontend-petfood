const parseDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const avg = (nums) => (nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0);

/**
 * Analyse les habitudes alimentaires et détecte anomalies (santé / comportement).
 */
export const analyzeFeederHabits = ({
  feeder = null,
  stats = null,
  plan = null,
  history = [],
  schedules = [],
} = {}) => {
  const alerts = [];
  const insights = [];
  const now = new Date();
  const hour = now.getHours();

  const dailyTarget = plan?.dailyGrams || stats?.dailyAverage || 60;
  const todayGrams = stats?.todayGrams ?? 0;
  const reservoirPct = feeder?.reservoirPercent ?? (feeder?.reservoirCm != null ? Math.max(0, 100 - feeder.reservoirCm * 3) : null);

  if (feeder?.isLowFood || (reservoirPct != null && reservoirPct < 30)) {
    alerts.push({
      id: 'low-food',
      type: 'low_food',
      level: reservoirPct != null && reservoirPct < 15 ? 'critical' : 'warning',
      title: 'Niveau de nourriture faible',
      message: `Réservoir à ${reservoirPct != null ? `${Math.round(reservoirPct)} %` : 'niveau bas'} — rechargez les croquettes.`,
    });
  }

  if (feeder?.status === 'offline' || (feeder?.offlineMinutes != null && feeder.offlineMinutes > 30)) {
    alerts.push({
      id: 'offline',
      type: 'device',
      level: 'warning',
      title: 'Distributeur hors ligne',
      message: 'Connexion IoT perdue — vérifiez le Wi-Fi et l\'alimentation ESP32.',
    });
  }

  const expectedByNow = dailyTarget * Math.min(hour / 24, 0.85);
  if (hour >= 14 && todayGrams < expectedByNow * 0.45) {
    alerts.push({
      id: 'low-intake-today',
      type: 'abnormal_eating',
      level: 'warning',
      title: 'Consommation anormalement basse',
      message: `${todayGrams} g consommés aujourd'hui vs ~${Math.round(expectedByNow)} g attendus — surveillez l'appétit.`,
    });
    insights.push({
      icon: '⚠️',
      text: 'Apport inférieur à la normale aujourd\'hui — changement de comportement possible.',
    });
  }

  if (hour >= 20 && todayGrams > dailyTarget * 1.35) {
    alerts.push({
      id: 'high-intake',
      type: 'abnormal_eating',
      level: 'info',
      title: 'Consommation élevée',
      message: `${todayGrams} g aujourd'hui (objectif ${dailyTarget} g).`,
    });
  }

  const byDay = stats?.consumptionByDay || [];
  if (byDay.length >= 4) {
    const recent = byDay.slice(-3).map((d) => Number(d.grams || 0));
    const previous = byDay.slice(-6, -3).map((d) => Number(d.grams || 0));
    const recentAvg = avg(recent);
    const prevAvg = avg(previous);
    if (prevAvg > 0 && recentAvg < prevAvg * 0.75) {
      const dropPct = Math.round((1 - recentAvg / prevAvg) * 100);
      alerts.push({
        id: 'consumption-drop',
        type: 'health_anomaly',
        level: 'warning',
        title: 'Anomalie de consommation détectée',
        message: `Baisse de ${dropPct} % sur 3 jours — peut indiquer un problème de santé ou de stress.`,
      });
      insights.push({
        icon: '📉',
        text: `Consommation en baisse (${dropPct} %) — consultez un vétérinaire si cela persiste.`,
      });
    } else if (prevAvg > 0 && recentAvg > prevAvg * 1.3) {
      const risePct = Math.round((recentAvg / prevAvg - 1) * 100);
      insights.push({
        icon: '📈',
        text: `Consommation en hausse (+${risePct} %) — surveillez le poids de l'animal.`,
      });
    }
  }

  const todayDispenses = (history || []).filter((log) => {
    const d = parseDate(log.createdAt);
    return d && isSameDay(d, now) && ['dispense', 'manual_request'].includes(log.eventType);
  });
  const enabledSchedules = (schedules || []).filter((s) => s.enabled !== false);
  const missedMeals = enabledSchedules.filter((sch) => {
    const [h, m] = String(sch.time || '00:00').split(':').map(Number);
    const schedDate = new Date(now);
    schedDate.setHours(h, m, 0, 0);
    if (schedDate > now) return false;
    return !todayDispenses.some((log) => {
      const ld = parseDate(log.createdAt);
      if (!ld) return false;
      return Math.abs(ld - schedDate) < 90 * 60 * 1000;
    });
  });

  if (missedMeals.length > 0 && hour >= 10) {
    alerts.push({
      id: 'missed-meals',
      type: 'abnormal_eating',
      level: missedMeals.length >= 2 ? 'critical' : 'warning',
      title: 'Repas programmé non consommé',
      message: `${missedMeals.length} créneau(x) sans distribution détectée aujourd'hui (${missedMeals.map((s) => s.time).join(', ')}).`,
    });
  }

  const lastDispense = (history || []).find((l) => ['dispense', 'manual_request'].includes(l.eventType));
  if (lastDispense) {
    const ld = parseDate(lastDispense.createdAt);
    const hoursSince = ld ? (now - ld) / 3600000 : null;
    if (hoursSince != null && hoursSince > 14 && hour >= 16) {
      alerts.push({
        id: 'long-fasting',
        type: 'health_anomaly',
        level: 'warning',
        title: 'Longue période sans repas',
        message: `Dernière distribution il y a ${Math.round(hoursSince)} h — vérifiez l'appétit.`,
      });
    }
  }

  if (feeder?.animalPresent && !todayDispenses.length && hour >= 12) {
    alerts.push({
      id: 'presence-no-eat',
      type: 'abnormal_eating',
      level: 'info',
      title: 'Animal présent sans manger',
      message: 'Capteur IR actif mais peu de consommation enregistrée — comportement à observer.',
    });
  }

  const healthScore = Math.max(
    0,
    100
      - alerts.filter((a) => a.level === 'critical').length * 25
      - alerts.filter((a) => a.level === 'warning').length * 10
      - (feeder?.isLowFood ? 15 : 0),
  );

  if (plan?.pet?.name && todayGrams >= dailyTarget * 0.85 && todayGrams <= dailyTarget * 1.15) {
    insights.push({
      icon: '✅',
      text: `${plan.pet.name} : apport journalier dans la cible (${todayGrams}/${dailyTarget} g).`,
    });
  }

  return {
    alerts,
    insights,
    healthScore,
    abnormal: alerts.some((a) => ['abnormal_eating', 'health_anomaly'].includes(a.type)),
    todayGrams,
    dailyTarget,
    missedMealsCount: missedMeals.length,
  };
};

export default analyzeFeederHabits;
