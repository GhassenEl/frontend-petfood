/** Service remboursements — API backend + fallback démo. */

import api from '../utils/api';
import { DEMO_REFUNDS, REFUND_STATUS_LABELS, isNoReturnRefund } from '../utils/refundDemoData';
import { allowDemoFallback } from '../config/liveDataPolicy';

const PRODUCT_IMAGES = {
  'Fontaine eau chat 2 L': '/images/iot/bowl-kibble.jpg',
  'Jouet corde résistant': '/images/placeholders/product-toy.svg',
  'Croquettes premium chien 15 kg': '/images/iot/bowl-kibble.jpg',
  'Pâtée chat saumon x6': '/images/placeholders/product-cat.svg',
  'Litière agglomérante 10 L': '/images/iot/bowl-kibble.jpg',
  'Croquettes chat 3 kg': '/images/placeholders/product-cat.svg',
  'Croquettes chiot 8 kg': '/images/iot/bowl-kibble.jpg',
};

const enrichRefunds = (list) =>
  (list || []).map((r) => ({
    ...r,
    productImageUrl: r.productImageUrl || PRODUCT_IMAGES[r.productName] || '/images/placeholders/product-default.svg',
  }));

const withRefundDemo = async (apiCall) => {
  try {
    const { data } = await apiCall();
    const refunds = enrichRefunds(data?.refunds);
    if (refunds.length > 0) return { data: { ...data, refunds }, demo: false };
    if (allowDemoFallback()) {
      return { data: { refunds: enrichRefunds(DEMO_REFUNDS) }, demo: true };
    }
    return { data: { refunds: [] }, demo: false };
  } catch {
    return {
      data: { refunds: allowDemoFallback() ? enrichRefunds(DEMO_REFUNDS) : [] },
      demo: allowDemoFallback(),
    };
  }
};

const apiMutate = (method, path, body) =>
  api[method](path, body).then((r) => ({ data: r.data, demo: false }));

export const fetchVendorRefunds = () => withRefundDemo(() => api.get('/ecosystem/vendor/refunds'));

export const fetchModeratorRefunds = () => withRefundDemo(() => api.get('/ecosystem/moderator/refunds'));

export const fetchAdminRefunds = () => withRefundDemo(() => api.get('/admin/refunds'));

export const fetchRefundPolicy = () =>
  api.get('/admin/refunds/policy').then((r) => ({ data: r.data, demo: false }));

export const updateRefundPolicy = (patch) =>
  api.patch('/admin/refunds/policy', patch).then((r) => ({ data: r.data, demo: false }));

export const vendorApproveRefund = (id, note = '') =>
  apiMutate('post', `/ecosystem/vendor/refunds/${id}/approve`, { note });

export const vendorRejectRefund = (id, note = '') =>
  apiMutate('post', `/ecosystem/vendor/refunds/${id}/reject`, { note });

export const vendorConfirmReturnReceived = (id, note = '') =>
  apiMutate('post', `/ecosystem/vendor/refunds/${id}/confirm-return`, { note });

export const vendorValidateRefund = (id, note = '') =>
  apiMutate('post', `/ecosystem/vendor/refunds/${id}/validate`, { note });

export const vendorMarkRefunded = (id, note = '') =>
  apiMutate('post', `/ecosystem/vendor/refunds/${id}/refund`, { note });

export const moderatorResolveRefund = (id, decision, note = '') =>
  apiMutate('post', `/ecosystem/moderator/refunds/${id}/resolve`, { decision, note });

export const moderatorFlagRefundFraud = (id, note = '') =>
  apiMutate('post', `/ecosystem/moderator/refunds/${id}/fraud`, { note });

export const adminForceRefund = (id, note = '') =>
  apiMutate('post', `/admin/refunds/${id}/force`, { note });

export const adminCancelTransaction = (id, note = '') =>
  apiMutate('post', `/admin/refunds/${id}/cancel`, { note });

export const createClientRefundRequest = (body) =>
  api.post('/refunds/request', body).then((r) => ({ data: r.data, demo: false }));

export { REFUND_STATUS_LABELS, isNoReturnRefund };
