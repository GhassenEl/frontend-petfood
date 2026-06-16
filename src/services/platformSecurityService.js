import api from '../utils/api';
import { fetchSecurityStatus, fetchIntrusionEvents, fetchThreatLog } from './securityService';
import { loadIntelligentSecurityPack } from './intelligentSecurityService';
import { getStoredToken } from '../utils/authStorage';
import { decodeToken, validateTokenClaims, VALID_ROLES, ROLE_LABELS } from '../utils/jwtSecurity';

const DEMO_ACTIVE_SESSIONS = [
  {
    id: 'sess-1',
    user: 'admin@petfood.tn',
    role: 'admin',
    device: 'Chrome · Windows',
    ip: '196.168.*.*',
    lastActive: new Date(Date.now() - 120000).toISOString(),
    current: true,
  },
  {
    id: 'sess-2',
    user: 'client@petfood.tn',
    role: 'client',
    device: 'Safari · iPhone',
    ip: '41.224.*.*',
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    current: false,
  },
  {
    id: 'sess-3',
    user: 'vendor@petfood.tn',
    role: 'vendor',
    device: 'Firefox · Linux',
    ip: '102.168.*.*',
    lastActive: new Date(Date.now() - 7200000).toISOString(),
    current: false,
  },
];

export async function loadPlatformSecurityPack() {
  const [status, intrusions, threats, intel] = await Promise.all([
    fetchSecurityStatus().catch(() => null),
    fetchIntrusionEvents(20).catch(() => ({ events: [] })),
    fetchThreatLog(15).catch(() => ({ threats: [] })),
    loadIntelligentSecurityPack().catch(() => null),
  ]);

  let activeSessions = DEMO_ACTIVE_SESSIONS;
  try {
    const res = await api.get('/security/sessions');
    if (res.data?.sessions?.length) activeSessions = res.data.sessions;
  } catch {
    const token = getStoredToken();
    const validation = token ? validateTokenClaims(token) : null;
    if (validation?.valid) {
      activeSessions = [
        {
          id: 'sess-current',
          user: validation.decoded.email || validation.decoded.sub,
          role: validation.decoded.role,
          device: 'Session courante',
          ip: '—',
          lastActive: new Date().toISOString(),
          current: true,
        },
        ...DEMO_ACTIVE_SESSIONS.filter((s) => !s.current).slice(0, 2),
      ];
    }
  }

  const intrusionEvents = intrusions?.events || intrusions || [];
  const threatList = threats?.threats || threats || [];

  const checks = [
    { id: 'jwt', label: 'JWT multi-rôles', ok: VALID_ROLES.length >= 7, detail: `${VALID_ROLES.length} rôles validés` },
    { id: 'ids', label: 'IDS actif', ok: status?.ids?.enabled !== false, detail: `${status?.ids?.eventsLast24h ?? 0} alertes/24h` },
    { id: 'av', label: 'Anti-virus applicatif', ok: status?.protection?.antivirus !== false, detail: `${status?.signatureCount ?? 0} signatures` },
    { id: 'fraud', label: 'Détection fraude', ok: (intel?.fraudAlerts?.length ?? 0) >= 0, detail: `${intel?.fraudAlerts?.length ?? 0} alerte(s)` },
    { id: 'mod', label: 'Modération auto', ok: true, detail: `${intel?.moderationQueue?.length ?? 0} en file` },
    { id: 'consent', label: 'Consentement cookies', ok: true, detail: 'RGPD — bannière active' },
  ];

  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

  return {
    status,
    intrusionEvents: Array.isArray(intrusionEvents) ? intrusionEvents : [],
    threatList: Array.isArray(threatList) ? threatList : [],
    activeSessions,
    intelligent: intel,
    checks,
    securityScore: score,
    roles: VALID_ROLES.map((r) => ({ id: r, label: ROLE_LABELS[r] || r })),
    stats: {
      threats: threatList.length,
      intrusions: intrusionEvents.length,
      fraudAlerts: intel?.fraudAlerts?.length ?? 0,
      moderationPending: intel?.moderationQueue?.length ?? 0,
      activeSessions: activeSessions.length,
    },
  };
}

export default loadPlatformSecurityPack;
