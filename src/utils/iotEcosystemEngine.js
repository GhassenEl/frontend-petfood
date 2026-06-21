import { IOT_DEVICE_TYPES } from '../config/iotEcosystemCatalog';

const FIRMWARE_LATEST = Object.fromEntries(
  IOT_DEVICE_TYPES.map((t) => [t.type, t.firmware]),
);

/** Santé réseau IoT agrégée. */
export const computeNetworkHealth = (pack = {}) => {
  const devices = pack.devices || [];
  const online = devices.filter((d) => d.status === 'online').length;
  const mqttOk = pack.mqtt?.connected;
  const socketOk = pack.socketConnected;
  const avgSignal = devices.length
    ? Math.round(devices.reduce((s, d) => s + (d.signalStrength || 0), 0) / devices.length)
    : 0;

  let score = 100;
  if (!mqttOk) score -= 25;
  if (online < devices.length) score -= (devices.length - online) * 12;
  if (avgSignal < 50) score -= 15;
  if (avgSignal < 30) score -= 10;

  return {
    score: Math.max(0, Math.min(100, score)),
    online,
    total: devices.length,
    mqttConnected: Boolean(mqttOk),
    websocketConnected: Boolean(socketOk),
    avgSignal,
    latencyMs: mqttOk ? 42 + (devices.length % 3) * 8 : null,
  };
};

/** Audit firmware par appareil. */
export const auditFirmware = (devices = []) =>
  devices.map((d) => {
    const expected = FIRMWARE_LATEST[d.type] || 'Unknown';
    const current = d.firmware || expected;
    const upToDate = current === expected || !d.firmware;
    return {
      deviceId: d.id,
      deviceName: d.name,
      type: d.type,
      current,
      latest: expected,
      upToDate,
    };
  });

/** Résultat simulé d'une commande rapide. */
export const simulateIoTCommand = (commandId, pack = {}) => {
  const now = new Date().toISOString();
  const messages = {
    'dispense-now': 'Distribution 30 g envoyée — Distributeur Max',
    'scan-quality': 'Scan ESP32-CAM déclenché — résultat sous 8 s',
    'sync-all': `${pack.devices?.length || 0} appareils synchronisés`,
    'firmware-check': 'Tous les firmwares sont à jour',
    'mqtt-ping': pack.mqtt?.connected ? `MQTT OK — ${pack.mqtt.broker} (42 ms)` : 'MQTT hors ligne',
    'water-purge': 'Cycle purge fontaine démarré (60 s)',
  };
  return {
    ok: true,
    commandId,
    message: messages[commandId] || 'Commande exécutée',
    at: now,
  };
};

export default { computeNetworkHealth, auditFirmware, simulateIoTCommand };
