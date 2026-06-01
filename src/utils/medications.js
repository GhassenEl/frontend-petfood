export const FREQUENCY_OPTIONS = [
  '1×/jour',
  '2×/jour',
  '1×/12h',
  '2×/12h',
  '1×/semaine',
  'Au besoin',
];

export const DURATION_OPTIONS = [
  '3 jours',
  '5 jours',
  '7 jours',
  '10 jours',
  '14 jours',
  '21 jours',
  '30 jours',
];

export const emptyMedicationRow = () => ({
  name: '',
  medicationId: '',
  dosage: '',
  frequency: '',
  duration: '',
  quantity: '',
  unit: 'mg',
});

export const parseMedications = (meds) => {
  if (!meds) return [];
  if (Array.isArray(meds)) return meds;
  if (typeof meds === 'string') {
    try {
      const parsed = JSON.parse(meds);
      return Array.isArray(parsed) ? parsed : [{ name: meds }];
    } catch {
      return [{ name: meds }];
    }
  }
  return [];
};

export const serializeMedications = (rows) =>
  rows
    .map((row) => ({
      name: (row.name || '').trim(),
      medicationId: row.medicationId || undefined,
      dosage: (row.dosage || '').trim(),
      frequency: (row.frequency || '').trim(),
      duration: (row.duration || '').trim(),
      quantity: row.quantity === '' || row.quantity == null ? undefined : Number(row.quantity) || 1,
      unit: row.unit || 'mg',
    }))
    .filter((row) => row.name);

export const validateMedications = (rows) => {
  const errors = [];
  rows.forEach((row, i) => {
    if (!row.name?.trim()) return;
    if (!row.dosage?.trim()) errors.push(`Médicament ${i + 1} : dosage requis`);
    if (!row.frequency?.trim()) errors.push(`Médicament ${i + 1} : fréquence requise`);
    if (!row.duration?.trim()) errors.push(`Médicament ${i + 1} : durée requise`);
    const qty = Number(row.quantity);
    if (row.quantity !== '' && row.quantity != null && (!Number.isFinite(qty) || qty < 1)) {
      errors.push(`Médicament ${i + 1} : quantité invalide`);
    }
  });
  return errors;
};

export const formatMedicationLine = (med) => {
  const parts = [med.name];
  if (med.dosage) parts.push(med.dosage);
  if (med.frequency) parts.push(med.frequency);
  if (med.duration) parts.push(`pendant ${med.duration}`);
  if (med.quantity != null && med.quantity !== '') parts.push(`qté ${med.quantity}`);
  return parts.join(' · ');
};

/** Schéma visuel matin / midi / soir pour le client */
export const buildMedicationSchedule = (med) => {
  const freq = (med.frequency || '').toLowerCase();
  const slots = { matin: false, midi: false, soir: false };
  if (freq.includes('2×') || freq.includes('2x') || freq.includes('12h')) {
    slots.matin = true;
    slots.soir = true;
  } else if (freq.includes('3×') || freq.includes('3x')) {
    slots.matin = true;
    slots.midi = true;
    slots.soir = true;
  } else if (freq.includes('1×') || freq.includes('1x') || freq.includes('jour')) {
    slots.matin = true;
  } else if (freq.includes('besoin')) {
    return { label: 'Au besoin', slots: null };
  }
  return { label: med.frequency || '—', slots };
};
