import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Polling temps réel pour courbes admin (Prometheus / Grafana / API).
 */
export default function useLivePoll(fetcher, intervalMs = 5000, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const next = await fetcherRef.current();
      setData(next);
      setLastUpdatedAt(Date.now());
      setError('');
    } catch (err) {
      setError(err?.message || 'Erreur chargement');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    reload(false);
    const id = setInterval(() => reload(true), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, reload]);

  return { data, loading, error, lastUpdatedAt, reload: () => reload(false) };
}
