/** Formate un montant en dinars tunisiens (DT). */
export const formatDT = (value, { decimals = 2 } = {}) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return `0${decimals ? ',00' : ''} DT`;
  return `${n.toLocaleString('fr-TN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} DT`;
};
