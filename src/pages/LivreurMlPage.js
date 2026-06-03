import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Package, Route } from 'lucide-react';
import RoleMlPanel from '../components/RoleMlPanel';
import useLivreurMlRisk from '../hooks/useLivreurMlRisk';

const LivreurMlPage = () => {
  const { data, loading, pythonPowered, poolPriority } = useLivreurMlRisk();

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '28px 24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #faf5ff, #ede9fe)',
          border: '1px solid #ddd6fe',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, color: '#5b21b6' }}>
          <Brain size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          IA Livraison
        </h1>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Modèles XGBoost : risque d&apos;annulation, priorité des courses et prévision de charge.
        </p>
      </motion.div>

      <RoleMlPanel role="livreur" />

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <StatCard
            icon="📦"
            label="Livraisons prévues (IA)"
            value={data.todayDeliveriesForecast ?? '—'}
          />
          <StatCard
            icon="💰"
            label="Gains estimés"
            value={data.commissionForecastDt != null ? `${data.commissionForecastDt} DT` : '—'}
          />
          <StatCard icon="⏰" label="Heures chargées" value={data.busyHoursHint || '—'} small />
          <StatCard
            icon="🧠"
            label="Moteur"
            value={pythonPowered ? 'XGBoost' : 'Règles'}
            small
          />
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Route size={20} color="#7c3aed" />
          Priorité file d&apos;attente (IA)
        </h3>
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Calcul des scores…</p>
        ) : poolPriority.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Aucune course en attente dans votre zone.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '8px 4px' }}>#</th>
                <th style={{ padding: '8px 4px' }}>Commande</th>
                <th style={{ padding: '8px 4px' }}>Score IA</th>
                <th style={{ padding: '8px 4px' }}>Risque</th>
                <th style={{ padding: '8px 4px' }}>Conseil</th>
              </tr>
            </thead>
            <tbody>
              {poolPriority.slice(0, 12).map((p, i) => (
                <tr key={p.orderId} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: 10 }}>{i + 1}</td>
                  <td style={{ padding: 10, fontWeight: 700 }}>
                    #{String(p.orderId).slice(-6)}
                    {p.total != null && <span style={{ fontWeight: 400, color: '#64748b' }}> · {p.total} DT</span>}
                  </td>
                  <td style={{ padding: 10, color: '#7c3aed', fontWeight: 800 }}>{p.priorityScore}</td>
                  <td style={{ padding: 10 }}>
                    <span style={{ color: p.highRisk ? '#b91c1c' : '#059669' }}>
                      {(p.cancelRisk * 100).toFixed(0)}% ({p.riskLabel})
                    </span>
                  </td>
                  <td style={{ padding: 10, fontSize: 12, color: '#475569' }}>{p.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data?.highCancelRiskDeliveries?.length > 0 && (
        <div style={{ marginTop: 20, padding: 16, background: '#fff7ed', borderRadius: 12, border: '1px solid #fed7aa' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#9a3412' }}>
            <AlertTriangle size={16} style={{ verticalAlign: 'middle' }} /> Alertes annulation
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#7c2d12' }}>
            {data.highCancelRiskDeliveries.slice(0, 6).map((r) => (
              <li key={r.orderId}>
                Commande #{String(r.orderId).slice(-6)} — {(r.cancelRisk * 100).toFixed(0)}% ({r.riskLabel})
              </li>
            ))}
          </ul>
        </div>
      )}

      {data?.productDemand?.length > 0 && (
        <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#334155' }}>
            <Package size={16} style={{ verticalAlign: 'middle' }} /> Produits lourds en demande (zone)
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
            {data.productDemand.slice(0, 5).map((p) => (
              <li key={p.productId}>{p.productName}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, small }) => (
  <div style={{ background: 'white', borderRadius: 14, padding: 16, border: '1px solid #e5e7eb' }}>
    <div style={{ fontSize: small ? 20 : 28, marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: small ? 16 : 22, fontWeight: 800, color: '#1e293b' }}>{value}</div>
    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{label}</div>
  </div>
);

export default LivreurMlPage;
