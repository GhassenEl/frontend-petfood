import api from '../utils/api';
import { getPets } from './userService';
import { getProducts } from './productService';
import { vetChat24 } from './ecosystemService';
import { sendVetHealthAssist } from './chatService';
import {
  DEMO_NUTRITION_PETS,
  DEMO_NEARBY_VETS,
  DEMO_ORDERS,
  DEMO_SUBSCRIPTIONS,
  DEMO_FEEDER_STATS,
} from '../utils/clientDemoData';
import { getLocalVetAssistantReply, VET_QUICK_QUESTIONS } from '../utils/vetAssistantEngine';
import { getMarketplaceRecommendation, VET_SPECIALTY_LABELS } from '../utils/intelligentVetMarketplace';
import { predictFutureNeeds } from '../utils/futureNeedsPredictor';

const DEFAULT_CENTER = { lat: 36.8065, lng: 10.1815 };

const getPosition = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_CENTER);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(DEFAULT_CENTER),
      { timeout: 8000 },
    );
  });

export async function askVetAssistant({ message, pet, history = [] }) {
  try {
    const data = await vetChat24({
      message,
      pet: pet ? { name: pet.name, type: pet.type, id: pet.id || pet._id } : null,
      history: history.slice(-6),
    });
    if (data?.message || data?.content) {
      return {
        message: data.message || data.content,
        source: 'api-vet-chat',
        shouldShowVetCTA: !!data.shouldShowVetCTA,
        quickReplies: data.quickReplies || [],
      };
    }
  } catch {
    /* fallback */
  }

  try {
    const data = await sendVetHealthAssist({
      message,
      mode: 'diagnostic',
      pet,
    });
    if (data?.message || data?.content) {
      return {
        message: data.message || data.content,
        source: 'api-chat',
        shouldShowVetCTA: !!data.shouldShowVetCTA,
        quickReplies: data.quickReplies || [],
      };
    }
  } catch {
    /* local */
  }

  return getLocalVetAssistantReply(message, pet);
}

export async function loadVetIntelligencePack(options = {}) {
  const position = await getPosition();
  let profileRegion = '';
  try {
    const res = await api.get('/users/profile');
    profileRegion = res.data?.region || '';
  } catch {
    /* démo */
  }

  const petsRes = await getPets().catch(() => []);
  const pets = (petsRes?.length ? petsRes : DEMO_NUTRITION_PETS).slice(0, 6);
  const products = (await getProducts().catch(() => [])) || [];

  let vets = [];
  try {
    const res = await api.get('/veterinary/nearby', {
      params: { lat: position.lat, lng: position.lng, radius: 80 },
    });
    vets = res.data?.vets || res.data || [];
  } catch {
    vets = [];
  }
  if (!vets.length) vets = DEMO_NEARBY_VETS;

  let orders = DEMO_ORDERS;
  try {
    const res = await api.get('/orders');
    if (res.data?.length) orders = res.data;
  } catch {
    /* démo */
  }

  const subscriptions = DEMO_SUBSCRIPTIONS;

  const marketplace = getMarketplaceRecommendation(vets, {
    lat: position.lat,
    lng: position.lng,
    region: profileRegion,
    specialty: options.specialty || null,
  });

  const futureByPet = pets.map((pet) =>
    predictFutureNeeds({
      pet,
      orders,
      products,
      subscriptions,
      feederStats: pet.name === 'Max' ? DEMO_FEEDER_STATS : null,
    }),
  );

  return {
    pets,
    position,
    profileRegion,
    allVets: vets,
    marketplace: getMarketplaceRecommendation(vets, {
      lat: position.lat,
      lng: position.lng,
      region: profileRegion,
    }),
    specialties: Object.entries(VET_SPECIALTY_LABELS).map(([id, label]) => ({ id, label })),
    quickQuestions: VET_QUICK_QUESTIONS,
    futureByPet,
  };
}

export { VET_QUICK_QUESTIONS, VET_SPECIALTY_LABELS };
export default loadVetIntelligencePack;
