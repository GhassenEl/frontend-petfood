import React from 'react';
import { Link } from 'react-router-dom';
import useVetClinicalOverview from '../hooks/useVetClinicalOverview';
import '../pages/VetPages.css';

const VetClinicalAlertsBar = ({ compact = false }) => {
  const { overview, loading } = useVetClinicalOverview();

  if (loading) return null;

  const { alerts, pharmacy, vaccinesOverdue, contactPending, unassigned } = overview;
  const hasUrgent = pharmacy.ruptures > 0 || unassigned > 0 || vaccinesOverdue > 0;

  if (!hasUrgent && alerts.length === 0 && contactPending === 0) {
    return (
      <div className={`vet-clinical-bar vet-clinical-bar--ok ${compact ? 'vet-clinical-bar--compact' : ''}`}>
        <span>✅ Aucune alerte clinique urgente</span>
        <Link to="/vet/pharmacy">Voir pharmacie →</Link>
      </div>
    );
  }

  return (
    <div className={`vet-clinical-bar ${compact ? 'vet-clinical-bar--compact' : ''}`}>
      <div className="vet-clinical-bar__chips">
        {pharmacy.ruptures > 0 && (
          <Link to="/vet/pharmacy" className="vet-clinical-chip vet-clinical-chip--critical">
            💊 {pharmacy.ruptures} rupture{pharmacy.ruptures > 1 ? 's' : ''}
          </Link>
        )}
        {vaccinesOverdue > 0 && (
          <Link to="/vet/vaccinations" className="vet-clinical-chip vet-clinical-chip--warning">
            💉 {vaccinesOverdue} vaccin{vaccinesOverdue > 1 ? 's' : ''} en retard
          </Link>
        )}
        {unassigned > 0 && (
          <Link to="/vet/calendar" className="vet-clinical-chip vet-clinical-chip--critical">
            📅 {unassigned} RDV pool
          </Link>
        )}
        {contactPending > 0 && (
          <Link to="/vet/contact-requests" className="vet-clinical-chip vet-clinical-chip--info">
            📩 {contactPending} contact
          </Link>
        )}
        {pharmacy.lowStock > 0 && (
          <Link to="/vet/pharmacy" className="vet-clinical-chip vet-clinical-chip--warning">
            📦 {pharmacy.lowStock} stock bas
          </Link>
        )}
      </div>
      {!compact && alerts.length > 0 && (
        <ul className="vet-clinical-bar__list">
          {alerts.slice(0, 5).map((a) => (
            <li key={a.id}>
              {a.link ? <Link to={a.link}>{a.message}</Link> : a.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VetClinicalAlertsBar;
