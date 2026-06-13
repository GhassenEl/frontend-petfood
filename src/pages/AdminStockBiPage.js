import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Package, AlertTriangle, Brain, TrendingUp } from 'lucide-react';
import { fetchAdminStockBiPack } from '../services/adminOpsService';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
};

const AdminStockBiPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchAdminStockBiPack());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const chartData = (data?.forecastSeries || []).map((f) => ({
    name: f.month,
    units: f.predictedUnits,
  }));

  const catData = (data?.categoryBreakdown || []).map((c) => ({
    name: c.category,
    skus: c.skus,
    atRisk: c.atRisk,
  }));

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '28px 24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #3730a3 100%)',
          color: 'white',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>
          <Package size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Stock BI / ML
        </h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Prévisions de demande, alertes rupture, réappro suggéré et analyse IA pour l’administrateur.
        </p>
        <button
          type="button"
          onClick={load}
          style={{
            marginTop: 12,
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.4)',
            color: '#fff',
            borderRadius: 8,
            padding: '8px 14px',
            cursor: 'pointer',
          }}
        >
          Actualiser
        </button>
      </motion.div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Calcul BI stock…</p>
      ) : !data ? (
        <p style={{ color: '#dc2626' }}>Module indisponible.</p>
      ) : (
        <>
          {data.summary && (
            <div style={card}>
              <h3 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={18} color="#4f46e5" /> Synthèse IA
              </h3>
              <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{data.summary}</p>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Modèle : {data.model}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
            <Kpi label="SKU" value={data.kpis?.totalSkus} />
            <Kpi label="Ruptures" value={data.kpis?.stockoutRisk} warn />
            <Kpi label="Stock bas" value={data.kpis?.lowStock} />
            <Kpi label="Valeur stock (DT)" value={data.kpis?.inventoryValueDt} />
            <Kpi label="Jours stock moy." value={data.kpis?.avgDaysOfStock} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={card}>
              <h3 style={{ margin: '0 0 12px' }}>
                <TrendingUp size={16} /> Prévision demande (4 mois)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="units" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={card}>
              <h3 style={{ margin: '0 0 12px' }}>Risque par catégorie</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={catData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="atRisk" fill="#dc2626" name="À risque" />
                  <Bar dataKey="skus" fill="#94a3b8" name="SKU" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 12px' }}>
              <AlertTriangle size={16} color="#dc2626" /> Alertes réappro
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: 8 }}>Produit</th>
                  <th>Stock</th>
                  <th>Vélocité/j</th>
                  <th>Jours restants</th>
                  <th>Réappro suggéré</th>
                </tr>
              </thead>
              <tbody>
                {(data.alerts || []).map((a) => (
                  <tr key={a.productId} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: 8, fontWeight: 600 }}>{a.name}</td>
                    <td style={{ color: a.stock <= 0 ? '#dc2626' : '#334155' }}>{a.stock}</td>
                    <td>{a.velocityPerDay}</td>
                    <td>{a.daysOfStock > 90 ? '∞' : a.daysOfStock}</td>
                    <td>{a.reorderSuggested || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link to="/admin/products" style={{ display: 'inline-block', marginTop: 14, color: '#4f46e5', fontSize: 13 }}>
              Ajuster les stocks →
            </Link>
            <Link to="/admin/ml-agent" style={{ display: 'inline-block', marginTop: 14, marginLeft: 16, color: '#4f46e5', fontSize: 13 }}>
              Agent IA plateforme →
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

const Kpi = ({ label, value, warn }) => (
  <div style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
    <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color: warn && value > 0 ? '#dc2626' : '#1e293b' }}>
      {value ?? '—'}
    </div>
  </div>
);

export default AdminStockBiPage;
