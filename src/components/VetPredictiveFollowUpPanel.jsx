import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Calendar } from 'lucide-react';

const PRIORITY_CLASS = { high: 'vetih-priority--high', medium: 'vetih-priority--medium', low: 'vetih-priority--low' };

const VetPredictiveFollowUpPanel = ({ followUp, loading }) => {
  if (loading) return <p className="vetih-muted">Calcul des suivis…</p>;
  if (!followUp) return <p className="vetih-muted">Aucune donnée de suivi.</p>;

  const { priorityPatients = [], reminders = [], stats = {} } = followUp;

  return (
    <div className="vetih-panel">
      <p className="vetih-summary">
        <Bell size={16} aria-hidden />
        L&apos;IA identifie les animaux nécessitant un suivi particulier et génère des rappels pour les consultations futures.
      </p>

      <div className="vetih-stats-row">
        <div className="vetih-stat">
          <strong>{stats.totalReminders || reminders.length}</strong>
          <span>Rappels</span>
        </div>
        <div className="vetih-stat vetih-stat--warn">
          <strong>{stats.highPriority || 0}</strong>
          <span>Priorité haute</span>
        </div>
        <div className="vetih-stat">
          <strong>{priorityPatients.length}</strong>
          <span>Patients suivis</span>
        </div>
      </div>

      <h4><Calendar size={16} aria-hidden /> Rappels automatiques</h4>
      <ul className="vetih-list">
        {reminders.map((r) => (
          <li key={r.id} className={`vetih-card ${PRIORITY_CLASS[r.priority] || ''}`}>
            <div className="vetih-card-head">
              <strong>{r.petName}</strong>
              <span className="vetih-badge vetih-badge--sm">J+{r.dueInDays}</span>
            </div>
            <p>{r.ownerName} — {r.reason}</p>
            <span className="vetih-action">{r.suggestedAction}</span>
          </li>
        ))}
      </ul>

      {!reminders.length && (
        <p className="vetih-empty-ok">Aucun rappel urgent — parc patients à jour.</p>
      )}

      <Link to="/vet/calendar" className="vetih-link">Planifier dans le calendrier →</Link>
    </div>
  );
};

export default VetPredictiveFollowUpPanel;
