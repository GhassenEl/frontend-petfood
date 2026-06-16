import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

const PlatformSecurityOverviewPanel = ({ pack, loading }) => {
  if (loading) return <p className="ais-loading">Analyse de la posture sécurité…</p>;
  if (!pack) return <p className="ais-empty">Données sécurité indisponibles.</p>;

  return (
    <div className="ps-overview">
      <div className="ps-score-ring">
        <strong>{pack.securityScore}</strong>
        <span>/100</span>
        <p>Score sécurité plateforme</p>
      </div>

      <ul className="ps-checks">
        {(pack.checks || []).map((check) => (
          <li key={check.id} className={check.ok ? 'ps-check-ok' : 'ps-check-warn'}>
            {check.ok ? <ShieldCheck size={18} aria-hidden /> : <ShieldAlert size={18} aria-hidden />}
            <div>
              <strong>{check.label}</strong>
              <span>{check.detail}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="ps-kpi-row">
        <div className="ps-kpi"><strong>{pack.stats?.intrusions ?? 0}</strong><span>Intrusions</span></div>
        <div className="ps-kpi"><strong>{pack.stats?.threats ?? 0}</strong><span>Menaces</span></div>
        <div className="ps-kpi"><strong>{pack.stats?.fraudAlerts ?? 0}</strong><span>Alertes fraude</span></div>
        <div className="ps-kpi"><strong>{pack.stats?.moderationPending ?? 0}</strong><span>Modération</span></div>
      </div>
    </div>
  );
};

export default PlatformSecurityOverviewPanel;
