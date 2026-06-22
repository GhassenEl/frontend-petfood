import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, Activity, BarChart3, Stethoscope, AlertTriangle, TrendingUp,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { DEMO_VET_BI, DEMO_VET_DASHBOARD } from '../utils/vetDemoData';
import './VetAiBiChartsPanel.css';

const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const AI_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'];

const tooltipStyle = {
  borderRadius: 12,
  border: 'none',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  fontSize: 12,
  fontWeight: 600,
};

const ChartBox = ({ title, subtitle, icon: Icon, iconColor, children, wide }) => (
  <article className={`vet-aibi-chart${wide ? ' vet-aibi-chart--wide' : ''}`}>
    <h3>
      {Icon && <Icon size={16} color={iconColor || '#0ea5e9'} />}
      {title}
    </h3>
    {subtitle && <p className="vet-aibi-chart__sub">{subtitle}</p>}
    {children}
  </article>
);

/**
 * Courbes IA + BI pour l'espace vétérinaire.
 */
const VetAiBiChartsPanel = ({
  weekChart = [],
  statusChart = [],
  biData = null,
  showBiSection = true,
  showAiSection = true,
  compact = false,
  embeddedInDashboard = false,
}) => {
  const bi = biData || DEMO_VET_BI;
  const ai = bi.aiMetrics || DEMO_VET_BI.aiMetrics;
  const chartH = compact || embeddedInDashboard ? 220 : 240;

  const monthData = (bi.casesByMonth || []).map((row) => ({
    name: row.label,
    cas: row.count,
  }));

  const animalPie = (bi.animalDistribution || []).map((row) => ({
    name: row.animal,
    value: row.count,
  }));

  const diseasePie = (bi.diseaseByAnimal || []).slice(0, 8).map((row) => ({
    name: row.disease?.length > 20 ? `${row.disease.slice(0, 18)}…` : row.disease,
    value: row.count,
    fullName: row.disease,
    animal: row.animal,
  }));

  const resolvedWeekChart = weekChart.length ? weekChart : DEMO_VET_DASHBOARD.weekChart;
  const resolvedStatusChart = statusChart.length ? statusChart : DEMO_VET_DASHBOARD.statusChart;

  return (
    <motion.section
      className={`vet-aibi-panel${compact || embeddedInDashboard ? ' vet-aibi-panel--compact' : ''}${embeddedInDashboard ? ' vet-aibi-panel--dashboard' : ''}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <header className="vet-aibi-panel__head">
        <div>
          <span className="vet-aibi-panel__badge">
            <Brain size={12} /> IA + BI
          </span>
          <h2>{embeddedInDashboard ? 'Courbes BI & intelligence clinique' : 'Courbes intelligence artificielle & business intelligence'}</h2>
          <p>
            {embeddedInDashboard
              ? 'Activité, cas cliniques, espèces, maladies et performance IA — données synchronisées avec le dashboard BI.'
              : 'Analyses ML, précision diagnostic, activité clinique et pharmacie'}
          </p>
        </div>
        <div className="vet-aibi-panel__links">
          <Link to="/vet/ml-agent" className="vet-aibi-link">Hub Agents IA</Link>
          <Link to="/vet/bi" className="vet-aibi-link vet-aibi-link--primary">Dashboard BI complet →</Link>
        </div>
      </header>

      {showAiSection && ai && (
        <>
          <h3 className="vet-aibi-section-title">
            <Brain size={18} /> Intelligence artificielle
          </h3>
          <div className="vet-aibi-grid">
            <ChartBox
              title="Analyses IA (7 jours)"
              subtitle="Volume quotidien · cas urgents en rouge"
              icon={Activity}
              iconColor="#06b6d4"
            >
              <ResponsiveContainer width="100%" height={chartH}>
                <LineChart data={ai.analysesDaily || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="analyses" name="Analyses" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="urgent" name="Urgents" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox
              title="Précision & rappel IA (6 mois)"
              subtitle="Performance modèle diagnostic"
              icon={TrendingUp}
              iconColor="#8b5cf6"
            >
              <ResponsiveContainer width="100%" height={chartH}>
                <AreaChart data={ai.accuracyByMonth || []}>
                  <defs>
                    <linearGradient id="vetPrecGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[70, 100]} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, '']} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="precision" name="Précision" stroke="#8b5cf6" fill="url(#vetPrecGrad)" strokeWidth={2} />
                  <Line type="monotone" dataKey="rappel" name="Rappel" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Niveaux d'urgence IA" subtitle="Classification automatique" icon={AlertTriangle} iconColor="#f59e0b">
              <ResponsiveContainer width="100%" height={chartH}>
                <PieChart>
                  <Pie
                    data={ai.urgencyBreakdown || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={compact ? 40 : 50}
                    outerRadius={compact ? 65 : 80}
                    paddingAngle={3}
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {(ai.urgencyBreakdown || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Part']} />
                </PieChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Prédictions par agent IA" subtitle="Maladie · Nutrition · Anomalies · Pharmacie" icon={Brain} iconColor="#6366f1">
              <ResponsiveContainer width="100%" height={chartH}>
                <BarChart data={ai.predictionsByAgent || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="agent" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Prédictions" radius={[6, 6, 0, 0]}>
                    {(ai.predictionsByAgent || []).map((_, i) => (
                      <Cell key={i} fill={AI_COLORS[i % AI_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox
              title="Confiance moyenne IA (7 sem.)"
              subtitle="Score de confiance des recommandations"
              icon={TrendingUp}
              iconColor="#059669"
              wide
            >
              <ResponsiveContainer width="100%" height={chartH}>
                <LineChart data={ai.confidenceTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[70, 100]} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Confiance']} />
                  <Line type="monotone" dataKey="score" stroke="#059669" strokeWidth={3} dot={{ r: 5, fill: '#059669' }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox
              title="Top maladies — tendance IA (6 mois)"
              subtitle="Dermatite · Arthrose · Parasites"
              icon={Stethoscope}
              iconColor="#0ea5e9"
              wide
            >
              <ResponsiveContainer width="100%" height={chartH}>
                <LineChart data={ai.topDiseasesMonthly || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="dermatite" name="Dermatite" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="arthrose" name="Arthrose" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="parasites" name="Parasites" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>
        </>
      )}

      {showBiSection && (
        <>
          <h3 className="vet-aibi-section-title">
            <BarChart3 size={18} /> Business intelligence clinique
          </h3>
          <div className="vet-aibi-grid">
            {resolvedWeekChart.length > 0 && (
              <ChartBox title="RDV & consultations (7 jours)" icon={Activity} iconColor="#0ea5e9">
                <ResponsiveContainer width="100%" height={chartH}>
                  <LineChart data={resolvedWeekChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="rdv" name="RDV" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="consultations" name="Consultations" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartBox>
            )}

            {monthData.length > 0 && (
              <ChartBox title="Cas cliniques par mois" icon={Stethoscope} iconColor="#6366f1">
                <ResponsiveContainer width="100%" height={chartH}>
                  <AreaChart data={monthData}>
                    <defs>
                      <linearGradient id="vetCasesGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'Cas']} />
                    <Area type="monotone" dataKey="cas" stroke="#6366f1" fill="url(#vetCasesGrad2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartBox>
            )}

            {resolvedStatusChart.length > 0 && (
              <ChartBox title="Statut des RDV">
                <ResponsiveContainer width="100%" height={chartH - 20}>
                  <BarChart data={resolvedStatusChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartBox>
            )}

            {animalPie.length > 0 && (
              <ChartBox title="Patients par espèce">
                <ResponsiveContainer width="100%" height={chartH - 20}>
                  <PieChart>
                    <Pie data={animalPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {animalPie.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartBox>
            )}

            {diseasePie.length > 0 && (
              <ChartBox title="Maladies par animal" subtitle="Répartition des diagnostics" icon={Stethoscope} iconColor="#f59e0b">
                <ResponsiveContainer width="100%" height={chartH}>
                  <PieChart>
                    <Pie
                      data={diseasePie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={compact || embeddedInDashboard ? 42 : 50}
                      outerRadius={compact || embeddedInDashboard ? 68 : 80}
                      paddingAngle={2}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {diseasePie.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v, _n, p) => [`${v} cas`, p.payload.fullName || p.payload.name]}
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartBox>
            )}

            {(bi.topMedications?.length ?? 0) > 0 && (
              <ChartBox title="Top médicaments (BI)" wide>
                <ResponsiveContainer width="100%" height={chartH}>
                  <BarChart data={bi.topMedications.slice(0, 6)} layout="vertical" margin={{ left: 4, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={compact ? 90 : 110} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="cases" name="Cas" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartBox>
            )}
          </div>
        </>
      )}
    </motion.section>
  );
};

export default VetAiBiChartsPanel;
