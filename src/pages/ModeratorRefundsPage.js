import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, ShieldAlert, Check, X, ArrowUpRight } from 'lucide-react';
import {
  fetchModeratorRefunds,
  moderatorResolveRefund,
  moderatorFlagRefundFraud,
  REFUND_STATUS_LABELS,
} from '../services/refundService';
import { REFUND_REASON_LABELS, isNoReturnRefund } from '../utils/refundDemoData';
import './ModeratorPages.css';

const ModeratorRefundsPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [selected, setSelected] = useState(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchModeratorRefunds();
    setRefunds(data.refunds || []);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (fn, id, ...args) => {
    await fn(id, ...args, note);
    setNote('');
    setSelected(null);
    setMsg('Décision enregistrée.');
    load();
  };

  const open = refunds.filter((r) => !['refunded', 'moderator_resolved', 'admin_forced', 'cancelled'].includes(r.status));

  return (
    <div className="mod-page">
      <header className="mod-hero">
        <h1><Scale size={24} /> Litiges & remboursements {demo && <span className="mod-demo-pill">Mode démo</span>}</h1>
        <p>
          Intervenir en cas de litige client/vendeur, réclamation, contestation ou suspicion de fraude.
          La politique globale est définie par l&apos;administrateur.
        </p>
      </header>

      {msg && <p className="mod-badge mod-badge--approved" style={{ marginBottom: 12 }}>{msg}</p>}

      <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to="/moderator/complaints" className="mod-btn mod-btn--ghost mod-btn--sm">Réclamations clients →</Link>
        <Link to="/moderator/reports" className="mod-btn mod-btn--ghost mod-btn--sm">Autres signalements →</Link>
      </div>

      <div className="mod-card">
        {loading ? <p className="mod-empty">Chargement…</p> : open.length === 0 ? (
          <p className="mod-empty">Aucun litige remboursement ouvert.</p>
        ) : (
          <table className="mod-table">
            <thead>
              <tr>
                <th>Commande</th><th>Client / Vendeur</th><th>Motif</th><th>Montant</th>
                <th>Fraude</th><th>Statut</th><th></th>
              </tr>
            </thead>
            <tbody>
              {open.map((r) => (
                <tr key={r.id}>
                  <td>{r.orderId}</td>
                  <td>{r.clientName}<br /><small>{r.vendorName}</small></td>
                  <td style={{ maxWidth: 160, fontSize: '0.82rem' }}>
                    {REFUND_REASON_LABELS[r.reasonCategory] || r.reason}
                    {(r.noReturnRequired || isNoReturnRefund(r.reasonCategory)) && (
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#b45309' }}>Retard — sans retour</span>
                    )}
                    {r.delayDays > 0 && (
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8' }}>{r.delayDays} j de retard</span>
                    )}
                  </td>
                  <td>{r.amount} DT</td>
                  <td style={{ color: r.fraudScore > 0.7 ? '#dc2626' : '#64748b' }}>
                    {(r.fraudScore * 100).toFixed(0)} %
                  </td>
                  <td><span className="mod-badge mod-badge--open">{REFUND_STATUS_LABELS[r.status] || r.status}</span></td>
                  <td>
                    <button type="button" className="mod-btn mod-btn--ghost mod-btn--sm" onClick={() => setSelected(r)}>Traiter</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="mod-card">
          <h2 style={{ margin: '0 0 10px' }}>{selected.orderId} — litige remboursement</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{selected.reason}</p>
          <textarea
            rows={2}
            placeholder="Motif de la décision modération…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #e2e8f0', margin: '12px 0', fontFamily: 'inherit' }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="mod-btn mod-btn--primary mod-btn--sm" onClick={() => act(moderatorResolveRefund, selected.id, 'approve')}>
              <Check size={14} /> Accorder remboursement
            </button>
            <button type="button" className="mod-btn mod-btn--ghost mod-btn--sm" onClick={() => act(moderatorResolveRefund, selected.id, 'reject')}>
              <X size={14} /> Maintenir refus
            </button>
            <button type="button" className="mod-btn mod-btn--ghost mod-btn--sm" onClick={() => act(moderatorFlagRefundFraud, selected.id)}>
              <ShieldAlert size={14} /> Signaler fraude
            </button>
            <button type="button" className="mod-btn mod-btn--ghost mod-btn--sm" onClick={() => act(moderatorResolveRefund, selected.id, 'escalate')}>
              <ArrowUpRight size={14} /> Escalader admin
            </button>
            <button type="button" className="mod-btn mod-btn--ghost mod-btn--sm" onClick={() => setSelected(null)}>Fermer</button>
          </div>
          {selected.history?.length > 0 && (
            <ul style={{ marginTop: 14, padding: 0, listStyle: 'none', fontSize: '0.78rem', color: '#94a3b8' }}>
              {selected.history.map((h, i) => (
                <li key={i}>{new Date(h.at).toLocaleString('fr-FR')} — {h.actor} : {h.action}{h.note ? ` (${h.note})` : ''}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ModeratorRefundsPage;
