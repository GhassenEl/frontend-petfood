import { useCallback, useEffect, useState } from 'react';
import { fetchAdminMlAgentPack } from '../services/mlService';

export const useAdminMlAgent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return fetchAdminMlAgentPack()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    data,
    loading,
    reload,
    pythonPowered: Boolean(data?.pythonPowered),
    groqPowered: Boolean(data?.groqPowered),
  };
};

export default useAdminMlAgent;
