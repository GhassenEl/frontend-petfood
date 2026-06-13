import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, BarChart3 } from 'lucide-react';
import api from '../utils/api';
import {
  DEMO_ADMIN_ORDERS,
  DEMO_ADMIN_SALES_KPI,
  DEMO_ADMIN_TOP_PRODUCTS,
  buildDemoRevenueChart,
  withDemoFallback,
} from '../utils/adminDemoData';
import { formatDT } from '../utils/formatCurrency';

const AdminSalesPage = () => {
  const [kpi, setKpi] = useState(DEMO_ADMIN_SALES_KPI);
  const [chartData, setChartData] = useState(buildDemoRevenueChart());
  const [topProducts, setTopProducts] = useState(DEMO_ADMIN_TOP_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ordersRes, statsRes] = await Promise.all([
          api.get('/orders').catch(() => ({ data: [] })),
          api.get('/orders/stats').catch(() => ({ data: {} })),
        ]);
        const orders = withDemoFallback(ordersRes.data, DEMO_ADMIN_ORDERS);
        setChartData(buildDemoRevenueChart(orders));
        if (statsRes.data?.revenue) {
          setKpi({
            ...DEMO_ADMIN_SALES_KPI,
            revenueMonth: statsRes.data.revenue,
            ordersWeek: statsRes.data.total || DEMO_ADMIN_SALES_KPI.ordersWeek,
          });
        }
      } catch {
        setChartData(buildDemoRevenueChart());
        setKpi(DEMO_ADMIN_SALES_KPI);
      }
      try {
        const { data } = await api.get('/admin/analytics/top-products');
        setTopProducts(withDemoFallback(data, DEMO_ADMIN_TOP_PRODUCTS));
      } catch {
        setTopProducts(DEMO_ADMIN_TOP_PRODUCTS);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Chargement ventes…</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #e67e22, #d35400)',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 24,
          color: 'white',
        }}
      >
        <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart3 size={28} /> Tableau de bord des ventes
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>
          Chiffre d&apos;affaires, panier moyen et analyse des best-sellers
        </p>
      </motion.header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        <Kpi icon={DollarSign} value={formatDT(kpi.revenueToday)} label="CA aujourd'hui" />
        <Kpi icon={TrendingUp} value={formatDT(kpi.revenueWeek)} label="CA semaine" />
        <Kpi icon={DollarSign} value={formatDT(kpi.revenueMonth)} label="CA mois" color="#059669" />
        <Kpi icon={ShoppingCart} value={kpi.ordersToday} label="Commandes jour" />
        <Kpi icon={ShoppingCart} value={kpi.ordersWeek} label="Commandes semaine" />
        <Kpi icon={TrendingUp} value={`${kpi.avgBasket} DT`} label="Panier moyen" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div style={card}>
          <h2 style={sectionTitle}>📈 Évolution CA (6 mois)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} DT`, 'CA']} />
              <Bar dataKey="value" fill="#e67e22" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <h2 style={sectionTitle}>🏆 Produits les plus vendus</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topProducts.slice(0, 5)} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v, name) => [v, name === 'units' ? 'Unités' : 'CA (DT)']} />
              <Bar dataKey="units" fill="#3498db" name="Unités" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={card}>
        <h2 style={sectionTitle}>📊 Détail top produits</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              {['Produit', 'Unités vendues', 'CA (DT)', 'Tendance'].map((h) => (
                <th key={h} style={{ padding: 12, color: '#64748b', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: 12 }}>
                  <span style={{ marginRight: 8, fontWeight: 800, color: '#94a3b8' }}>#{i + 1}</span>
                  {p.name}
                </td>
                <td style={{ padding: 12, fontWeight: 700 }}>{p.units}</td>
                <td style={{ padding: 12 }}>{formatDT(p.revenue)}</td>
                <td style={{ padding: 12, color: p.trend?.startsWith('+') ? '#059669' : '#dc2626', fontWeight: 700 }}>
                  {p.trend}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ margin: '14px 0 0', fontSize: 13, color: '#64748b' }}>
          Catégorie leader : <strong>{kpi.topCategory}</strong> · Taux conversion : {kpi.conversionRate} %
        </p>
      </div>
    </div>
  );
};

const Kpi = ({ icon: Icon, value, label, color = '#e67e22' }) => (
  <div style={{ background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
    <Icon size={20} color={color} style={{ marginBottom: 6 }} />
    <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1e293b' }}>{value}</p>
    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{label}</p>
  </div>
);

const card = { background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' };
const sectionTitle = { margin: '0 0 14px', fontSize: '1.05rem', fontWeight: 700 };

export default AdminSalesPage;
