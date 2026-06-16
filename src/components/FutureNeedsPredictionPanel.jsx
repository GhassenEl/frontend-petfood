import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Calendar, AlertCircle } from 'lucide-react';

const urgencyClass = {
  critical: 'vetintel-urgency--critical',
  soon: 'vetintel-urgency--soon',
  upcoming: 'vetintel-urgency--upcoming',
  ok: 'vetintel-urgency--ok',
};

const urgencyLabel = {
  critical: 'Critique',
  soon: 'Bientôt',
  upcoming: 'À prévoir',
  ok: 'OK',
};

const FutureNeedsPredictionPanel = ({ prediction, petName }) => {
  if (!prediction) {
    return <p className="vetintel-muted">Sélectionnez un animal pour voir les prédictions.</p>;
  }

  const { predictions = [], summary, criticalCount, petProfile, nextReorder } = prediction;

  return (
    <div className="vetintel-future">
      <p className="vetintel-summary">{summary}</p>

      {petProfile && (
        <section className="vetintel-card vetintel-future-kpi">
          <div>
            <span className="vetintel-kpi-label">Profil consommation</span>
            <strong>{petProfile.dailyGrams} g/jour · {petProfile.dailyKcal} kcal</strong>
          </div>
          <div>
            <span className="vetintel-kpi-label">Actions prioritaires</span>
            <strong>{criticalCount}</strong>
          </div>
          {nextReorder && (
            <div>
              <span className="vetintel-kpi-label">Prochain besoin</span>
              <strong>{nextReorder.productName}</strong>
            </div>
          )}
        </section>
      )}

      <div className="vetintel-future-list">
        {predictions.map((p) => (
          <article
            key={p.productId || p.id}
            className={`vetintel-card vetintel-future-item ${urgencyClass[p.urgency] || ''}`}
          >
            <div className="vetintel-future-head">
              <span className={`vetintel-urgency-badge ${urgencyClass[p.urgency]}`}>
                {p.urgency === 'critical' || p.urgency === 'soon' ? (
                  <AlertCircle size={12} aria-hidden />
                ) : (
                  <Calendar size={12} aria-hidden />
                )}
                {urgencyLabel[p.urgency] || p.urgency}
              </span>
              {p.category && <span className="vetintel-cat-badge">{p.category}</span>}
            </div>
            <h4>{p.productName}</h4>
            <p className="vetintel-muted">{p.aiReason || p.aiSummary}</p>
            <div className="vetintel-future-meta">
              {p.estimatedDaysLeft != null && (
                <span>Stock estimé : ~{p.estimatedDaysLeft} jours</span>
              )}
              {p.reorderBy && (
                <span>Commander avant : {new Date(p.reorderBy).toLocaleDateString('fr-FR')}</span>
              )}
            </div>
            {p.category !== 'santé' && (
              <Link to="/client-products" className="vetintel-link">
                <ShoppingCart size={14} aria-hidden /> Voir produits →
              </Link>
            )}
            {p.category === 'santé' && (
              <Link to="/veterinary" className="vetintel-link">Planifier RDV vaccin →</Link>
            )}
          </article>
        ))}
      </div>

      <p className="vetintel-footer-link">
        <Link to="/client-subscriptions">Activer l&apos;auto-réappro →</Link>
        {' · '}
        <Link to="/client-smart-commerce">E-commerce IA →</Link>
      </p>
    </div>
  );
};

export default FutureNeedsPredictionPanel;
