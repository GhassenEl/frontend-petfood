import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Scale, Bot, Banknote } from 'lucide-react';
import { fetchModeratorRefunds } from '../services/refundService';
import {
  fetchModeratorDisputes,
  resolveModeratorDispute,
  fetchModeratorFakeReviews,
  rejectFakeReview,
  clearFakeReview,
} from '../services/moderatorService';
import './ModeratorPages.css';

const ModeratorFraudCenterPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [fakeReviews, setFakeReviews] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [priority, setPriority] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const [refRes, dispRes, fakeRes] = await Promise.all([
      fetchModeratorRefunds(),
      fetchModeratorDisputes(),
      fetchModeratorFakeReviews(),
    ]);
    setRefunds(refRes.data?.refunds || []);
    setDisputes(dispRes.data?.disputes || []);
    setFakeReviews(fakeRes.data?.reviews || []);
    setDemo(refRes.demo || dispRes.demo || fakeRes.demo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const fraudRefunds = useMemo(
    () => refunds.filter((r) => r.status === 'fraud_flagged' || (r.fraudScore || 0) >= 0.7),
    [refunds],
  );

  const openDisputes = useMemo(
    () => disputes.filter((d) => d.status !== 'resolved'),
    [disputes],
  );

  const flaggedReviews = useMemo(
    () => fakeReviews.filter((r) => r.status === 'flagged'),
    [fakeReviews],
  );

  const score = fraudRefunds.length * 3 + openDisputes.length * 2 + flaggedReviews.length;

  const riskLevel = score >= 8 ? 'high' : score >= 4 ? 'medium' : 'low';

  const filteredQueue = useMemo(() => {
    const items = [
      ...fraudRefunds.map((r) => ({
        id: `ref-${r.id}`,
        type: 'refund',
        title: `Remboursement suspect — ${r.orderId}`,
        sub: `${r.clientName} · ${r.amount} DT · score ${Math.round((r.fraudScore || 0) * 100)}%`,
        priority: (r.fraudScore || 0) >= 0.85 ? 'high' : 'medium',
        raw: r,
      })),
      ...openDisputes.map((d) => ({
        id: `disp-${d.id}`,
        type: 'dispute',
        title: `Litige ${d.orderId}`,
        sub: d.reason || d.summary || '—',
        priority: d.priority || 'medium',
        raw: d,
      })),
      ...flaggedReviews.map((r) => ({
        id: `rev-${r.id}`,
        type: 'review',
        title: `Faux avis — ${r.productName}`,
        sub: `${r.author} · score NLP ${r.nlpScore || '—'}%`,
        priority: (r.nlpScore || 0) >= 90 ? 'high' : 'low',
        raw: r,
      })),
    ];
    if (priority === 'all') return items;
    return items.filter((i) => i.priority === priority);
  }, [fraudRefunds, openDisputes, flaggedReviews, priority]);

  const actDispute = async (id) => {
    await resolveModeratorDispute(id, 'Résolu depuis le centre anti-fraude');
    setMsg('Litige clos.');
    load();
  };

  const actReview = async (id, reject) => {
    if (reject) await rejectFakeReview(id);
    else await clearFakeReview(id);
    setMsg(reject ? 'Avis supprimé.' : 'Avis réhabilité.');
    load();
  };

  return (
    <div className="mod-page">
      <header className="mod-hero">
        <h1><ShieldAlert size={24} /> Centre anti-fraude {demo && <span className="mod-demo-pill">Mode démo</span>}</h1>
        <p>Vue unifiée : remboursements suspects, litiges ouverts et avis NLP — priorisation automatique.</p>
      </header>

      {msg && <p className="mod-badge mod-badge--approved" style={{ marginBottom: 12 }}>{msg}</p>}

      <div className="mod-kpi-grid">
        <div className="mod-kpi">
          <span>🎯 Score de risque</span>
          <strong style={{ color: riskLevel === 'high' ? '#dc2626' : riskLevel === 'medium' ? '#d97706' : '#16a34a' }}>
            {riskLevel === 'high' ? 'Élevé' : riskLevel === 'medium' ? 'Modéré' : 'Faible'}
          </strong>
        </div>
        <div className="mod-kpi"><span>💸 Remboursements fraude</span><strong>{fraudRefunds.length}</strong></div>
        <div className="mod-kpi"><span>⚖️ Litiges ouverts</span><strong>{openDisputes.length}</strong></div>
        <div className="mod-kpi"><span>🤖 Avis suspects</span><strong>{flaggedReviews.length}</strong></div>
      </div>

      <div className="mod-tabs">
        <button type="button" className={`mod-tab${priority === 'all' ? ' mod-tab--active' : ''}`} onClick={() => setPriority('all')}>Tous</button>
        <button type="button" className={`mod-tab${priority === 'high' ? ' mod-tab--active' : ''}`} onClick={() => setPriority('high')}>Urgent</button>
        <button type="button" className={`mod-tab${priority === 'medium' ? ' mod-tab--active' : ''}`} onClick={() => setPriority('medium')}>Normal</button>
        <button type="button" className={`mod-tab${priority === 'low' ? ' mod-tab--active' : ''}`} onClick={() => setPriority('low')}>Faible</button>
        <Link to="/moderator/refunds" className="mod-btn mod-btn--ghost mod-btn--sm">Workflow remboursements →</Link>
      </div>

      <div className="mod-card">
        {loading ? (
          <p className="mod-empty">Analyse en cours…</p>
        ) : filteredQueue.length === 0 ? (
          <p className="mod-empty">Aucun cas dans cette file — plateforme saine.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {filteredQueue.map((item) => (
              <li key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '1.4rem' }}>
                  {item.type === 'refund' ? <Banknote size={20} /> : item.type === 'dispute' ? <Scale size={20} /> : <Bot size={20} />}
                </span>
                <div style={{ flex: 1 }}>
                  <strong>{item.title}</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>{item.sub}</p>
                </div>
                <span className={`mod-badge mod-badge--${item.priority === 'high' ? 'rejected' : item.priority === 'medium' ? 'pending' : 'approved'}`}>
                  {item.priority}
                </span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {item.type === 'refund' && (
                    <Link to="/moderator/refunds" className="mod-btn mod-btn--primary mod-btn--sm">Traiter</Link>
                  )}
                  {item.type === 'dispute' && (
                    <button type="button" className="mod-btn mod-btn--primary mod-btn--sm" onClick={() => actDispute(item.raw.id)}>Clore</button>
                  )}
                  {item.type === 'review' && (
                    <>
                      <button type="button" className="mod-btn mod-btn--ghost mod-btn--sm" onClick={() => actReview(item.raw.id, false)}>Réhabiliter</button>
                      <button type="button" className="mod-btn mod-btn--primary mod-btn--sm" onClick={() => actReview(item.raw.id, true)}>Supprimer</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ModeratorFraudCenterPage;
