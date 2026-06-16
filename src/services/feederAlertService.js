import api from '../utils/api';
import { analyzeFeederHabits } from '../utils/feederHabitAnalyzer';

const dedupeAlerts = (list) => {
  const map = new Map();
  (list || []).forEach((a) => {
    const key = a.id || a.type || a.title;
    if (!map.has(key)) map.set(key, a);
  });
  return [...map.values()];
};

/** Alertes API + analyse locale habitudes alimentaires */
export async function fetchFeederRealtimeAlerts(feederId, context = {}) {
  const local = analyzeFeederHabits(context);

  if (!feederId || String(feederId).startsWith('demo-')) {
    return { alerts: dedupeAlerts(local.alerts), analysis: local, source: 'local' };
  }

  try {
    const { data } = await api.get(`/feeder/${feederId}/alerts`);
    const apiAlerts = Array.isArray(data) ? data : [];
    return {
      alerts: dedupeAlerts([...apiAlerts, ...local.alerts]),
      analysis: local,
      source: apiAlerts.length ? 'api+local' : 'local',
    };
  } catch {
    return { alerts: dedupeAlerts(local.alerts), analysis: local, source: 'local' };
  }
}

export default fetchFeederRealtimeAlerts;
