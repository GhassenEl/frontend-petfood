/**
 * Notifications intelligentes unifiées — repas, vaccins, stock, qualité alimentaire.
 */

export const SMART_NOTIFICATION_TYPES = {
  meal: { icon: '🍽️', label: 'Rappel repas', color: '#059669' },
  vaccination: { icon: '💉', label: 'Vaccination', color: '#7c3aed' },
  stock: { icon: '📦', label: 'Rupture stock', color: '#d97706' },
  food_quality: { icon: '📷', label: 'Aliment détérioré', color: '#dc2626' },
  delivery: { icon: '🚚', label: 'Livraison', color: '#0ea5e9' },
  promo: { icon: '🏷️', label: 'Promotion', color: '#e67e22' },
};

const hoursFromNow = (h) => new Date(Date.now() + h * 3600000).toISOString();
const daysFromNow = (d) => new Date(Date.now() + d * 86400000).toISOString();

export const DEMO_SMART_NOTIFICATIONS = [
  {
    id: 'sn-meal-1',
    type: 'meal',
    title: 'Petit-déjeuner Max — 07:30',
    message: 'Distribution automatique 30 g — distributeur IoT prêt.',
    petName: 'Max',
    scheduledAt: hoursFromNow(2),
    channel: 'push',
    read: false,
    link: '/pet-feeder',
  },
  {
    id: 'sn-meal-2',
    type: 'meal',
    title: 'Dîner Luna — 19:30',
    message: 'Rappel repas — 25 g croquettes light.',
    petName: 'Luna',
    scheduledAt: hoursFromNow(8),
    channel: 'push',
    read: false,
    link: '/pet-feeder',
  },
  {
    id: 'sn-vac-1',
    type: 'vaccination',
    title: 'Rappel vaccin Max — Rage',
    message: 'Rappel dans 14 jours — cabinet Dr. Ben Ali.',
    petName: 'Max',
    scheduledAt: daysFromNow(14),
    channel: 'email',
    read: false,
    link: '/medical-dossier',
  },
  {
    id: 'sn-stock-1',
    type: 'stock',
    title: 'Stock croquettes Max — 18 %',
    message: 'Rupture estimée dans 5 jours — commander maintenant.',
    petName: 'Max',
    scheduledAt: hoursFromNow(-1),
    channel: 'push',
    read: false,
    link: '/client-smart-commerce',
  },
  {
    id: 'sn-fq-1',
    type: 'food_quality',
    title: 'Qualité croquettes — score 72 %',
    message: 'ESP32-CAM : humidité élevée — surveiller ou remplacer.',
    petName: 'Max',
    scheduledAt: hoursFromNow(-0.5),
    channel: 'push',
    read: true,
    link: '/client-iot?tab=food-quality',
  },
  {
    id: 'sn-delivery-1',
    type: 'delivery',
    title: 'Livraison en route — chaîne du froid OK',
    message: 'Commande #PF-2847 — ETA 45 min, 4.2 °C véhicule.',
    scheduledAt: hoursFromNow(-0.2),
    channel: 'push',
    read: false,
    link: '/client-smart-delivery',
  },
];

export const groupSmartNotifications = (items = DEMO_SMART_NOTIFICATIONS) => {
  const groups = {};
  items.forEach((n) => {
    const t = n.type || 'meal';
    if (!groups[t]) groups[t] = [];
    groups[t].push(n);
  });
  return groups;
};

export const countUnreadSmartNotifications = (items = DEMO_SMART_NOTIFICATIONS) =>
  items.filter((n) => !n.read).length;

export default { DEMO_SMART_NOTIFICATIONS, SMART_NOTIFICATION_TYPES };
