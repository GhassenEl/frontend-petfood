import { fetchPlatformSecurityPack } from './securityService';
import { loadIntelligentSecurityPack } from './intelligentSecurityService';
import { getStoredToken } from '../utils/authStorage';
import { validateTokenClaims, VALID_ROLES, ROLE_LABELS } from '../utils/jwtSecurity';

export async function loadPlatformSecurityPack() {
  try {
    const pack = await fetchPlatformSecurityPack();
    const intel = await loadIntelligentSecurityPack().catch(() => null);
    return {
      ...pack,
      intelligent: intel,
      intrusionEvents: pack.intrusionEvents || pack.events || [],
      threatList: pack.threatList || pack.threats || [],
      activeSessions: pack.activeSessions || pack.sessions || [],
      roles: VALID_ROLES.map((r) => ({ id: r, label: ROLE_LABELS[r] || r })),
      stats: {
        ...(pack.stats || {}),
        fraudAlerts: pack.fraudAlerts?.length ?? intel?.fraudAlerts?.length ?? 0,
        moderationPending: intel?.moderationQueue?.length ?? 0,
      },
    };
  } catch {
    const token = getStoredToken();
    const validation = token ? validateTokenClaims(token) : null;
    const intel = await loadIntelligentSecurityPack().catch(() => null);
    return {
      securityScore: 72,
      checks: [],
      intrusionEvents: intel ? [] : [],
      threatList: [],
      activeSessions: validation?.valid
        ? [{
          id: 'sess-current',
          user: validation.decoded.email || validation.decoded.sub,
          role: validation.decoded.role,
          device: 'Session courante',
          ip: '—',
          lastActive: new Date().toISOString(),
          current: true,
        }]
        : [],
      intelligent: intel,
      fraudAlerts: intel?.fraudAlerts || [],
      stats: {
        threats: 0,
        intrusions: 0,
        fraudAlerts: intel?.fraudAlerts?.length ?? 0,
        moderationPending: intel?.moderationQueue?.length ?? 0,
        activeSessions: validation?.valid ? 1 : 0,
      },
      roles: VALID_ROLES.map((r) => ({ id: r, label: ROLE_LABELS[r] || r })),
    };
  }
}

export default loadPlatformSecurityPack;
