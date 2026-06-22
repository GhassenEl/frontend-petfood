/**
 * Masquage affichage données sensibles (téléphone, adresse).
 * Le chiffrement AES-256 au repos est assuré côté API / base.
 */

export function maskPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 4) return '••••';
  return `••• ${digits.slice(-4)}`;
}

export function maskEmail(email) {
  const value = String(email || '').trim();
  const [local, domain] = value.split('@');
  if (!local || !domain) return '•••';
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}•••@${domain}`;
}

export function maskAddress(address) {
  const value = String(address || '').trim();
  if (value.length <= 8) return '••••••••';
  return `${value.slice(0, 6)}••• ${value.slice(-4)}`;
}

export const SENSITIVE_FIELD_LABELS = {
  phone: 'Téléphone (masqué)',
  address: 'Adresse (masquée)',
  delivery: 'Livraison (chiffrée AES-256)',
};

export default { maskPhone, maskEmail, maskAddress };
