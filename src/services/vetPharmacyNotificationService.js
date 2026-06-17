import api from '../utils/api';

const SEEN_KEY = 'petfood_vet_pharmacy_seen_alerts';

const loadSeen = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

const saveSeen = (set) => {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...set].slice(-100)));
  } catch {
    /* ignore */
  }
};

const toNotificationPayload = (alert) => ({
  id: `vet-pharm-${alert.id || alert.medicationId || alert.name}`,
  type: alert.status === 'rupture' ? 'vet_pharmacy_rupture' : 'vet_pharmacy_low_stock',
  title: alert.status === 'rupture' ? 'Rupture pharmacie' : 'Alerte stock pharmacie',
  description: alert.message || alert.name,
  link: alert.link || '/vet/pharmacy',
  createdAt: new Date().toISOString(),
  read: false,
  level: alert.level,
});

/** Émet une notification locale (cloche + toast) pour le vétérinaire. */
export const emitVetPharmacyAlert = (alert) => {
  const payload = toNotificationPayload(alert);
  window.dispatchEvent(new CustomEvent('petfood:vet-pharmacy-alert', { detail: payload }));

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification(payload.title, {
        body: payload.description,
        tag: payload.id,
        icon: '/favicon.ico',
      });
    } catch {
      /* ignore */
    }
  }
};

/** Notifie uniquement les alertes critiques nouvelles depuis la dernière visite. */
export const notifyNewPharmacyAlerts = (alerts = []) => {
  const seen = loadSeen();
  const critical = alerts.filter((a) => a.level === 'critical');
  const fresh = critical.filter((a) => !seen.has(a.id));

  fresh.forEach((alert) => {
    emitVetPharmacyAlert(alert);
    seen.add(alert.id);
  });

  alerts.forEach((a) => seen.add(a.id));
  saveSeen(seen);

  return fresh.length;
};

export const requestPharmacyNotificationPermission = async () => {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
};

/** Tente de persister côté API (silencieux si endpoint absent). */
export const persistVetPharmacyNotification = async (alert) => {
  try {
    await api.post('/notifications/vet-pharmacy', {
      type: alert.status === 'rupture' ? 'vet_pharmacy_rupture' : 'vet_pharmacy_low_stock',
      title: alert.status === 'rupture' ? 'Rupture pharmacie' : 'Alerte stock pharmacie',
      message: alert.message,
      medicationId: alert.medicationId,
      link: '/vet/pharmacy',
    });
  } catch {
    /* backend optionnel */
  }
};

export default emitVetPharmacyAlert;
