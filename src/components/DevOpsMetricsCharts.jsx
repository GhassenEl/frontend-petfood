import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const DevOpsMetricsCharts = ({ performance }) => {
  if (!performance?.api) return null;

  const requestSeries = performance.api.requestSeries || [];
  const latencySeries = performance.api.latencySeries || [];

  return (
    <section className="devops-section">
      <h2>Métriques temps réel</h2>
      <div className="devops-charts">
        <article className="devops-card devops-chart-card">
          <h3>Requêtes API (5 min)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={requestSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#2563eb" fill="#93c5fd" fillOpacity={0.35} />
            </AreaChart>
          </ResponsiveContainer>
        </article>
        <article className="devops-card devops-chart-card">
          <h3>Latence (ms)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={latencySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="ms" stroke="#059669" fill="#86efac" fillOpacity={0.35} />
            </AreaChart>
          </ResponsiveContainer>
        </article>
      </div>
      {performance.api.slowest?.length > 0 && (
        <div className="devops-card" style={{ marginTop: 14 }}>
          <h3>Endpoints les plus lents</h3>
          <ul className="devops-slow-list">
            {performance.api.slowest.map((row) => (
              <li key={`${row.method}-${row.path}`}>
                <code>{row.method} {row.path}</code>
                <span>{row.ms} ms · {row.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default DevOpsMetricsCharts;
