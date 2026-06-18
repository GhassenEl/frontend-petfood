import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchModeratorDashboard } from '../services/moderatorService';
import {
  DEMO_MODERATOR_QUEUE,
  DEMO_MODERATOR_HISTORY,
  MOD_ACTION_LABELS,
  withDemoModeratorStats,
} from '../utils/moderatorDemoData';
import RealtimeStatsCharts from '../components/RealtimeStatsCharts';
import ModeratorBiPanel from '../components/ModeratorBiPanel';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './ModeratorPages.css';

const TYPE_ICONS = {
  review: '⭐',
  complaint: '⚠️',
  event: '🎪',
  message: '💬',
  product: '🏷️',
  vendor: '🏬',
};

const PRIORITY_STYLES = {
  high: { bg: '#fee2e2', color: '#991b1b', label: 'Urgent' },
  medium: { bg: '#fef3c7', color: '#92400e', label: 'Normal' },
  low: { bg: '#dbeafe', color: '#1e40af', label: 'Faible' },
};

const ModeratorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchModeratorDashboard().then(({ data, demo: isDemo }) => {
      setStats(withDemoModeratorStats(data));
      setDemo(isDemo);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    const id = window.setInterval(load, 20000);
    return () => window.clearInterval(id);
  }, []);

  usePlatformRefresh(load);

  if (loading) {
    return <div className="mod-page"><p className="mod-empty">Chargement du tableau de bord…</p></div>;
  }

  const kpiCards = [
    { label: 'Produits à valider', value: stats.pendingProducts, icon: '🏷️', to: '/moderator/content' },
    { label: 'Avis en attente', value: stats.pendingReviews, icon: '⭐', to: '/moderator/reviews' },
    { label: 'Réclamations ouvertes', value: stats.pendingComplaints, icon: '⚠️', to: '/moderator/complaints' },
    { label: 'Litiges ouverts', value: stats.openDisputes, icon: '⚖️', to: '/moderator/reports' },
    { label: 'Centre anti-fraude', value: stats.fraudCases ?? stats.fakeReviewsFlagged, icon: '🚨', to: '/moderator/fraud' },
    { label: 'Remboursements litige', value: stats.pendingRefunds ?? 2, icon: '💸', to: '/moderator/refunds' },
    { label: 'Cas résolus aujourd\'hui', value: stats.resolvedToday, icon: '✅', to: '/moderator/dashboard' },
  ];

  return (
    <div className="mod-page">
      <header className="mod-hero">
        <h1>🛡️ Tableau de bord modération {demo && <span className="mod-demo-pill">Mode démo</span>}</h1>
        <p>Contrôle qualité — contenu, avis, signalements et synthèse BI intégrée.</p>
      </header>

      <RealtimeStatsCharts role="moderator" detailLink={null} />

      <ModeratorBiPanel />

      <div className="mod-kpi-grid">
        {kpiCards.map((k) => (
          <Link key={k.label} to={k.to} className="mod-kpi" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span>{k.icon} {k.label}</span>
            <strong>{k.value}</strong>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <section className="mod-card">
          <h2>File d&apos;attente prioritaire</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {DEMO_MODERATOR_QUEUE.map((item) => {
              const pr = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.medium;
              return (
                <li key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '1.25rem' }}>{TYPE_ICONS[item.type] || '📋'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Il y a {item.ago}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px', borderRadius: 6, background: pr.bg, color: pr.color }}>
                    {pr.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mod-card">
          <h2>Activité récente</h2>
          {DEMO_MODERATOR_HISTORY.map((h) => (
            <div key={h.id} className="mod-history-item">
              <span>
                <strong>{MOD_ACTION_LABELS[h.action] || h.action}</strong> — {h.target}
                <br /><small style={{ color: '#94a3b8' }}>{h.moderator}</small>
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                {new Date(h.at).toLocaleString('fr-FR')}
              </span>
            </div>
          ))}
          <div className="mod-quick-links" style={{ marginTop: 16 }}>
            <Link to="/moderator/content">Contenu</Link>
            <Link to="/moderator/fraud">Anti-fraude</Link>
            <Link to="/moderator/messages">Messagerie</Link>
            <Link to="/moderator/refunds">Remboursements</Link>
            <Link to="/moderator/reports">Signalements</Link>
            <Link to="/moderator/reviews">Avis</Link>
            <Link to="/moderator/complaints">Réclamations</Link>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 13, color: '#64748b' }}>
            Délai moyen de réponse : <strong style={{ color: '#d97706' }}>{stats.avgResponseHours} h</strong>
          </p>
        </section>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
