import { jwtDecode } from 'jwt-decode';

export const ROLE_LABELS = {
  admin: 'Administrateur',
  stock_manager: 'Gestionnaire de stock',
  vendor: 'Vendeur',
  vet: 'Vétérinaire',
  client: 'Client',
  livreur: 'Livreur',
  moderator: 'Modérateur',
  visitor: 'Visiteur',
};

export const AUTH_EVENTS = {
  LOGOUT: 'petfoodtn:auth:logout',
  TOKEN_REFRESHED: 'petfoodtn:auth:token-refreshed',
  SESSION_EXPIRING: 'petfoodtn:auth:session-expiring',
};

export const VALID_ROLES = ['admin', 'stock_manager', 'client', 'livreur', 'vet', 'vendor', 'moderator', 'visitor'];

/** Accepte rôles système ou slugs custom (a-z0-9_). */
export const isAllowedRole = (role) => {
  if (!role || typeof role !== 'string') return false;
  if (VALID_ROLES.includes(role)) return true;
  return /^[a-z][a-z0-9_]{1,47}$/.test(role);
};

const ISSUER = import.meta.env.VITE_JWT_ISSUER || '';
const AUDIENCE = import.meta.env.VITE_JWT_AUDIENCE || '';
const EXPIRY_BUFFER_MS = Number(import.meta.env.VITE_JWT_EXPIRY_BUFFER_SEC || 60) * 1000;
const REFRESH_THRESHOLD_MS = Number(import.meta.env.VITE_JWT_REFRESH_THRESHOLD_SEC || 300) * 1000;

export const decodeToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export const getTokenExpiryMs = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return null;
  return decoded.exp * 1000;
};

export const isTokenExpired = (token, bufferMs = EXPIRY_BUFFER_MS) => {
  const expiryMs = getTokenExpiryMs(token);
  if (!expiryMs) return false;
  return expiryMs - bufferMs <= Date.now();
};

export const shouldRefreshToken = (token) => {
  const expiryMs = getTokenExpiryMs(token);
  if (!expiryMs) return false;
  return expiryMs - REFRESH_THRESHOLD_MS <= Date.now() && !isTokenExpired(token);
};

const audienceMatches = (audClaim, expected) => {
  if (!expected) return true;
  if (!audClaim) return true;
  if (Array.isArray(audClaim)) return audClaim.includes(expected);
  return audClaim === expected;
};

export const validateTokenClaims = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) {
    return { valid: false, reason: 'invalid_format', decoded: null };
  }

  // Jetons démo locaux (signature factice) — refusés face à l'API réelle
  const parts = String(token).split('.');
  if (parts[2] === 'demo' || decoded.demo === true) {
    return { valid: false, reason: 'demo_token', decoded };
  }

  if (isTokenExpired(token)) {
    return { valid: false, reason: 'expired', decoded };
  }

  if (ISSUER && decoded.iss && decoded.iss !== ISSUER) {
    return { valid: false, reason: 'invalid_issuer', decoded };
  }

  if (AUDIENCE && !audienceMatches(decoded.aud, AUDIENCE)) {
    return { valid: false, reason: 'invalid_audience', decoded };
  }

  const role = decoded.role;
  if (role && !isAllowedRole(role)) {
    return { valid: false, reason: 'invalid_role', decoded };
  }

  if (!decoded.sub && !decoded.id && !decoded._id) {
    return { valid: false, reason: 'missing_subject', decoded };
  }

  return { valid: true, reason: null, decoded };
};

export const isValidToken = (token) => validateTokenClaims(token).valid;

export const userFromToken = (decoded, apiUser = null) => {
  if (!decoded && !apiUser) return null;

  const fromToken = decoded
    ? {
        id: decoded.id || decoded._id || decoded.sub,
        email: decoded.email,
        role: decoded.role || 'client',
        name: decoded.name || decoded.fullName || decoded.username,
      }
    : {};

  return apiUser ? { ...fromToken, ...apiUser, role: apiUser.role || fromToken.role } : fromToken;
};

export const emitAuthLogout = (reason = 'session_invalid') => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGOUT, { detail: { reason } }));
};

export const emitTokenRefreshed = (token) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_EVENTS.TOKEN_REFRESHED, { detail: { token } }));
};

export const emitSessionExpiring = (expiresInMs) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_EVENTS.SESSION_EXPIRING, { detail: { expiresInMs } }));
};
