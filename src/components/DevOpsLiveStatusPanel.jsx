import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, RefreshCw } from 'lucide-react';

const SEVERITY = {
  ok: { icon: CheckCircle2, className: 'devops-alert--ok' },
  info: { icon: Info, className: 'devops-alert--info' },
  warning: { icon: AlertTriangle, className: 'devops-alert--warn' },
  critical: { icon: XCircle, className: 'devops-alert--crit' },
};

const DevOpsAlertsPanel = ({ alerts = [] }) => (
  <section className="devops-section">
    <h2>Alertes &amp; incidents</h2>
    <div className="devops-alerts">
      {alerts.map((alert) => {
        const meta = SEVERITY[alert.severity] || SEVERITY.info;
        const Icon = meta.icon;
        return (
          <article key={`${alert.title}-${alert.message}`} className={`devops-alert ${meta.className}`}>
            <Icon size={18} aria-hidden />
            <div>
              <strong>{alert.title}</strong>
              <p>{alert.message}</p>
            </div>
          </article>
        );
      })}
    </div>
  </section>
);

const ServiceRow = ({ service }) => (
  <div className={`devops-service${service.ok ? ' devops-service--up' : ' devops-service--down'}`}>
    <span className="devops-service__dot" aria-hidden />
    <div className="devops-service__body">
      <strong>{service.label}</strong>
      <span className="devops-service__meta">
        {service.ok ? `${service.latencyMs} ms` : (service.error || `HTTP ${service.status}`)}
        {service.optional && !service.ok ? ' · optionnel' : ''}
      </span>
    </div>
    <span className={`devops-badge ${service.ok ? 'devops-badge--ok' : service.optional ? 'devops-badge--local' : 'devops-badge--partial'}`}>
      {service.ok ? 'UP' : 'DOWN'}
    </span>
  </div>
);

const DevOpsLiveStatusPanel = ({
  services = [],
  summary,
  collectedAt,
  loading,
  onRefresh,
  hero,
  showHeroMetrics = false,
}) => (
  <section className="devops-section">
    <div className="devops-section__head">
      <div>
        <h2>État des services</h2>
        <p className="devops-section__hint">
          Sonde automatique API, Grafana, Prometheus, ML — actualisation toutes les 30 s.
          {collectedAt && (
            <> Dernière vérif. : {new Date(collectedAt).toLocaleTimeString('fr-FR')}</>
          )}
        </p>
      </div>
      <button type="button" className="devops-refresh-btn" onClick={onRefresh} disabled={loading}>
        <RefreshCw size={15} className={loading ? 'devops-spin' : ''} />
        Actualiser
      </button>
    </div>

    {summary && (
      <div className="devops-stack-summary">
        <span className={`devops-stack-pill devops-stack-pill--${summary.stackStatus}`}>
          Stack {summary.stackStatus === 'healthy' ? 'saine' : summary.stackStatus === 'partial' ? 'partielle' : 'critique'}
        </span>
        <span>{summary.up}/{summary.total} services UP</span>
        {summary.optionalDown > 0 && (
          <span className="devops-stack-summary__muted">{summary.optionalDown} optionnel(s) hors ligne</span>
        )}
      </div>
    )}

    {showHeroMetrics && hero && (
      <div className="devops-inline-metrics">
        <div><strong>{hero.apiP95Ms ?? '—'} ms</strong><span>P95 API</span></div>
        <div><strong>{hero.errorRate ?? '—'} %</strong><span>Erreurs</span></div>
        <div><strong>{hero.dbLatencyMs ?? '—'} ms</strong><span>SQL</span></div>
        <div><strong>{hero.socketConnections ?? 0}</strong><span>Sockets</span></div>
      </div>
    )}

    <div className="devops-service-list">
      {services.map((service) => (
        <ServiceRow key={service.id} service={service} />
      ))}
    </div>
  </section>
);

export { DevOpsAlertsPanel, DevOpsLiveStatusPanel };
export default DevOpsLiveStatusPanel;
