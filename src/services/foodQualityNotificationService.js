import api from '../utils/api';
import { QUALITY_LABELS, NON_CONFORME_OLED } from '../utils/foodQualityEngine';

const ALERTS_KEY = 'petfoodtn:iot:food-quality-alerts';
const ALERT_COOLDOWN_MS = 5 * 60 * 1000;

let lastCriticalAt = 0;
let lastNonConformeAt = 0;

const loadLocalAlerts = () => {
  try {
    return JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveLocalAlerts = (alerts) => {
  try {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts.slice(0, 30)));
  } catch {
    /* quota */
  }
};

/** Scénario alternatif — alerte application client (< 50 %, non critique). */
function buildNonConformeAppAlert(reading, device = {}) {
  const score = reading.qualityScore ?? 0;
  const petName = device.petName || 'Max';
  return {
    id: `fq-app-${reading.analyzedAt}`,
    type: 'iot_food_quality',
    severity: 'high',
    audience: 'client',
    title: `⚠ ${NON_CONFORME_OLED.alertTitle} — ${NON_CONFORME_OLED.alertMessage}`,
    message: `Qualité : ${score}%`,
    description: `Anomalie IA détectée sur le récipient de ${petName}. Nourriture non conforme (${score}%).`,
    readingId: reading.analyzedAt,
    deviceId: device.id || reading.deviceId || 'esp32-cam',
    link: '/client-iot?tab=food-quality',
    createdAt: new Date().toISOString(),
    read: false,
  };
}

/** Alertes scénario principal — critique client + vétérinaire. */
function buildCriticalAlerts(reading, device = {}) {
  const meta = QUALITY_LABELS[reading.quality] || QUALITY_LABELS.bad;
  const petName = device.petName || 'Max';
  const score = reading.qualityScore ?? 0;
  const action = reading.recommendedAction || 'Remplacer l\'aliment';

  const base = {
    type: 'iot_food_quality',
    severity: 'critical',
    readingId: reading.analyzedAt,
    deviceId: device.id || reading.deviceId || 'esp32-cam',
    link: '/client-iot?tab=food-quality',
    createdAt: new Date().toISOString(),
  };

  return [
    {
      ...base,
      id: `fq-client-${reading.analyzedAt}`,
      audience: 'client',
      title: `Qualité alimentaire critique — ${petName}`,
      message: `ESP32-CAM : ${score}% — ${meta.state}. Action : ${action}.`,
      description: `ESP32-CAM : ${score}% — ${meta.state}. Action : ${action}.`,
      read: false,
    },
    {
      ...base,
      id: `fq-vet-${reading.analyzedAt}`,
      audience: 'vet',
      title: `Alerte IoT — aliment altéré (${petName})`,
      message: `Client signalé : score ${score}%, ${meta.state}.`,
      description: `Altération alimentaire pour ${petName}. ${action}.`,
      link: '/veterinary',
      read: false,
    },
  ];
}

/** Construit les payloads notification selon le scénario. */
export function buildFoodQualityAlerts(reading, device = {}) {
  if (!reading) return [];

  if (reading.isCritical || reading.quality === 'critical') {
    return buildCriticalAlerts(reading, device);
  }

  if (reading.isNonConforme || (reading.qualityScore < 50 && reading.quality === 'bad')) {
    return [buildNonConformeAppAlert(reading, device)];
  }

  return [];
}

/** Envoie alertes API + stockage local (mode démo). */
export async function dispatchFoodQualityAlerts(reading, device = {}) {
  const alerts = buildFoodQualityAlerts(reading, device);
  if (!alerts.length) return { sent: false, alerts: [] };

  const now = Date.now();
  const isCritical = reading.isCritical || reading.quality === 'critical';

  if (isCritical && now - lastCriticalAt < ALERT_COOLDOWN_MS) {
    return { sent: false, alerts: [], throttled: true };
  }
  if (!isCritical && reading.isNonConforme && now - lastNonConformeAt < ALERT_COOLDOWN_MS) {
    return { sent: false, alerts: [], throttled: true };
  }

  if (isCritical) lastCriticalAt = now;
  else lastNonConformeAt = now;

  try {
    await api.post('/client/iot/food-quality/alerts', {
      reading,
      alerts,
      notifyVet: isCritical,
    });
    return { sent: true, alerts, mode: 'api', scenario: isCritical ? 'critical' : 'alternate' };
  } catch {
    const clientAlert = alerts[0];
    const stored = [clientAlert, ...loadLocalAlerts().filter((a) => a.id !== clientAlert.id)].slice(0, 20);
    saveLocalAlerts(stored);
    window.dispatchEvent(new CustomEvent('petfood:food-quality-alert', { detail: clientAlert }));
    return { sent: true, alerts, mode: 'demo', scenario: isCritical ? 'critical' : 'alternate' };
  }
}

export function getStoredFoodQualityAlerts() {
  return loadLocalAlerts();
}

export default dispatchFoodQualityAlerts;
