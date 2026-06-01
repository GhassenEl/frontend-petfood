import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Syringe, Calendar, AlertTriangle } from 'lucide-react';
import { getVaccineReminders } from '../services/vaccineReminderService';
import '../pages/ClientComplaintsPage.css';

const URGENCY_LABELS = {
  overdue: { label: 'En retard', class: 'cc-vaccine-overdue', badge: 'rejected' },
  soon: { label: 'Dans 7 jours', class: 'cc-vaccine-soon', badge: 'pending' },
  upcoming: { label: 'Ce mois-ci', class: 'cc-vaccine-soon', badge: 'in_progress' },
  ok: { label: 'À jour', class: 'cc-vaccine-ok', badge: 'resolved' },
  unknown: { label: 'Non planifié', class: '', badge: 'pending' },
};

/** Panneau rappels vaccins — intégré au dossier médical */
const ClientVaccineRemindersPanel = ({ petName = null, compact = false }) => {
  const [reminders, setReminders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getVaccineReminders();
        setReminders(data);
      } catch {
        setReminders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const scoped = useMemo(() => {
    if (!petName) return reminders;
    return reminders.filter((r) => r.petName?.toLowerCase() === petName.toLowerCase());
  }, [reminders, petName]);

  const stats = useMemo(() => ({
    overdue: scoped.filter((r) => r.urgency === 'overdue').length,
    soon: scoped.filter((r) => r.urgency === 'soon').length,
  }), [scoped]);

  const filtered = useMemo(() => {
    if (filter === 'all') return scoped;
    if (filter === 'alert') return scoped.filter((r) => ['overdue', 'soon'].includes(r.urgency));
    return scoped.filter((r) => r.urgency === filter);
  }, [scoped, filter]);

  if (loading) {
    return <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Chargement des rappels vaccins…</p>;
  }

  if (!scoped.length) {
    return (
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
        Aucun rappel vaccinal enregistré{petName ? ` pour ${petName}` : ''}.
      </p>
    );
  }

  return (
    <div>
      {!compact && stats.overdue > 0 && (
        <div className="cc-response" style={{ marginBottom: 16, background: '#fef2f2', borderColor: '#fecaca' }}>
          <strong style={{ color: '#b91c1c' }}>
            <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {stats.overdue} vaccin(s) en retard
          </strong>
        </div>
      )}

      {!compact && (
        <div className="cc-filters" style={{ marginBottom: 14 }}>
          {[
            { id: 'all', label: 'Tous' },
            { id: 'alert', label: 'Urgents' },
            { id: 'overdue', label: 'En retard' },
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
        {filtered.map((v) => {
          const meta = URGENCY_LABELS[v.urgency] || URGENCY_LABELS.unknown;
          return (
            <article key={v.id} className={`cc-card review ${meta.class}`} style={{ padding: compact ? 14 : 18 }}>
              <div className="cc-card-head" style={{ marginBottom: 6 }}>
                <h3 style={{ margin: 0, fontSize: compact ? '0.95rem' : '1.05rem' }}>
                  <Syringe size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  {v.vaccineType} — {v.petName}
                </h3>
              </div>
              <div className="cc-meta">
                <span className={`cc-badge ${meta.badge}`}>{meta.label}</span>
                {v.daysUntil !== null && (
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: v.daysUntil <= 0 ? '#dc2626' : '#d97706' }}>
                    {v.daysUntil <= 0 ? `${Math.abs(v.daysUntil)} j de retard` : `Dans ${v.daysUntil} j`}
                  </span>
                )}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#4b5563' }}>
                <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Prochain rappel :{' '}
                <strong>
                  {v.nextDue
                    ? new Date(v.nextDue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </strong>
              </p>
              {!compact && (
                <div className="cc-actions">
                  <Link to="/veterinary" className="cc-btn-ghost" style={{ textDecoration: 'none', fontSize: '0.8rem' }}>
                    Prendre RDV
                  </Link>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ClientVaccineRemindersPanel;
