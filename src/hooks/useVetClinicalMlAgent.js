import { useCallback, useEffect, useState } from 'react';
import { fetchVetClinicalMlAgentPack } from '../services/mlService';

export const useVetClinicalMlAgent = () => {
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return fetchVetClinicalMlAgentPack()
      .then(setPack)
      .catch(() => setPack(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { pack, loading, reload };
};

export default useVetClinicalMlAgent;
