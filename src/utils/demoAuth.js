/**
 * Connexion démo locale — comptes de test sans backend (dev / démo).
 */
import { getDemoAccountByEmail } from '../config/demoAccounts';

const b64url = (obj) => {
  const json = JSON.stringify(obj);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/** Jeton JWT minimal (payload lisible par jwt-decode, signature factice « demo »). */
export const createDemoSessionToken = (account) => {
  const header = b64url({ alg: 'none', typ: 'JWT' });
  const payload = b64url({
    sub: account.id || account.email,
    id: account.id || account.email,
    email: account.email,
    role: account.role,
    name: account.name,
    demo: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
  });
  return `${header}.${payload}.demo`;
};

export const tryDemoLogin = (email, password) => {
  const account = getDemoAccountByEmail(email);
  if (!account || account.password !== password) {
    return { success: false };
  }
  const token = createDemoSessionToken(account);
  const user = {
    id: account.id || account.email,
    email: account.email,
    role: account.role,
    name: account.name,
    demo: true,
  };
  return { success: true, token, user };
};
