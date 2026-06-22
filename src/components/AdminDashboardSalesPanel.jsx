import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import {
  DEMO_ADMIN_ORDERS,
  DEMO_ADMIN_SALES_KPI,
  DEMO_ADMIN_TOP_PRODUCTS,
  buildDemoRevenueChart,
  withDemoFallback,
} from '../utils/adminDemoData';
import { formatDT } from '../utils/formatCurrency';

const card = {
  background: 'white',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  border: '1px solid #f1f5f9',
};

const Kpi = ({ icon: Icon, value, label, color = '#e67e22' }) => (
  <div style={{ ...card, textAlign: 'center', padding: '16px 12px' }}>
    <Icon size={20} color={color} style={{ marginBottom: 6 }} />
    <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1e293b' }}>{value}</p>
    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{label}</p>
  </div>
);

const AdminDashboardSalesPanel = () => {
  const [kpi, setKpi] = useState(DEMO_ADMIN_SALES_KPI);
  const [chartData, setChartData] = useState(buildDemoRevenueChart());
  const [topProducts, setTopProducts] = useState(DEMO_ADMIN_TOP_PRODUCTS);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [ordersRes, statsRes] = await Promise.all([
          api.get('/orders').catch(() => ({ data: [] })),
          api.get('/orders/stats').catch(() => ({ data: {} })),
        ]);
        if (!mounted) return;
        const orders = withDemoFallback(ordersRes.data, DEMO_ADMIN_ORDERS);
        setChartData(buildDemoRevenueChart(orders));
        if (statsRes.data?.revenue != null) {
          setKpi({
            ...DEMO_ADMIN_SALES_KPI,
            revenueMonth: statsRes.data.revenue,
            ordersWeek: statsRes.data.total || DEMO_ADMIN_SALES_KPI.ordersWeek,
          });
        }
      } catch {
        if (mounted) {
          setChartData(buildDemoRevenueChart());
          setKpi(DEMO_ADMIN_SALES_KPI);
        }
      }
      try {
        const { data } = await api.get('/admin/analytics/top-products');
        if (mounted) setTopProducts(withDemoFallback(data, DEMO_ADMIN_TOP_PRODUCTS));
      } catch {
        if (mounted) setTopProducts(DEMO_ADMIN_TOP_PRODUCTS);
      }
    };
    load();
    const id = setInterval(load, 8000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#334155' }}>💰 Ventes &amp; chiffre d&apos;affaires</h2>
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
          Détail complet →
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 18 }}>
        <Kpi icon={DollarSign} value={formatDT(kpi.revenueToday)} label="CA aujourd'hui" />
        <Kpi icon={TrendingUp} value={formatDT(kpi.revenueWeek)} label="CA semaine" />
        <Kpi icon={DollarSign} value={formatDT(kpi.revenueMonth)} label="CA mois" color="#059669" />
        <Kpi icon={ShoppingCart} value={kpi.ordersToday} label="Commandes jour" color="#3498db" />
        <Kpi icon={ShoppingCart} value={kpi.ordersWeek} label="Commandes semaine" color="#3498db" />
        <Kpi icon={TrendingUp} value={`${kpi.avgBasket} DT`} label="Panier moyen" color="#9b59b6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        <div style={card}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Évolution CA (6 mois)</h3>
          <ResponsiveContainer width="100%" height={240}>
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
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Top produits vendus</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                {['Produit', 'Unités', 'CA', 'Tendance'].map((h) => (
                  <th key={h} style={{ padding: '8px 10px', color: '#64748b', fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topProducts.slice(0, 5).map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px' }}>
                    <span style={{ marginRight: 6, color: '#94a3b8', fontWeight: 800 }}>#{i + 1}</span>
                    {p.name}
                  </td>
                  <td style={{ padding: '10px', fontWeight: 700 }}>{p.units}</td>
                  <td style={{ padding: '10px' }}>{formatDT(p.revenue)}</td>
                  <td style={{ padding: '10px', color: p.trend?.startsWith('+') ? '#059669' : '#dc2626', fontWeight: 700 }}>
                    {p.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardSalesPanel;
