import api from '../utils/api';
import { allowDemoFallback } from '../config/liveDataPolicy';
import {
  getDemoFeederList,
  getDemoFeederBundle,
} from '../utils/clientDemoData';
import { mergeFeederWithFirebaseGrandeurs, fetchFeederFirebaseLatest } from './feederFirebaseService';

export const fetchFeederList = async () => {
  try {
    const { data } = await api.get('/feeder');
    const list = Array.isArray(data) ? data : [];
    if (list.length > 0) return { list, demo: false };
    if (!allowDemoFallback()) return { list: [], demo: false };
    return { list: getDemoFeederList(), demo: true };
  } catch {
    if (!allowDemoFallback()) return { list: [], demo: false };
    return { list: getDemoFeederList(), demo: true };
  }
};

export const fetchFeederBundle = async (feederId) => {
  if (!feederId) return null;
  if (allowDemoFallback() && (feederId === 'demo-feeder-1' || String(feederId).startsWith('demo-'))) {
    return { ...getDemoFeederBundle(feederId), demo: true };
  }

  try {
    const [detailRes, planRes, statsRes, alertsRes, historyRes, fbLatestRes] = await Promise.all([
      api.get(`/feeder/${feederId}`),
      api.get(`/feeder/${feederId}/nutrition-plan`).catch(() => ({ data: null })),
      api.get(`/feeder/${feederId}/stats?days=7`).catch(() => ({ data: null })),
      api.get(`/feeder/${feederId}/alerts`).catch(() => ({ data: [] })),
      api.get(`/feeder/${feederId}/history?limit=40`).catch(() => ({ data: [] })),
      fetchFeederFirebaseLatest(feederId).catch(() => ({ firebaseEnabled: false, grandeurs: null })),
    ]);

    const feeder = mergeFeederWithFirebaseGrandeurs(detailRes.data, fbLatestRes);
    return {
      feeder,
      plan: planRes.data,
      stats: statsRes.data,
      alerts: alertsRes.data || [],
      history: historyRes.data || [],
      demo: false,
    };
  } catch {
    if (!allowDemoFallback()) return null;
    return { ...getDemoFeederBundle(feederId), demo: true };
  }
};

export const dispenseFeeder = (feederId, grams) =>
  api.post(`/feeder/${feederId}/dispense`, { grams });

export const applyFeederSchedules = (feederId) =>
  api.post(`/feeder/${feederId}/apply-schedules`);

export const refillFeeder = (feederId, grams = 500) =>
  api.post(`/feeder/${feederId}/refill`, { grams });
