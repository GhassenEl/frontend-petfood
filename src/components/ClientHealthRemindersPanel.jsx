import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertTriangle, Calendar, Video } from 'lucide-react';
import { getPetHealthReminders } from '../services/petHealthReminderService';
import '../pages/ClientComplaintsPage.css';

const TYPE_LABELS = {
  vaccine: 'Vaccination',
  deworming: 'Vermifuge',
  appointment: 'Rendez-vous',
  treatment: 'Traitement',
};

const URGENCY_META = {
  overdue: { label: 'En retard', badge: 'rejected', class: 'cc-vaccine-overdue' },
  soon: { label: 'Sous 7 jours', badge: 'pending', class: 'cc-vaccine-soon' },
  upcoming: { label: 'Ce mois-ci', badge: 'in_progress', class: 'cc-vaccine-soon' },
  ok: { label: 'À jour', badge: 'resolved', class: 'cc-vaccine-ok' },
  unknown: { label: 'À planifier', badge: 'pending', class: '' },
};

/** Rappels santé : vaccins, vermifuges, RDV vétérinaires, renouvellement traitements */
const ClientHealthRemindersPanel = ({ petName = null, compact = false }) => {
  const [reminders, setReminders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPetHealthReminders()
      .then((data) => { if (!cancelled) setReminders(data || []); })
      .catch(() => { if (!cancelled) setReminders([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const scoped = useMemo(() => {
    if (!petName) return reminders;
    return reminders.filter((r) => r.petName?.toLowerCase() === petName.toLowerCase());
  }, [reminders, petName]);

  const stats = useMemo(() => ({
    overdue: scoped.filter((r) => r.urgency === 'overdue').length,
    soon: scoped.filter((r) => r.urgency === 'soon').length,
    teleconsult: scoped.filter((r) => r.type === 'appointment' && r.online).length,
  }), [scoped]);

  const filtered = useMemo(() => {
    if (filter === 'all') return scoped;
    if (filter === 'alert') return scoped.filter((r) => ['overdue', 'soon'].includes(r.urgency));
    if (filter === 'teleconsult') return scoped.filter((r) => r.online);
    return scoped.filter((r) => r.type === filter);
  }, [scoped, filter]);

  if (loading) {
    return <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Chargement des rappels santé…</p>;
  }

  if (!scoped.length) {
    return (
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
        Aucun rappel{petName ? ` pour ${petName}` : ''}.{' '}
        <Link to="/veterinary" style={{ color: '#0ea5e9' }}>Prendre rendez-vous</Link>
      </p>
    );
  }

  return (
    <div>
      {!compact && (stats.overdue > 0 || stats.soon > 0) && (
        <div className="cc-response" style={{ marginBottom: 16, background: '#fffbeb', borderColor: '#fde68a' }}>
          <strong style={{ color: '#92400e' }}>
            <Bell size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Notifications automatiques : {stats.overdue} en retard · {stats.soon} bientôt
          </strong>
        </div>
      )}

      {!compact && (
        <div className="cc-filters" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Tous' },
            { id: 'alert', label: 'Urgents' },
            { id: 'vaccine', label: '💉 Vaccins' },
            { id: 'deworming', label: '🪱 Vermifuges' },
            { id: 'appointment', label: '🩺 RDV' },
            { id: 'treatment', label: '💊 Traitements' },
            { id: 'teleconsult', label: '📹 Visio' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              className={`cc-filter-btn reviews ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="cc-list">
        {filtered.map((r) => {
          const meta = URGENCY_META[r.urgency] || URGENCY_META.unknown;
          const due = r.dueDate ? new Date(r.dueDate).toLocaleDateString('fr-FR') : '—';
          return (
            <article key={r.id} className={`cc-card review ${meta.class}`} style={{ padding: compact ? 14 : 18 }}>
              <div className="cc-card-head" style={{ marginBottom: 6 }}>
                <h3 style={{ margin: 0, fontSize: compact ? '0.95rem' : '1.05rem' }}>
                  {r.icon} {r.title}
                </h3>
                <span className={`cc-badge ${meta.badge}`}>{meta.label}</span>
              </div>
              <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#64748b' }}>
                {TYPE_LABELS[r.type] || r.category} · {r.petName || 'Animal'}
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={13} /> Échéance : {due}
                {r.notify && (
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>· Notif auto</span>
                )}
              </p>
              {r.online && (
                <Link
                  to="/client-teleconsult"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 10,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#7c3aed',
                    textDecoration: 'none',
                  }}
                >
                  <Video size={14} /> Rejoindre la téléconsultation
                </Link>
              )}
              {r.urgency === 'overdue' && (
                <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#b91c1c' }}>
                  <AlertTriangle size={12} style={{ verticalAlign: 'middle' }} /> Action recommandée
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ClientHealthRemindersPanel;
