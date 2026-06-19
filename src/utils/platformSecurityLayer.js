import { scanTextForThreats } from '../services/securityService';
import { moderateContent } from '../utils/autoModerationFilter';
import { validateTokenClaims } from './jwtSecurity';
import { getStoredToken } from './authStorage';

/**
 * Couche sécurité côté client — complète le backend (IDS, scan, JWT).
 */

export async function assertContentSafe(text, context = {}) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return { safe: true };

  try {
    const scan = await scanTextForThreats(trimmed, context);
    if (!scan?.safe) {
      const err = new Error(scan.threats?.[0]?.label || 'Contenu bloqué par la politique de sécurité');
      err.code = 'SECURITY_BLOCKED';
      err.threats = scan.threats;
      throw err;
    }
    return scan;
  } catch (error) {
    if (error.code === 'SECURITY_BLOCKED') throw error;
    const local = moderateContent(trimmed);
    if (local.action === 'reject' || local.action === 'hide') {
      const err = new Error(local.summary || 'Contenu refusé par la modération automatique');
      err.code = 'SECURITY_BLOCKED';
      throw err;
    }
    return { safe: true, fallback: 'local_moderation' };
  }
}

export function getClientSecurityContext() {
  const token = getStoredToken();
  const validation = token ? validateTokenClaims(token) : { valid: false };
  return {
    authenticated: validation.valid,
    role: validation.valid ? validation.decoded.role : null,
    tokenExp: validation.valid && validation.decoded.exp
      ? new Date(validation.decoded.exp * 1000).toISOString()
      : null,
  };
}

export function isSecureConnection() {
  if (typeof window === 'undefined') return true;
  return window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

export default {
  assertContentSafe,
  getClientSecurityContext,
  isSecureConnection,
};
