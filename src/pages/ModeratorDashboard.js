import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchModeratorDashboard } from '../services/moderatorService';
import { DEMO_MODERATOR_QUEUE } from '../utils/moderatorDemoData';
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

  useEffect(() => {
    fetchModeratorDashboard().then(({ data, demo: isDemo }) => {
      setStats(data);
      setDemo(isDemo);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="mod-page"><p className="mod-empty">Chargement du tableau de bord…</p></div>;
  }

  const kpiCards = [
    { label: 'Utilisateurs suspendus', value: stats.suspendedUsers, icon: '👤', to: '/moderator/users' },
    { label: 'Vendeurs en attente', value: stats.pendingVendors, icon: '🏬', to: '/moderator/vendors' },
    { label: 'Produits à valider', value: stats.pendingProducts, icon: '🏷️', to: '/moderator/content' },
    { label: 'Avis en attente', value: stats.pendingReviews, icon: '⭐', to: '/moderator/reviews' },
    { label: 'Réclamations ouvertes', value: stats.pendingComplaints, icon: '⚠️', to: '/moderator/complaints' },
    { label: 'Litiges ouverts', value: stats.openDisputes, icon: '⚖️', to: '/moderator/reports' },
    { label: 'Faux avis détectés', value: stats.fakeReviewsFlagged, icon: '🤖', to: '/moderator/reports' },
    { label: 'Cas résolus aujourd\'hui', value: stats.resolvedToday, icon: '✅', to: '/moderator/analytics' },
  ];

  return (
    <div className="mod-page">
      <header className="mod-hero">
        <h1>🛡️ Tableau de bord modération {demo && <span className="mod-demo-pill">Mode démo</span>}</h1>
        <p>Contrôle qualité — utilisateurs, vendeurs, contenu, signalements et rapports.</p>
      </header>

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
          <h2>Performance</h2>
          <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '0.85rem' }}>Délai moyen de réponse</p>
          <strong style={{ fontSize: '2rem', color: '#d97706' }}>{stats.avgResponseHours} h</strong>
          <div className="mod-quick-links">
            <Link to="/moderator/users">Utilisateurs</Link>
            <Link to="/moderator/vendors">Vendeurs</Link>
            <Link to="/moderator/content">Contenu</Link>
            <Link to="/moderator/reports">Signalements</Link>
            <Link to="/moderator/analytics">Rapports</Link>
            <Link to="/moderator/reviews">Avis</Link>
            <Link to="/moderator/complaints">Réclamations</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
