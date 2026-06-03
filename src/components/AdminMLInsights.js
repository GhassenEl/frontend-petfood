import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, TrendingUp, Users, Package, ShieldAlert } from 'lucide-react';
import api from '../utils/api';
import { formatDT } from '../utils/formatCurrency';

const AdminMLInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .get('/ml/admin/insights')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Insights ML indisponibles'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rev = data?.nextMonthRevenue;
  const anomalies = data?.anomalyDetection || {};

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <Brain size={22} color="#7c3aed" />
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, flex: 1 }}>Intelligence ML — plateforme</h3>
        {data?.pythonPowered && (
          <span style={badge}>XGBoost Python</span>
        )}
        {!data?.pythonPowered && data && (
          <span style={{ ...badge, background: '#f1f5f9', color: '#64748b' }}>Repli Node</span>
        )}
        <button type="button" onClick={load} style={btnRefresh}>
          Actualiser
        </button>
      </div>

      {loading && <p style={muted}>Calcul des modèles…</p>}
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

      {!loading && !error && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section>
            <h4 style={sectionTitle}>
              <TrendingUp size={16} /> CA mois prochain
            </h4>
            <p style={bigValue}>
              {formatDT(rev?.forecastRevenue ?? 0)}
              <span style={muted}> — {rev?.modelLabel || rev?.model || 'modèle'}</span>
            </p>
          </section>

          <section>
            <h4 style={sectionTitle}>
              <Package size={16} /> Demande par produit (mois prochain)
            </h4>
            <div style={tableWrap}>
              <table style={table}>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Qté prévue</th>
                    <th>Dernier mois</th>
                    <th>Tendance</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.productDemand || []).slice(0, 8).map((row) => (
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
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <section style={subCard}>
              <h4 style={sectionTitle}>
                <Users size={16} /> Rachat client (classification)
              </h4>
              <ul style={list}>
                {(data.churnPredictions || []).slice(0, 6).map((c) => (
                  <li key={c.userId}>
                    <strong>{c.userName || c.userId}</strong>
                    <span style={{ float: 'right', color: c.willRebuy ? '#059669' : '#dc2626' }}>
                      {(c.rebuyProbability * 100).toFixed(0)}% — {c.riskLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section style={subCard}>
              <h4 style={sectionTitle}>
                <AlertTriangle size={16} /> Risque d&apos;annulation (commandes)
              </h4>
              <ul style={list}>
                {(data.cancelRiskOrders || []).slice(0, 6).map((o) => (
                  <li key={o.orderId}>
                    #{String(o.orderId).slice(0, 8)}…
                    <span style={{ float: 'right', color: o.highRisk ? '#dc2626' : '#64748b' }}>
                      {(o.cancelRisk * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {data.seniorDogRanking?.length > 0 && (
            <section>
              <h4 style={sectionTitle}>Ranking — chien senior (top produits)</h4>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {data.seniorDogRanking.slice(0, 6).map((r) => (
                  <li key={r.productId} style={{ marginBottom: 6 }}>
                    {r.rank}. {r.productName}{' '}
                    <span style={muted}>(score {(r.score * 100).toFixed(0)}%)</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section style={subCard}>
            <h4 style={sectionTitle}>
              <ShieldAlert size={16} /> Détection anomalies
            </h4>
            <p style={muted}>
              Fraude / montants atypiques : {(anomalies.fraudAlerts || []).length} alerte(s) — Pics commandes :{' '}
              {(anomalies.volumeSpikes || []).length}
            </p>
            {(anomalies.fraudAlerts || []).slice(0, 3).map((a) => (
              <div key={a.orderId} style={alertRow}>
                Commande {String(a.orderId).slice(0, 8)}… — {formatDT(a.total)} — {a.reason}
              </div>
            ))}
            {(anomalies.volumeSpikes || []).slice(0, 2).map((s) => (
              <div key={s.date} style={alertRow}>
                {s.date} : {s.orderCount} commandes (z={s.zScore})
              </div>
            ))}
          </section>
        </div>
      )}
    </motion.div>
  );
};

const card = {
  background: 'white',
  borderRadius: 18,
  padding: 24,
  marginBottom: 24,
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  border: '1px solid #f0f0f0',
};

const subCard = { background: '#f8fafc', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0' };
const sectionTitle = { margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: 8 };
const bigValue = { margin: 0, fontSize: 22, fontWeight: 800, color: '#7c3aed' };
const muted = { fontSize: 13, color: '#64748b' };
const badge = { fontSize: 11, fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', padding: '4px 10px', borderRadius: 999 };
const btnRefresh = { padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 13 };
const tableWrap = { overflowX: 'auto' };
const table = { width: '100%', fontSize: 13, borderCollapse: 'collapse' };
const list = { margin: 0, padding: 0, listStyle: 'none', fontSize: 13 };
const alertRow = { fontSize: 12, color: '#92400e', background: '#fffbeb', padding: '8px 10px', borderRadius: 8, marginTop: 6 };

export default AdminMLInsights;
