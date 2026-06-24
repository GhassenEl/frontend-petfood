import api from '../utils/api';
import { getDemoVendorStore } from '../utils/vendorDemoData';
import { logActivity } from './activityLogService';
import { resolveApiCall } from '../utils/liveDataResolver';

let demoStore = null;

const ensureDemoStore = () => {
  if (!demoStore) demoStore = getDemoVendorStore();
  return demoStore;
};

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}`;

const withDemo = async (apiCall, fallbackFn, logFn) => {
  const result = await resolveApiCall(apiCall, fallbackFn);
  if (logFn) logFn(result.data);
  return result;
};

const vendorLog = (action, target, details = '') => {
  logActivity({
    actorRole: 'vendor',
    actorName: 'Vendeur',
    action,
    target,
    details,
    module: 'vendor',
  });
};

// —— Produits ——
export const fetchVendorCatalog = () =>
  withDemo(
    () => api.get('/ecosystem/vendor/catalog').then((r) => r.data),
    () => {
      const s = ensureDemoStore();
      return { products: [...s.products], categories: [...s.categories] };
    },
  );

export const createVendorProduct = (body) =>
  withDemo(
    () => api.post('/ecosystem/vendor/products', body).then((r) => r.data),
    () => {
      const s = ensureDemoStore();
      const product = { id: uid('vp'), unitsSold: 0, promotionPercent: 0, ...body };
      s.products.push(product);
      return product;
    },
    (p) => vendorLog('create_product', p.name || body.name),
  );

export const updateVendorProduct = (id, body) =>
  withDemo(
    () => api.patch(`/ecosystem/vendor/products/${id}`, body).then((r) => r.data),
    () => {
      const s = ensureDemoStore();
      const idx = s.products.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error('Produit introuvable');
      s.products[idx] = { ...s.products[idx], ...body };
      return s.products[idx];
    },
    (p) => vendorLog(
      body.stock !== undefined ? 'update_stock' : 'update_product',
      p.name,
      body.stock !== undefined ? `Stock → ${body.stock}` : '',
    ),
  );

export const deleteVendorProduct = (id) =>
  withDemo(
    () => api.delete(`/ecosystem/vendor/products/${id}`).then((r) => r.data),
    () => {
      const s = ensureDemoStore();
      const p = s.products.find((x) => x.id === id);
      s.products = s.products.filter((x) => x.id !== id);
      return { ok: true, name: p?.name || id };
    },
    (r) => vendorLog('delete_product', r.name || id),
  );

export const updateVendorStock = (id, stock) => updateVendorProduct(id, { stock: Number(stock) });

// —— Catégories ——
export const createVendorCategory = (body) =>
  withDemo(
    () => api.post('/ecosystem/vendor/categories', body).then((r) => r.data),
    () => {
      const s = ensureDemoStore();
      const cat = { id: uid('cat'), icon: '📦', ...body };
      s.categories.push(cat);
      return cat;
    },
  );

export const updateVendorCategory = (id, body) =>
  withDemo(
    () => api.patch(`/ecosystem/vendor/categories/${id}`, body).then((r) => r.data),
    () => {
      const s = ensureDemoStore();
      const idx = s.categories.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error('Catégorie introuvable');
      s.categories[idx] = { ...s.categories[idx], ...body };
      return s.categories[idx];
    },
  );

export const deleteVendorCategory = (id) =>
  withDemo(
    () => api.delete(`/ecosystem/vendor/categories/${id}`).then((r) => r.data),
    () => {
      const s = ensureDemoStore();
      s.categories = s.categories.filter((c) => c.id !== id);
      return { ok: true };
    },
  );

// —— Commandes ——
export const fetchVendorOrders = () =>
  withDemo(
    () => api.get('/ecosystem/vendor/orders').then((r) => r.data),
    () => ({ orders: [...ensureDemoStore().orders] }),
  );

export const updateVendorOrderStatus = (id, status, extra = {}) =>
  withDemo(
    () => api.patch(`/ecosystem/vendor/orders/${id}`, { status, ...extra }).then((r) => r.data),
    () => {
      const s = ensureDemoStore();
      const idx = s.orders.findIndex((o) => o.id === id);
      if (idx === -1) throw new Error('Commande introuvable');
      const deliveryMap = {
        accepted: 'preparing',
        preparing: 'preparing',
        shipped: 'in_transit',
        delivered: 'delivered',
        rejected: 'cancelled',
      };
      s.orders[idx] = {
        ...s.orders[idx],
        status,
        deliveryStatus: deliveryMap[status] || s.orders[idx].deliveryStatus,
        ...extra,
      };
      if (status === 'shipped' && !s.orders[idx].trackingCode) {
        s.orders[idx].trackingCode = `TN-LIV-${Math.floor(10000 + Math.random() * 90000)}`;
      }
      return s.orders[idx];
    },
    (o) => vendorLog(
      status === 'accepted' ? 'accept_order' : `order_${status}`,
      o.id || o.orderId || id,
    ),
  );

export const fetchVendorSalesHistory = () =>
  withDemo(
    () => api.get('/ecosystem/vendor/sales-history').then((r) => r.data),
    () => ({ history: [...ensureDemoStore().salesHistory] }),
  );

// —— Retours ——
export const fetchVendorReturns = () =>
  withDemo(
    () => api.get('/ecosystem/vendor/returns').then((r) => r.data),
    () => ({ returns: [...ensureDemoStore().returns] }),
  );

export const updateVendorReturn = (id, status) =>
  withDemo(
    () => api.patch(`/ecosystem/vendor/returns/${id}`, { status }).then((r) => r.data),
    () => {
      const s = ensureDemoStore();
      const idx = s.returns.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Retour introuvable');
      s.returns[idx].status = status;
      return s.returns[idx];
    },
    (r) => vendorLog('update_return', r.orderId || id, status),
  );

// —— Communication ——
export const fetchVendorReviews = () =>
  withDemo(
    () => api.get('/ecosystem/vendor/reviews').then((r) => r.data),
    () => ({ reviews: [...ensureDemoStore().reviews] }),
  );

export const replyVendorReview = (id, vendorReply) =>
  withDemo(
    () => api.patch(`/ecosystem/vendor/reviews/${id}`, { vendorReply }).then((r) => r.data),
    () => {
      const s = ensureDemoStore();
      const idx = s.reviews.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Avis introuvable');
      s.reviews[idx].vendorReply = vendorReply;
      return s.reviews[idx];
    },
    (r) => vendorLog('reply_review', r.productName || id),
  );

export const fetchVendorClientMessages = () =>
  withDemo(
    () => api.get('/ecosystem/vendor/messages').then((r) => r.data),
    () => {
      const s = ensureDemoStore();
      return { threads: [...s.messages], conversations: s.threads };
    },
  );

export const sendVendorClientMessage = (clientId, text) =>
  withDemo(
    () => api.post('/ecosystem/vendor/messages', { clientId, text }).then((r) => r.data),
    () => {
      const s = ensureDemoStore();
      if (!s.threads[clientId]) s.threads[clientId] = [];
      const msg = { id: uid('m'), from: 'vendor', text, at: new Date().toISOString() };
      s.threads[clientId].push(msg);
      const thread = s.messages.find((m) => m.clientId === clientId);
      if (thread) {
        thread.lastMessage = text;
        thread.unread = false;
        thread.updatedAt = msg.at;
      }
      return msg;
    },
    () => vendorLog('send_message', clientId),
  );

export const fetchVendorNotifications = () =>
  withDemo(
    () => api.get('/ecosystem/vendor/notifications').then((r) => r.data),
    () => ({ notifications: [...ensureDemoStore().notifications] }),
  );

export const markVendorNotificationRead = (id) =>
  withDemo(
    () => api.patch(`/ecosystem/vendor/notifications/${id}/read`).then((r) => r.data),
    () => {
      const s = ensureDemoStore();
      const n = s.notifications.find((x) => x.id === id);
      if (n) n.read = true;
      return n;
    },
  );

/** Réinitialise le store démo (tests). */
export const resetVendorDemoStore = () => {
  demoStore = null;
};
