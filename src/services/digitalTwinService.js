import api from '../utils/api';
import { getPets } from './userService';
import { getProducts } from './productService';
import { fetchPetPassport, fetchPetWeightTracking } from './ecosystemService';
import {
  DEMO_NUTRITION_PETS,
  DEMO_PET_WEIGHT_HISTORY,
  DEMO_DIGITAL_TWIN_SNAPSHOTS,
  DEMO_ORDERS,
} from '../utils/clientDemoData';
import { buildDigitalTwin } from '../utils/digitalTwinEngine';

const defaultSnapshot = {
  feeding: { adherence: 0.75, consistency: 0.7, history: [], logs: [] },
  activity: { weeklyMinutes: 80, dailyGoalMin: 30, dailyGoalMetPct: 0.6, sessions: [] },
  veterinary: { lastConsultDaysAgo: 150, vaccinesUpToDate: true, upcomingAppointment: false },
  medical: { followUpComplete: true, noOverdueVaccines: true, chronicConditions: [], vaccines: [], consultations: [] },
};

export async function loadDigitalTwinPack(options = {}) {
  const petsRes = await getPets().catch(() => []);
  const pets = (petsRes?.length ? petsRes : DEMO_NUTRITION_PETS).slice(0, 6);
  const products = (await getProducts().catch(() => [])) || [];

  let orders = DEMO_ORDERS;
  try {
    const res = await api.get('/orders');
    if (res.data?.length) orders = res.data;
  } catch {
    /* démo */
  }

  const twins = await Promise.all(
    pets.map(async (pet) => {
      const petId = String(pet.id || pet._id);
      let weightHistory = DEMO_PET_WEIGHT_HISTORY[petId] || [];
      let passport = null;
      const snapshot = DEMO_DIGITAL_TWIN_SNAPSHOTS[petId] || defaultSnapshot;

      try {
        const tracking = await fetchPetWeightTracking(petId);
        if (tracking?.series?.length) {
          weightHistory = tracking.series.map((s) => ({
            date: s.date || s.recordedAt,
            weightKg: s.weightKg ?? s.weight,
          }));
        }
      } catch {
        /* démo */
      }

      try {
        passport = await fetchPetPassport(petId);
      } catch {
        /* démo */
      }

      return buildDigitalTwin({
        pet,
        weightHistory,
        medical: snapshot.medical,
        feeding: snapshot.feeding,
        activity: snapshot.activity,
        veterinary: snapshot.veterinary,
        orders,
        products,
        passport,
      });
    }),
  );

  return { twins, products, pets, source: petsRes?.length ? 'api' : 'demo' };
}

export async function loadDigitalTwin(petId, options = {}) {
  const pack = await loadDigitalTwinPack(options);
  return pack.twins.find((t) => t.petId === String(petId)) || pack.twins[0] || null;
}

export default loadDigitalTwinPack;
