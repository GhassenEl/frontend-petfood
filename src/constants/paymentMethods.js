/** Méthodes de paiement client — alignées sur backend/utils/paymentMethods.js */
export const PAYMENT_METHODS = [
  { id: 'stripe', label: 'Stripe', emoji: '⚡', online: true },
  { id: 'paypal', label: 'PayPal', emoji: '🅿️', online: true },
  { id: 'card', label: 'Carte bancaire', emoji: '💳', online: true },
  { id: 'check', label: 'Chèque', emoji: '📄', online: false },
  { id: 'cash', label: 'Espèces', emoji: '💵', online: false },
  { id: 'transfer', label: 'Virement bancaire', emoji: '🏦', online: false },
  { id: 'pro_card', label: 'Carte professionnelle', emoji: '🏢', online: false },
];

export const PAYMENT_LABELS = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.id, m.label])
);

export const ONLINE_PAYMENT_IDS = PAYMENT_METHODS.filter((m) => m.online).map((m) => m.id);
export const STRIPE_CARD_IDS = ['stripe', 'card'];

export const getPaymentLabel = (id) => PAYMENT_LABELS[id] || id || 'Non précisé';

export const isStripeCardMethod = (id) => STRIPE_CARD_IDS.includes(id);

export const isOnlinePayment = (id) => ONLINE_PAYMENT_IDS.includes(id);

export const DEFAULT_BANK_TRANSFER = {
  beneficiary: 'PetfoodTN SARL',
  bank: 'BIAT Tunisie',
  rib: '08 012 000 1234567890 12',
  iban: 'TN59 0812 0001 2345 6789 0123',
  swift: 'BIATTNTT',
  currency: 'TND',
  referenceHint: 'Référence : votre numéro de commande ou facture',
};
