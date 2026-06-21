/** Référentiel sécurité IoT PetfoodTN — authentification, chiffrement, audit. */

export const IOT_SECURITY_PILLARS = [
  {
    id: 'auth',
    icon: '🔑',
    label: 'Authentification appareils',
    desc: 'Clé device unique, pairing sécurisé et révocation à distance.',
  },
  {
    id: 'transport',
    icon: '🔒',
    label: 'Transport chiffré',
    desc: 'MQTT over TLS, certificats X.509 et rotation des clés.',
  },
  {
    id: 'firmware',
    icon: '🛡️',
    label: 'Intégrité firmware',
    desc: 'Signatures OTA, vérification hash et rollback protection.',
  },
  {
    id: 'privacy',
    icon: '👁️',
    label: 'Confidentialité',
    desc: 'Consentement caméra, traitement local et partage vétérinaire opt-in.',
  },
  {
    id: 'network',
    icon: '📡',
    label: 'Réseau & isolation',
    desc: 'Segmentation VLAN IoT, détection intrusions et liste blanche MAC.',
  },
  {
    id: 'audit',
    icon: '📋',
    label: 'Audit & conformité',
    desc: 'Journal immuable, alignement ISO 27001 et RGPD.',
  },
];

export const IOT_SECURITY_CHECKLIST = [
  { id: 'tls', label: 'MQTT TLS activé sur le broker', critical: true },
  { id: 'keys', label: 'Clés appareil uniques (pas de clé par défaut)', critical: true },
  { id: 'rotate', label: 'Rotation des clés < 90 jours', critical: false },
  { id: 'ota-sign', label: 'Firmware signé (OTA vérifié)', critical: true },
  { id: 'camera-consent', label: 'Consentement caméra explicite', critical: true },
  { id: 'vet-optin', label: 'Partage vétérinaire désactivé par défaut', critical: false },
  { id: 'offline-revoke', label: 'Révocation appareils perdus/volés', critical: false },
  { id: 'encrypt-at-rest', label: 'Télémétrie chiffrée au repos', critical: false },
];

export const IOT_THREAT_TYPES = {
  unknown_device: { label: 'Appareil inconnu', icon: '⚠️', severity: 'high' },
  weak_key: { label: 'Clé faible / expirée', icon: '🔑', severity: 'high' },
  no_tls: { label: 'MQTT sans TLS', icon: '🔓', severity: 'medium' },
  firmware_unsigned: { label: 'Firmware non signé', icon: '📦', severity: 'medium' },
  camera_without_consent: { label: 'Caméra sans consentement', icon: '📷', severity: 'high' },
  signal_anomaly: { label: 'Signal / MAC suspect', icon: '📡', severity: 'low' },
  brute_force: { label: 'Tentatives pairing', icon: '🚨', severity: 'high' },
};

export default {
  IOT_SECURITY_PILLARS,
  IOT_SECURITY_CHECKLIST,
  IOT_THREAT_TYPES,
};
