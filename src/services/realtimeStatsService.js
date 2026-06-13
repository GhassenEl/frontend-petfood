/** API statistiques temps réel — polling par rôle. */

import api from '../utils/api';
import { getRoleRealtimeDemo, tickRoleRealtimeDemo } from '../utils/realtimeStatsDemo';

const API_PATHS = {
  admin: '/orders/stats/realtime',
  vendor: '/ecosystem/vendor/stats/realtime',
  moderator: '/ecosystem/moderator/stats/realtime',
  livreur: '/livreur/stats/realtime',
  vet: '/vet/stats/realtime',
};

const normalize = (role, raw) => {
  const demo = getRoleRealtimeDemo(role);
  if (!raw || typeof raw !== 'object') return demo;
  return {
    kpis: raw.kpis || demo.kpis,
    livePrimary: raw.livePrimary ?? demo.livePrimary,
    liveSecondary: raw.liveSecondary ?? demo.liveSecondary,
    liveSeries: raw.liveSeries?.length ? raw.liveSeries : demo.liveSeries,
    dailySeries: raw.dailySeries?.length ? raw.dailySeries : demo.dailySeries,
    breakdown: raw.breakdown?.length ? raw.breakdown : demo.breakdown,
    monthlySeries: raw.monthlySeries || demo.monthlySeries,
    updatedAt: raw.updatedAt || new Date().toISOString(),
    demo: false,
  };
};

export const fetchRealtimeStats = async (role) => {
  const path = API_PATHS[role];
  if (!path) {
    const data = getRoleRealtimeDemo(role);
    return { data, demo: true };
  }
  try {
    const { data } = await api.get(path);
    return { data: normalize(role, data), demo: false };
  } catch {
    return { data: getRoleRealtimeDemo(role), demo: true };
  }
};

/** Tick local (mode démo ou complément live entre deux polls API). */
export const tickRealtimeStats = (role, prev) => tickRoleRealtimeDemo(role, prev);
