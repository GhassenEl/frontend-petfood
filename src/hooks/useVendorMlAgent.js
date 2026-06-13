import { useCallback, useEffect, useState } from 'react';
import { fetchVendorMlAgent } from '../services/ecosystemService';

export const useVendorMlAgent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return fetchVendorMlAgent()
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
    mlPowered: Boolean(data?.mlPowered),
  };
};

export default useVendorMlAgent;
