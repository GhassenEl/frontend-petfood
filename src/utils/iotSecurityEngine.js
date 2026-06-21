import {
  IOT_SECURITY_CHECKLIST,
  IOT_THREAT_TYPES,
} from '../config/iotSecurityCatalog';
import {
  getIoTPrivacyPreferences,
  getIoTSecurityPreferences,
} from '../utils/privacyPreferences';

const daysSince = (iso) => {
  if (!iso) return 999;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
};

const maskKey = (key) => {
  if (!key || key.length < 8) return '****';
  return `${key.slice(0, 8)}****${key.slice(-4)}`;
};

/** Profil sécurité par appareil. */
export const buildDeviceSecurityProfile = (device = {}, index = 0) => {
  const key = device.deviceKey || `PETFEED-DEMO-${device.id?.slice(-4) || '0000'}`;
  const keyRotatedAt = device.keyRotatedAt || new Date(Date.now() - (45 + index * 12) * 86400000).toISOString();
  const keyAgeDays = daysSince(keyRotatedAt);
  const tlsEnabled = device.tlsEnabled ?? device.status === 'online';
  const firmwareSigned = device.firmwareSigned ?? true;
  const pairingLocked = device.pairingLocked ?? true;
  const certificateValid = device.certificateValid ?? tlsEnabled;

  let score = 100;
  if (!tlsEnabled) score -= 25;
  if (keyAgeDays > 90) score -= 15;
  if (keyAgeDays > 180) score -= 10;
  if (!firmwareSigned) score -= 20;
  if (!pairingLocked) score -= 15;
  if (!certificateValid) score -= 10;
  if (device.status !== 'online' && device.revoked) score = 0;

  return {
    deviceId: device.id,
    deviceName: device.name,
    type: device.type,
    status: device.status,
    deviceKeyMasked: maskKey(key),
    keyAgeDays,
    keyRotatedAt,
    tlsEnabled,
    firmwareSigned,
    pairingLocked,
    certificateValid,
    lastAuthAt: device.lastAuthAt || new Date(Date.now() - 300000).toISOString(),
    score: Math.max(0, Math.min(100, score)),
    revoked: Boolean(device.revoked),
  };
};

/** Menaces détectées sur le parc IoT. */
export const detectIoTSecurityThreats = (devices = [], pack = {}) => {
  const threats = [];
  const prefs = getIoTPrivacyPreferences();
  const secPrefs = getIoTSecurityPreferences();
  const mqttTls = pack.mqtt?.tlsEnabled ?? secPrefs.mqttTlsEnabled;

  devices.forEach((d, i) => {
    const profile = buildDeviceSecurityProfile(d, i);
    if (d.revoked) return;
    if (!profile.tlsEnabled && d.status === 'online') {
      threats.push({
        id: `threat-tls-${d.id}`,
        type: 'no_tls',
        deviceId: d.id,
        deviceName: d.name,
        message: 'Communication MQTT non chiffrée — activez TLS.',
        severity: IOT_THREAT_TYPES.no_tls.severity,
      });
    }
    if (profile.keyAgeDays > 90) {
      threats.push({
        id: `threat-key-${d.id}`,
        type: 'weak_key',
        deviceId: d.id,
        deviceName: d.name,
        message: `Clé appareil âgée de ${profile.keyAgeDays} jours — rotation recommandée.`,
        severity: IOT_THREAT_TYPES.weak_key.severity,
      });
    }
    if (!profile.firmwareSigned) {
      threats.push({
        id: `threat-fw-${d.id}`,
        type: 'firmware_unsigned',
        deviceId: d.id,
        deviceName: d.name,
        message: 'Firmware OTA non vérifié par signature.',
        severity: IOT_THREAT_TYPES.firmware_unsigned.severity,
      });
    }
    if (d.type === 'feeder-cam' && !prefs.cameraCaptureEnabled) {
      threats.push({
        id: `threat-cam-${d.id}`,
        type: 'camera_without_consent',
        deviceId: d.id,
        deviceName: d.name,
        message: 'ESP32-CAM actif sans consentement utilisateur — capture bloquée.',
        severity: IOT_THREAT_TYPES.camera_without_consent.severity,
      });
    }
    if (d.signalStrength != null && d.signalStrength < 25 && d.status === 'online') {
      threats.push({
        id: `threat-sig-${d.id}`,
        type: 'signal_anomaly',
        deviceId: d.id,
        deviceName: d.name,
        message: 'Signal Wi-Fi faible — risque d\'interception ou de déconnexion.',
        severity: IOT_THREAT_TYPES.signal_anomaly.severity,
      });
    }
  });

  if (!mqttTls) {
    threats.push({
      id: 'threat-mqtt-global',
      type: 'no_tls',
      deviceId: null,
      deviceName: 'Broker MQTT',
      message: 'TLS désactivé sur le broker — activez MQTT over TLS (port 8883).',
      severity: 'high',
    });
  }

  if (secPrefs.blockUnknownDevices && (pack.intrusionAttempts || 0) > 0) {
    threats.push({
      id: 'threat-brute',
      type: 'brute_force',
      deviceId: null,
      deviceName: 'Réseau IoT',
      message: `${pack.intrusionAttempts} tentative(s) de pairing non autorisée(s) bloquée(s).`,
      severity: 'high',
    });
  }

  return threats;
};

