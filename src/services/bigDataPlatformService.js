import api from '../utils/api';
import buildBigDataMetrics from '../utils/bigDataEngine';

export const fetchBigDataPlatform = async () => {
  try {
    const { data } = await api.get('/platform/big-data/metrics');
    return { ...data, mode: data.mode || 'live' };
  } catch {
    return buildBigDataMetrics();
  }
};

export default fetchBigDataPlatform;
