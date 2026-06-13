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
import { Activity, Calendar, Stethoscope } from 'lucide-react';
import { DEMO_VET_BI } from '../utils/vetDemoData';

const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const tooltipStyle = {
  borderRadius: 12,
  border: 'none',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  fontSize: 13,
  fontWeight: 600,
};

const VetDashboardCharts = ({
  weekChart = [],
  statusChart = [],
  casesByMonth = DEMO_VET_BI.casesByMonth,
  animalDistribution = DEMO_VET_BI.animalDistribution,
}) => {
  const monthData = (casesByMonth || []).map((row) => ({
    name: row.label,
    cas: row.count,
  }));

  const animalPie = (animalDistribution || []).map((row) => ({
    name: row.animal,
    value: row.count,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      style={{ marginBottom: 28 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={20} color="#0ea5e9" /> Courbes d&apos;activité clinique
        </h2>
        <Link
          to="/vet/bi"
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#0369a1',
            textDecoration: 'none',
            padding: '8px 14px',
            background: 'rgba(14,165,233,0.1)',
            borderRadius: 10,
          }}
        >
          Dashboard BI →
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginBottom: 18 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={16} color="#0ea5e9" /> RDV & consultations (7 jours)
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748b' }}>Activité quotidienne du cabinet</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weekChart} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="rdv" name="RDV" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="consultations" name="Consultations" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stethoscope size={16} color="#6366f1" /> Cas cliniques par mois
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748b' }}>Tendance des dossiers traités</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthData} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
              <defs>
                <linearGradient id="vetCasesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'Cas']} />
              <Area type="monotone" dataKey="cas" stroke="#6366f1" fill="url(#vetCasesGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700 }}>Statut des RDV</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusChart} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700 }}>Patients par espèce</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={animalPie} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {animalPie.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default VetDashboardCharts;
