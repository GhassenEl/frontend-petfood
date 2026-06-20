import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, ExternalLink, Maximize2, RefreshCw, TrendingUp, Receipt,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import useAnalyticsHub from '../hooks/useAnalyticsHub';
import { DEMO_ADMIN_ANALYTICS } from '../utils/adminDemoData';
import './PowerBiDashboardPanel.css';

const tooltipStyle = {
  borderRadius: 10,
  border: 'none',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  fontSize: 12,
  fontWeight: 600,
};

/**
 * Panneau Power BI — iframe si URL configurée, sinon dashboard interactif style Power BI.
 */
const PowerBiDashboardPanel = ({
  compact = false,
  salesOnly = false,
  revenueData = [],
  dailyData = [],
  totalRevenue = null,
  showHeader = true,
  className = '',
}) => {
  const { data: apiData, loading, reload } = useAnalyticsHub();
  const viteEmbed = import.meta.env.VITE_POWER_BI_EMBED_URL || '';
  const embedUrl = apiData?.powerBi?.embedUrl || viteEmbed || '';

  const kpi = {
    ...DEMO_ADMIN_ANALYTICS.kpiSummary,
    ...(apiData?.kpiSummary || {}),
  };

  const kpis = salesOnly
    ? [
        {
          label: 'CA total',
          value: totalRevenue != null
            ? `${Number(totalRevenue).toLocaleString('fr-FR')} DT`
            : `${Number(kpi.revenueMonth || 0).toLocaleString('fr-FR')} DT`,
          icon: TrendingUp,
          tone: 'pbi-kpi--blue',
        },
        {
          label: 'CA du mois',
          value: `${Number(kpi.revenueMonth || 0).toLocaleString('fr-FR')} DT`,
          icon: BarChart3,
          tone: 'pbi-kpi--navy',
        },
        {
          label: 'Panier moyen',
          value: `${kpi.avgOrderValue ?? '—'} DT`,
          icon: Receipt,
          tone: 'pbi-kpi--orange',
        },
        {
          label: 'Commandes (mois)',
          value: kpi.ordersMonth ?? '—',
          icon: TrendingUp,
          tone: 'pbi-kpi--purple',
        },
      ]
    : [
        { label: 'CA du mois', value: `${Number(kpi.revenueMonth || 0).toLocaleString('fr-FR')} DT`, icon: TrendingUp, tone: 'pbi-kpi--blue' },
        { label: 'Commandes', value: kpi.ordersMonth ?? '—', icon: BarChart3, tone: 'pbi-kpi--navy' },
        { label: 'Clients actifs', value: kpi.activeClients ?? '—', icon: BarChart3, tone: 'pbi-kpi--purple' },
        { label: 'Panier moyen', value: `${kpi.avgOrderValue ?? '—'} DT`, icon: Receipt, tone: 'pbi-kpi--orange' },
        { label: 'Ponctualité livraison', value: `${kpi.deliveryOnTime ?? '—'}%`, icon: BarChart3, tone: 'pbi-kpi--teal' },
      ];

  const regionData = (DEMO_ADMIN_ANALYTICS.biCharts?.regionDistribution || []).map((r) => ({
    name: r.name,
    value: r.value,
  }));

  return (
    <motion.section
      className={`pbi-panel ${compact ? 'pbi-panel--compact' : ''} ${className}`.trim()}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      aria-label={salesOnly ? 'Ventes et chiffre d\'affaires' : 'Tableau de bord Power BI'}
    >
      {showHeader && (
        <header className="pbi-panel__header">
          <div className="pbi-panel__brand">
            <span className="pbi-panel__logo" aria-hidden>
              <BarChart3 size={22} />
            </span>
            <div>
              <h2 className="pbi-panel__title">
                {salesOnly ? 'Ventes & chiffre d\'affaires' : 'Power BI — Tableau de bord'}
              </h2>
              <p className="pbi-panel__subtitle">
                {salesOnly
                  ? 'Suivi du CA et des ventes en temps réel'
                  : embedUrl
                    ? 'Rapport intégré en direct'
                    : 'Vue analytique interactive (mode démo)'}
              </p>
            </div>
          </div>
          <div className="pbi-panel__actions">
            <button type="button" className="pbi-panel__btn" onClick={reload} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'pbi-spin' : ''} />
              Actualiser
            </button>
            {salesOnly ? (
              <Link to="/admin/sales" className="pbi-panel__btn pbi-panel__btn--primary">
                <Maximize2 size={14} />
                Détail ventes
              </Link>
            ) : (
              <Link to="/admin/powerbi" className="pbi-panel__btn pbi-panel__btn--primary">
                <Maximize2 size={14} />
                Hub Power BI
              </Link>
            )}
          </div>
        </header>
      )}

      <div className="pbi-panel__kpis">
        {kpis.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className={`pbi-kpi ${tone}`}>
            <Icon size={16} aria-hidden />
            <div>
              <div className="pbi-kpi__value">{value}</div>
              <div className="pbi-kpi__label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {embedUrl && !salesOnly ? (
        <div className="pbi-panel__embed-wrap">
          <iframe
            title="Power BI PetfoodTN"
            src={embedUrl}
            className="pbi-panel__iframe"
            allowFullScreen
          />
          <a href={embedUrl} target="_blank" rel="noopener noreferrer" className="pbi-panel__embed-link">
            Ouvrir dans Power BI Service <ExternalLink size={12} />
          </a>
        </div>
      ) : (
        <div className={`pbi-panel__charts${salesOnly ? ' pbi-panel__charts--sales' : ''}`}>
          <article className="pbi-chart-card pbi-chart-card--wide">
            <h3>Évolution du chiffre d&apos;affaires</h3>
            <ResponsiveContainer width="100%" height={compact ? 200 : 280}>
              <AreaChart data={revenueData.length ? revenueData : [{ name: '—', value: 0 }]}>
                <defs>
                  <linearGradient id="pbiRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#118DFF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#118DFF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} DT`, 'CA']} />
                <Area type="monotone" dataKey="value" stroke="#118DFF" strokeWidth={2.5} fill="url(#pbiRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </article>

          {!salesOnly && (
            <>
              <article className="pbi-chart-card">
                <h3>Commandes par jour</h3>
                <ResponsiveContainer width="100%" height={compact ? 200 : 260}>
                  <BarChart data={dailyData.length ? dailyData : [{ name: '—', commandes: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'Commandes']} />
                    <Bar dataKey="commandes" fill="#12239E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </article>

              <article className="pbi-chart-card">
                <h3>CA par région</h3>
                <ResponsiveContainer width="100%" height={compact ? 200 : 260}>
                  <BarChart data={regionData} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} unit="%" />
                    <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Part CA']} />
                    <Bar dataKey="value" fill="#E66C37" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </article>
            </>
          )}

          {salesOnly && (
            <article className="pbi-chart-card">
              <h3>CA par région</h3>
              <ResponsiveContainer width="100%" height={compact ? 200 : 280}>
                <BarChart data={regionData} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} unit="%" />
                  <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Part CA']} />
                  <Bar dataKey="value" fill="#E66C37" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </article>
          )}
        </div>
      )}

      {!embedUrl && !salesOnly && (
        <p className="pbi-panel__hint">
          Pour intégrer votre rapport Power BI : configurez{' '}
          <code>VITE_POWER_BI_EMBED_URL</code> ou <code>POWER_BI_EMBED_URL</code> (backend).
          {' '}
          <Link to="/admin/powerbi">Voir le hub complet →</Link>
        </p>
      )}
    </motion.section>
  );
};

export default PowerBiDashboardPanel;
