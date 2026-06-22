import api from '../utils/api';
import { DEMO_ADMIN_ORDERS, withDemoFallback } from '../utils/adminDemoData';
import { DEMO_REVIEWS } from '../utils/clientDemoData';
import { detectFraudSignals } from '../utils/fraudDetectionEngine';
import { moderateBatch } from '../utils/autoModerationFilter';
import { detectBehaviorAnomalies } from '../utils/contentAnomalyDetector';
import { normalizeIntrusionResponse } from './securityService';
import {
  VALID_ROLES,
  ROLE_LABELS,
  validateTokenClaims,
  decodeToken,
} from '../utils/jwtSecurity';
import { getStoredToken } from '../utils/authStorage';

export async function loadIntelligentSecurityPack() {
  const [ordersRes, reviewsRes, intrusionsRes] = await Promise.all([
    api.get('/orders').catch(() => ({ data: [] })),
    api.get('/reviews').catch(() => ({ data: [] })),
    api.get('/security/intrusions').catch(() => ({ data: { events: [] } })),
  ]);

  const orders = withDemoFallback(ordersRes.data, DEMO_ADMIN_ORDERS);
  const reviews = withDemoFallback(reviewsRes.data, DEMO_REVIEWS);
  const intrusionEvents = normalizeIntrusionResponse(intrusionsRes.data);

  const fraudAlerts = detectFraudSignals({
    orders,
    events: intrusionEvents,
  });

  const behavior = detectBehaviorAnomalies(
    intrusionEvents.length
      ? intrusionEvents
      : [
          { type: 'review_burst', count: 6 },
          { type: 'refund_abuse', count: 2 },
          { amount: 920 },
        ],
  );

  const moderationQueue = moderateBatch(reviews).filter((r) => r.suspicious);

  const token = getStoredToken();
  const tokenValidation = token ? validateTokenClaims(token) : { valid: false, reason: 'no_token' };
  const decoded = token ? decodeToken(token) : null;

  return {
    fraudAlerts,
    behavior,
    moderationQueue,
    jwt: {
      hasToken: Boolean(token),
      valid: tokenValidation.valid,
      reason: tokenValidation.reason,
      role: decoded?.role || null,
      roleLabel: ROLE_LABELS[decoded?.role] || decoded?.role || '—',
      exp: decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : null,
      roles: VALID_ROLES.filter((r) =>
        ['admin', 'stock_manager', 'vendor', 'vet', 'client', 'moderator', 'livreur'].includes(r),
      ),
      roleLabels: ROLE_LABELS,
    },
    stats: {
      fraudCount: fraudAlerts.length,
      moderationPending: moderationQueue.length,
      behaviorScore: behavior.score,
    },
  };
}

export { ROLE_LABELS, VALID_ROLES };
export default loadIntelligentSecurityPack;
