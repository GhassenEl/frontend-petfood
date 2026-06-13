import { SERVICE_RATE_CARDS } from './clientDemoData';

/** Services réservables avec date de fin (pension, garde à domicile). */
export const SERVICES_WITH_DATE_RANGE = ['boarding', 'home_sitting'];

/** Ordre d’affichage dans Mes services (client). */
export const CLIENT_BOOKABLE_SERVICE_TYPES = [
  'grooming',
  'bathing',
  'nail_trim',
  'dental_cleaning',
  'wellness_pack',
  'home_sitting',
  'boarding',
  'training',
  'daycare',
];

export const mergeServiceCatalog = (apiList = []) => {
  const byType = new Map(SERVICE_RATE_CARDS.map((c) => [c.type, { ...c }]));
  (apiList || []).forEach((item) => {
    if (item?.type) {
      byType.set(item.type, { ...byType.get(item.type), ...item });
    }
  });
  return CLIENT_BOOKABLE_SERVICE_TYPES.map((t) => byType.get(t)).filter(Boolean);
};

const daySpanInclusive = (start, end) => {
  if (!start || !end) return 1;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(ms / 86400000) + 1);
};

export const estimateLocalServicePrice = (type, date, endDate) => {
  const card = SERVICE_RATE_CARDS.find((c) => c.type === type);
  if (!card) return { price: null };

  if (type === 'wellness_pack') {
    const separate = (45 + 35 + 15);
    return {
      price: card.basePrice,
      discountNote: `10 % de réduction vs ${separate} DT à l'unité`,
    };
  }

  if (SERVICES_WITH_DATE_RANGE.includes(type)) {
    const days = daySpanInclusive(date, endDate);
    return { price: days * card.basePrice };
  }

  return { price: card.basePrice };
};

export const getDefaultServiceSlots = (date) => {
  const base = new Date(`${date}T09:00:00`);
  return [9, 11, 14, 16].map((hour) => {
    const d = new Date(base);
    d.setHours(hour, 0, 0, 0);
    return { start: d.toISOString(), isAvailable: true };
  });
};
