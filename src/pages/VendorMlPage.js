import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, RefreshCw, TrendingUp, Package, Percent, AlertTriangle } from 'lucide-react';
import useVendorMlAgent from '../hooks/useVendorMlAgent';
import { formatDT } from '../utils/formatCurrency';
import './VendorPages.css';

const VendorMlPage = () => {
  const { data, loading, reload, pythonPowered, groqPowered, mlPowered } = useVendorMlAgent();
  const agent = data || {};
  const alerts = agent.stockAlerts || agent.alerts || [];
  const promos = agent.promoSuggestions || agent.promotions || [];
  const forecast = agent.salesForecast || agent.forecast || [];
  const priceSuggestions = agent.priceSuggestions || [];
  const lowPerformers = agent.lowPerformers || [];
  const demandAnomalies = agent.demandAnomalies || [];

  return (
    <div className="vnd-page">
      <header className="vnd-hero">
        <h1><Brain size={24} /> Assistant ML vendeur</h1>
        <p>
          Prévisions ventes, alertes stock et suggestions promo — alimenté par les données marketplace.
          {(pythonPowered || groqPowered || mlPowered) && (
            <span className="vnd-demo-pill" style={{ marginLeft: 8, background: '#dcfce7', color: '#166534' }}>IA active</span>
          )}
        </p>
        <button type="button" className="vnd-btn vnd-btn--ghost vnd-btn--sm" onClick={reload} disabled={loading}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </header>

      {loading && !data ? (
        <p className="vnd-empty">Chargement de l&apos;agent ML…</p>
      ) : (
        <>
          <div className="vnd-kpi-grid">
            <div className="vnd-kpi">
              <span><TrendingUp size={16} /> Prévision 7j</span>
              <strong>{formatDT(agent.revenueForecast7d ?? agent.forecastRevenue ?? 0)}</strong>
            </div>
            <div className="vnd-kpi">
              <span><Package size={16} /> Alertes stock</span>
              <strong>{alerts.length}</strong>
            </div>
            <div className="vnd-kpi">
              <span><Percent size={16} /> Promos suggérées</span>
              <strong>{promos.length}</strong>
            </div>
            <div className="vnd-kpi">
              <span><AlertTriangle size={16} /> Risque rupture</span>
              <strong>{agent.riskScore != null ? `${agent.riskScore}%` : '—'}</strong>
            </div>
          </div>

          {agent.summary && (
            <div className="vnd-card" style={{ marginBottom: 16 }}>
              <h2>Analyse</h2>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>{agent.summary}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <section className="vnd-card">
              <h2>Alertes stock</h2>
              {alerts.length === 0 ? (
                <p className="vnd-empty">Stock OK sur vos références.</p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {alerts.slice(0, 8).map((a, i) => (
                    <li key={a.productId || i} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <strong>{a.productName || a.name}</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        Stock {a.stock ?? '—'} · {a.message || a.reason || 'Réapprovisionner'}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/vendor/products" className="vnd-btn vnd-btn--ghost vnd-btn--sm" style={{ marginTop: 12 }}>Gérer les produits →</Link>
            </section>

            <section className="vnd-card">
              <h2>Promotions suggérées</h2>
              {promos.length === 0 ? (
                <p className="vnd-empty">Aucune promo recommandée cette semaine.</p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {promos.slice(0, 6).map((p, i) => (
                    <li key={p.id || i} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <strong>{p.productName || p.label}</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        -{p.discountPercent || p.discount || 10}% · {p.reason || 'Boost ventes'}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="vnd-card">
              <h2>Prévisions ventes</h2>
              {forecast.length === 0 ? (
                <p className="vnd-empty">Historique insuffisant — vendez quelques jours pour activer les prévisions.</p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {forecast.slice(0, 7).map((f, i) => (
                    <li key={f.label || i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span>{f.label || f.day}</span>
                      <strong>{formatDT(f.revenue ?? f.value ?? 0)}</strong>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/vendor/bi" className="vnd-btn vnd-btn--ghost vnd-btn--sm" style={{ marginTop: 12 }}>Dashboard BI →</Link>
            </section>

            <section className="vnd-card">
              <h2>Ajustements prix IA</h2>
              {priceSuggestions.length === 0 ? (
                <p className="vnd-empty">Prix optimaux pour l&apos;instant.</p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {priceSuggestions.slice(0, 6).map((s, i) => (
                    <li key={s.productId || i} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <strong>{s.productName}</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        {s.suggestedChange} · {s.reason}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="vnd-card">
              <h2>Produits faible performance</h2>
              {lowPerformers.length === 0 ? (
                <p className="vnd-empty">Tous vos produits performent correctement.</p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {lowPerformers.map((p, i) => (
                    <li key={p.productId || i} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <strong>{p.productName}</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        {p.unitsSold} ventes · {p.action}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="vnd-card">
              <h2>Anomalies demande</h2>
              {demandAnomalies.length === 0 ? (
                <p className="vnd-empty">Demande stable sur vos références.</p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {demandAnomalies.map((a, i) => (
                    <li key={a.productId || i} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <strong>{a.productName}</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: a.severity === 'warning' ? '#b45309' : '#64748b' }}>
                        {a.message}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default VendorMlPage;
