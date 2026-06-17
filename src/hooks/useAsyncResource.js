import { useCallback, useEffect, useState } from 'react';

/**
 * Hook générique pour charger une ressource async avec état loading/error.
 * @param {() => Promise<any>} loader
 * @param {any[]} deps — dépendances useEffect
 */
const useAsyncResource = (loader, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await loader();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refresh, setData };
};

export default useAsyncResource;
