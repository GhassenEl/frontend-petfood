import { useCallback, useEffect, useState } from 'react';
import {
  fetchVetMlAgentPack,
  fetchClinicMlAgentPack,
  fetchPharmacyMlAgentPack,
} from '../services/mlService';

export const useVetMlAgents = () => {
  const [vet, setVet] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return Promise.all([
      fetchVetMlAgentPack().then(setVet).catch(() => setVet(null)),
      fetchClinicMlAgentPack().then(setClinic).catch(() => setClinic(null)),
      fetchPharmacyMlAgentPack().then(setPharmacy).catch(() => setPharmacy(null)),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    vet,
    clinic,
    pharmacy,
    loading,
    reload,
    pythonPowered: Boolean(vet?.pythonPowered || clinic?.pythonPowered || pharmacy?.pythonPowered),
    groqPowered: Boolean(vet?.groqPowered || clinic?.groqPowered || pharmacy?.groqPowered),
  };
};

export default useVetMlAgents;
