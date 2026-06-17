import React, { useEffect, useMemo, useState } from 'react';
import {
  fetchPharmacyCatalog,
  fetchMedicationRecommendations,
  applyRecommendationsToRows,
  calculateMedicationDose,
} from '../services/vetMedicationService';
import {
  emptyMedicationRow,
  FREQUENCY_OPTIONS,
  DURATION_OPTIONS,
} from '../utils/medications';
import { classifyMedicationStock } from '../utils/vetPharmacyAlerts';

const MedicationFormFields = ({
  medications,
  onChange,
  petWeightKg,
  animalType,
  diagnosis,
  showValidation = true,
}) => {
  const [catalog, setCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [doseLoading, setDoseLoading] = useState(null);

  const rows = medications?.length ? medications : [emptyMedicationRow()];

  useEffect(() => {
    fetchPharmacyCatalog()
      .then((data) => setCatalog(data || []))
      .catch(() => setCatalog([]))
      .finally(() => setLoadingCatalog(false));
  }, []);

  const catalogByName = useMemo(() => {
    const map = new Map();
    catalog.forEach((c) => map.set(c.name.toLowerCase(), c));
    return map;
  }, [catalog]);

  const updateRow = (index, field, value) => {
    const next = rows.map((row, i) => (i === index ? { ...row, [field]: value } : row));
    onChange(next);
  };

  const pickFromCatalog = (index, name) => {
    const item = catalogByName.get(name.toLowerCase());
    const treatment = item?.treatments?.[0];
    updateRow(index, 'name', name);
    if (item) {
      onChange(
        rows.map((row, i) =>
          i === index
            ? {
                ...row,
                name,
                medicationId: item.id,
                dosage: treatment?.defaultDosage || row.dosage,
                frequency: treatment?.defaultFrequency || row.frequency || '1×/jour',
                duration: treatment?.defaultDuration || row.duration || '7 jours',
                quantity: treatment?.defaultQuantity || row.quantity || 1,
              }
            : row
        )
      );
    }
  };

  const calculateDose = async (index) => {
    const row = rows[index];
    if (!row.name || !petWeightKg) {
      window.alert('Renseignez le médicament et le poids de l\'animal.');
      return;
    }
    setDoseLoading(index);
    try {
      const data = await calculateMedicationDose({
        medicationName: row.name,
        weightKg: Number(petWeightKg),
        animalType,
      });
      onChange(
        rows.map((r, i) =>
          i === index
            ? {
                ...r,
                dosage: data.dosage,
                frequency: data.frequency || r.frequency,
                duration: data.duration || r.duration,
                quantity: data.quantity ?? r.quantity,
              }
            : r
        )
      );
    } catch (err) {
      window.alert(err.message || 'Calcul impossible');
    } finally {
      setDoseLoading(null);
    }
  };

  const suggestFromDiagnosis = async () => {
    if (!diagnosis?.trim()) {
      window.alert('Saisissez d\'abord un diagnostic.');
      return;
    }
    try {
      const result = await fetchMedicationRecommendations({
        diagnosis,
        animalType,
        weightKg: petWeightKg,
      });
      if (!result.recommendations?.length) {
        window.alert('Aucun protocole trouvé pour ce diagnostic.');
        return;
      }
      onChange(applyRecommendationsToRows(result.recommendations.slice(0, 5)));
    } catch {
      window.alert('Erreur suggestion protocole');
    }
  };

  const addRow = () => onChange([...rows, emptyMedicationRow()]);
  const removeRow = (index) => {
    if (rows.length === 1) {
      onChange([emptyMedicationRow()]);
      return;
    }
    onChange(rows.filter((_, i) => i !== index));
  };

  const inputStyle = {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    fontSize: 14,
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <button type="button" onClick={suggestFromDiagnosis} style={suggestBtnStyle}>
          💡 Protocole depuis diagnostic (BI)
        </button>
        {loadingCatalog && <span style={{ fontSize: 12, color: '#94a3b8' }}>Chargement pharmacie…</span>}
        {petWeightKg ? (
          <span style={{ fontSize: 12, color: '#047857' }}>Poids patient : {petWeightKg} kg</span>
        ) : (
          <span style={{ fontSize: 12, color: '#b45309' }}>Poids non renseigné — calcul dose indisponible</span>
        )}
      </div>

      <datalist id="vet-med-catalog">
        {catalog.map((c) => (
          <option key={c.id} value={c.name}>
            {c.stockQty != null ? `Stock: ${c.stockQty}` : ''}
          </option>
        ))}
      </datalist>

      {rows.map((row, index) => {
        const cat = catalogByName.get((row.name || '').toLowerCase());
        const stockInfo = cat ? classifyMedicationStock(cat) : null;
        const rowBorder = stockInfo?.level === 'critical' ? '#fecaca' : stockInfo?.level === 'warning' ? '#fcd34d' : '#e5e7eb';
        const rowBg = stockInfo?.level === 'critical' ? '#fef2f2' : stockInfo?.level === 'warning' ? '#fffbeb' : '#f9fafb';
        return (
          <div
            key={index}
            style={{
              padding: 14,
              borderRadius: 12,
              border: `1px solid ${rowBorder}`,
              background: rowBg,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <strong style={{ fontSize: 13, color: '#374151' }}>Médicament {index + 1}</strong>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {stockInfo && stockInfo.status !== 'ok' && (
                  <span className={`vet-stock-badge vet-stock-badge--${stockInfo.level === 'critical' ? 'critical' : 'warning'}`}>
                    {stockInfo.label}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => calculateDose(index)}
                  disabled={doseLoading === index}
                  style={doseBtnStyle}
                >
                  {doseLoading === index ? '…' : '⚖️ Dose mg/kg'}
                </button>
                <button type="button" onClick={() => removeRow(index)} style={removeBtnStyle}>
                  Supprimer
                </button>
              </div>
            </div>

            {stockInfo && stockInfo.status !== 'ok' && (
              <p style={{ margin: '0 0 8px', fontSize: 12, color: stockInfo.level === 'critical' ? '#b91c1c' : '#b45309' }}>
                ⚠ {stockInfo.message}
              </p>
            )}

            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              <label style={labelStyle}>
                Nom * (pharmacie)
                <input
                  required={index === 0}
                  list="vet-med-catalog"
                  value={row.name}
                  onChange={(e) => updateRow(index, 'name', e.target.value)}
                  onBlur={(e) => {
                    if (catalogByName.has(e.target.value.toLowerCase())) {
                      pickFromCatalog(index, e.target.value);
                    }
                  }}
                  placeholder="Ex: Amoxicilline"
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Dosage *
                <input
                  value={row.dosage}
                  onChange={(e) => updateRow(index, 'dosage', e.target.value)}
                  placeholder="Ex: 250 mg"
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Fréquence *
                <select
                  value={FREQUENCY_OPTIONS.includes(row.frequency) ? row.frequency : ''}
                  onChange={(e) => updateRow(index, 'frequency', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">— Choisir —</option>
                  {FREQUENCY_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                  {row.frequency && !FREQUENCY_OPTIONS.includes(row.frequency) && (
                    <option value={row.frequency}>{row.frequency}</option>
                  )}
                </select>
              </label>
              <label style={labelStyle}>
                Durée *
                <select
                  value={DURATION_OPTIONS.includes(row.duration) ? row.duration : ''}
                  onChange={(e) => updateRow(index, 'duration', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">— Choisir —</option>
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>
              <label style={labelStyle}>
                Quantité
                <input
                  type="number"
                  min="1"
                  value={row.quantity ?? ''}
                  onChange={(e) => updateRow(index, 'quantity', e.target.value)}
                  placeholder="Ex: 14"
                  style={inputStyle}
                />
              </label>
            </div>
          </div>
        );
      })}

      <button type="button" onClick={addRow} style={addBtnStyle}>
        + Ajouter un médicament
      </button>

      {showValidation && !rows.some((r) => r.name?.trim() && r.dosage?.trim()) && (
        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
          Les champs dosage, fréquence et durée sont obligatoires pour chaque médicament prescrit.
        </p>
      )}
    </div>
  );
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 12,
  fontWeight: 600,
  color: '#4b5563',
};

const removeBtnStyle = {
  border: 'none',
  background: '#fee2e2',
  color: '#b91c1c',
  padding: '4px 10px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
};

const addBtnStyle = {
  alignSelf: 'flex-start',
  border: '1px dashed #0ea5e9',
  background: '#f0f9ff',
  color: '#0369a1',
  padding: '10px 16px',
  borderRadius: 10,
  cursor: 'pointer',
  fontWeight: 700,
};

const doseBtnStyle = {
  border: '1px solid #86efac',
  background: '#ecfdf5',
  color: '#047857',
  padding: '4px 10px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
};

const suggestBtnStyle = {
  border: '1px solid #c4b5fd',
  background: '#f5f3ff',
  color: '#6d28d9',
  padding: '8px 14px',
  borderRadius: 10,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 700,
};

export default MedicationFormFields;
