import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const VetHealthEvolutionPanel = ({ evolution, patients = [], loading }) => {
  const [petId, setPetId] = useState(patients[0]?.id || '');
  const data = evolution || { weightKg: [], dailyKcal: [], healthScore: [], insights: [] };

  const chartData = (data.weightKg || []).map((w, i) => ({
    month: w.month,
    poids: w.value,
    kcal: data.dailyKcal?.[i]?.value,
    score: data.healthScore?.[i]?.value,
  }));

  if (loading) return <p className="vetih-muted">Chargement des courbes…</p>;

  return (
    <div className="vetih-panel">
      <p className="vetih-summary">
        <TrendingUp size={16} aria-hidden />
        Visualisation de l&apos;évolution du poids, de l&apos;alimentation et des paramètres de santé.
      </p>

      {patients.length > 0 && (
        <label className="vetih-select-inline">
          Patient
          <select value={petId} onChange={(e) => setPetId(e.target.value)}>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.petName}</option>
            ))}
          </select>
        </label>
      )}

      <div className="vetih-chart-wrap">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="poids" name="Poids (kg)" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
            <Line yAxisId="right" type="monotone" dataKey="kcal" name="kcal/j" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
            <Line yAxisId="right" type="monotone" dataKey="score" name="Score santé" stroke="#7c3aed" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h4>Insights IA</h4>
      <ul className="vetih-list">
        {(data.insights || []).map((ins, i) => (
          <li key={i} className="vetih-card">
            <strong>{ins.metric}</strong>
            <span className={`vetih-trend vetih-trend--${ins.trend}`}>{ins.trend}</span>
            <p>{ins.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VetHealthEvolutionPanel;
