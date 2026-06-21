import api from '../utils/api';
import { DEMO_IOT_PACK } from '../utils/clientDemoData';
import {
  buildWearablePack,
  simulateWearableReading,
} from '../utils/wearablePetEngine';

const demoCollars = () => (DEMO_IOT_PACK.devices || []).filter((d) => d.type === 'wearable-collar');

export async function fetchWearableState() {
  try {
    const { data } = await api.get('/client/iot/wearables');
    if (data?.collars?.length) {
      return buildWearablePack(data.collars, { mode: data.mode || 'live', history: data.history });
    }
    if (data?.devices?.length) {
      return buildWearablePack(data.devices, { mode: data.mode || 'live', history: data.history });
    }
  } catch {
    /* fallback démo */
  }
  return buildWearablePack(demoCollars(), { mode: 'demo' });
}

export async function runWearableSimulation(device) {
  const collar = device || demoCollars()[0];
  if (!collar) return null;
  try {
    const { data } = await api.post(`/client/iot/wearables/${collar.id}/simulate`);
    if (data?.reading) return data.reading;
  } catch {
    /* démo */
  }
  return simulateWearableReading(collar);
}

export default { fetchWearableState, runWearableSimulation };
