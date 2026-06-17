import api from '../utils/api';
import { QUALITY_LABELS } from '../utils/foodQualityEngine';

const ALERTS_KEY = 'petfoodtn:iot:food-quality-alerts';
const ALERT_COOLDOWN_MS = 5 * 60 * 1000;

let lastCriticalAt = 0;

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

/** Construit les payloads notification client + vétérinaire. */
export function buildFoodQualityAlerts(reading, device = {}) {
  if (!reading?.isCritical && reading?.quality !== 'bad' && reading?.quality !== 'critical') {
    return [];
  }

  const meta = QUALITY_LABELS[reading.quality] || QUALITY_LABELS.bad;
  const petName = device.petName || 'Max';
  const score = reading.qualityScore ?? 0;
  const action = reading.recommendedAction || 'Remplacer l\'aliment';
  const title = `Qualité alimentaire critique — ${petName}`;
  const message = `ESP32-CAM : ${score}% — ${meta.state}. Action recommandée : ${action}.`;

  const base = {
    type: 'iot_food_quality',
    severity: reading.isCritical ? 'critical' : 'high',
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
      title,
      message,
      description: message,
    },
    {
      ...base,
      id: `fq-vet-${reading.analyzedAt}`,
      audience: 'vet',
      title: `Alerte IoT — aliment altéré (${petName})`,
      message: `Client signalé : score ${score}%, ${meta.state}. Vérification recommandée.`,
      description: `Le système IoT PetFoodTN a détecté une altération alimentaire pour ${petName}. ${action}.`,
      link: '/veterinary',
    },
  ];
}

/** Envoie alertes API + stockage local (mode démo). */
export async function dispatchFoodQualityAlerts(reading, device = {}) {
  const alerts = buildFoodQualityAlerts(reading, device);
  if (!alerts.length) return { sent: false, alerts: [] };

  const now = Date.now();
  if (reading.isCritical && now - lastCriticalAt < ALERT_COOLDOWN_MS) {
    return { sent: false, alerts: [], throttled: true };
  }
  if (reading.isCritical) lastCriticalAt = now;

  try {
    await api.post('/client/iot/food-quality/alerts', {
      reading,
      alerts,
      notifyVet: true,
    });
    return { sent: true, alerts, mode: 'api' };
  } catch {
    const stored = [alerts[0], ...loadLocalAlerts().filter((a) => a.id !== alerts[0].id)].slice(0, 20);
    saveLocalAlerts(stored);
    window.dispatchEvent(new CustomEvent('petfood:food-quality-alert', { detail: alerts[0] }));
    return { sent: true, alerts, mode: 'demo' };
  }
}

export function getStoredFoodQualityAlerts() {
  return loadLocalAlerts();
}

export default dispatchFoodQualityAlerts;