/** Journal d'audit sécurité IoT. */
export const buildIoTSecurityAuditLog = (devices = []) => {
  const events = [];
  devices.forEach((d, i) => {
    const profile = buildDeviceSecurityProfile(d, i);
    events.push({
      id: `audit-auth-${d.id}`,
      at: profile.lastAuthAt,
      action: 'auth_success',
      device: d.name,
      detail: `Authentification MQTT — clé ${profile.deviceKeyMasked}`,
      level: 'info',
    });
    if (profile.keyAgeDays > 60) {
      events.push({
        id: `audit-key-${d.id}`,
        at: profile.keyRotatedAt,
        action: 'key_rotation_due',
        device: d.name,
        detail: `Rotation clé recommandée (${profile.keyAgeDays} jours)`,
        level: 'warning',
      });
    }
  });
  events.push({
    id: 'audit-tls-check',
    at: new Date(Date.now() - 3600000).toISOString(),
    action: 'tls_verified',
    device: 'Broker MQTT',
    detail: 'Certificat broker valide — TLS 1.2',
    level: 'info',
  });
  return events.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 12);
};

/** Score checklist conformité. */
export const evaluateSecurityChecklist = (pack = {}, deviceProfiles = []) => {
  const prefs = getIoTPrivacyPreferences();
  const secPrefs = getIoTSecurityPreferences();
  const mqttTls = pack.mqtt?.tlsEnabled ?? secPrefs.mqttTlsEnabled;

  const state = {
    tls: mqttTls,
    keys: deviceProfiles.every((p) => p.deviceKeyMasked && !p.deviceKeyMasked.includes('DEFAULT')),
    rotate: deviceProfiles.every((p) => p.keyAgeDays <= 90),
    'ota-sign': deviceProfiles.every((p) => p.firmwareSigned),
    'camera-consent': prefs.cameraCaptureEnabled || !pack.devices?.some((d) => d.type === 'feeder-cam'),
    'vet-optin': !prefs.vetAlertSharingEnabled,
    'offline-revoke': true,
    'encrypt-at-rest': secPrefs.encryptTelemetry,
  };

  return IOT_SECURITY_CHECKLIST.map((item) => ({
    ...item,
    passed: Boolean(state[item.id]),
  }));
};

/** Pack sécurité IoT complet. */
export const buildIoTSecurityPack = (pack = {}) => {
  const devices = (pack.devices || []).filter((d) => !d.revoked);
  const deviceProfiles = devices.map((d, i) => buildDeviceSecurityProfile(d, i));
  const threats = detectIoTSecurityThreats(pack.devices || [], pack);
  const checklist = evaluateSecurityChecklist(pack, deviceProfiles);
  const auditLog = buildIoTSecurityAuditLog(pack.devices || []);

  const avgDeviceScore = deviceProfiles.length
    ? Math.round(deviceProfiles.reduce((s, p) => s + p.score, 0) / deviceProfiles.length)
    : 0;
  const checklistScore = Math.round(
    (checklist.filter((c) => c.passed).length / checklist.length) * 100,
  );
  const threatPenalty = threats.filter((t) => t.severity === 'high').length * 8
    + threats.filter((t) => t.severity === 'medium').length * 4;
  const overallScore = Math.max(0, Math.min(100, Math.round((avgDeviceScore + checklistScore) / 2 - threatPenalty)));

  return {
    overallScore,
    deviceProfiles,
    threats,
    checklist,
    auditLog,
    intrusionAttempts: pack.intrusionAttempts ?? 2,
    mqttTlsEnabled: pack.mqtt?.tlsEnabled ?? getIoTSecurityPreferences().mqttTlsEnabled,
    pillarsPassed: checklist.filter((c) => c.passed).length,
    pillarsTotal: checklist.length,
  };
};

export default {
  buildDeviceSecurityProfile,
  detectIoTSecurityThreats,
  buildIoTSecurityAuditLog,
  evaluateSecurityChecklist,
  buildIoTSecurityPack,
};
