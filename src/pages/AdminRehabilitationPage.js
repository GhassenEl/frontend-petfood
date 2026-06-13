import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, PlusCircle } from 'lucide-react';
import {
  fetchRehabOverview,
  logRehabTreatment,
} from '../services/ecosystemService';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
};

const AdminRehabilitationPage = () => {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    programId: '',
    treatmentType: 'behavior',
    title: '',
    notes: '',
    progressDelta: 5,
  });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await fetchRehabOverview());
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      await logRehabTreatment(form);
      setMsg('Traitement enregistré — progression mise à jour.');
      setForm({ ...form, title: '', notes: '' });
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Erreur (réservé admin/vétérinaire)');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #7c2d12, #ea580c)',
          color: '#fff',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
          <Heart size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Réhabilitation refuges
        </h1>
        <p style={{ margin: '8px 0 0', opacity: 0.9 }}>
          Enregistrer soins et traitements pour animaux abandonnés / effrayés (admin & vétérinaire).
        </p>
      </motion.div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Programmes actifs</h3>
        {(data?.programs || []).map((p) => (
          <div key={p.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
            <strong>{p.animal?.name}</strong> — {p.progressPercent}% — {p.phaseLabel}
            <button
              type="button"
              style={{ marginLeft: 12, fontSize: 12 }}
              onClick={() => setForm({ ...form, programId: p.id })}
            >
              Sélectionner
            </button>
          </div>
        ))}
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <PlusCircle size={18} /> Nouveau traitement
        </h3>
        <form onSubmit={submit}>
          <label style={label}>Programme (ID)</label>
          <input style={input} value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })} required />
          <label style={label}>Type</label>
          <select style={input} value={form.treatmentType} onChange={(e) => setForm({ ...form, treatmentType: e.target.value })}>
            {(data?.treatmentTypes || []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.label}
              </option>
            ))}
          </select>
          <label style={label}>Titre</label>
          <input style={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <label style={label}>Notes</label>
          <textarea style={input} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <label style={label}>Gain progression (%)</label>
          <input
            type="number"
            min={1}
            max={15}
            style={input}
            value={form.progressDelta}
            onChange={(e) => setForm({ ...form, progressDelta: Number(e.target.value) })}
          />
          <button type="submit" disabled={busy} style={btn}>
            Enregistrer le traitement
          </button>
        </form>
        {msg && <p style={{ marginTop: 12, color: '#059669' }}>{msg}</p>}
      </div>
    </div>
  );
};

const label = { display: 'block', fontSize: 13, fontWeight: 600, margin: '10px 0 4px' };
const input = { width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' };
const btn = {
  marginTop: 16,
  padding: '12px 20px',
  background: '#ea580c',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer',
};

export default AdminRehabilitationPage;
