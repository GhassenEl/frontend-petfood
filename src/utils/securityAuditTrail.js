import { logActivity } from '../services/activityLogService';
import { getUserStorageKey } from './twoFactorPolicy';

const TRAIL_KEY = 'petfoodtn:security-audit:trail';
const MAX_TRAIL = 50;

const loadTrail = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TRAIL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveTrail = (entries) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRAIL_KEY, JSON.stringify(entries.slice(0, MAX_TRAIL)));
};

/** Empreinte déterministe (SHA-256 si dispo, sinon FNV). */
export const fingerprintPayload = async (payload) => {
  const text = JSON.stringify(payload);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `fnv-${(h >>> 0).toString(16)}`;
};

export const getProdAuditHistory = () => loadTrail();

export const verifyAuditChain = async () => {
  const trail = loadTrail();
  if (trail.length === 0) {
    return { ok: true, entries: 0, brokenAt: null, message: 'Aucun audit enregistré.' };
  }

  for (let i = trail.length - 1; i >= 0; i -= 1) {
    const entry = trail[i];
    const expectedPrev = i === trail.length - 1 ? 'genesis' : trail[i + 1].hash;
    if (entry.prevHash !== expectedPrev) {
      return {
        ok: false,
        entries: trail.length,
        brokenAt: entry.at,
        message: 'Chaîne d\'audit altérée — empreinte précédente invalide.',
      };
    }
    const recomputed = await fingerprintPayload({
      at: entry.at,
      userId: entry.userId,
      role: entry.role,
      summary: entry.summary,
      checkDigest: entry.checkDigest,
      prevHash: entry.prevHash,
    });
    if (recomputed !== entry.hash) {
      return {
        ok: false,
        entries: trail.length,
        brokenAt: entry.at,
        message: 'Chaîne d\'audit altérée — empreinte incohérente.',
      };
    }
  }

  return {
    ok: true,
    entries: trail.length,
    brokenAt: null,
    message: `${trail.length} exécution(s) vérifiée(s).`,
  };
};

export const recordProdAuditRun = async (user, summary, checks) => {
  const trail = loadTrail();
  const prevHash = trail[0]?.hash || 'genesis';
  const checkDigest = checks.map((c) => `${c.id}:${c.level}`).join('|');
  const at = new Date().toISOString();
  const userId = getUserStorageKey(user);
  const base = {
    at,
    userId,
    role: user?.role,
    summary,
    checkDigest,
    prevHash,
  };
  const hash = await fingerprintPayload(base);
  const entry = { ...base, hash, score: summary.score, failed: summary.failed };
  trail.unshift(entry);
  saveTrail(trail);

  logActivity({
    actorRole: user?.role || 'admin',
    actorId: userId,
    actorName: user?.name || user?.email || 'Administrateur',
    action: 'security_audit_run',
    target: 'platform',
    details: `Audit prod — score ${summary.score}% (${summary.failed} échec(s), ${summary.warnings} avert.)`,
    module: 'audit',
  });

  return entry;
};

export const exportProdAuditReport = (checks, summary, user) => {
  const report = {
    generatedAt: new Date().toISOString(),
    actor: {
      id: getUserStorageKey(user),
      role: user?.role,
      email: user?.email,
    },
    summary,
    checks,
    history: getProdAuditHistory().slice(0, 10),
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `petfoodtn-audit-prod-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
