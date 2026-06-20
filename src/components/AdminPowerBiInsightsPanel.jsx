import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pill, Activity, PawPrint, MapPin, Truck } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { DEMO_LIVREUR_STATS } from '../utils/livreurDemoData';
import './PowerBiDashboardPanel.css';

const PBI_COLORS = ['#118DFF', '#12239E', '#E66C37', '#6B007B', '#744EC2', '#D9B300', '#D64550', '#009E73'];

const tooltipStyle = {
  borderRadius: 10,
  border: 'none',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  fontSize: 12,
  fontWeight: 600,
};

const ChartCard = ({ title, icon: Icon, iconColor, children, wide }) => (
  <article className={`pbi-chart-card${wide ? ' pbi-chart-card--wide' : ''}`}>
    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {Icon && <Icon size={16} color={iconColor || '#118DFF'} />}
      {title}
    </h3>
    {children}
  </article>
);

/**
 * Graphiques Power BI — pharmacie, maladies, répartitions et livreurs.
 */
const AdminPowerBiInsightsPanel = ({
  biCharts = {},
  livreurStats = null,
  compact = false,
}) => {
  const {
    topMedications = [],
    topDiseases = [],
    animalDistribution = [],
    regionDistribution = [],
  } = biCharts;

  const livreur = livreurStats || DEMO_LIVREUR_STATS;
  const dailyChart = livreur.dailyChart?.length ? livreur.dailyChart : DEMO_LIVREUR_STATS.dailyChart;
  const chartH = compact ? 220 : 280;

  return (
    <motion.section
      className="pbi-insights"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      aria-label="Analyses Power BI — pharmacie et livraisons"
    >
      <div className="pbi-insights__head">
        <div>
          <span className="pbi-insights__badge">Power BI</span>
          <h2 className="pbi-insights__title">Pharmacie, maladies &amp; livraisons</h2>
          <p className="pbi-insights__sub">Top médicaments, pathologies, répartition animaux / régions et performance livreurs</p>
        </div>
        <Link to="/admin/powerbi" className="pbi-panel__btn pbi-panel__btn--primary" style={{ color: '#252423' }}>
          Hub Power BI →
        </Link>
      </div>

      <div className="pbi-insights__grid">
        <ChartCard title="Top médicaments prescrits" icon={Pill} iconColor="#0ea5e9">
          <ResponsiveContainer width="100%" height={chartH}>
            <BarChart data={topMedications.slice(0, 8)} layout="vertical" margin={{ left: 4, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={compact ? 90 : 120} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [v, n === 'cases' ? 'Cas' : 'Quantité']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="cases" name="Cas" fill="#118DFF" radius={[0, 6, 6, 0]} />
              <Bar dataKey="totalQty" name="Qté totale" fill="#744EC2" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top maladies diagnostiquées" icon={Activity} iconColor="#dc2626">
          <ResponsiveContainer width="100%" height={chartH}>
            <BarChart data={topDiseases.slice(0, 8)} layout="vertical" margin={{ left: 4, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={compact ? 90 : 120} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'Cas']} />
              <Bar dataKey="count" name="Cas" fill="#E66C37" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Répartition par animal" icon={PawPrint} iconColor="#059669">
          <ResponsiveContainer width="100%" height={chartH}>
            <PieChart>
              <Pie
                data={animalDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={compact ? 40 : 52}
                outerRadius={compact ? 68 : 88}
                paddingAngle={3}
                label={({ name, value }) => `${name} ${value}%`}
              >
                {animalDistribution.map((_, i) => (
                  <Cell key={i} fill={PBI_COLORS[i % PBI_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v, _n, p) => [`${v}% · ${p.payload.count ?? '—'} cas`, p.payload.name]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Répartition par région" icon={MapPin} iconColor="#7c3aed">
          <ResponsiveContainer width="100%" height={chartH}>
            <PieChart>
              <Pie
                data={regionDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={compact ? 40 : 52}
                outerRadius={compact ? 68 : 88}
                paddingAngle={2}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {regionDistribution.map((_, i) => (
                  <Cell key={i} fill={PBI_COLORS[(i + 2) % PBI_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v, _n, p) => [`${v}% · ${p.payload.orders ?? '—'} cmd.`, p.payload.name]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Livraisons livreurs (7 jours)" icon={Truck} iconColor="#059669" wide>
          <ResponsiveContainer width="100%" height={chartH}>
            <BarChart data={dailyChart} margin={{ top: 4, right: 8, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="count" name="Livraisons" fill="#12239E" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="commission" name="Commissions (DT)" fill="#118DFF" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
          <p className="pbi-insights__livreur-meta">
            {livreur.weekDelivered ?? 0} livraisons cette semaine · ponctualité {livreur.onTimeRate ?? 94}%
            · moy. {livreur.avgDeliveryMinutes ?? 28} min
          </p>
        </ChartCard>

        <ChartCard title="Courbe des gains livreurs" icon={Truck} iconColor="#059669" wide>
          <ResponsiveContainer width="100%" height={chartH}>
            <LineChart data={dailyChart} margin={{ top: 4, right: 8, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit=" DT" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} DT`, 'Commissions']} />
              <Line
                type="monotone"
                dataKey="commission"
                name="Commissions"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4, fill: '#059669' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </motion.section>
  );
};

export default AdminPowerBiInsightsPanel;
