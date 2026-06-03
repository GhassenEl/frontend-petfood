import { useCallback, useEffect, useState } from 'react';
import { fetchIncidentAgentPack } from '../services/incidentMlService';

export const useAdminIncidentsMl = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return fetchIncidentAgentPack()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, reload };
};

export default useAdminIncidentsMl;
