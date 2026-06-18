import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { DEMO_LIVREUR_STATS } from '../utils/livreurDemoData';

const COLORS = ['#27ae60', '#059669', '#3498db', '#f39c12', '#e74c3c'];

const tooltipStyle = {
  borderRadius: 12,
  border: 'none',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  fontSize: 13,
  fontWeight: 600,
};

const LivreurDashboardCharts = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="card-animal" style={{ padding: 24, marginBottom: 24, textAlign: 'center', color: '#64748b' }}>
        Chargement des graphiques…
      </div>
    );
  }

  if (!stats) return null;

  const dailyChart = stats.dailyChart?.length ? stats.dailyChart : DEMO_LIVREUR_STATS.dailyChart;
  const statusEntries = Object.entries(stats.statusBreakdown || {}).filter(([, v]) => Number(v) > 0);
  const statusData = (statusEntries.length ? statusEntries : Object.entries(DEMO_LIVREUR_STATS.statusBreakdown)).map(([name, value]) => ({
    name: { pending: 'En attente', shipped: 'En cours', delivered: 'Livrées', cancelled: 'Annulées', paid: 'Payées' }[name] || name,
    value,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      style={{ marginBottom: 28 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>📊 Tableau de bord — performance</h2>
        <Link
          to="/livreur/stats"
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#059669',
            textDecoration: 'none',
            padding: '8px 14px',
            background: 'rgba(5,150,105,0.08)',
            borderRadius: 10,
          }}
        >
          Voir tout →
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
        <div className="card-animal" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700 }}>Livraisons & gains (7 jours)</h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748b' }}>
            {stats.weekDelivered ?? 0} livraison(s) · {stats.weekCommission ?? 0} DT cette semaine
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyChart} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Livraisons" fill="#27ae60" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="commission" name="Gains (DT)" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-animal" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700 }}>Courbe des gains</h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748b' }}>
            Commission {stats.commissionPerDelivery ?? 5} DT / livraison
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyChart} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="commission" name="Gains (DT)" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card-animal" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700 }}>Répartition des commandes</h3>
          <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#64748b' }}>
            Ponctualité {stats.onTimeRate ?? 95}% · moy. {stats.avgDeliveryMinutes ?? '—'} min
          </p>
          {statusData.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Pas encore de données</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LivreurDashboardCharts;
