import { useCallback, useEffect, useState } from 'react';
import loadIntelligencePlatformPack from '../services/intelligencePlatformService';

const useIntelligencePlatform = () => {
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      setPack(await loadIntelligencePlatformPack());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { pack, loading, error, refresh };
};

export default useIntelligencePlatform;
