import { ROLE_SECURITY_HUB_ROUTES, getPasswordChangeRoute } from '../config/roleSecurityConfig';

export const TWO_FA_STORAGE_KEY = 'petfoodtn:2fa:accounts';
export const TWO_FA_CHANGED_EVENT = 'petfoodtn:2fa:changed';

/** Rôles pour lesquels la 2FA est obligatoire avant accès à l'espace métier. */
export const MANDATORY_2FA_ROLES = ['admin', 'stock_manager', 'vet', 'livreur', 'moderator'];

const readStore = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(TWO_FA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeStore = (store) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TWO_FA_STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(TWO_FA_CHANGED_EVENT));
};

export const getUserStorageKey = (user) => {
  if (!user) return null;
  return String(user.id ?? user._id ?? user.email ?? user.username ?? '');
};

export const is2FARequiredForRole = (role) => MANDATORY_2FA_ROLES.includes(role);

export const get2FARecord = (userId) => {
  if (!userId) return null;
  return readStore()[userId] || null;
};

export const is2FAEnabled = (userId) => Boolean(get2FARecord(userId)?.enabled);

export const set2FAEnabled = (userId, enabled, meta = {}) => {
  if (!userId) return;
  const store = readStore();
  if (enabled) {
    store[userId] = {
      enabled: true,
      channel: meta.channel || 'totp',
      enabledAt: new Date().toISOString(),
    };
  } else {
    delete store[userId];
  }
  writeStore(store);
};

export const getSecurityHubRoute = (role) =>
  ROLE_SECURITY_HUB_ROUTES[role] || ROLE_SECURITY_HUB_ROUTES.client;

export const needs2FASetup = (user) => {
  if (!user?.role) return false;
  if (!is2FARequiredForRole(user.role)) return false;
  const key = getUserStorageKey(user);
  return !is2FAEnabled(key);
};

export const canAccessWithout2FA = (location, role) => {
  if (!location) return false;
  const { pathname, search } = location;
  if (pathname === '/login' || pathname.startsWith('/register')) return true;

  const hub = getSecurityHubRoute(role);
  if (pathname === hub) return true;

  const pwd = getPasswordChangeRoute(role);
  if (pwd.includes('?')) {
    const [pwdPath, query] = pwd.split('?');
    if (pathname === pwdPath && search.includes(query)) return true;
  } else if (pathname === pwd) {
    return true;
  }

  return false;
};
