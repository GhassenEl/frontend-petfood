export const ALERT_TYPES = {
  vaccination: { id: 'vaccination', label: 'Vaccination', icon: '💉', color: '#059669' },
  promotion: { id: 'promotion', label: 'Promotion', icon: '🏷️', color: '#e67e22' },
  event: { id: 'event', label: 'Événement', icon: '🎪', color: '#7c3aed' },
};

const urgencyOrder = { high: 0, medium: 1, low: 2 };

/** Filtre et trie les alertes locales par région et type */
export const filterLocalAlerts = (alerts = [], { region, types = [], maxDistanceKm } = {}) => {
  let list = [...alerts];

  if (region) {
    list = list.filter(
      (a) =>
        !a.region ||
        a.region.toLowerCase() === region.toLowerCase() ||
        a.region === 'Toute la Tunisie'
    );
  }

  if (types.length) {
    list = list.filter((a) => types.includes(a.type));
  }

  if (maxDistanceKm != null) {
    list = list.filter((a) => a.distanceKm == null || a.distanceKm <= maxDistanceKm);
  }

  return list.sort((a, b) => {
    const u = (urgencyOrder[a.urgency] ?? 9) - (urgencyOrder[b.urgency] ?? 9);
    if (u !== 0) return u;
    return new Date(a.date || 0) - new Date(b.date || 0);
  });
};

export const summarizeLocalAlerts = (alerts = []) => {
  const byType = {};
  Object.keys(ALERT_TYPES).forEach((t) => {
    byType[t] = alerts.filter((a) => a.type === t).length;
  });
  return {
    total: alerts.length,
    byType,
    urgent: alerts.filter((a) => a.urgency === 'high').length,
    summary:
      alerts.length === 0
        ? 'Aucune alerte locale pour votre zone.'
        : `${alerts.length} alerte(s) — ${byType.vaccination || 0} vaccination, ${byType.promotion || 0} promo, ${byType.event || 0} événement.`,
  };
};

export default filterLocalAlerts;
