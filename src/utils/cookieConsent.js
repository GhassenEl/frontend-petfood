import { getCookie, setCookie, removeCookie } from './cookies';

export const CONSENT_STORAGE_KEY = 'petfood_cookie_consent';
export const CONSENT_COOKIE = 'petfood_cookie_consent';
export const CONSENT_VERSION = 1;

export const COOKIE_CATEGORIES = {
  necessary: {
    id: 'necessary',
    label: 'Essentiels',
    description: 'Session, sécurité et connexion (obligatoires).',
    required: true,
  },
  preferences: {
    id: 'preferences',
    label: 'Préférences',
    description: 'Langue, thème et mémorisation de votre e-mail.',
    required: false,
  },
  analytics: {
    id: 'analytics',
    label: 'Analytique',
    description: 'Mesure d’audience et amélioration de l’expérience.',
    required: false,
  },
  marketing: {
    id: 'marketing',
    label: 'Marketing',
    description: 'Offres personnalisées et rappels promotionnels.',
    required: false,
  },
};

const DEFAULT_CONSENT = {
  version: CONSENT_VERSION,
  decidedAt: null,
  categories: {
    necessary: true,
    preferences: false,
    analytics: false,
    marketing: false,
  },
};

const readLocalConsent = () => {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.categories) return null;
    return {
      ...DEFAULT_CONSENT,
      ...parsed,
      categories: { ...DEFAULT_CONSENT.categories, ...parsed.categories, necessary: true },
    };
  } catch {
    return null;
  }
};

const persistConsent = (consent) => {
  const payload = {
    ...consent,
    version: CONSENT_VERSION,
    decidedAt: consent.decidedAt || new Date().toISOString(),
    categories: { ...consent.categories, necessary: true },
  };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota errors */
  }
  setCookie(CONSENT_COOKIE, JSON.stringify({
    v: CONSENT_VERSION,
    p: payload.categories.preferences ? 1 : 0,
    a: payload.categories.analytics ? 1 : 0,
    m: payload.categories.marketing ? 1 : 0,
  }), 365);
  return payload;
};

export const getCookieConsent = () => readLocalConsent() || { ...DEFAULT_CONSENT };

export const hasCookieConsentDecision = () => {
  const local = readLocalConsent();
  if (local?.decidedAt) return true;
  const cookie = getCookie(CONSENT_COOKIE);
  return Boolean(cookie);
};

export const shouldShowCookieBanner = () => !hasCookieConsentDecision();

export const isCategoryAllowed = (categoryId) => {
  const cat = COOKIE_CATEGORIES[categoryId];
  if (!cat) return false;
  if (cat.required) return true;
  const consent = getCookieConsent();
  return Boolean(consent.categories?.[categoryId]);
};

export const saveCookieConsent = (categories) => {
  const merged = {
    ...getCookieConsent(),
    categories: {
      necessary: true,
      preferences: !!categories.preferences,
      analytics: !!categories.analytics,
      marketing: !!categories.marketing,
    },
  };
  return persistConsent(merged);
};

export const acceptAllCookies = () =>
  saveCookieConsent({ preferences: true, analytics: true, marketing: true });

export const rejectNonEssentialCookies = () =>
  saveCookieConsent({ preferences: false, analytics: false, marketing: false });

export const clearCookieConsent = () => {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  removeCookie(CONSENT_COOKIE);
};

export const listActiveCookieTypes = () => {
  const consent = getCookieConsent();
  return Object.values(COOKIE_CATEGORIES)
    .filter((c) => c.required || consent.categories?.[c.id])
    .map((c) => c.label);
};
