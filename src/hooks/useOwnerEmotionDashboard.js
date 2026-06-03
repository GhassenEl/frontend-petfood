import { useCallback, useEffect, useState } from 'react';
import { fetchOwnerEmotionDashboard } from '../services/ownerEmotionService';

export const useOwnerEmotionDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return fetchOwnerEmotionDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, reload };
};

export default useOwnerEmotionDashboard;
