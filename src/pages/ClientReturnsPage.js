import React, { useState } from 'react';
import { RotateCcw, Clock } from 'lucide-react';
import { createClientRefundRequest } from '../services/refundService';
import { REFUND_REASON_LABELS } from '../utils/refundDemoData';

const REASONS = Object.entries(REFUND_REASON_LABELS);

const ClientReturnsPage = () => {
  const [form, setForm] = useState({
    orderId: '', productName: '', amount: '', reasonCategory: 'damaged', reason: '', delayDays: '',
  });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const isLateDelivery = form.reasonCategory === 'late_delivery';

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: result } = await createClientRefundRequest({
        ...form,
        amount: Number(form.amount) || 0,
        delayDays: isLateDelivery ? Number(form.delayDays) || 0 : undefined,
        clientName: 'Client',
      });
      if (result?.status === 'rejected') {
        setMsg('Demande refusée : le retard indiqué ne correspond pas à la politique plateforme (voir délai ci-dessous).');
      } else if (isLateDelivery) {
        setMsg('Demande enregistrée. Cas livraison tardive : remboursement sans retour du produit.');
      } else {
        setMsg('Demande de retour enregistrée. Le vendeur et le service client en sont informés.');
      }
      setForm({ orderId: '', productName: '', amount: '', reasonCategory: 'damaged', reason: '', delayDays: '' });
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

      {msg && (
        <p style={{
          padding: 12,
          borderRadius: 10,
          background: msg.includes('refusée') ? '#fef2f2' : '#dcfce7',
          color: msg.includes('refusée') ? '#b91c1c' : '#166534',
          marginBottom: 16,
        }}
        >
          {msg}
        </p>
      )}

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

        {isLateDelivery && (
          <div style={{ marginBottom: 12, padding: 14, borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a' }}>
            <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} />
              <strong>Livraison tardive</strong> — remboursement sans retour du colis (produit reçu en retard ou non reçu).
            </p>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>
              Retard constaté (jours après la date prévue)
              <input
                type="number"
                min="1"
                max="60"
                required
                value={form.delayDays}
                onChange={(e) => setForm({ ...form, delayDays: e.target.value })}
                style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
                placeholder="Ex. 5"
              />
            </label>
            <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#a16207' }}>
              Éligible si retard &gt; 2 jours (politique plateforme). Indiquez la date prévue et la date réelle dans les détails.
            </p>
          </div>
        )}

        <label style={{ display: 'block', marginBottom: 16, fontSize: '0.85rem', fontWeight: 600 }}>
          Détails
          <textarea
            required
            rows={3}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder={isLateDelivery ? 'Ex. : commande du 01/06, livraison prévue 03/06, reçue le 10/06…' : 'Décrivez le problème…'}
            style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0', fontFamily: 'inherit' }}
          />
        </label>
        <button type="submit" disabled={saving} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#2563eb', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
          {saving ? 'Envoi…' : 'Soumettre la demande'}
        </button>
      </form>
    </div>
  );
};

export default ClientReturnsPage;
