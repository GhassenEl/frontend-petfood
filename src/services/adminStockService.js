import api from '../utils/api';
import {
  computeStockStats,
  getDemoAdminStockStore,
  mergeAdminStock,
  normalizeStockMovements,
  normalizeStockOverview,
} from '../utils/adminDemoData';

let demoStore = null;

const ensureDemoStore = () => {
  if (!demoStore) demoStore = getDemoAdminStockStore();
  return demoStore;
};

const findStockItem = (store, productId) =>
  store.items.find((p) => String(p.id) === String(productId));

const pushMovement = (store, item, qty, reason, user = 'Admin (démo)') => {
  const movement = {
    id: `mv-${Date.now().toString(36)}`,
    productName: item.name,
    type: qty > 0 ? 'entrée' : qty < 0 ? 'sortie' : 'ajustement',
    qty,
    reason: reason || 'Ajustement manuel',
    date: new Date().toISOString(),
    user,
  };
  store.movements.unshift(movement);
  return movement;
};

const buildOverview = (items, stats, demo) => ({
  items,
  stats: stats || computeStockStats(items),
  demo,
});

const fetchLiveOverview = async () => {
  const endpoints = [
  () => api.get('/admin/stock/overview').then((r) => r.data),
  () => api.get('/admin/stock').then((r) => r.data),
  () => api.get('/products').then((r) => r.data),
  ];

  for (const load of endpoints) {
    try {
      const raw = await load();
      const { items: rawItems, stats } = normalizeStockOverview(raw);
      if (rawItems.length > 0) {
        const items = mergeAdminStock(rawItems);
        return buildOverview(items, stats, false);
      }
    } catch {
      // try next endpoint
    }
  }
  return null;
};

export const fetchAdminStockOverview = async () => {
  const live = await fetchLiveOverview();
  if (live) return live;

  const store = ensureDemoStore();
  return buildOverview([...store.items], computeStockStats(store.items), true);
};

export const fetchAdminStockMovements = async (limit = 50) => {
  try {
    const raw = await api.get('/admin/stock/movements', { params: { limit } }).then((r) => r.data);
    const list = normalizeStockMovements(raw);
    if (list) return { data: list, demo: false };
  } catch {
    // fallback below
  }

  const store = ensureDemoStore();
  return { data: store.movements.slice(0, limit), demo: true };
};

export const adjustAdminStock = async (productId, body) => {
  const pid = String(productId);
  const adjustment = Number(body.adjustment) || 0;
  const reason = body.reason || 'Ajustement manuel';

  const stockEndpoints = [
    () => api.patch(`/admin/stock/products/${pid}/adjust`, { adjustment, reason }).then((r) => r.data),
    () => api.patch(`/products/${pid}/stock/adjust`, { adjustment, reason }).then((r) => r.data),
  ];

  for (const call of stockEndpoints) {
    try {
      const data = await call();
      return { data, demo: false };
    } catch {
      // try next endpoint
    }
  }

  const store = ensureDemoStore();
  const item = findStockItem(store, pid);
  if (!item) throw new Error('Produit introuvable');
  item.stock = Math.max(0, (item.stock ?? 0) + adjustment);
  const movement = pushMovement(store, item, adjustment, reason);
  return { data: { item, movement }, demo: true };
};

export const updateAdminStockThresholds = async (productId, body) => {
  try {
    const data = await api
      .patch(`/admin/stock/products/${productId}/thresholds`, body)
      .then((r) => r.data);
    return { data, demo: false };
  } catch {
    const store = ensureDemoStore();
    const item = findStockItem(store, productId);
    if (!item) throw new Error('Produit introuvable');
    if (body.minStock !== undefined) item.minStock = Number(body.minStock);
    if (body.maxStock !== undefined) item.maxStock = Number(body.maxStock);
    if (body.reorderQty !== undefined) item.reorderQty = Number(body.reorderQty);
    if (body.location !== undefined) item.location = body.location;
    if (body.sku !== undefined) item.sku = body.sku;
    return { data: { item }, demo: true };
  }
};

export const bulkReorderAdminStock = async (productIds = []) => {
  try {
    const data = await api.post('/admin/stock/reorder', { productIds }).then((r) => r.data);
    return { data, demo: false };
  } catch {
    const store = ensureDemoStore();
    const ids = productIds.map(String);
    let count = 0;
    ids.forEach((pid) => {
      const item = findStockItem(store, pid);
      if (!item) return;
      const qty = item.reorderQty ?? 20;
      item.stock = (item.stock ?? 0) + qty;
      pushMovement(store, item, qty, 'Réapprovisionnement automatique');
      count += 1;
    });
    return {
      data: {
        summary: `${count} produit(s) réapprovisionné(s) (mode démo)`,
        reordered: count,
      },
      demo: true,
    };
  }
};
