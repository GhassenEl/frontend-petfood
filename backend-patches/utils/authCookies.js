/** Cookies HttpOnly pour JWT — évite localStorage (XSS). */

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'petfoodtn_access_token';
const MAX_AGE_MS = Number(process.env.JWT_EXPIRES_MS || 7 * 24 * 60 * 60 * 1000);

const isSecureCookie = () => process.env.AUTH_COOKIE_SECURE === 'true';

const parseCookies = (req) => {
  const header = req.headers?.cookie;
  if (!header) return {};
  return header.split(';').reduce((acc, part) => {
    const idx = part.indexOf('=');
    if (idx < 1) return acc;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    try {
      acc[key] = decodeURIComponent(val);
    } catch {
      acc[key] = val;
    }
    return acc;
  }, {});
};

const getTokenFromRequest = (req) => {
  const rawAuth = typeof req.header === 'function'
    ? req.header('Authorization')
    : req.headers?.authorization;
  if (rawAuth?.startsWith('Bearer ')) {
    return rawAuth.replace('Bearer ', '').trim();
  }
  const cookies = parseCookies(req);
  return cookies[COOKIE_NAME] || null;
};

const setAuthCookie = (res, token) => {
  if (!token || process.env.AUTH_HTTPONLY_COOKIES === 'false') return;
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(MAX_AGE_MS / 1000)}`,
  ];
  if (isSecureCookie()) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
};

const clearAuthCookie = (res) => {
  const parts = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isSecureCookie()) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
};

module.exports = {
  COOKIE_NAME,
  parseCookies,
  getTokenFromRequest,
  setAuthCookie,
  clearAuthCookie,
};
