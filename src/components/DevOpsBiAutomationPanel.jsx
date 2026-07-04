import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Workflow, ExternalLink, RefreshCw, BarChart3, CheckCircle2, Circle,
} from 'lucide-react';
import { fetchDashboardAutomationStatus } from '../services/devopsDashboardAutomationService';
import './DevOpsBiAutomationPanel.css';

const DevOpsBiAutomationPanel = ({ compact = false, refreshMs = 30000 }) => {
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await fetchDashboardAutomationStatus());
    } catch {
      setPack(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    if (!refreshMs) return undefined;
    const id = window.setInterval(load, refreshMs);
    return () => window.clearInterval(id);
  }, [load, refreshMs]);

  if (loading && !pack) {
    return <p className="dba-loading">Chargement pipeline dashboards DevOps…</p>;
  }
  if (!pack) return null;

  const { metrics, dashboards, pipeline, grafanaUp, prometheusUp, grafanaUrl } = pack;

  return (
    <section className={`dba-panel${compact ? ' dba-panel--compact' : ''}`}>
      <header className="dba-panel__head">
        <Workflow size={20} aria-hidden />
        <div>
          <h2>Automatisation dashboards DevOps → BI</h2>
          <p>
            Grafana provisionné depuis Git — métriques vet, IoT et audience via Prometheus.
          </p>
        </div>
        <button type="button" className="dba-btn" onClick={load}>
          <RefreshCw size={14} aria-hidden /> Actualiser
        </button>
      </header>

      <div className="dba-status-row">
        <span className={`dba-pill ${grafanaUp ? 'dba-pill--ok' : ''}`}>
          Grafana {grafanaUp ? 'UP' : 'OFF · fichier Docker'}
        </span>
        <span className={`dba-pill ${prometheusUp ? 'dba-pill--ok' : ''}`}>
          Prometheus {prometheusUp ? 'UP' : 'OFF'}
        </span>
        {grafanaUrl && (
          <a href={grafanaUrl} target="_blank" rel="noopener noreferrer" className="dba-ext">
            Ouvrir Grafana <ExternalLink size={12} />
          </a>
        )}
      </div>

      {!compact && (
        <div className="dba-kpi-row">
          <div className="dba-kpi"><span>En ligne</span><strong>{metrics.usersOnline ?? '—'}</strong></div>
          <div className="dba-kpi"><span>Cas vet</span><strong>{metrics.vetActiveCases ?? '—'}</strong></div>
          <div className="dba-kpi"><span>Alertes IoT</span><strong>{metrics.iotAlerts ?? '—'}</strong></div>
          <div className="dba-kpi"><span>Commandes</span><strong>{metrics.ordersTotal ?? '—'}</strong></div>
        </div>
      )}

      <div className="dba-grid">
        <div className="dba-block">
          <h3><BarChart3 size={16} /> Dashboards Grafana</h3>
          <ul className="dba-list">
            {dashboards.map((d) => (
              <li key={d.uid}>
                <div className="dba-list__main">
                  <strong>{d.title}</strong>
                  <span>{d.desc}</span>
                </div>
                <div className="dba-list__actions">
                  <a href={d.href} target="_blank" rel="noopener noreferrer" className="dba-link">
                    Grafana <ExternalLink size={11} />
                  </a>
                  <Link to={d.appRoute} className="dba-link">Hub app →</Link>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {!compact && (
          <div className="dba-block">
            <h3><Workflow size={16} /> Pipeline automatisation</h3>
            <ol className="dba-pipeline">
              {pipeline.map((step, i) => (
                <li key={step.id}>
                  <span className="dba-pipeline__icon" aria-hidden>
                    {grafanaUp || i < 3 ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  </span>
                  <div>
                    <strong>{step.label}</strong>
                    <code>{step.cmd}</code>
                    <span className="dba-muted">{step.trigger}</span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="dba-hint">
              Local : <code>npm run devops:dashboards:validate</code> ·{' '}
              <code>npm run docker:monitoring:up</code>
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DevOpsBiAutomationPanel;
