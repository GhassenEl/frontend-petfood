import { useCallback, useEffect, useState } from 'react';
import { fetchClientMlAgentPack } from '../services/mlService';

export const useClientMlAgent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return fetchClientMlAgentPack()
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

export default useClientMlAgent;
