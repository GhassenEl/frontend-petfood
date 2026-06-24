/** Gestion des profils animaux client — API + fallback démo localStorage. */

import api from '../utils/api';
import { DEMO_NUTRITION_PETS } from '../utils/clientDemoData';
import { resolveApiCall } from '../utils/liveDataResolver';

const STORAGE_KEY = 'petfood_client_pets';

let memoryPets = null;

const uid = () => `pet-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const loadStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
};

const saveStore = (pets) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
  } catch {
    /* quota */
  }
};

const getStore = () => {
  if (!memoryPets) {
    const stored = loadStore();
    memoryPets = stored || DEMO_NUTRITION_PETS.slice(0, 2).map((p) => ({ ...p }));
    if (!stored) saveStore(memoryPets);
  }
  return memoryPets;
};

const normalizePet = (pet) => {
  const weight = pet.weight ?? pet.weightKg;
  return {
    ...pet,
    id: pet.id || pet._id || uid(),
    _id: pet._id || pet.id,
    weight: weight != null ? Number(weight) : null,
    weightKg: weight != null ? Number(weight) : null,
    isNeutered: pet.isNeutered !== false,
  };
};

const withDemo = async (apiCall, fallbackFn) => resolveApiCall(apiCall, fallbackFn);

export const fetchClientPets = () =>
  withDemo(
    () => api.get('/pets').then((r) => {
      const list = Array.isArray(r.data) ? r.data : r.data?.pets || [];
      return list.map(normalizePet);
    }),
    () => getStore().map(normalizePet),
  );

export const createClientPet = (body) =>
  withDemo(
    () => api.post('/pets', body).then((r) => normalizePet(r.data)),
    () => {
      const pet = normalizePet({ ...body, id: uid(), _id: uid() });
      const store = getStore();
      store.push(pet);
      saveStore(store);
      return pet;
    },
  );

export const updateClientPet = (id, body) =>
  withDemo(
    () => api.put(`/pets/${id}`, body).then((r) => normalizePet(r.data)),
    () => {
      const store = getStore();
      const idx = store.findIndex((p) => (p.id || p._id) === id);
      if (idx === -1) throw new Error('Animal introuvable');
      store[idx] = normalizePet({ ...store[idx], ...body, id, _id: id });
      saveStore(store);
      return store[idx];
    },
  );

export const deleteClientPet = (id) =>
  withDemo(
    () => api.delete(`/pets/${id}`).then((r) => r.data),
    () => {
      const store = getStore();
      const next = store.filter((p) => (p.id || p._id) !== id);
      if (next.length === store.length) throw new Error('Animal introuvable');
      memoryPets = next;
      saveStore(next);
      return { ok: true };
    },
  );

export const resetClientPetsDemo = () => {
  memoryPets = null;
  localStorage.removeItem(STORAGE_KEY);
};
