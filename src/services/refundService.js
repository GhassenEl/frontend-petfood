/** Service remboursements — API backend uniquement (Prisma). */

import api from '../utils/api';
import { REFUND_STATUS_LABELS, isNoReturnRefund } from '../utils/refundDemoData';

const apiGet = (path) => api.get(path).then((r) => ({ data: r.data, demo: false }));
const apiMutate = (method, path, body) =>
  api[method](path, body).then((r) => ({ data: r.data, demo: false }));

export const fetchVendorRefunds = () => apiGet('/ecosystem/vendor/refunds');

export const fetchModeratorRefunds = () => apiGet('/ecosystem/moderator/refunds');

export const fetchAdminRefunds = () => apiGet('/admin/refunds');

export const fetchRefundPolicy = () => apiGet('/admin/refunds/policy');

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
