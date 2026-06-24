/** Gestion catégories produits — admin (localStorage démo). */

import api from '../utils/api';
import { PRODUCT_CATEGORIES } from '../constants/productCategories';
import { resolveApiCall } from '../utils/liveDataResolver';

const STORAGE_KEY = 'petfood_categories';

let memory = null;

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
};

const save = (list) => localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

const getStore = () => {
  if (!memory) {
    memory = load() || PRODUCT_CATEGORIES.map((c) => ({ ...c, id: c.value, active: true }));
    if (!load()) save(memory);
  }
  return memory;
};

const withDemo = async (apiCall, fallback) => resolveApiCall(apiCall, fallback);

export const fetchCategories = () =>
  withDemo(
    () => api.get('/admin/categories').then((r) => r.data),
    () => [...getStore()],
  );

export const createCategory = (body) =>
  withDemo(
    () => api.post('/admin/categories', body).then((r) => r.data),
    () => {
      const store = getStore();
      const cat = { id: body.value || `cat-${Date.now()}`, value: body.value, label: body.label, active: true };
      store.push(cat);
      save(store);
      return cat;
    },
  );

export const updateCategory = (id, body) =>
  withDemo(
    () => api.patch(`/admin/categories/${id}`, body).then((r) => r.data),
    () => {
      const store = getStore();
      const idx = store.findIndex((c) => (c.id || c.value) === id);
      if (idx === -1) throw new Error('Catégorie introuvable');
      store[idx] = { ...store[idx], ...body };
      save(store);
      return store[idx];
    },
  );

export const deleteCategory = (id) =>
  withDemo(
    () => api.delete(`/admin/categories/${id}`).then((r) => r.data),
    () => {
      const store = getStore().filter((c) => (c.id || c.value) !== id);
      memory = store;
      save(store);
      return { ok: true };
    },
  );
