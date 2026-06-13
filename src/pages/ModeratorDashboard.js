import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  DEMO_MODERATOR_QUEUE,
  DEMO_MODERATOR_STATS,
  withDemoModeratorQueue,
  withDemoModeratorStats,
} from '../utils/moderatorDemoData';

const TYPE_ICONS = {
  review: '⭐',
  complaint: '⚠️',
  event: '🎪',
  message: '💬',
};

const PRIORITY_STYLES = {
  high: { bg: '#fee2e2', color: '#991b1b', label: 'Urgent' },
  medium: { bg: '#fef3c7', color: '#92400e', label: 'Normal' },
  low: { bg: '#dbeafe', color: '#1e40af', label: 'Faible' },
};

const ModeratorDashboard = () => {
  const [stats, setStats] = useState(withDemoModeratorStats(null));
  const [queue, setQueue] = useState(DEMO_MODERATOR_QUEUE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [reviewsRes, complaintsRes] = await Promise.allSettled([
          api.get('/reviews?status=pending&limit=5'),
          api.get('/complaints?status=open&limit=5'),
        ]);
        const pendingReviews =
          reviewsRes.status === 'fulfilled'
            ? (reviewsRes.value.data?.reviews || reviewsRes.value.data || []).length
            : DEMO_MODERATOR_STATS.pendingReviews;
        const pendingComplaints =
          complaintsRes.status === 'fulfilled'
            ? (complaintsRes.value.data?.complaints || complaintsRes.value.data || []).length
            : DEMO_MODERATOR_STATS.pendingComplaints;
        setStats(
          withDemoModeratorStats({
            pendingReviews: pendingReviews || DEMO_MODERATOR_STATS.pendingReviews,
            pendingComplaints: pendingComplaints || DEMO_MODERATOR_STATS.pendingComplaints,
          }),
        );
        setQueue(withDemoModeratorQueue(null));
      } catch {
        setStats(withDemoModeratorStats(null));
        setQueue(withDemoModeratorQueue(null));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const kpiCards = [
    { label: 'Avis en attente', value: stats.pendingReviews, icon: '⭐', to: '/moderator/reviews' },
    { label: 'Réclamations ouvertes', value: stats.pendingComplaints, icon: '⚠️', to: '/moderator/complaints' },
    { label: 'Messages signalés', value: stats.flaggedMessages, icon: '💬', to: '/moderator/messages' },
    { label: 'Événements actifs', value: stats.activeEvents, icon: '🎪', to: '/moderator/events' },
  ];

  if (loading) {
    return (
      <div className="admin-page" style={{ padding: 24 }}>
        <p>Chargement du tableau de bord modération…</p>
      </div>
    );
  }

  return (
    <div className="admin-page" style={{ padding: '20px 24px 40px' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🛡️ Tableau de bord modération</h1>
        <p style={{ margin: '8px 0 0', color: '#64748b' }}>
          Supervision des avis, réclamations, événements et messages communautaires.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 28,
        }}
      >
        {kpiCards.map((k) => (
          <Link
            key={k.label}
            to={k.to}
            style={{
              textDecoration: 'none',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 16,
              color: 'inherit',
            }}
          >
            <div style={{ fontSize: '1.5rem' }}>{k.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '6px 0' }}>{k.value}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{k.label}</div>
          </Link>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        <section
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 20,
          }}
        >
          <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>File d&apos;attente</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {queue.map((item) => {
              const pr = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.medium;
              return (
                <li
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '12px 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{TYPE_ICONS[item.type] || '📋'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>Il y a {item.ago}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: pr.bg,
                      color: pr.color,
                    }}
                  >
                    {pr.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 20,
          }}
        >
          <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>Performance du jour</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Cas résolus aujourd&apos;hui</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>{stats.resolvedToday}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Délai moyen de réponse</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706' }}>
                {stats.avgResponseHours} h
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/moderator/reviews" style={{ fontWeight: 600, color: '#d97706' }}>
              Modérer les avis →
            </Link>
            <Link to="/moderator/complaints" style={{ fontWeight: 600, color: '#d97706' }}>
              Traiter les réclamations →
            </Link>
            <Link to="/moderator/platform-services" style={{ fontWeight: 600, color: '#64748b' }}>
              Catalogue des services →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
