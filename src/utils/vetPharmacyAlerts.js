/** Classification stock pharmacie vétérinaire — rupture, stock bas, péremption. */

export const STOCK_STATUS = {
  OK: 'ok',
  LOW: 'stock_bas',
  OUT: 'rupture',
  EXPIRED: 'perime',
  EXPIRING: 'peremption',
};

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
};

export const classifyMedicationStock = (med = {}) => {
  const stockQty = Number(med.stockQty ?? 0);
  const minStock = Number(med.minStock ?? 5);
  const expiryDays = daysUntil(med.expiryDate);

  if (expiryDays != null && expiryDays <= 0) {
    return {
      status: STOCK_STATUS.EXPIRED,
      level: 'critical',
      label: 'Périmé',
      message: `${med.name} — lot périmé`,
    };
  }
  if (stockQty <= 0) {
    return {
      status: STOCK_STATUS.OUT,
      level: 'critical',
      label: 'Rupture',
      message: `${med.name} — rupture de stock`,
    };
  }
  if (expiryDays != null && expiryDays <= 30) {
    return {
      status: STOCK_STATUS.EXPIRING,
      level: 'warning',
      label: 'Péremption proche',
      message: `${med.name} — expire dans ${expiryDays} j`,
    };
  }
  if (stockQty < minStock || med.lowStock) {
    return {
      status: STOCK_STATUS.LOW,
      level: 'warning',
      label: 'Stock bas',
      message: `${med.name} — ${stockQty} ${med.unit || 'u.'} (min ${minStock})`,
    };
  }
  return {
    status: STOCK_STATUS.OK,
    level: 'info',
    label: 'Disponible',
    message: `${med.name} — stock OK`,
  };
};

export const buildPharmacyAlerts = (medications = []) =>
  medications
    .map((med) => {
      const classification = classifyMedicationStock(med);
      if (classification.status === STOCK_STATUS.OK) return null;
      return {
        id: med.id || med.name,
        medicationId: med.id,
        name: med.name,
        stockQty: med.stockQty,
        minStock: med.minStock,
        unit: med.unit,
        location: med.location || med.pharmacy,
        expiryDate: med.expiryDate,
        link: '/vet/pharmacy',
        ...classification,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return (order[a.level] ?? 9) - (order[b.level] ?? 9);
    });

export const summarizePharmacyStock = (medications = []) => {
  const alerts = buildPharmacyAlerts(medications);
  return {
    total: medications.length,
    ruptures: alerts.filter((a) => a.status === STOCK_STATUS.OUT).length,
    lowStock: alerts.filter((a) => a.status === STOCK_STATUS.LOW).length,
    expiry: alerts.filter((a) => [STOCK_STATUS.EXPIRED, STOCK_STATUS.EXPIRING].includes(a.status)).length,
    alerts,
  };
};

export const findCatalogItem = (catalog, nameOrId) => {
  if (!nameOrId) return null;
  const key = String(nameOrId).toLowerCase();
  return (
    catalog.find((c) => c.id === nameOrId) ||
    catalog.find((c) => (c.name || '').toLowerCase() === key) ||
    null
  );
};

/** Vérifie si une ordonnance peut être honorée avec le stock actuel. */
export const checkPrescriptionStock = (prescriptionMeds = [], catalog = []) => {
  const warnings = [];
  const meds = Array.isArray(prescriptionMeds) ? prescriptionMeds : [];

  meds.forEach((med) => {
    const name = (med.name || '').trim();
    if (!name) return;
    const item = findCatalogItem(catalog, med.medicationId || name);
    if (!item) {
      warnings.push({
        level: 'warning',
        status: 'absent',
        name,
        message: `${name} — absent du catalogue pharmacie`,
      });
      return;
    }
    const classification = classifyMedicationStock(item);
    const qtyNeeded = Number(med.quantity) || 1;
    if (classification.status === STOCK_STATUS.OUT) {
      warnings.push({
        level: 'critical',
        status: STOCK_STATUS.OUT,
        name,
        medicationId: item.id,
        message: `${name} — rupture (besoin ~${qtyNeeded} ${item.unit || 'u.'})`,
      });
    } else if (Number(item.stockQty) < qtyNeeded) {
      warnings.push({
        level: 'critical',
        status: STOCK_STATUS.OUT,
        name,
        medicationId: item.id,
        message: `${name} — stock insuffisant (${item.stockQty}/${qtyNeeded} ${item.unit || 'u.'})`,
      });
    } else if (classification.status !== STOCK_STATUS.OK) {
      warnings.push({
        level: classification.level,
        status: classification.status,
        name,
        medicationId: item.id,
        message: classification.message,
      });
    }
  });

  return {
    ok: warnings.filter((w) => w.level === 'critical').length === 0,
    warnings,
  };
};
