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

const SECURITY_DEFAULTS = {
  mqttTlsEnabled: true,
  encryptTelemetry: true,
  blockUnknownDevices: true,
  localProcessingOnly: false,
  twoFactorPairing: false,
};

const SECURITY_STORAGE_KEY = 'petfoodtn:security:iot';

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

const readSecurity = () => {
  if (!isCategoryAllowed('preferences')) return { ...SECURITY_DEFAULTS };
  try {
    const raw = localStorage.getItem(SECURITY_STORAGE_KEY);
    if (!raw) return { ...SECURITY_DEFAULTS };
    return { ...SECURITY_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...SECURITY_DEFAULTS };
  }
};

const writeSecurity = (patch) => {
  if (!isCategoryAllowed('preferences')) return readSecurity();
  const next = { ...readSecurity(), ...patch };
  try {
    localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(next));
  } catch { /* quota */ }
  window.dispatchEvent(new Event('petfood:privacy-preferences'));
  return next;
};

export const getIoTSecurityPreferences = () => readSecurity();

export const setMqttTlsEnabled = (enabled) => writeSecurity({ mqttTlsEnabled: Boolean(enabled) });

export const setEncryptTelemetry = (enabled) => writeSecurity({ encryptTelemetry: Boolean(enabled) });

export const setBlockUnknownDevices = (enabled) => writeSecurity({ blockUnknownDevices: Boolean(enabled) });

export const setLocalProcessingOnly = (enabled) => writeSecurity({ localProcessingOnly: Boolean(enabled) });

export const setTwoFactorPairing = (enabled) => writeSecurity({ twoFactorPairing: Boolean(enabled) });

export default {
  getIoTPrivacyPreferences,
  isCameraCaptureAllowed,
  isVetAlertSharingAllowed,
  setCameraCaptureEnabled,
  setVetAlertSharingEnabled,
  getIoTSecurityPreferences,
  setMqttTlsEnabled,
  setEncryptTelemetry,
  setBlockUnknownDevices,
  setLocalProcessingOnly,
  setTwoFactorPairing,
};
