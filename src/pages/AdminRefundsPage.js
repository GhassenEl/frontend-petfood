import React, { useCallback, useEffect, useState } from 'react';
import { Banknote, Save, Ban, Shield } from 'lucide-react';
import {
  fetchAdminRefunds,
  fetchRefundPolicy,
  updateRefundPolicy,
  adminForceRefund,
  adminCancelTransaction,
  REFUND_STATUS_LABELS,
} from '../services/refundService';
import { REFUND_REASON_LABELS } from '../utils/refundDemoData';
import './AdminPages.css';

const AdminRefundsPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('history');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [refRes, polRes] = await Promise.all([fetchAdminRefunds(), fetchRefundPolicy()]);
    setRefunds(refRes.data.refunds || []);
    setPolicy(polRes.data || polRes);
    setDemo(refRes.demo || polRes.demo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setPol = (key, value) => setPolicy((p) => ({ ...p, [key]: value }));

  const savePolicy = async () => {
    const { data } = await updateRefundPolicy(policy);
    setPolicy(data);
    setMsg('Politique de retour & remboursement enregistrée.');
    setTimeout(() => setMsg(''), 3000);
  };

  const force = async (id) => {
    await adminForceRefund(id, note);
    setNote('');
    setSelected(null);
    setMsg('Remboursement forcé.');
    load();
  };

  const cancel = async (id) => {
    if (!window.confirm('Annuler définitivement cette transaction ?')) return;
    await adminCancelTransaction(id, note);
    setNote('');
    setSelected(null);
    setMsg('Transaction annulée.');
    load();
  };

  if (loading || !policy) {
    return <div className="adm-page"><p>Chargement…</p></div>;
  }

  return (
    <div className="adm-page" style={{ maxWidth: 1100 }}>
      <header className="adm-hero">
        <h1>
          <Banknote size={24} />
          Remboursements & politique globale
          {demo && <span className="adm-demo-pill">Mode démo</span>}
        </h1>
        <p>
          Droits administrateur : forcer un remboursement, annuler une transaction, consulter l&apos;historique
          et définir la politique appliquée à tous les acteurs.
        </p>
      </header>

      {msg && <p className="adm-msg">{msg}</p>}

      <div className="adm-tabs">
        <button type="button" className={`adm-tab ${tab === 'history' ? 'adm-tab--active' : ''}`} onClick={() => setTab('history')}>
          Historique ({refunds.length})
        </button>
        <button type="button" className={`adm-tab ${tab === 'policy' ? 'adm-tab--active' : ''}`} onClick={() => setTab('policy')}>
          <Shield size={14} /> Politique globale
        </button>
      </div>

      {tab === 'history' && (
        <div className="adm-card">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Commande</th><th>Client</th><th>Vendeur</th><th>Montant</th>
                <th>Motif</th><th>Statut</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((r) => (
                <tr key={r.id}>
                  <td>{r.orderId}</td>
                  <td>{r.clientName}</td>
                  <td>{r.vendorName}</td>
                  <td>{r.amount} DT</td>
                  <td style={{ fontSize: '0.82rem' }}>{REFUND_REASON_LABELS[r.reasonCategory] || r.reasonCategory}</td>
                  <td><span className="adm-badge adm-badge--active">{REFUND_STATUS_LABELS[r.status] || r.status}</span></td>
                  <td>
                    <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setSelected(r)}>Gérer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'policy' && (
        <>
          <div className="adm-card">
            <h2>Politique de retour & remboursement (plateforme)</h2>
            <div className="adm-form-grid">
              <label>
                Délai retour (jours)
                <input type="number" min="1" max="60" value={policy.returnWindowDays || 14} onChange={(e) => setPol('returnWindowDays', Number(e.target.value))} />
              </label>
              <label>
                Délai traitement remboursement (jours)
                <input type="number" min="1" max="30" value={policy.refundProcessingDays || 5} onChange={(e) => setPol('refundProcessingDays', Number(e.target.value))} />
              </label>
              <label>
                Escalade modérateur après (jours)
                <input type="number" min="1" max="14" value={policy.moderatorEscalationDays || 3} onChange={(e) => setPol('moderatorEscalationDays', Number(e.target.value))} />
              </label>
              <label>
                Seuil auto-remboursement (DT)
                <input type="number" min="0" value={policy.autoRefundThresholdDt || 50} onChange={(e) => setPol('autoRefundThresholdDt', Number(e.target.value))} />
              </label>
            </div>
            <div className="adm-toggle-group">
              <label className="adm-toggle">
                <input type="checkbox" checked={!!policy.requirePhotoEvidence} onChange={(e) => setPol('requirePhotoEvidence', e.target.checked)} />
                Preuve photo obligatoire pour les retours
              </label>
              <label className="adm-toggle">
                <input type="checkbox" checked={!!policy.partialRefundEnabled} onChange={(e) => setPol('partialRefundEnabled', e.target.checked)} />
                Remboursements partiels autorisés
              </label>
              <label className="adm-toggle">
                <input type="checkbox" checked={!!policy.allowChangedMind} onChange={(e) => setPol('allowChangedMind', e.target.checked)} />
                Accepter les retours « changement d&apos;avis »
              </label>
              <label className="adm-toggle">
                <input type="checkbox" checked={policy.vendorMustConfirmReceipt !== false} onChange={(e) => setPol('vendorMustConfirmReceipt', e.target.checked)} />
                Le vendeur doit confirmer la réception du produit
              </label>
            </div>
          </div>
          <div className="adm-card" style={{ marginTop: 16 }}>
            <h2>Retards de livraison</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>
              Cas sans retour physique — remboursement direct après validation vendeur ou modération.
            </p>
            <div className="adm-form-grid">
              <label>
                Tolérance avant réclamation (jours)
                <input type="number" min="0" max="14" value={policy.lateDeliveryGraceDays ?? 2} onChange={(e) => setPol('lateDeliveryGraceDays', Number(e.target.value))} />
              </label>
              <label>
                Retard maximum pris en charge (jours)
                <input type="number" min="3" max="90" value={policy.lateDeliveryMaxDays ?? 30} onChange={(e) => setPol('lateDeliveryMaxDays', Number(e.target.value))} />
              </label>
            </div>
            <label className="adm-toggle">
              <input type="checkbox" checked={policy.lateDeliveryAutoApprove !== false} onChange={(e) => setPol('lateDeliveryAutoApprove', e.target.checked)} />
              Validation automatique du remboursement (sans étape retour) quand le vendeur accepte
            </label>
          <button type="button" className="adm-btn adm-btn--primary" onClick={savePolicy}>
            <Save size={16} /> Appliquer la politique à toute la plateforme
          </button>
        </>
      )}

      {selected && (
        <div className="adm-card" style={{ marginTop: 16 }}>
          <h2>{selected.orderId} — actions admin</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {selected.clientName} / {selected.vendorName} · {selected.amount} DT · {REFUND_STATUS_LABELS[selected.status]}
          </p>
          <textarea
            rows={2}
            placeholder="Justification administrative…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #e2e8f0', margin: '12px 0', fontFamily: 'inherit' }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {!['refunded', 'admin_forced', 'cancelled'].includes(selected.status) && (
              <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => force(selected.id)}>
                <Banknote size={14} /> Forcer remboursement
              </button>
            )}
            {selected.status !== 'cancelled' && (
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => cancel(selected.id)}>
                <Ban size={14} /> Annuler transaction
              </button>
            )}
            <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setSelected(null)}>Fermer</button>
          </div>
          {selected.history?.length > 0 && (
            <ul style={{ marginTop: 14, padding: 0, listStyle: 'none', fontSize: '0.78rem', color: '#94a3b8' }}>
              {selected.history.map((h, i) => (
                <li key={i}>{new Date(h.at).toLocaleString('fr-FR')} — {h.actorRole} {h.actor} : {h.action}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRefundsPage;
