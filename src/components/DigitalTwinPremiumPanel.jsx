import React from 'react';
import { Link } from 'react-router-dom';
import { Dna, Sparkles } from 'lucide-react';
import { DIGITAL_TWIN_PREMIUM_FEATURES } from '../config/advancedIotPremiumCatalog';

const DigitalTwinPremiumPanel = ({ twin }) => {
  if (!twin) return null;
  const { feeding, wellness, healthRisks = [] } = twin;
  const alerts = healthRisks.filter((r) => r.severity === 'high' || r.severity === 'medium').slice(0, 3);

  return (
    <div className="dtwin-premium">
      <div className="dtwin-premium__badge">
        <Sparkles size={14} /> Fonctionnalité Premium PFE — Smart Pet Digital Twin
      </div>

      <div className="dtwin-premium__kpis">
        <div className="dtwin-premium__kpi">
          <span>Score bien-être</span>
          <strong style={{ color: wellness?.levelColor }}>{wellness?.overall ?? '—'}/100</strong>
        </div>
        <div className="dtwin-premium__kpi">
          <span>Adhérence alimentaire</span>
          <strong>{Math.round((feeding?.adherence ?? 0) * 100)} %</strong>
        </div>
        <div className="dtwin-premium__kpi">
          <span>Alertes préventives</span>
          <strong>{alerts.length || healthRisks.length}</strong>
        </div>
      </div>

      <div className="dtwin-premium__grid">
        {DIGITAL_TWIN_PREMIUM_FEATURES.map((f) => (
          <Link key={f.id} to={f.route} className="dtwin-premium__card">
            <span>{f.icon}</span>
            <div>
              <strong>{f.label}</strong>
              <p>{f.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {alerts.length > 0 && (
        <section className="dtwin-card" style={{ marginTop: 16 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Dna size={16} /> Alertes santé préventives
          </h3>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#475569' }}>
            {alerts.map((a) => (
              <li key={a.id}><strong>{a.title}</strong> — {a.detail || a.action}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default DigitalTwinPremiumPanel;
