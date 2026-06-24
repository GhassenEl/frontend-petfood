import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  LineChart,
  Label,
} from 'recharts';

import { normalizeLivreurDailyChart, normalizeLivreurStatusBreakdown } from '../utils/livreurDemoData';

const COLORS = ['#27ae60', '#059669', '#3498db', '#f39c12', '#e74c3c'];

const tooltipStyle = {
  borderRadius: 12,
  border: 'none',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  fontSize: 13,
  fontWeight: 600,
};

const useMeasuredWidth = () => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const measure = () => {
      const next = Math.floor(el.getBoundingClientRect().width);
      if (next > 0) setWidth(next);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return [ref, width];
};

const ChartFrame = ({ height = 240, children }) => {
  const [ref, width] = useMeasuredWidth();
  return (
    <div ref={ref} style={{ width: '100%', minWidth: 0, height }}>
      {width > 0 ? children(width) : null}
    </div>
  );
};

const LivreurDashboardCharts = ({ stats, loading }) => {
  const dailyChart = useMemo(
    () => normalizeLivreurDailyChart(stats?.dailyChart),
    [stats?.dailyChart],
  );

  const statusData = useMemo(
    () => (stats?.statusPie?.length
      ? stats.statusPie
      : normalizeLivreurStatusBreakdown(stats?.statusBreakdown)),
    [stats?.statusPie, stats?.statusBreakdown],
  );

  const totalOrders = useMemo(
    () => statusData.reduce((sum, d) => sum + d.value, 0),
    [statusData],
  );

  if (loading) {
    return (
      <div className="card-animal" style={{ padding: 24, marginBottom: 24, textAlign: 'center', color: '#64748b' }}>
        Chargement des graphiques…
      </div>
    );
  }

  if (!stats) return null;

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18, minWidth: 0 }}>
        <div className="card-animal" style={{ padding: 20, minWidth: 0 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700 }}>Livraisons & gains (7 jours)</h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748b' }}>
            {stats.weekDelivered ?? 0} livraison(s) · {stats.weekCommission ?? 0} DT cette semaine
          </p>
          <ChartFrame height={240}>
            {(width) => (
              <ComposedChart width={width} height={240} data={dailyChart} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={32}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                  unit=" DT"
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [
                    name === 'Gains (DT)' ? `${value} DT` : value,
                    name,
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  name="Livraisons"
                  fill="#27ae60"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="commission"
                  name="Gains (DT)"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#059669' }}
                />
              </ComposedChart>
            )}
          </ChartFrame>
        </div>

        <div className="card-animal" style={{ padding: 20, minWidth: 0 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700 }}>Courbe des gains</h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748b' }}>
            Commission {stats.commissionPerDelivery ?? 5} DT / livraison
          </p>
          <ChartFrame height={240}>
            {(width) => (
              <LineChart width={width} height={240} data={dailyChart} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                  unit=" DT"
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [`${v} DT`, 'Gains']}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  name="Gains (DT)"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#059669' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ChartFrame>
        </div>

        <div className="card-animal" style={{ padding: 20, minWidth: 0 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700 }}>Répartition des commandes</h3>
          <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#64748b' }}>
            Ponctualité {stats.onTimeRate ?? 95}% · moy. {stats.avgDeliveryMinutes ?? '—'} min
          </p>
          <ChartFrame height={200}>
            {(width) => (
              <PieChart width={width} height={200}>
                <Pie
                  data={statusData}
                  cx={width / 2}
                  cy={100}
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={false}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.key || entry.name} fill={entry.color || COLORS[0]} stroke="#fff" strokeWidth={2} />
                  ))}
                  <Label
                    value={totalOrders}
                    position="center"
                    style={{ fontSize: 22, fontWeight: 800, fill: '#334155' }}
                  />
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [`${value} commande(s)`, name]}
                />
              </PieChart>
            )}
          </ChartFrame>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(72px, 1fr))',
            gap: 8,
            marginTop: 4,
          }}
          >
            {statusData.map((entry) => (
              <div key={entry.key || entry.name} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: entry.color || '#334155' }}>
                  {entry.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, lineHeight: 1.2 }}>
                  {entry.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LivreurDashboardCharts;
