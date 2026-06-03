import { useCallback, useEffect, useState } from 'react';
import { fetchAnalyticsHub } from '../services/analyticsHubService';

export const useAnalyticsHub = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return fetchAnalyticsHub()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, reload };
};

export default useAnalyticsHub;
