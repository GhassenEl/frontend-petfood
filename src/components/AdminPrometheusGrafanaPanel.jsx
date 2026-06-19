import React, { useMemo } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Activity, ExternalLink, RefreshCw } from 'lucide-react';
import useLivePoll from '../hooks/useLivePoll';
import { fetchLiveMetricsTimeseries } from '../services/devopsStatusService';
import './AdminPrometheusGrafanaPanel.css';

const ChartCard = ({ title, unit, data, color, fill }) => (
  <article className="pg-panel__chart">
    <div className="pg-panel__chart-head">
      <h3>{title}</h3>
    </div>
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data || []}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10 }} unit={unit} width={42} />
        <Tooltip formatter={(v) => [`${v}${unit}`, title]} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={fill}
          strokeWidth={2}
          isAnimationActive
          animationDuration={600}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  </article>
);

/**
 * Courbes Grafana / Prometheus — mises à jour dynamiques (polling), sans embed live.
 */
const AdminPrometheusGrafanaPanel = ({
  refreshMs = 5000,
  compact = false,
}) => {
  const { data, loading, error, lastUpdatedAt, reload } = useLivePoll(
    () => fetchLiveMetricsTimeseries(30),
    refreshMs,
    true,
  );

  const sourceLabel = useMemo(() => {
    if (!data) return '—';
    if (data.source === 'prometheus') return 'Prometheus';
    if (data.source === 'hybrid') return 'Prometheus + buffer interne';
    return 'Buffer interne';
  }, [data]);

  const panels = data?.panels || {};
  const current = data?.current || {};

  return (
    <section className={`pg-panel${compact ? ' pg-panel--compact' : ''}`}>
      <header className="pg-panel__header">
        <div>
          <h2>
            <Activity size={20} /> Monitoring Grafana &amp; Prometheus
          </h2>
          <p>
            Courbes dynamiques (MAJ {data?.refreshSec || 5}s) · Source : <strong>{sourceLabel}</strong>
            {lastUpdatedAt && (
              <> · {new Date(lastUpdatedAt).toLocaleTimeString('fr-FR')}</>
            )}
          </p>
        </div>
        <div className="pg-panel__actions">
          <span className={`pg-panel__source pg-panel__source--${data?.prometheusUp ? 'prom' : 'int'}`}>
            {data?.prometheusUp ? 'Prometheus UP' : 'Prometheus OFF · fallback interne'}
          </span>
          {data && (
            <span className={`pg-panel__source pg-panel__source--${data.grafanaUp ? 'prom' : 'int'}`}>
              {data.grafanaUp ? 'Grafana UP' : 'Grafana OFF'}
            </span>
          )}
          <button type="button" className="pg-panel__refresh" onClick={reload} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'pg-panel__spin' : ''} /> Actualiser
          </button>
          {data?.grafanaUrl && (
            <a href={data.grafanaUrl} target="_blank" rel="noopener noreferrer" className="pg-panel__ext">
              Grafana <ExternalLink size={13} />
            </a>
          )}
          {data?.prometheusUp && (
            <a
              href={data.prometheusUrl || 'http://127.0.0.1:9090'}
              target="_blank"
              rel="noopener noreferrer"
              className="pg-panel__ext"
            >
              Prometheus <ExternalLink size={13} />
            </a>
          )}
        </div>
      </header>

      {error && <p className="pg-panel__error" role="alert">{error}</p>}

      <div className="pg-panel__kpis">
        <div><strong>{current.apiLatency ?? '—'}</strong><span>Latence API ms</span></div>
        <div><strong>{current.orders ?? '—'}</strong><span>Commandes</span></div>
        <div><strong>{current.esp32Cam ?? '—'}</strong><span>ESP32-CAM</span></div>
        <div><strong>{current.iotSensors ?? '—'}</strong><span>Capteurs IoT</span></div>
        <div><strong>{current.mlQuality ?? '—'}</strong><span>Qualité ML</span></div>
      </div>

      <div className="pg-panel__grid">
        <ChartCard title="Latence API /health" unit=" ms" data={panels.apiLatency} color="#2563eb" fill="#dbeafe" />
        <ChartCard title="ESP32-CAM connectées" unit="" data={panels.esp32Cam} color="#059669" fill="#d1fae5" />
        <ChartCard title="Capteurs IoT actifs" unit="" data={panels.iotSensors} color="#0891b2" fill="#cffafe" />
        <ChartCard title="Commandes (total)" unit="" data={panels.orders} color="#7c3aed" fill="#ede9fe" />
        <ChartCard title="Requêtes / intervalle" unit="" data={panels.requests} color="#e67e22" fill="#ffedd5" />
        <ChartCard title="Qualité modèle IA" unit="" data={panels.mlQuality} color="#db2777" fill="#fce7f3" />
      </div>

      {panels.cpuPercent?.length > 0 && (
        <article className="pg-panel__chart pg-panel__chart--wide">
          <div className="pg-panel__chart-head">
            <h3>CPU hôte (Prometheus / node-exporter)</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={panels.cpuPercent}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} unit=" %" width={42} />
              <Tooltip formatter={(v) => [`${v} %`, 'CPU']} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
                isAnimationActive
                animationDuration={600}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </article>
      )}

      {data && !data.grafanaUp && (
        <p className="pg-panel__embed-hint">
          Dashboard Grafana externe indisponible — les courbes ci-dessus restent mises à jour dynamiquement
          {data.prometheusUp ? ' via Prometheus' : ' via le buffer interne'}.
          Lancez <code>npm run docker:monitoring:up</code> pour activer Grafana.
        </p>
      )}
    </section>
  );
};

export default AdminPrometheusGrafanaPanel;
