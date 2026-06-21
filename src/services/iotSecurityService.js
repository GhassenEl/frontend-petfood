import api from '../utils/api';
import { fetchIoTPack } from './iotService';
import { buildIoTSecurityPack } from '../utils/iotSecurityEngine';
import { getIoTSecurityPreferences } from '../utils/privacyPreferences';

const REVOKED_KEY = 'petfood_iot_revoked';
const ROTATIONS_KEY = 'petfood_iot_key_rotations';

function getRevokedIds() {
  try {
    return JSON.parse(localStorage.getItem(REVOKED_KEY) || '[]');
  } catch {
    return [];
  }
}

function getRotations() {
  try {
    return JSON.parse(localStorage.getItem(ROTATIONS_KEY) || '{}');
  } catch {
    return {};
  }
}

function applyLocalDeviceState(pack) {
  const revoked = getRevokedIds();
  const rotations = getRotations();
  const secPrefs = getIoTSecurityPreferences();
  return {
    ...pack,
    mqtt: {
      ...pack.mqtt,
      tlsEnabled: pack.mqtt?.tlsEnabled ?? secPrefs.mqttTlsEnabled,
    },
    devices: (pack.devices || []).map((d) => ({
      ...d,
      revoked: revoked.includes(d.id),
      keyRotatedAt: rotations[d.id] || d.keyRotatedAt,
      deviceKey: d.deviceKey || `PETFEED-${d.id?.toUpperCase()?.slice(-8) || 'DEVICE'}`,
      tlsEnabled: d.tlsEnabled ?? secPrefs.mqttTlsEnabled,
    })),
    intrusionAttempts: pack.intrusionAttempts ?? 2,
  };
}

export async function fetchIoTSecurityPack() {
  const pack = applyLocalDeviceState(await fetchIoTPack());
  return buildIoTSecurityPack(pack);
}

export async function rotateDeviceKey(deviceId) {
  try {
    const { data } = await api.post(`/client/iot/devices/${deviceId}/rotate-key`);
    if (data?.rotatedAt) {
      const rotations = getRotations();
      rotations[deviceId] = data.rotatedAt;
      localStorage.setItem(ROTATIONS_KEY, JSON.stringify(rotations));
      return data;
    }
  } catch { /* démo */ }
  const rotations = getRotations();
  rotations[deviceId] = new Date().toISOString();
  localStorage.setItem(ROTATIONS_KEY, JSON.stringify(rotations));
  return { deviceId, rotatedAt: rotations[deviceId], keyPreview: 'PETFEED-****-NEW' };
}

export async function revokeIoTDevice(deviceId) {
  try {
    await api.post(`/client/iot/devices/${deviceId}/revoke`);
  } catch { /* démo */ }
  const revoked = getRevokedIds();
  if (!revoked.includes(deviceId)) {
    revoked.push(deviceId);
    localStorage.setItem(REVOKED_KEY, JSON.stringify(revoked));
  }
  return { deviceId, revoked: true };
}

export default { fetchIoTSecurityPack, rotateDeviceKey, revokeIoTDevice };
