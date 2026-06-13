/**
 * Middleware JWT Express — à copier dans backend-petfood (repo séparé).
 * Dépendances : jsonwebtoken, dotenv
 *
 * backend/.env :
 *   JWT_SECRET=<secret-fort-min-32-chars>
 *   JWT_EXPIRES_IN=8h
 *   JWT_ISSUER=petfoodtn
 *   JWT_AUDIENCE=petfoodtn-web
 */

const jwt = require('jsonwebtoken');

const VALID_ROLES = ['admin', 'client', 'livreur', 'vet', 'vendor'];

const jwtOptions = () => ({
  issuer: process.env.JWT_ISSUER || undefined,
  audience: process.env.JWT_AUDIENCE || undefined,
});

const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    ...jwtOptions(),
  });

const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'],
    ...jwtOptions(),
  });

/** Routes publiques (sans Bearer) */
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/health',
];

const isPublicPath = (path) =>
  PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

const authMiddleware = (req, res, next) => {
  if (isPublicPath(req.path)) return next();

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const decoded = verifyAccessToken(token);
    if (decoded.role && !VALID_ROLES.includes(decoded.role)) {
      return res.status(403).json({ error: 'Rôle invalide' });
    }
    req.user = decoded;
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expiré' : 'Token invalide';
    return res.status(401).json({ error: message });
  }
};

const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  return next();
};

/** POST /api/auth/refresh — renouveler le JWT avant expiration */
const refreshHandler = (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  try {
    const decoded = verifyAccessToken(token);
    const { iat, exp, nbf, ...payload } = decoded;
    const newToken = signAccessToken(payload);
    return res.json({ token: newToken });
  } catch (err) {
    return res.status(401).json({ error: 'Impossible de renouveler la session' });
  }
};

module.exports = {
  authMiddleware,
  requireRoles,
  signAccessToken,
  verifyAccessToken,
  refreshHandler,
};
