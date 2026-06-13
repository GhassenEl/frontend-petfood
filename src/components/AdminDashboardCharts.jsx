import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, Clock, Users } from 'lucide-react';

const COLORS = ['#e67e22', '#27ae60', '#3498db', '#9b59b6', '#e74c3c', '#f39c12'];

const tooltipStyle = {
  borderRadius: 12,
  border: 'none',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  fontSize: 13,
  fontWeight: 600,
};

const AdminDashboardCharts = ({
  revenueData = [],
  statusData = [],
  dailyData = [],
  usersData = [],
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    style={{ marginBottom: 28 }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
      <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#334155' }}>📈 Courbes & tendances</h2>
      <Link
        to="/admin/sales"
        style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#e67e22',
          textDecoration: 'none',
          padding: '8px 14px',
          background: 'rgba(230,126,34,0.08)',
          borderRadius: 10,
        }}
      >
        Détail ventes →
      </Link>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginBottom: 18 }}>
      <div className="card-animal" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={16} color="#e67e22" /> Courbe du chiffre d&apos;affaires
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748b' }}>Évolution mensuelle (DT)</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={revenueData} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} DT`, 'CA']} />
            <Line type="monotone" dataKey="value" stroke="#e67e22" strokeWidth={3} dot={{ r: 4, fill: '#e67e22' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card-animal" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={16} color="#27ae60" /> Commandes & CA (7 jours)
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748b' }}>Volume quotidien</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={dailyData} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
            <defs>
              <linearGradient id="adminCaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#27ae60" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#27ae60" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="adminOrdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3498db" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3498db" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area yAxisId="left" type="monotone" dataKey="commandes" name="Commandes" stroke="#3498db" fill="url(#adminOrdGrad)" strokeWidth={2} />
            <Area yAxisId="right" type="monotone" dataKey="ca" name="CA (DT)" stroke="#27ae60" fill="url(#adminCaGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
      <div className="card-animal" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={16} color="#3498db" /> Croissance utilisateurs
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748b' }}>Nouveaux comptes par mois</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={usersData} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'Utilisateurs']} />
            <Line type="monotone" dataKey="utilisateurs" stroke="#3498db" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card-animal" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} color="#9b59b6" /> Statut des commandes
        </h3>
        <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#64748b' }}>Répartition actuelle</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={78}
              paddingAngle={4}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, marginTop: 4 }}>
          {statusData.map((entry, index) => (
            <div key={entry.name} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: COLORS[index % COLORS.length] }}>{entry.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{entry.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-animal" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700 }}>Histogramme CA mensuel</h3>
        <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748b' }}>Comparaison par période</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} DT`, 'Revenus']} />
            <Bar dataKey="value" fill="#e67e22" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </motion.div>
);

export default AdminDashboardCharts;
