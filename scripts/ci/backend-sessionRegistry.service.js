/**
 * Patch CI — registre de sessions en mémoire (backend manquant en prod checkout).
 */
const sessions = new Map();

const registerSession = ({ jti, userId, email, role, ip, userAgent }) => {
  if (!jti) return;
  sessions.set(jti, {
    userId,
    email,
    role,
    ip: ip || null,
    userAgent: userAgent || null,
    createdAt: Date.now(),
  });
};

const revokeSession = (jti) => {
  if (jti) sessions.delete(jti);
};

const listSessionsForUser = (userId) =>
  [...sessions.entries()]
    .filter(([, s]) => s.userId === userId)
    .map(([id, s]) => ({ jti: id, ...s }));

module.exports = {
  registerSession,
  revokeSession,
  listSessionsForUser,
};
