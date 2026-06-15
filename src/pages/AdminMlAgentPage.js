import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, Users, Package, AlertTriangle, ShieldAlert, BarChart3,
} from 'lucide-react';
import useAdminMlAgent from '../hooks/useAdminMlAgent';
import { formatDT } from '../utils/formatCurrency';

const AdminMlAgentPage = () => {
  const { data, loading, pythonPowered, groqPowered, reload } = useAdminMlAgent();

  const rev = data?.nextMonthRevenue;
  const anomalies = data?.anomalies || {};

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '28px 24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          color: 'white',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>
          <Brain size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Agent IA Administration
        </h1>
        <p style={{ margin: 0, opacity: 0.9, maxWidth: 640 }}>
          Prévisions CA, demande produits, churn clients, risques annulation et anomalies — XGBoost + Groq.
        </p>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {pythonPowered && <Badge label="XGBoost" />}
          {groqPowered && <Badge label="Groq" bg="#ecfdf5" color="#059669" />}
          <button type="button" onClick={reload} style={btnLight}>
            Actualiser
          </button>
          <Link to="/admin/advanced-ai" style={{ ...btnLight, textDecoration: 'none' }}>
            IA avancée
          </Link>
        </div>
      </motion.div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Calcul des modèles plateforme…</p>
      ) : !data ? (
        <p style={{ color: '#dc2626' }}>Agent IA indisponible. Vérifiez le backend et le service ML (port 8000).</p>
      ) : (
        <>
          {data.summary && (
            <div style={card}>
              <h3 style={h3}>Synthèse IA</h3>
              <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{data.summary}</p>
              {data.tip && <p style={{ margin: '12px 0 0', fontSize: 13, color: '#7c3aed' }}>{data.tip}</p>}
            </div>
          )}

          {data.platformKpis && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
              <Kpi label="Commandes" value={data.platformKpis.totalOrders} />
              <Kpi label="En attente" value={data.platformKpis.pendingOrders} />
              <Kpi label="Clients" value={data.platformKpis.clients} />
              <Kpi label="Produits" value={data.platformKpis.products} />
              <Kpi label="Adoptions" value={data.platformKpis.adoptionListings} />
            </div>
          )}

          {data.actionHints?.length > 0 && (
            <div style={card}>
              <h3 style={h3}>Actions recommandées</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {data.actionHints.map((h) => (
                  <Link key={h.type} to={h.link} style={chipLink}>
                    {h.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div style={card}>
              <h3 style={h3}>
                <TrendingUp size={18} /> CA mois prochain
              </h3>
              <p style={bigValue}>{formatDT(rev?.forecastRevenue ?? 0)}</p>
              <p style={muted}>{rev?.modelLabel || rev?.model || 'modèle ML'}</p>
            </div>

            <div style={card}>
              <h3 style={h3}>
                <BarChart3 size={18} /> Top ventes (Groq)
              </h3>
              <ul style={ul}>
                {(data.topProducts || []).slice(0, 5).map((p) => (
                  <li key={p.productId || p.id}>
                    <strong>{p.name}</strong> — {p.unitsSold ?? 0} u. · {p.revenue ?? 0} DT
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={card}>
            <h3 style={h3}>
              <Package size={18} /> Demande produits (prévision)
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Qté prévue</th>
                    <th>Mois dernier</th>
                    <th>Tendance</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.productDemand || []).slice(0, 10).map((row) => (
                    <tr key={row.productId}>
                      <td>{row.productName}</td>
                      <td>{row.predictedQuantityNextMonth}</td>
                      <td>{row.lastMonthQuantity}</td>
                      <td>{row.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div style={card}>
              <h3 style={h3}>
                <Users size={18} /> Clients à risque churn
              </h3>
              <ul style={ul}>
                {(data.churnHighRisk || []).slice(0, 8).map((c) => (
                  <li key={c.userId}>
                    <strong>{c.userName || c.userId}</strong>
                    <span style={{ float: 'right', color: '#dc2626' }}>
                      {(c.rebuyProbability * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
              <Link to="/admin/users" style={{ ...chipLink, marginTop: 10, display: 'inline-block' }}>
                Voir utilisateurs
              </Link>
            </div>

            <div style={card}>
              <h3 style={h3}>
                <AlertTriangle size={18} /> Risque annulation commandes
              </h3>
              <ul style={ul}>
                {(data.cancelRisks || []).slice(0, 8).map((o) => (
                  <li key={o.orderId}>
                    #{String(o.orderId).slice(-6)}
                    <span style={{ float: 'right', color: o.highRisk ? '#dc2626' : '#64748b' }}>
                      {(o.cancelRisk * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
              <Link to="/admin/orders" style={{ ...chipLink, marginTop: 10, display: 'inline-block' }}>
                Voir commandes
              </Link>
            </div>
          </div>

          <div style={card}>
            <h3 style={h3}>
              <ShieldAlert size={18} /> Anomalies
            </h3>
            <p style={muted}>
              Fraude : {(anomalies.fraudAlerts || []).length} alerte(s) — Pics volume :{' '}
              {(anomalies.volumeSpikes || []).length}
            </p>
            {(anomalies.fraudAlerts || []).slice(0, 4).map((a) => (
              <div key={a.orderId} style={alertRow}>
                Commande {String(a.orderId).slice(0, 8)}… — {formatDT(a.total)} — {a.reason}
              </div>
            ))}
          </div>

          {data.lowStockProducts?.length > 0 && (
            <div style={card}>
              <h3 style={h3}>Stock faible</h3>
              <ul style={ul}>
                {data.lowStockProducts.map((p) => (
                  <li key={p.id}>
                    {p.name} — <strong>{p.stock}</strong> restant(s)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Badge = ({ label, bg = '#f3e8ff', color = '#7c3aed' }) => (
  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: bg, color }}>
    {label}
  </span>
);

const Kpi = ({ label, value }) => (
  <div style={{ background: 'white', borderRadius: 14, padding: 16, border: '1px solid #e5e7eb', textAlign: 'center' }}>
    <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
    <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
  </div>
);

const card = { background: 'white', borderRadius: 16, padding: 20, marginBottom: 20, border: '1px solid #e5e7eb' };
const h3 = { margin: '0 0 12px', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 };
const bigValue = { margin: 0, fontSize: 24, fontWeight: 800, color: '#7c3aed' };
const muted = { fontSize: 13, color: '#64748b', margin: '4px 0 0' };
const ul = { margin: 0, padding: 0, listStyle: 'none', fontSize: 13 };
const table = { width: '100%', fontSize: 13, borderCollapse: 'collapse' };
const alertRow = { fontSize: 12, background: '#fffbeb', padding: '8px 10px', borderRadius: 8, marginTop: 6 };
const chipLink = {
  padding: '10px 14px',
  borderRadius: 12,
  background: '#f5f3ff',
  color: '#5b21b6',
  fontWeight: 600,
  fontSize: 13,
  textDecoration: 'none',
  border: '1px solid #ddd6fe',
};
const btnLight = {
  padding: '8px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.3)',
  background: 'rgba(255,255,255,0.15)',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 600,
};

export default AdminMlAgentPage;
