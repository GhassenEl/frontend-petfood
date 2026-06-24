import { is2FAEnabled, getUserStorageKey } from './twoFactorPolicy';

/** Seuls ces rôles peuvent consulter l'audit production et les journaux sensibles. */
export const AUDIT_VIEWER_ROLES = ['admin'];

/** Routes protégées — admin + 2FA obligatoire. */
export const AUDIT_PROTECTED_PATHS = [
  '/admin/activity-logs',
  '/admin/security-framework',
  '/admin/security-audit',
];

export const isAuditProtectedPath = (pathname) =>
  AUDIT_PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export const canAccessAuditFeatures = (user) => {
  if (!user?.role || !AUDIT_VIEWER_ROLES.includes(user.role)) return false;
  return is2FAEnabled(getUserStorageKey(user));
};
