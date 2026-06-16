import api from '../utils/api';
import {
  analyzeFoodQuality,
  simulateEsp32CamReading,
  buildDemoQualityHistory,
  getStoredQualityReadings,
  storeQualityReading,
  getLatestQualityReading,
} from '../utils/foodQualityEngine';

export async function fetchFoodQualityState() {
  let mode = 'demo';
  let current = null;
  let history = [];

  try {
    const { data } = await api.get('/client/iot/food-quality');
    if (data?.current) {
      current = data.current;
      history = data.history || [];
      mode = data.mode || 'live';
      return { mode, current, history, device: data.device };
    }
  } catch {
    /* fallback */
  }

  const stored = getStoredQualityReadings();
  history = stored.length ? stored : buildDemoQualityHistory();
  current = getLatestQualityReading(history[0]);

  return {
    mode: 'demo',
    current,
    history,
    device: {
      id: 'demo-esp32cam-1',
      name: 'ESP32-CAM — Bac croquettes Max',
      petName: 'Max',
      model: 'ESP32-CAM + DHT11',
      status: 'online',
    },
  };
}

export async function postFoodQualityReading(reading) {
  try {
    const { data } = await api.post('/client/iot/food-quality/reading', reading);
    return data?.reading || reading;
  } catch {
    return storeQualityReading(reading)[0];
  }
}

export async function runEsp32CamSimulation(scenario) {
  const reading = simulateEsp32CamReading(scenario);
  reading.deviceId = 'demo-esp32cam-1';
  return postFoodQualityReading(reading);
}

export { analyzeFoodQuality, simulateEsp32CamReading };

export default fetchFoodQualityState;
