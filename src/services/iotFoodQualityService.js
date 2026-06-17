import api from '../utils/api';
import {
  analyzeFoodQuality,
  simulateEsp32CamReading,
  buildDemoQualityHistory,
  getStoredQualityReadings,
  storeQualityReading,
  getLatestQualityReading,
  getStoredQualitySchedules,
  storeQualitySchedules,
  DEFAULT_FOOD_QUALITY_SCHEDULES,
  getNextScheduledCheck,
  buildScheduleStatuses,
} from '../utils/foodQualityEngine';

/** Fusionne une nouvelle lecture dans l'état affiché. */
export function mergeFoodQualityReading(prev, reading) {
  if (!reading) return prev;
  const history = [reading, ...(prev?.history || []).filter(
    (r) => r.analyzedAt !== reading.analyzedAt,
  )].slice(0, 24);
  const schedules = prev?.schedules || getStoredQualitySchedules();
  return enrichFoodQualityState({
    ...prev,
    current: reading,
    history,
    schedules,
    mode: prev?.mode || 'live',
    device: prev?.device,
  });
}

export async function fetchFoodQualityState() {
  let mode = 'demo';
  let current = null;
  let history = [];
  let schedules = getStoredQualitySchedules();

  try {
    const { data } = await api.get('/client/iot/food-quality');
    if (data?.current) {
      current = data.current;
      history = data.history || [];
      schedules = data.schedules?.length ? data.schedules : schedules;
      mode = data.mode || 'live';
      return enrichFoodQualityState({ mode, current, history, device: data.device, schedules });
    }
  } catch {
    /* fallback */
  }

  const stored = getStoredQualityReadings();
  history = stored.length ? stored : buildDemoQualityHistory();
  current = getLatestQualityReading(history[0]);

  return enrichFoodQualityState({
    mode: 'demo',
    current,
    history,
    schedules,
    device: {
      id: 'demo-esp32cam-1',
      name: 'ESP32-CAM — Bac croquettes Max',
      petName: 'Max',
      model: 'ESP32-CAM + DHT11',
      status: 'online',
    },
  });
}

function enrichFoodQualityState(state) {
  const schedules = state.schedules?.length ? state.schedules : DEFAULT_FOOD_QUALITY_SCHEDULES;
  const nextCheck = getNextScheduledCheck(schedules);
  const scheduleStatuses = buildScheduleStatuses(schedules, state.history || []);
  return {
    ...state,
    schedules,
    nextCheck,
    scheduleStatuses,
  };
}

export async function saveFoodQualitySchedules(schedules) {
  try {
    const { data } = await api.put('/client/iot/food-quality/schedules', { schedules });
    return data?.schedules || schedules;
  } catch {
    return storeQualitySchedules(schedules);
  }
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
