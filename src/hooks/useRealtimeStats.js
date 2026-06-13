import { useCallback, useEffect, useState } from 'react';
import { fetchRealtimeStats, tickRealtimeStats } from '../services/realtimeStatsService';

const DEFAULT_INTERVAL = 8000;

/**
 * Polling stats temps réel + extension de la courbe live.
 * @param {string} role — admin | vendor | moderator | livreur | vet
 * @param {number} intervalMs — fréquence de rafraîchissement
 */
const useRealtimeStats = (role, intervalMs = DEFAULT_INTERVAL) => {
  const [data, setData] = useState(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!role) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data: payload, demo: isDemo } = await fetchRealtimeStats(role);
      setData(payload);
      setDemo(isDemo);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role]);

  useEffect(() => {
    load(false);
  }, [load]);

  useEffect(() => {
    if (!role) return undefined;
    const pollId = window.setInterval(() => load(true), intervalMs);
    return () => window.clearInterval(pollId);
  }, [role, intervalMs, load]);

  useEffect(() => {
    if (!role) return undefined;
    const tickId = window.setInterval(() => {
      setData((prev) => (prev ? tickRealtimeStats(role, prev) : prev));
    }, 4000);
    return () => window.clearInterval(tickId);
  }, [role]);

  return { data, demo, loading, refreshing, reload: () => load(true) };
};

export default useRealtimeStats;
