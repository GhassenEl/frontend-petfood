import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, AlertTriangle } from 'lucide-react';

const URGENCY_LABEL = {
  critical: { label: 'Urgent', className: 'sc-urgency-critical' },
  soon: { label: 'Bientôt', className: 'sc-urgency-soon' },
  upcoming: { label: 'À planifier', className: 'sc-urgency-upcoming' },
  ok: { label: 'OK', className: 'sc-urgency-ok' },
};

const SmartReplenishmentPanel = ({ plans = [], loading }) => {
  if (loading) {
    return <p className="sc-loading">Estimation IA de vos stocks…</p>;
  }

  if (!plans.length) {
    return (
      <div className="sc-empty">
        <p>Pas encore d&apos;historique d&apos;achat exploitable. Commandez vos croquettes habituelles pour activer le réapprovisionnement intelligent.</p>
        <Link to="/client-subscriptions" className="sc-link-btn">
          Activer l&apos;auto-réappro
        </Link>
      </div>
    );
  }

  return (
    <ul className="sc-replenish-list">
      {plans.map((plan) => {
        const urg = URGENCY_LABEL[plan.urgency] || URGENCY_LABEL.ok;
        const reorderDate = plan.reorderBy ? new Date(plan.reorderBy).toLocaleDateString('fr-FR') : '—';
        return (
          <li key={plan.productId} className="sc-replenish-item">
            <div className="sc-replenish-top">
              <h3>{plan.productName}</h3>
              <span className={`sc-urgency ${urg.className}`}>{urg.label}</span>
            </div>
            <p className="sc-ai-summary">{plan.aiSummary}</p>
            <div className="sc-replenish-meta">
              <span>
                <CalendarClock size={14} aria-hidden />
                {' '}
                Commander avant le {reorderDate}
              </span>
              {plan.estimatedDaysLeft != null && (
                <span>~{plan.estimatedDaysLeft} j restants (estimé)</span>
              )}
              {plan.hasSubscription && <span className="sc-sub-badge">Abonnement actif</span>}
            </div>
            {(plan.urgency === 'critical' || plan.urgency === 'soon') && (
              <p className="sc-alert-line">
                <AlertTriangle size={14} aria-hidden />
                {' '}
                Risque de rupture — pensez à réapprovisionner.
              </p>
            )}
            <Link to="/client-subscriptions" className="sc-card-action">
              Programmer un abonnement →
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default SmartReplenishmentPanel;
