/** Service remboursements — vendeur, modérateur, admin (store partagé). */

import api from '../utils/api';
import {
  DEMO_REFUNDS,
  DEMO_REFUND_POLICY,
  REFUND_STATUS_LABELS,
} from '../utils/refundDemoData';
import { logActivity } from './activityLogService';

const STORAGE_KEY = 'petfood_refunds';
const POLICY_KEY = 'petfood_refund_policy';

let memoryRefunds = null;

const uid = () => `ref-${Date.now().toString(36)}`;

const loadStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
};

const saveStore = (refunds) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(refunds));
  } catch {
    /* quota */
  }
};

const getStore = () => {
  if (!memoryRefunds) {
    memoryRefunds = loadStore() || DEMO_REFUNDS.map((r) => ({ ...r, history: [...(r.history || [])] }));
    if (!loadStore()) saveStore(memoryRefunds);
  }
  return memoryRefunds;
};

const loadPolicy = () => {
  try {
    const raw = localStorage.getItem(POLICY_KEY);
    if (raw) return { ...DEMO_REFUND_POLICY, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ...DEMO_REFUND_POLICY };
};

const savePolicy = (p) => localStorage.setItem(POLICY_KEY, JSON.stringify(p));

const withDemo = async (apiCall, fallbackFn) => {
  try {
    const data = await apiCall();
    return { data, demo: false };
  } catch {
    return { data: fallbackFn(), demo: true };
  }
};

const findRefund = (id) => {
  const store = getStore();
  const idx = store.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Demande introuvable');
  return { store, idx, refund: store[idx] };
};

const pushHistory = (refund, action, actor, actorRole, note = '') => {
  if (!refund.history) refund.history = [];
  refund.history.unshift({
    at: new Date().toISOString(),
    action,
    actor,
    actorRole,
    note,
  });
  refund.updatedAt = new Date().toISOString();
};

const persist = (store) => {
  memoryRefunds = store;
  saveStore(store);
};

// —— Lecture ——
export const fetchVendorRefunds = () =>
  withDemo(
    () => api.get('/ecosystem/vendor/refunds').then((r) => r.data),
    () => ({ refunds: getStore().filter((r) => !['admin_forced', 'cancelled'].includes(r.status) || r.vendorName) }),
  );

export const fetchModeratorRefunds = () =>
  withDemo(
    () => api.get('/ecosystem/moderator/refunds').then((r) => r.data),
    () => ({
      refunds: getStore().filter(
        (r) =>
          r.disputed
          || r.status === 'fraud_flagged'
          || r.status === 'moderator_review'
          || r.status === 'disputed'
          || r.status === 'rejected',
      ),
    }),
  );

export const fetchAdminRefunds = () =>
  withDemo(
    () => api.get('/admin/refunds').then((r) => r.data),
    () => ({ refunds: [...getStore()], policy: loadPolicy() }),
  );

export const fetchRefundPolicy = () =>
  withDemo(
    () => api.get('/admin/refunds/policy').then((r) => r.data),
    () => loadPolicy(),
  );

export const updateRefundPolicy = (patch) =>
  withDemo(
    () => api.patch('/admin/refunds/policy', patch).then((r) => r.data),
    () => {
      const next = { ...loadPolicy(), ...patch, updatedAt: new Date().toISOString() };
      savePolicy(next);
      logActivity({
        actorRole: 'admin',
        actorName: 'Administrateur',
        action: 'refund_policy_update',
        target: 'Politique remboursement',
        module: 'admin',
      });
      return next;
    },
  );

// —— Vendeur ——
export const vendorApproveRefund = (id, note = '') => {
  const { store, idx, refund } = findRefund(id);
  refund.status = 'awaiting_return';
  pushHistory(refund, 'vendor_approved', 'Vendeur', note || 'Demande acceptée — retour attendu');
  store[idx] = refund;
  persist(store);
  logActivity({ actorRole: 'vendor', actorName: 'Vendeur', action: 'refund_approve', target: refund.orderId, module: 'vendor' });
  return refund;
};

export const vendorRejectRefund = (id, note = '') => {
  const { store, idx, refund } = findRefund(id);
  refund.status = 'rejected';
  pushHistory(refund, 'vendor_rejected', 'Vendeur', note || 'Demande refusée');
  store[idx] = refund;
  persist(store);
  logActivity({ actorRole: 'vendor', actorName: 'Vendeur', action: 'refund_reject', target: refund.orderId, module: 'vendor' });
  return refund;
};

export const vendorConfirmReturnReceived = (id, note = '') => {
  const { store, idx, refund } = findRefund(id);
  refund.status = 'return_received';
  refund.returnReceived = true;
  refund.returnReceivedAt = new Date().toISOString();
  pushHistory(refund, 'return_received', 'Vendeur', note || 'Produit retourné reçu');
  store[idx] = refund;
  persist(store);
  logActivity({ actorRole: 'vendor', actorName: 'Vendeur', action: 'return_received', target: refund.orderId, module: 'vendor' });
  return refund;
};

export const vendorValidateRefund = (id, note = '') => {
  const { store, idx, refund } = findRefund(id);
  refund.status = 'refund_validated';
  pushHistory(refund, 'refund_validated', 'Vendeur', note || 'Remboursement validé');
  store[idx] = refund;
  persist(store);
  logActivity({ actorRole: 'vendor', actorName: 'Vendeur', action: 'refund_validate', target: refund.orderId, module: 'vendor' });
  return refund;
};

export const vendorMarkRefunded = (id, note = '') => {
  const { store, idx, refund } = findRefund(id);
  refund.status = 'refunded';
  pushHistory(refund, 'refunded', 'Vendeur', note || `Remboursement ${refund.amount} DT effectué`);
  store[idx] = refund;
  persist(store);
  logActivity({ actorRole: 'vendor', actorName: 'Vendeur', action: 'refund_complete', target: refund.orderId, details: `${refund.amount} DT`, module: 'vendor' });
  return refund;
};

// —— Modérateur ——
export const moderatorResolveRefund = (id, decision, note = '') => {
  const { store, idx, refund } = findRefund(id);
  if (decision === 'approve') {
    refund.status = 'moderator_resolved';
    refund.disputed = false;
    pushHistory(refund, 'moderator_approve_refund', 'Modérateur', note || 'Remboursement accordé après litige');
  } else if (decision === 'reject') {
    refund.status = 'rejected';
    refund.disputed = false;
    pushHistory(refund, 'moderator_reject_refund', 'Modérateur', note || 'Demande maintenue refusée');
  } else if (decision === 'escalate') {
    refund.status = 'moderator_review';
    pushHistory(refund, 'moderator_escalate_admin', 'Modérateur', note || 'Escalade administrateur');
  }
  store[idx] = refund;
  persist(store);
  logActivity({ actorRole: 'moderator', actorName: 'Modérateur', action: 'refund_dispute_resolve', target: refund.orderId, details: decision, module: 'moderation' });
  return refund;
};

export const moderatorFlagRefundFraud = (id, note = '') => {
  const { store, idx, refund } = findRefund(id);
  refund.status = 'fraud_flagged';
  refund.fraudScore = Math.max(refund.fraudScore || 0, 0.85);
  pushHistory(refund, 'fraud_flagged', 'Modérateur', note || 'Fraude ou abus confirmé');
  store[idx] = refund;
  persist(store);
  logActivity({ actorRole: 'moderator', actorName: 'Modérateur', action: 'refund_fraud_flag', target: refund.orderId, module: 'moderation' });
  return refund;
};

// —— Admin ——
export const adminForceRefund = (id, note = '') => {
  const { store, idx, refund } = findRefund(id);
  refund.status = 'admin_forced';
  pushHistory(refund, 'admin_forced_refund', 'Administrateur', note || 'Remboursement forcé');
  store[idx] = refund;
  persist(store);
  logActivity({ actorRole: 'admin', actorName: 'Administrateur', action: 'refund_force', target: refund.orderId, details: `${refund.amount} DT`, module: 'admin' });
  return refund;
};

export const adminCancelTransaction = (id, note = '') => {
  const { store, idx, refund } = findRefund(id);
  refund.status = 'cancelled';
  pushHistory(refund, 'admin_cancel_transaction', 'Administrateur', note || 'Transaction annulée');
  store[idx] = refund;
  persist(store);
  logActivity({ actorRole: 'admin', actorName: 'Administrateur', action: 'transaction_cancel', target: refund.orderId, module: 'admin' });
  return refund;
};

export const createClientRefundRequest = (body) =>
  withDemo(
    () => api.post('/refunds/request', body).then((r) => r.data),
    () => {
      const store = getStore();
      const entry = {
        id: uid(),
        orderId: body.orderId,
        clientName: body.clientName || 'Client',
        vendorName: body.vendorName || 'Vendeur',
        productName: body.productName || 'Produit',
        amount: body.amount || 0,
        reason: body.reason,
        reasonCategory: body.reasonCategory || 'other',
        status: 'pending',
        returnReceived: false,
        fraudScore: 0.05,
        disputed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [{
          at: new Date().toISOString(),
          action: 'request_created',
          actor: body.clientName || 'Client',
          actorRole: 'client',
          note: body.reason,
        }],
      };
      store.unshift(entry);
      persist(store);
      logActivity({ actorRole: 'client', actorName: entry.clientName, action: 'refund_request', target: entry.orderId, module: 'boutique' });
      return entry;
    },
  );

export { REFUND_STATUS_LABELS };
