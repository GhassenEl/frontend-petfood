import api from '../utils/api';
import {
  getModeratorDemoStore,
  MOD_ACTION_LABELS,
  withDemoModeratorStats,
} from '../utils/moderatorDemoData';

let demoStore = null;

const ensureStore = () => {
  if (!demoStore) demoStore = getModeratorDemoStore();
  return demoStore;
};

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}`;

const withDemo = async (apiCall, fallbackFn) => {
  try {
    const data = await apiCall();
    return { data, demo: false };
  } catch {
    return { data: fallbackFn(), demo: true };
  }
};

const logAction = (action, target, moderator = 'Modérateur') => {
  const s = ensureStore();
  s.history.unshift({
    id: uid('h'),
    action,
    target,
    moderator,
    at: new Date().toISOString(),
  });
};

// —— Dashboard & analytics ——
export const fetchModeratorDashboard = () =>
  withDemo(
    () => api.get('/ecosystem/moderator/dashboard').then((r) => r.data),
    () => {
      const s = ensureStore();
      return withDemoModeratorStats({
        pendingProducts: s.pendingProducts.filter((p) => p.status === 'pending').length,
        pendingVendors: s.vendors.filter((v) => v.applicationStatus === 'pending').length,
        openDisputes: s.disputes.filter((d) => d.status !== 'resolved').length,
        fakeReviewsFlagged: s.fakeReviews.filter((r) => r.status === 'flagged').length,
        suspendedUsers: s.users.filter((u) => u.isActive === false).length,
      });
    },
  );

export const fetchModeratorAnalytics = () =>
  withDemo(
    () => api.get('/ecosystem/moderator/analytics').then((r) => r.data),
    () => {
      const s = ensureStore();
      return {
        userStats: {
          total: s.users.length,
          active: s.users.filter((u) => u.isActive !== false).length,
          suspended: s.users.filter((u) => u.isActive === false).length,
          byRole: s.users.reduce((acc, u) => {
            acc[u.role] = (acc[u.role] || 0) + 1;
            return acc;
          }, {}),
        },
        vendorActivity: [...s.vendorActivity],
        reportedProducts: [...s.reportedProducts],
        history: [...s.history],
      };
    },
  );

// —— Utilisateurs ——
export const fetchModeratorUsers = () =>
  withDemo(
    () => api.get('/ecosystem/moderator/users').then((r) => r.data),
    () => ({ users: [...ensureStore().users] }),
  );

export const suspendModeratorUser = (id) =>
  withDemo(
    () => api.patch(`/ecosystem/moderator/users/${id}/suspend`).then((r) => r.data),
    () => {
      const s = ensureStore();
      const u = s.users.find((x) => x.id === id || x._id === id);
      if (!u) throw new Error('Utilisateur introuvable');
      u.isActive = false;
      u.suspendedAt = new Date().toISOString();
      logAction('suspend_user', u.name);
      return u;
    },
  );

export const reactivateModeratorUser = (id) =>
  withDemo(
    () => api.patch(`/ecosystem/moderator/users/${id}/reactivate`).then((r) => r.data),
    () => {
      const s = ensureStore();
      const u = s.users.find((x) => x.id === id || x._id === id);
      if (!u) throw new Error('Utilisateur introuvable');
      u.isActive = true;
      u.suspendedAt = null;
      logAction('reactivate_user', u.name);
      return u;
    },
  );

export const flagAbusiveUser = (id, reason = '') =>
  withDemo(
    () => api.post(`/ecosystem/moderator/users/${id}/flag`, { reason }).then((r) => r.data),
    () => {
      const s = ensureStore();
      const u = s.users.find((x) => x.id === id || x._id === id);
      if (!u) throw new Error('Utilisateur introuvable');
      u.abusiveReports = (u.abusiveReports || 0) + 1;
      u.lastFlagReason = reason;
      logAction('flag_abusive', u.name);
      return u;
    },
  );

// —— Vendeurs ——
export const fetchModeratorVendors = () =>
  withDemo(
    () => api.get('/ecosystem/moderator/vendors').then((r) => r.data),
    () => ({ vendors: [...ensureStore().vendors] }),
  );

export const approveModeratorVendor = (id) =>
  withDemo(
    () => api.patch(`/ecosystem/moderator/vendors/${id}/approve`).then((r) => r.data),
    () => {
      const s = ensureStore();
      const v = s.vendors.find((x) => x.id === id);
      if (!v) throw new Error('Vendeur introuvable');
      v.applicationStatus = 'approved';
      v.status = 'active';
      logAction('approve_vendor', v.shopName);
      return v;
    },
  );

export const verifyModeratorVendor = (id) =>
  withDemo(
    () => api.patch(`/ecosystem/moderator/vendors/${id}/verify`).then((r) => r.data),
    () => {
      const s = ensureStore();
      const v = s.vendors.find((x) => x.id === id);
      if (!v) throw new Error('Vendeur introuvable');
      v.commercialInfo = { ...v.commercialInfo, verified: true };
      logAction('verify_vendor', v.shopName);
      return v;
    },
  );

export const suspendModeratorVendor = (id) =>
  withDemo(
    () => api.patch(`/ecosystem/moderator/vendors/${id}/suspend`).then((r) => r.data),
    () => {
      const s = ensureStore();
      const v = s.vendors.find((x) => x.id === id);
      if (!v) throw new Error('Vendeur introuvable');
      v.applicationStatus = 'suspended';
      v.status = 'suspended';
      logAction('suspend_vendor', v.shopName);
      return v;
    },
  );

// —— Contenu ——
export const fetchModeratorPendingProducts = () =>
  withDemo(
    () => api.get('/ecosystem/moderator/products/pending').then((r) => r.data),
    () => ({ products: [...ensureStore().pendingProducts] }),
  );

export const approveModeratorProduct = (id) =>
  withDemo(
    () => api.patch(`/ecosystem/moderator/products/${id}/approve`).then((r) => r.data),
    () => {
      const s = ensureStore();
      const p = s.pendingProducts.find((x) => x.id === id);
      if (!p) throw new Error('Produit introuvable');
      p.status = 'approved';
      logAction('approve_product', p.name);
      return p;
    },
  );

export const rejectModeratorProduct = (id) =>
  withDemo(
    () => api.patch(`/ecosystem/moderator/products/${id}/reject`).then((r) => r.data),
    () => {
      const s = ensureStore();
      const p = s.pendingProducts.find((x) => x.id === id);
      if (!p) throw new Error('Produit introuvable');
      p.status = 'rejected';
      logAction('reject_product', p.name);
      return p;
    },
  );

export const fetchModeratorInappropriate = () =>
  withDemo(
    () => api.get('/ecosystem/moderator/content/flagged').then((r) => r.data),
    () => ({ items: [...ensureStore().inappropriate] }),
  );

export const deleteModeratorContent = (id) =>
  withDemo(
    () => api.delete(`/ecosystem/moderator/content/${id}`).then((r) => r.data),
    () => {
      const s = ensureStore();
      const item = s.inappropriate.find((x) => x.id === id);
      if (!item) throw new Error('Contenu introuvable');
      item.status = 'deleted';
      logAction('delete_content', item.target);
      return item;
    },
  );

export const approveModeratorImage = (productId) =>
  withDemo(
    () => api.patch(`/ecosystem/moderator/images/${productId}/approve`).then((r) => r.data),
    () => {
      const s = ensureStore();
      const p = s.pendingProducts.find((x) => x.id === productId);
      if (p) p.imageFlag = null;
      logAction('approve_image', p?.name || productId);
      return { ok: true };
    },
  );

// —— Signalements ——
export const fetchModeratorDisputes = () =>
  withDemo(
    () => api.get('/ecosystem/moderator/disputes').then((r) => r.data),
    () => ({ disputes: [...ensureStore().disputes] }),
  );

export const resolveModeratorDispute = (id, resolution = '') =>
  withDemo(
    () => api.patch(`/ecosystem/moderator/disputes/${id}/resolve`, { resolution }).then((r) => r.data),
    () => {
      const s = ensureStore();
      const d = s.disputes.find((x) => x.id === id);
      if (!d) throw new Error('Litige introuvable');
      d.status = 'resolved';
      d.resolution = resolution;
      logAction('resolve_dispute', d.orderId);
      return d;
    },
  );

export const fetchModeratorFakeReviews = () =>
  withDemo(
    () => api.get('/ecosystem/moderator/reviews/fake').then((r) => r.data),
    () => ({ reviews: [...ensureStore().fakeReviews] }),
  );

export const rejectFakeReview = (id) =>
  withDemo(
    () => api.delete(`/ecosystem/moderator/reviews/fake/${id}`).then((r) => r.data),
    () => {
      const s = ensureStore();
      const r = s.fakeReviews.find((x) => x.id === id);
      if (!r) throw new Error('Avis introuvable');
      r.status = 'rejected';
      logAction('reject_review', r.productName);
      return r;
    },
  );

export const clearFakeReview = (id) =>
  withDemo(
    () => api.patch(`/ecosystem/moderator/reviews/fake/${id}/clear`).then((r) => r.data),
    () => {
      const s = ensureStore();
      const r = s.fakeReviews.find((x) => x.id === id);
      if (!r) throw new Error('Avis introuvable');
      r.status = 'cleared';
      logAction('clear_fake_review', r.productName);
      return r;
    },
  );

export { MOD_ACTION_LABELS };
