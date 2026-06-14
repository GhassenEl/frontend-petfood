import { getCookie, setCookie, removeCookie } from './cookies';
import { isCategoryAllowed } from './cookieConsent';

const TOKEN_SESSION_KEY = 'token';
const TOKEN_LS_KEY = 'token';
const EMAIL_COOKIE = 'petfoodtn_email';
const REMEMBER_COOKIE = 'petfoodtn_remember';

const getSessionStorage = () => {
  try {
    return typeof sessionStorage !== 'undefined' ? sessionStorage : null;
  } catch {
    return null;
  }
};

const getLocalStorage = () => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
};

export const getStoredToken = () => {
  const session = getSessionStorage();
  const local = getLocalStorage();
  return session?.getItem(TOKEN_SESSION_KEY) || local?.getItem(TOKEN_LS_KEY) || null;
};

export const persistAuthToken = (token, rememberMe = false) => {
  const session = getSessionStorage();
  const local = getLocalStorage();

  if (rememberMe) {
    local?.setItem(TOKEN_LS_KEY, token);
    session?.removeItem(TOKEN_SESSION_KEY);
    setCookie(REMEMBER_COOKIE, '1', 30);
  } else {
    session?.setItem(TOKEN_SESSION_KEY, token);
    local?.removeItem(TOKEN_LS_KEY);
    removeCookie(REMEMBER_COOKIE);
  }
};

export const clearAuthToken = () => {
  getSessionStorage()?.removeItem(TOKEN_SESSION_KEY);
  getLocalStorage()?.removeItem(TOKEN_LS_KEY);
  removeCookie(REMEMBER_COOKIE);
};

export const persistRememberedEmail = (email, rememberMe) => {
  if (rememberMe && email && isCategoryAllowed('preferences')) {
    setCookie(EMAIL_COOKIE, email.trim().toLowerCase(), 30);
  } else {
    removeCookie(EMAIL_COOKIE);
  }
};

export const getRememberedEmail = () => getCookie(EMAIL_COOKIE);

export const isRememberMeEnabled = () => getCookie(REMEMBER_COOKIE) === '1';
