import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Scale, Bot } from 'lucide-react';
import {
  fetchModeratorDisputes,
  resolveModeratorDispute,
  fetchModeratorFakeReviews,
  rejectFakeReview,
  clearFakeReview,
} from '../services/moderatorService';
import './ModeratorPages.css';

const ModeratorReportsPage = () => {
  const [tab, setTab] = useState('disputes');
  const [disputes, setDisputes] = useState([]);
  const [fakeReviews, setFakeReviews] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [dispRes, fakeRes] = await Promise.all([
      fetchModeratorDisputes(),
      fetchModeratorFakeReviews(),
    ]);
    setDisputes(dispRes.data.disputes || []);
    setFakeReviews(fakeRes.data.reviews || []);
    setDemo(dispRes.demo || fakeRes.demo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="mod-page">
      <header className="mod-hero">
        <h1><AlertTriangle size={24} /> Gestion des signalements {demo && <span className="mod-demo-pill">Mode démo</span>}</h1>
        <p>Traiter les réclamations, gérer les litiges et contrôler les faux avis.</p>
      </header>

      {msg && <p className="mod-badge mod-badge--approved" style={{ marginBottom: 12 }}>{msg}</p>}

      <div className="mod-tabs">
        <Link to="/moderator/complaints" className="mod-btn mod-btn--ghost mod-btn--sm">Réclamations clients →</Link>
        <button type="button" className={`mod-tab${tab === 'disputes' ? ' mod-tab--active' : ''}`} onClick={() => setTab('disputes')}>
          <Scale size={14} /> Litiges ({disputes.filter((d) => d.status !== 'resolved').length})
        </button>
        <button type="button" className={`mod-tab${tab === 'fake' ? ' mod-tab--active' : ''}`} onClick={() => setTab('fake')}>
          <Bot size={14} /> Faux avis ({fakeReviews.filter((r) => r.status === 'flagged').length})
        </button>
      </div>

      <div className="mod-card">
        {loading ? <p className="mod-empty">Chargement…</p> : tab === 'disputes' && (
          disputes.length === 0 ? <p className="mod-empty">Aucun litige.</p> : (
            <table className="mod-table">
              <thead>
                <tr><th>Commande</th><th>Client / Vendeur</th><th>Sujet</th><th>Montant</th><th>Statut</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr key={d.id}>
                    <td>{d.orderId}</td>
                    <td>{d.clientName}<br /><small>{d.vendorName}</small></td>
                    <td>{d.subject}</td>
                    <td>{d.amount} DT</td>
                    <td><span className={`mod-badge mod-badge--${d.status === 'resolved' ? 'resolved' : 'open'}`}>{d.status}</span></td>
                    <td>
                      {d.status !== 'resolved' && (
                        <button type="button" className="mod-btn mod-btn--primary mod-btn--sm" onClick={async () => { await resolveModeratorDispute(d.id, 'Résolu par modérateur'); setMsg('Litige résolu.'); load(); }}>
                          Résoudre
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {tab === 'fake' && (
          fakeReviews.length === 0 ? <p className="mod-empty">Aucun avis analysé.</p> : (
            fakeReviews.map((r) => (
              <div key={r.id} style={{ padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <strong>{r.productName}</strong> — {'★'.repeat(r.rating)}
                    <span className={`mod-badge mod-badge--${r.status === 'flagged' ? 'flagged' : 'resolved'}`} style={{ marginLeft: 8 }}>{r.status}</span>
                    <p style={{ margin: '6px 0', fontStyle: 'italic', color: '#64748b' }}>&ldquo;{r.comment}&rdquo;</p>
                    <small>Auteur : {r.author}</small>
                    <div style={{ marginTop: 8, maxWidth: 200 }}>
                      <small>Probabilité spam : {Math.round((r.spamProbability || 0) * 100)}%</small>
                      <div className="mod-spam-bar">
                        <div className="mod-spam-bar__fill" style={{ width: `${(r.spamProbability || 0) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                  {r.status === 'flagged' && (
                    <div>
                      <button type="button" className="mod-btn mod-btn--danger mod-btn--sm" onClick={async () => { await rejectFakeReview(r.id); setMsg('Avis rejeté.'); load(); }}>Rejeter</button>
                      {' '}
                      <button type="button" className="mod-btn mod-btn--success mod-btn--sm" onClick={async () => { await clearFakeReview(r.id); setMsg('Avis validé (légitime).'); load(); }}>Légitime</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default ModeratorReportsPage;
