import { useCallback, useEffect, useState } from 'react';
import { fetchLivreurOrdersRisk } from '../services/mlService';

export const useLivreurMlRisk = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return fetchLivreurOrdersRisk()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const getRisk = (orderId) => {
    const id = orderId?.id || orderId?._id || orderId;
    return data?.risks?.[id] || null;
  };

  const getPriority = (orderId) => {
    const id = orderId?.id || orderId?._id || orderId;
    return data?.poolPriority?.find((p) => p.orderId === id) || null;
  };

  return {
    data,
    loading,
    reload,
    getRisk,
    getPriority,
    pythonPowered: Boolean(data?.pythonPowered),
    poolPriority: data?.poolPriority || [],
  };
};

export default useLivreurMlRisk;
