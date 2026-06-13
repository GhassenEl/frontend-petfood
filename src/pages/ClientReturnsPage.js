import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { createClientRefundRequest } from '../services/refundService';
import { REFUND_REASON_LABELS } from '../utils/refundDemoData';

const REASONS = Object.entries(REFUND_REASON_LABELS);

const ClientReturnsPage = () => {
  const [form, setForm] = useState({
    orderId: '', productName: '', amount: '', reasonCategory: 'damaged', reason: '',
  });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createClientRefundRequest({
        ...form,
        amount: Number(form.amount) || 0,
        clientName: 'Client',
      });
      setMsg('Demande de retour enregistrée. Le vendeur et le service client en sont informés.');
      setForm({ orderId: '', productName: '', amount: '', reasonCategory: 'damaged', reason: '' });
    } catch (err) {
      setMsg(`Erreur : ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 560, margin: '0 auto' }}>
      <header style={{ marginBottom: 20, padding: 20, borderRadius: 16, background: 'linear-gradient(135deg,#eff6ff,#dbeafe)' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <RotateCcw size={22} /> Demande de retour / remboursement
        </h1>
        <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Votre demande sera traitée par le vendeur. En cas de litige, le modérateur ou le service client interviendra.
        </p>
      </header>

      {msg && <p style={{ padding: 12, borderRadius: 10, background: '#dcfce7', color: '#166534', marginBottom: 16 }}>{msg}</p>}

      <form onSubmit={submit} style={{ background: 'white', padding: 20, borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <label style={{ display: 'block', marginBottom: 12, fontSize: '0.85rem', fontWeight: 600 }}>
          N° commande
          <input required value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }} placeholder="CMD-XXXX" />
        </label>
        <label style={{ display: 'block', marginBottom: 12, fontSize: '0.85rem', fontWeight: 600 }}>
          Produit
          <input required value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }} />
        </label>
        <label style={{ display: 'block', marginBottom: 12, fontSize: '0.85rem', fontWeight: 600 }}>
          Montant (DT)
          <input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }} />
        </label>
        <label style={{ display: 'block', marginBottom: 12, fontSize: '0.85rem', fontWeight: 600 }}>
          Motif
          <select value={form.reasonCategory} onChange={(e) => setForm({ ...form, reasonCategory: e.target.value })} style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            {REASONS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label style={{ display: 'block', marginBottom: 16, fontSize: '0.85rem', fontWeight: 600 }}>
          Détails
          <textarea required rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0', fontFamily: 'inherit' }} />
        </label>
        <button type="submit" disabled={saving} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#2563eb', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
          {saving ? 'Envoi…' : 'Soumettre la demande'}
        </button>
      </form>
    </div>
  );
};

export default ClientReturnsPage;
