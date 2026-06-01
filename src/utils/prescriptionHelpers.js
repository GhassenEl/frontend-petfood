/** Parse medications JSON/string from prescription or dossier entry. */
export const parseMedications = (raw) => {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
      if (parsed.vaccineType) {
        return [{ name: parsed.vaccineType, dosage: parsed.batchNumber || '', frequency: 'vaccin' }];
      }
      return [parsed];
    }
    return [{ name: String(raw), dosage: '', frequency: '' }];
  } catch {
    return [{ name: String(raw), dosage: '', frequency: '' }];
  }
};
