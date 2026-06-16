import React from 'react';
import { Link } from 'react-router-dom';
import { Route, MapPin } from 'lucide-react';

const LivreurRouteOptimizationPanel = ({ route, loading }) => {
  if (loading) return <p className="livih-muted">Calcul itinéraire…</p>;
  const r = route || {};

  return (
    <div className="livih-panel">
      <p className="livih-summary">
        <Route size={16} aria-hidden />
        L&apos;IA calcule l&apos;itinéraire optimal pour réduire temps de livraison et coûts transport.
      </p>
      <div className="livih-stats-row">
        <div className="livih-stat"><strong>{r.summary?.stopCount ?? 0}</strong><span>Arrêts</span></div>
        <div className="livih-stat"><strong>{r.summary?.estimatedKm ?? '—'} km</strong><span>Distance</span></div>
        <div className="livih-stat"><strong>{r.summary?.estimatedMinutes ?? '—'} min</strong><span>Durée</span></div>
        <div className="livih-stat livih-stat--green"><strong>-{r.savingsPercent ?? 0}%</strong><span>Gain vs naïf</span></div>
      </div>
      <p className="livih-ai-text">{r.aiSummary}</p>
      <ol className="livih-stop-list">
        {(r.stops || []).map((s) => (
          <li key={s.order?.id || s.sequence}>
            <span className="livih-stop-num">{s.sequence}</span>
            <div>
              <strong>{s.order?.address || '—'}</strong>
              <span>{s.legKm} km · ETA {s.etaMinutes} min{s.urgent ? ' · ⚡ Prioritaire' : ''}</span>
            </div>
          </li>
        ))}
      </ol>
      <Link to="/livreur/route" className="livih-link"><MapPin size={14} /> Ouvrir tournée GPS →</Link>
    </div>
  );
};

export default LivreurRouteOptimizationPanel;
