import api from '../utils/api';

export const fetchFeederFirebaseStatus = () =>
  api.get('/feeder/firebase/status').then((r) => r.data);

export const fetchFeederFirebaseLatest = (feederId) =>
  api.get(`/feeder/${feederId}/firebase/latest`).then((r) => r.data);

export const fetchFeederFirebaseHistory = (feederId, limit = 40) =>
  api.get(`/feeder/${feederId}/firebase/history`, { params: { limit } }).then((r) => r.data);

/** Fusionne les grandeurs Firestore sur l'objet distributeur API */
export const mergeFeederWithFirebaseGrandeurs = (feeder, firebasePayload) => {
  if (!feeder || !firebasePayload?.grandeurs) return feeder;
  const g = firebasePayload.grandeurs;
  return {
    ...feeder,
    temperature: g.temperature_c ?? feeder.temperature,
    humidity: g.humidity_pct ?? feeder.humidity,
    foodGrams: g.food_grams ?? feeder.foodGrams,
    reservoirCm: g.reservoir_cm ?? feeder.reservoirCm,
    animalPresent: g.animal_present ?? feeder.animalPresent,
    isLowFood: g.low_food ?? feeder.isLowFood,
    status: g.status || feeder.status,
    firebaseRecordedAt: firebasePayload.recordedAt,
  };
};
