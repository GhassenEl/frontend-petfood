import React from 'react';
import { normalizeLivreurDailyChart } from '../utils/livreurDemoData';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const LivreurPerformancePanel = ({ performance, loading }) => {
  if (loading) return <p className="livih-muted">Chargement performances…</p>;
  const p = performance || {};

  const dailyChart = normalizeLivreurDailyChart(p.dailyChart);

  return (
    <div className="livih-panel">
      <p className="livih-summary">
        <BarChart3 size={16} aria-hidden />
        Suivi livraisons réalisées, taux de réussite, temps moyen et satisfaction client.
      </p>
      <div className="livih-stats-row">
        <div className="livih-stat"><strong>{p.totalDelivered}</strong><span>Livraisons</span></div>
        <div className="livih-stat livih-stat--green"><strong>{p.successRate}%</strong><span>À l&apos;heure</span></div>
        <div className="livih-stat"><strong>{p.avgDeliveryMinutes} min</strong><span>Temps moyen</span></div>
        <div className="livih-stat"><strong>{p.satisfactionScore}/5</strong><span>Satisfaction</span></div>
      </div>
      <p className="livih-ai-text">{p.aiSummary}</p>
      {dailyChart.length > 0 && (
        <div className="livih-chart-wrap" style={{ width: '100%', minHeight: 200, height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyChart} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" name="Livraisons" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <h4><TrendingUp size={16} /> Insights</h4>
      <ul className="livih-list">
        {(p.insights || []).map((ins) => (
          <li key={ins.label} className="livih-card">
            <strong>{ins.label} : {ins.value}</strong>
            <p>{ins.message}</p>
          </li>
        ))}
      </ul>
      <Link to="/livreur/stats" className="livih-link">Statistiques détaillées →</Link>
    </div>
  );
};

export default LivreurPerformancePanel;
