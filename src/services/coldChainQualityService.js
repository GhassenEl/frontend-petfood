import api from './api';
import { enrichSurveillancePack } from '../utils/coldChainQualityEngine';
import { DEMO_COLD_CHAIN_PACK, getVendorColdChainPack } from '../utils/coldChainDemoData';

export async function fetchColdChainSurveillance(role = 'admin') {
  try {
    const path = role === 'vendor' ? '/vendor/food-quality/surveillance' : '/admin/food-quality/surveillance';
    const { data } = await api.get(path);
    if (data?.zones?.length) {
      return enrichSurveillancePack({ ...data, mode: data.mode || 'live' });
    }
  } catch {
    /* fallback démo */
  }

  const base = role === 'vendor' ? getVendorColdChainPack() : DEMO_COLD_CHAIN_PACK;
  return enrichSurveillancePack({ ...base, mode: 'demo' });
}

export default fetchColdChainSurveillance;
