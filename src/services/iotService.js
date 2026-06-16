import api from '../utils/api';
import { DEMO_IOT_PACK } from '../utils/clientDemoData';
import { enrichIoTPack } from '../utils/iotIntelligenceEngine';

export async function fetchIoTPack() {
  try {
    const { data } = await api.get('/client/iot/pack');
    if (data?.devices?.length) {
      return enrichIoTPack({ ...data, mode: data.mode || 'live' });
    }
  } catch {
    /* fallback démo */
  }
  return enrichIoTPack({ ...DEMO_IOT_PACK, mode: 'demo' });
}

export async function toggleIoTAutomation(automationId, enabled) {
  try {
    const { data } = await api.patch(`/client/iot/automations/${automationId}`, { enabled });
    return data;
  } catch {
    return { id: automationId, enabled };
  }
}

export default fetchIoTPack;
