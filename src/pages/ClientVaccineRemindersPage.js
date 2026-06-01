import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Syringe, Bell, Calendar, AlertTriangle } from 'lucide-react';
import { getVaccineReminders } from '../services/vaccineReminderService';
import './ClientComplaintsPage.css';
import './ClientServicesPage.css';

const URGENCY_LABELS = {
  overdue: { label: 'En retard', class: 'cc-vaccine-overdue', badge: 'rejected' },
  soon: { label: 'Dans 7 jours', class: 'cc-vaccine-soon', badge: 'pending' },
  upcoming: { label: 'Ce mois-ci', class: 'cc-vaccine-soon', badge: 'in_progress' },
  ok: { label: 'À jour', class: 'cc-vaccine-ok', badge: 'resolved' },
  unknown: { label: 'Non planifié', class: '', badge: 'pending' },
};

const ClientVaccineRemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

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

  const stats = useMemo(() => ({
    total: reminders.length,
    overdue: reminders.filter((r) => r.urgency === 'overdue').length,
    soon: reminders.filter((r) => r.urgency === 'soon').length,
    ok: reminders.filter((r) => r.urgency === 'ok' || r.urgency === 'upcoming').length,
  }), [reminders]);

  const filtered = useMemo(() => {
    if (filter === 'all') return reminders;
    if (filter === 'alert') return reminders.filter((r) => ['overdue', 'soon'].includes(r.urgency));
    return reminders.filter((r) => r.urgency === filter);
  }, [reminders, filter]);

  return (
    <div className="cc-page cc-page--services">
      {toast && <div className={`cc-toast ${toast.type}`}>{toast.text}</div>}

      <header className="cc-hero cc-hero--vaccines">
        <h1>💉 Rappels vaccins</h1>
        <p>
          Suivez les prochaines échéances de vaccination de vos compagnons.
          Des notifications vous alertent 7 jours avant chaque rappel.
        </p>
      </header>

      <div className="cc-stats">
        <div className="cc-stat">
          <strong style={{ color: '#1e40af' }}>{stats.total}</strong>
          <span>Vaccins suivis</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#dc2626' }}>{stats.overdue}</strong>
          <span>En retard</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#d97706' }}>{stats.soon}</strong>
          <span>Cette semaine</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#16a34a' }}>{stats.ok}</strong>
          <span>Planifiés</span>
        </div>
      </div>

      {stats.overdue > 0 && (
        <div className="cc-response" style={{ marginBottom: 20, background: '#fef2f2', borderColor: '#fecaca' }}>
          <strong style={{ color: '#b91c1c' }}>
            <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {stats.overdue} vaccin(s) en retard
          </strong>
          <p style={{ margin: '6px 0 0', color: '#991b1b' }}>
            Prenez rendez-vous vétérinaire dès que possible pour protéger votre animal.
          </p>
        </div>
      )}

      <div className="cc-toolbar">
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Calendrier vaccinal</h2>
        <div className="cc-filters">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'alert', label: '⚠️ Urgents' },
            { id: 'overdue', label: 'En retard' },
            { id: 'soon', label: '7 jours' },
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
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Chargement…</p>
      ) : filtered.length === 0 ? (
        <div className="cc-empty">
          <Syringe size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>Aucun rappel{filter !== 'all' ? ' pour ce filtre' : ''}.</p>
          <p style={{ fontSize: '0.9rem' }}>
            <Link to="/veterinary" style={{ color: '#2563eb', fontWeight: 700 }}>
              Prendre RDV vétérinaire
            </Link>
          </p>
        </div>
      ) : (
        <div className="cc-list">
          {filtered.map((v) => {
            const meta = URGENCY_LABELS[v.urgency] || URGENCY_LABELS.unknown;
            return (
              <article key={v.id} className={`cc-card review ${meta.class}`}>
                <div className="cc-card-head">
                  <h3>
                    <Syringe size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    {v.vaccineType} — {v.petName}
                  </h3>
                </div>
                <div className="cc-meta">
                  <span className={`cc-badge ${meta.badge}`}>{meta.label}</span>
                  <span className="cc-badge" style={{ background: '#f3f4f6', color: '#374151', textTransform: 'none' }}>
                    {v.animalType === 'dog' ? '🐕 Chien' : v.animalType === 'cat' ? '🐈 Chat' : '🐾 ' + v.animalType}
                  </span>
                  {v.daysUntil !== null && (
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: v.daysUntil <= 0 ? '#dc2626' : '#d97706' }}>
                      {v.daysUntil <= 0 ? `${Math.abs(v.daysUntil)} j de retard` : `Dans ${v.daysUntil} j`}
                    </span>
                  )}
                </div>
                <p className="cc-message" style={{ marginBottom: 8 }}>
                  <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Prochain rappel :{' '}
                  <strong>
                    {v.nextDue
                      ? new Date(v.nextDue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Non défini'}
                  </strong>
                </p>
                {v.dateAdministered && (
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    Dernière dose : {new Date(v.dateAdministered).toLocaleDateString('fr-FR')}
                  </p>
                )}
                <div className="cc-actions">
                  <Link to="/veterinary" className="cc-btn-ghost" style={{ textDecoration: 'none' }}>
                    <Bell size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Prendre RDV
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientVaccineRemindersPage;
