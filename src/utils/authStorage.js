import { getCookie, setCookie, removeCookie } from './cookies';

const TOKEN_LS_KEY = 'token';
const TOKEN_COOKIE = 'petfoodtn_token';
const EMAIL_COOKIE = 'petfoodtn_email';
const REMEMBER_COOKIE = 'petfoodtn_remember';

export const getStoredToken = () =>
  localStorage.getItem(TOKEN_LS_KEY) || getCookie(TOKEN_COOKIE);

export const persistAuthToken = (token, rememberMe = false) => {
  localStorage.setItem(TOKEN_LS_KEY, token);
  if (rememberMe) {
    setCookie(TOKEN_COOKIE, token, 30);
    setCookie(REMEMBER_COOKIE, '1', 30);
  } else {
    removeCookie(TOKEN_COOKIE);
    removeCookie(REMEMBER_COOKIE);
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_LS_KEY);
  removeCookie(TOKEN_COOKIE);
};

export const persistRememberedEmail = (email, rememberMe) => {
  if (rememberMe && email) {
    setCookie(EMAIL_COOKIE, email.trim().toLowerCase(), 30);
  } else {
    removeCookie(EMAIL_COOKIE);
  }
};

export const getRememberedEmail = () => getCookie(EMAIL_COOKIE);

export const isRememberMeEnabled = () => getCookie(REMEMBER_COOKIE) === '1';
