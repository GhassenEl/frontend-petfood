/**
 * Préférences de confidentialité IoT — caméra, partage vétérinaire.
 * Stockage local, activé uniquement si cookies « préférences » autorisés.
 */

import { isCategoryAllowed } from './cookieConsent';

const STORAGE_KEY = 'petfoodtn:privacy:iot';

const DEFAULTS = {
  cameraCaptureEnabled: false,
  vetAlertSharingEnabled: false,
  decidedAt: null,
};

const read = () => {
  if (!isCategoryAllowed('preferences')) return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
};

const write = (patch) => {
  if (!isCategoryAllowed('preferences')) return read();
  const next = { ...read(), ...patch, decidedAt: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  window.dispatchEvent(new Event('petfood:privacy-preferences'));
  return next;
};

export const getIoTPrivacyPreferences = () => read();

export const isCameraCaptureAllowed = () => read().cameraCaptureEnabled === true;

export const isVetAlertSharingAllowed = () => read().vetAlertSharingEnabled === true;

export const setCameraCaptureEnabled = (enabled) =>
  write({ cameraCaptureEnabled: Boolean(enabled) });

export const setVetAlertSharingEnabled = (enabled) =>
  write({ vetAlertSharingEnabled: Boolean(enabled) });

export const hasIoTPrivacyDecision = () => Boolean(read().decidedAt);

export default {
  getIoTPrivacyPreferences,
  isCameraCaptureAllowed,
  isVetAlertSharingAllowed,
  setCameraCaptureEnabled,
  setVetAlertSharingEnabled,
};
