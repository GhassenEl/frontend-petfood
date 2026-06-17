/**
 * Confidentialité — présence / audience admin.
 */

const SENSITIVE_PREFIXES = [
  '/checkout',
  '/login',
  '/register',
  '/client-profile',
  '/admin',
  '/vet/medical',
  '/support/tickets',
];

/** Masque les chemins sensibles avant envoi analytics. */
export const sanitizePresencePath = (path = '/') => {
  const p = String(path || '/');
  const hit = SENSITIVE_PREFIXES.find((prefix) => p.startsWith(prefix));
  if (hit) return `${hit}/[privé]`;
  return p;
};

/** Payload minimal pour le heartbeat présence. */
export const buildPresencePayload = ({
  sessionId,
  userId,
  role,
  name,
  region,
  path,
}) => ({
  sessionId,
  userId: userId || null,
  role: role || 'visitor',
  name: userId ? (name || 'Utilisateur') : 'Visiteur anonyme',
  region: region || 'Non assignée',
  path: sanitizePresencePath(path),
});

export default { sanitizePresencePath, buildPresencePayload };
