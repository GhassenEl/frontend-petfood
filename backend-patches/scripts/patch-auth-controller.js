/**
 * Applique les patches auth.controller (cookies HttpOnly + blocage login démo en prod).
 * Exécuté par scripts/apply-backend-security-patches.mjs dans le conteneur backend.
 */
const fs = require('fs');
const path = require('path');

const controllerPath = path.join(__dirname, '../controllers/auth.controller.js');

let src = fs.readFileSync(controllerPath, 'utf8');

if (!src.includes('authCookies')) {
  src = src.replace(
    "const { signAccessToken } = require('../utils/jwtTokens');",
    "const { signAccessToken } = require('../utils/jwtTokens');\nconst { setAuthCookie, clearAuthCookie } = require('../utils/authCookies');",
  );
}

if (!src.includes('setAuthCookie(res, token)')) {
  src = src.replace(
    'res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });',
    'setAuthCookie(res, token);\n    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role }, cookieAuth: true });',
  );
  src = src.replace(
    'res.json({ token, user: normalizedUser });',
    'setAuthCookie(res, token);\n    res.json({ token, user: normalizedUser, cookieAuth: true });',
  );
  src = src.replace(
    'res.json({ token });',
    'setAuthCookie(res, token);\n    res.json({ token, cookieAuth: true });',
  );
}

if (!src.includes('clearAuthCookie(res)')) {
  src = src.replace(
    "res.json({ ok: true, message: 'Déconnexion effectuée.' });",
    "clearAuthCookie(res);\n    res.json({ ok: true, message: 'Déconnexion effectuée.' });",
  );
}

if (!src.includes('DEMO_LOGIN_BLOCKED_PROD')) {
  src = src.replace(
    `    if (!user) {
      const demo = demoUsers[email];
      if (demo) {`,
    `    if (!user) {
      if (!isDemoMode()) {
        recordFailedLogin(req.ip, email);
        return res.status(401).json({ error: 'Identifiants incorrects. Vérifiez votre email et mot de passe.' });
      }
      const demo = demoUsers[email];
      if (demo) {`,
  );
}

fs.writeFileSync(controllerPath, src, 'utf8');
console.log('✅ auth.controller.js patché (cookies + blocage démo prod)');
