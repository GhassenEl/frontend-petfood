/** API statistiques temps réel — polling par rôle. */

import api from '../utils/api';
import { getRoleRealtimeDemo, tickRoleRealtimeDemo } from '../utils/realtimeStatsDemo';
import {
  chartSeriesHasValues,
  liveSeriesHasValues,
  mergeChartSeries,
  mergeLiveSeries,
} from '../utils/chartSeriesNormalize';

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

  const dailyRaw = raw.dailySeries ?? raw.daily ?? raw.dailyVolume;
  const liveRaw = raw.liveSeries ?? raw.live ?? raw.stream;
  const breakdownRaw = raw.breakdown ?? raw.distribution;

  const liveSeries = mergeLiveSeries(liveRaw, demo.liveSeries);
  const dailySeries = mergeChartSeries(dailyRaw, demo.dailySeries);
  const validBreakdown = Array.isArray(breakdownRaw)
    && breakdownRaw.some((b) => Number(b?.value) > 0);

  return {
    kpis: raw.kpis?.length ? raw.kpis : demo.kpis,
    livePrimary: raw.livePrimary ?? demo.livePrimary,
    liveSecondary: raw.liveSecondary ?? demo.liveSecondary,
    liveSeries: liveSeriesHasValues(liveSeries) ? liveSeries : demo.liveSeries,
    dailySeries: chartSeriesHasValues(dailySeries) ? dailySeries : demo.dailySeries,
    breakdown: validBreakdown ? breakdownRaw : demo.breakdown,
    monthlySeries: raw.monthlySeries?.length ? raw.monthlySeries : demo.monthlySeries,
    updatedAt: raw.updatedAt || new Date().toISOString(),
    demo: !(liveSeriesHasValues(liveRaw) || chartSeriesHasValues(dailyRaw)),
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
