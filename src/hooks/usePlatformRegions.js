import { useCallback, useEffect, useState } from 'react';
import { fetchPlatformRegions } from '../services/platformCitiesService';

let cache = null;
let cachePromise = null;

const loadRegionsOnce = async () => {
  if (cache) return cache;
  if (!cachePromise) {
    cachePromise = fetchPlatformRegions().then((res) => {
      cache = res;
      return res;
    });
  }
  return cachePromise;
};

export const invalidatePlatformRegionsCache = () => {
  cache = null;
  cachePromise = null;
};

const usePlatformRegions = () => {
  const [regions, setRegions] = useState(cache?.regions || []);
  const [loading, setLoading] = useState(!cache);
  const [demo, setDemo] = useState(Boolean(cache?.demo));

  const reload = useCallback(async () => {
    invalidatePlatformRegionsCache();
    setLoading(true);
    const res = await loadRegionsOnce();
    setRegions(res.regions || []);
    setDemo(Boolean(res.demo));
    setLoading(false);
    return res.regions || [];
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadRegionsOnce()
      .then((res) => {
        if (cancelled) return;
        setRegions(res.regions || []);
        setDemo(Boolean(res.demo));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { regions, loading, demo, reload };
};

export default usePlatformRegions;
