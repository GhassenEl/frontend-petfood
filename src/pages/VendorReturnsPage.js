import React, { useCallback, useEffect, useState } from 'react';
import { RotateCcw, Check, X, Package, Banknote } from 'lucide-react';
import {
  fetchVendorRefunds,
  vendorApproveRefund,
  vendorRejectRefund,
  vendorConfirmReturnReceived,
  vendorValidateRefund,
  vendorMarkRefunded,
  REFUND_STATUS_LABELS,
} from '../services/refundService';
import { REFUND_REASON_LABELS } from '../utils/refundDemoData';
import './VendorPages.css';

const VendorReturnsPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [selected, setSelected] = useState(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchVendorRefunds();
    setRefunds(data.refunds || []);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (fn, id) => {
    await fn(id, note);
    setNote('');
    setSelected(null);
    load();
  };

  const statusClass = (s) => {
    if (['pending', 'awaiting_return'].includes(s)) return 'pending';
    if (['rejected', 'fraud_flagged', 'cancelled'].includes(s)) return 'rejected';
    if (s === 'refunded' || s === 'admin_forced') return 'refunded';
    return 'approved';
  };

  return (
    <div className="vnd-page">
      <header className="vnd-hero">
        <h1><RotateCcw size={24} /> Remboursements & retours {demo && <span className="vnd-demo-pill">Mode démo</span>}</h1>
        <p>
          En tant que vendeur : accepter/refuser, vérifier le motif, confirmer la réception du produit et valider le remboursement.
        </p>
      </header>

      <div className="vnd-card">
        {loading ? <p className="vnd-empty">Chargement…</p> : refunds.length === 0 ? (
          <p className="vnd-empty">Aucune demande de remboursement.</p>
        ) : (
          <table className="vnd-table">
            <thead>
              <tr>
                <th>Commande</th><th>Client</th><th>Produit</th><th>Montant</th>
                <th>Motif</th><th>Statut</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((r) => (
                <tr key={r.id}>
                  <td>{r.orderId}</td>
                  <td>{r.clientName}</td>
                  <td>{r.productName}</td>
                  <td>{r.amount} DT</td>
                  <td style={{ maxWidth: 180, fontSize: '0.82rem' }}>
                    {REFUND_REASON_LABELS[r.reasonCategory] || r.reasonCategory}
                    <br /><small>{r.reason}</small>
                  </td>
                  <td>
                    <span className={`vnd-badge vnd-badge--${statusClass(r.status)}`}>
                      {REFUND_STATUS_LABELS[r.status] || r.status}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="vnd-btn vnd-btn--ghost vnd-btn--sm" onClick={() => setSelected(r)}>
                      Détail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="vnd-card" style={{ marginTop: 16 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1rem' }}>{selected.orderId} — {selected.productName}</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 12px' }}>
            Client : {selected.clientName} · {selected.amount} DT
            {selected.fraudScore > 0.7 && <span style={{ color: '#dc2626', marginLeft: 8 }}>⚠️ Score fraude {(selected.fraudScore * 100).toFixed(0)} %</span>}
          </p>
          <textarea
            rows={2}
            placeholder="Note interne (optionnel)…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 12, fontFamily: 'inherit' }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {selected.status === 'pending' && (
              <>
                <button type="button" className="vnd-btn vnd-btn--primary vnd-btn--sm" onClick={() => act(vendorApproveRefund, selected.id)}>
                  <Check size={14} /> Accepter la demande
                </button>
                <button type="button" className="vnd-btn vnd-btn--danger vnd-btn--sm" onClick={() => act(vendorRejectRefund, selected.id)}>
                  <X size={14} /> Refuser
                </button>
              </>
            )}
            {['awaiting_return', 'approved'].includes(selected.status) && !selected.returnReceived && (
              <button type="button" className="vnd-btn vnd-btn--primary vnd-btn--sm" onClick={() => act(vendorConfirmReturnReceived, selected.id)}>
                <Package size={14} /> Confirmer réception produit
              </button>
            )}
            {selected.status === 'return_received' && (
              <button type="button" className="vnd-btn vnd-btn--primary vnd-btn--sm" onClick={() => act(vendorValidateRefund, selected.id)}>
                <Check size={14} /> Valider le remboursement
              </button>
            )}
            {selected.status === 'refund_validated' && (
              <button type="button" className="vnd-btn vnd-btn--primary vnd-btn--sm" onClick={() => act(vendorMarkRefunded, selected.id)}>
                <Banknote size={14} /> Marquer remboursé
              </button>
            )}
            {['disputed', 'fraud_flagged', 'moderator_review'].includes(selected.status) && (
              <p style={{ fontSize: '0.85rem', color: '#b45309' }}>Dossier en cours de modération — action vendeur suspendue.</p>
            )}
            <button type="button" className="vnd-btn vnd-btn--ghost vnd-btn--sm" onClick={() => setSelected(null)}>Fermer</button>
          </div>
          {selected.history?.length > 0 && (
            <ul style={{ marginTop: 16, padding: 0, listStyle: 'none', fontSize: '0.8rem', color: '#64748b' }}>
              {selected.history.map((h, i) => (
                <li key={i} style={{ padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                  {new Date(h.at).toLocaleString('fr-FR')} — <strong>{h.actor}</strong> ({h.action})
                  {h.note && ` : ${h.note}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorReturnsPage;
