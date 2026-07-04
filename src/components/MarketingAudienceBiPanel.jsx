import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, BarChart3, TrendingUp, Cpu } from 'lucide-react';

const TYPE_ICON = {
  audience: Radio,
  bi: BarChart3,
  iot: Cpu,
  campaign: TrendingUp,
};

const MarketingAudienceBiPanel = ({ pack, compact = false }) => {
  const audience = pack?.audienceLive;
  const insights = pack?.liveInsights || [];
  const hasData = audience?.mode === 'live' || insights.length > 0;

  if (!hasData && compact) return null;

  return (
    <section className={`mkt-panel mkt-live-panel${compact ? ' mkt-live-panel--compact' : ''}`}>
      <div className="mkt-live-panel__head">
        <h3>
          <Radio size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} aria-hidden />
          Audience live &amp; BI — alimentation campagnes
        </h3>
        {!compact && (
          <div className="mkt-live-panel__links">
            <Link to="/admin/live-audience" className="mkt-footer-link">Audience →</Link>
            <Link to="/admin/business-intelligence" className="mkt-footer-link">Hub BI →</Link>
            <Link to="/admin/powerbi" className="mkt-footer-link">Power BI →</Link>
          </div>
        )}
      </div>

      {audience?.mode === 'live' && (
        <div className="mkt-kpi-grid" style={{ marginBottom: 16 }}>
          <div className="mkt-kpi">
            <div className="mkt-kpi__label">En ligne</div>
            <div className="mkt-kpi__value">{audience.onlineTotal}</div>
          </div>
          <div className="mkt-kpi">
            <div className="mkt-kpi__label">Visiteurs</div>
            <div className="mkt-kpi__value">{audience.visitors}</div>
          </div>
          <div className="mkt-kpi">
            <div className="mkt-kpi__label">Clients</div>
            <div className="mkt-kpi__value">{audience.clients}</div>
          </div>
          <div className="mkt-kpi">
            <div className="mkt-kpi__label">Vétos</div>
            <div className="mkt-kpi__value">{audience.vets}</div>
          </div>
        </div>
      )}

      {insights.length > 0 && (
        <ul className="mkt-live-insights">
          {insights.map((item) => {
            const Icon = TYPE_ICON[item.type] || TrendingUp;
            return (
              <li key={item.id}>
                <Icon size={16} aria-hidden />
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </div>
                <Link to={item.route}>Agir →</Link>
              </li>
            );
          })}
        </ul>
      )}

      {audience?.mode !== 'live' && insights.length === 0 && (
        <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>
          Audience live indisponible — lancez le backend et ouvrez{' '}
          <Link to="/admin/live-audience">/admin/live-audience</Link>.
        </p>
      )}
    </section>
  );
};

export default MarketingAudienceBiPanel;
