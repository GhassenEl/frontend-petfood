import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, RefreshCw } from 'lucide-react';
import {
  adjustVetMedicationStock,
  createVetMedication,
  fetchVetPharmacyAlerts,
  fetchVetPharmacyCatalog,
  fetchVetPharmacyMovements,
  updateVetMedicationThresholds,
} from '../services/vetPharmacyService';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import {
  DEMO_VET_PHARMACY_ALERTS,
  DEMO_VET_PHARMACY_MEDS,
  withDemoFallback,
} from '../utils/vetDemoData';

const emptyForm = () => ({
  name: '',
  unit: 'comprimé',
  stockQty: '',
  minStock: '5',
  location: 'Stock clinique',
});

const VetPharmacyPage = () => {
  const [medications, setMedications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm());
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ adjustment: '', reason: '' });
  const [thresholdTarget, setThresholdTarget] = useState(null);
  const [thresholdForm, setThresholdForm] = useState({
    minStock: '',
    unit: '',
    location: '',
  });

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [meds, al, mv] = await Promise.all([
        fetchVetPharmacyCatalog(),
        fetchVetPharmacyAlerts(),
        fetchVetPharmacyMovements(20).catch(() => []),
      ]);
      setMedications(withDemoFallback(meds, DEMO_VET_PHARMACY_MEDS));
      setAlerts(withDemoFallback(al, DEMO_VET_PHARMACY_ALERTS));
      setMovements(Array.isArray(mv) ? mv : []);
    } catch {
      setMedications(DEMO_VET_PHARMACY_MEDS);
      setAlerts(DEMO_VET_PHARMACY_ALERTS);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(() => load(true));

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!addForm.name.trim()) {
      window.alert('Nom du médicament requis');
      return;
    }
    setBusy(true);
    try {
      await createVetMedication({
        name: addForm.name.trim(),
        unit: addForm.unit.trim() || 'unité',
        stockQty: Number(addForm.stockQty) || 0,
        minStock: Number(addForm.minStock) || 5,
        location: addForm.location.trim() || 'Stock clinique',
      });
      setShowAdd(false);
      setAddForm(emptyForm());
      await load(true);
    } catch (error) {
      window.alert(error.response?.data?.error || 'Impossible d\'ajouter le médicament');
    } finally {
      setBusy(false);
    }
  };

  const handleAdjust = async (event) => {
    event.preventDefault();
    const adjustment = Number(adjustForm.adjustment);
    if (!adjustTarget || !Number.isFinite(adjustment) || adjustment === 0) {
      window.alert('Entrez un ajustement différent de 0');
      return;
    }
    setBusy(true);
    try {
      await adjustVetMedicationStock(adjustTarget.id, {
        adjustment,
        reason: adjustForm.reason.trim() || undefined,
      });
      setAdjustTarget(null);
      setAdjustForm({ adjustment: '', reason: '' });
      await load(true);
    } catch (error) {
      window.alert(error.response?.data?.error || 'Ajustement impossible');
    } finally {
      setBusy(false);
    }
  };

  const handleThresholds = async (event) => {
    event.preventDefault();
    if (!thresholdTarget) return;
    setBusy(true);
    try {
      await updateVetMedicationThresholds(thresholdTarget.id, {
        minStock: thresholdForm.minStock !== '' ? Number(thresholdForm.minStock) : undefined,
        unit: thresholdForm.unit.trim() || undefined,
        location: thresholdForm.location.trim() || undefined,
      });
      setThresholdTarget(null);
      await load(true);
    } catch (error) {
      window.alert(error.response?.data?.error || 'Mise à jour impossible');
    } finally {
      setBusy(false);
    }
  };

  const openAdjust = (med) => {
    setAdjustTarget(med);
    setAdjustForm({ adjustment: '', reason: '' });
  };

  const openThresholds = (med) => {
    setThresholdTarget(med);
    setThresholdForm({
      minStock: String(med.minStock ?? ''),
      unit: med.unit || '',
      location: med.location || med.pharmacy || 'Stock clinique',
    });
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement pharmacie…</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0 }}>💊 Pharmacie clinique</h1>
          <p style={{ color: '#64748b', margin: '8px 0 0' }}>
            Gestion du stock, alertes et catalogue ordonnances.{' '}
            <Link to="/vet/bi" style={{ color: '#0ea5e9' }}>Dashboard BI →</Link>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => load(true)} style={btnGhost} disabled={busy}>
            <RefreshCw size={16} /> Actualiser
          </button>
          <button type="button" onClick={() => setShowAdd((v) => !v)} style={btnPrimary} disabled={busy}>
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} style={panelStyle}>
          <strong>Nouveau médicament</strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginTop: 12 }}>
            <input required placeholder="Nom *" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} style={inputStyle} />
            <input placeholder="Unité" value={addForm.unit} onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })} style={inputStyle} />
            <input type="number" min="0" placeholder="Stock initial" value={addForm.stockQty} onChange={(e) => setAddForm({ ...addForm, stockQty: e.target.value })} style={inputStyle} />
            <input type="number" min="0" placeholder="Stock minimum" value={addForm.minStock} onChange={(e) => setAddForm({ ...addForm, minStock: e.target.value })} style={inputStyle} />
            <input placeholder="Emplacement" value={addForm.location} onChange={(e) => setAddForm({ ...addForm, location: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button type="submit" style={btnPrimary} disabled={busy}>Enregistrer</button>
            <button type="button" style={btnGhost} onClick={() => setShowAdd(false)}>Annuler</button>
          </div>
        </form>
      )}

      {alerts.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <strong style={{ color: '#b45309' }}>⚠ Alertes stock ({alerts.length})</strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
            {alerts.map((a) => (
              <li key={a.id || a.name} style={{ fontSize: 14 }}>
                {a.name} — {a.stockQty} {a.unit} (minimum {a.minStock})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ overflowX: 'auto', background: 'white', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: 12 }}>Médicament</th>
              <th style={{ padding: 12 }}>Stock</th>
              <th style={{ padding: 12 }}>Min</th>
              <th style={{ padding: 12 }}>Unité</th>
              <th style={{ padding: 12 }}>Emplacement</th>
              <th style={{ padding: 12 }}>Protocoles BI</th>
              <th style={{ padding: 12 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {medications.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #f3f4f6', background: m.lowStock ? '#fffbeb' : 'transparent' }}>
                <td style={{ padding: 12 }}><strong>{m.name}</strong></td>
                <td style={{ padding: 12, color: m.lowStock ? '#b45309' : '#059669', fontWeight: 700 }}>{m.stockQty}</td>
                <td style={{ padding: 12 }}>{m.minStock}</td>
                <td style={{ padding: 12 }}>{m.unit}</td>
                <td style={{ padding: 12 }}>{m.location || m.pharmacy || 'Stock clinique'}</td>
                <td style={{ padding: 12, fontSize: 12, color: '#64748b' }}>
                  {(m.treatments || []).map((t) => t.disease).filter(Boolean).join(', ') || '—'}
                </td>
                <td style={{ padding: 12 }}>
                  <button type="button" onClick={() => openAdjust(m)} style={btnSmall}>Stock</button>
                  <button type="button" onClick={() => openThresholds(m)} style={{ ...btnSmall, marginLeft: 6 }}>
                    <Pencil size={12} style={{ verticalAlign: 'middle' }} /> Seuils
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {movements.length > 0 && (
        <div style={panelStyle}>
          <strong>Mouvements récents</strong>
          <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 13, color: '#475569' }}>
            {movements.map((mv) => (
              <li key={mv.id}>
                {new Date(mv.date).toLocaleString('fr-FR')} — {mv.medicationName}: {mv.qty > 0 ? '+' : ''}{mv.qty} ({mv.reason})
              </li>
            ))}
          </ul>
        </div>
      )}

      {adjustTarget && (
        <div style={overlayStyle}>
          <form onSubmit={handleAdjust} style={modalStyle}>
            <h3 style={{ marginTop: 0 }}>Ajuster le stock — {adjustTarget.name}</h3>
            <p style={{ color: '#64748b', fontSize: 14 }}>Stock actuel : {adjustTarget.stockQty} {adjustTarget.unit}</p>
            <input type="number" required placeholder="Ajustement (+/-)" value={adjustForm.adjustment} onChange={(e) => setAdjustForm({ ...adjustForm, adjustment: e.target.value })} style={{ ...inputStyle, width: '100%', marginBottom: 10 }} />
            <input placeholder="Motif (optionnel)" value={adjustForm.reason} onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} style={{ ...inputStyle, width: '100%', marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={btnPrimary} disabled={busy}>Valider</button>
              <button type="button" style={btnGhost} onClick={() => setAdjustTarget(null)}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {thresholdTarget && (
        <div style={overlayStyle}>
          <form onSubmit={handleThresholds} style={modalStyle}>
            <h3 style={{ marginTop: 0 }}>Seuils — {thresholdTarget.name}</h3>
            <input type="number" min="0" placeholder="Stock minimum" value={thresholdForm.minStock} onChange={(e) => setThresholdForm({ ...thresholdForm, minStock: e.target.value })} style={{ ...inputStyle, width: '100%', marginBottom: 10 }} />
            <input placeholder="Unité" value={thresholdForm.unit} onChange={(e) => setThresholdForm({ ...thresholdForm, unit: e.target.value })} style={{ ...inputStyle, width: '100%', marginBottom: 10 }} />
            <input placeholder="Emplacement" value={thresholdForm.location} onChange={(e) => setThresholdForm({ ...thresholdForm, location: e.target.value })} style={{ ...inputStyle, width: '100%', marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={btnPrimary} disabled={busy}>Enregistrer</button>
              <button type="button" style={btnGhost} onClick={() => setThresholdTarget(null)}>Annuler</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const panelStyle = {
  background: 'white',
  borderRadius: 14,
  border: '1px solid #e5e7eb',
  padding: 16,
  marginBottom: 20,
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  fontSize: 14,
};

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 16px',
  borderRadius: 10,
  border: 'none',
  background: '#0ea5e9',
  color: 'white',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnGhost = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 16px',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  background: 'white',
  color: '#334155',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnSmall = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: 12,
  cursor: 'pointer',
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15,23,42,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 16,
};

const modalStyle = {
  background: 'white',
  borderRadius: 16,
  padding: 24,
  width: '100%',
  maxWidth: 420,
  boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
};

export default VetPharmacyPage;
