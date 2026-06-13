import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Package, RefreshCw, TrendingDown } from 'lucide-react';
import api from '../utils/api';
import {
  DEMO_ADMIN_STOCK_MOVEMENTS,
  buildStockAlerts,
  mergeAdminStock,
  withDemoFallback,
} from '../utils/adminDemoData';

const AdminStockPage = () => {
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      setItems(mergeAdminStock(data));
    } catch {
      setItems(mergeAdminStock([]));
    }
    try {
      const { data: mv } = await api.get('/admin/stock/movements');
      setMovements(withDemoFallback(mv, DEMO_ADMIN_STOCK_MOVEMENTS));
    } catch {
      setMovements(DEMO_ADMIN_STOCK_MOVEMENTS);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const alerts = useMemo(() => buildStockAlerts(items), [items]);

  const filtered = useMemo(() => {
    let rows = [...items];
    if (filter === 'low') rows = rows.filter((p) => p.stock <= p.minStock);
    if (filter === 'ok') rows = rows.filter((p) => p.stock > p.minStock);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
    }
    return rows;
  }, [items, filter, search]);

  const stats = useMemo(() => ({
    total: items.length,
    ruptures: items.filter((p) => p.stock <= 0).length,
    low: items.filter((p) => p.stock > 0 && p.stock <= p.minStock).length,
    value: items.reduce((s, p) => s + p.stock * 12, 0),
  }), [items]);

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Chargement stock…</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 24,
          color: 'white',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Package size={28} /> Gestion avancée du stock
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>
            Seuils, vélocité, mouvements et alertes de rupture
          </p>
        </div>
        <button type="button" onClick={load} className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>
          <RefreshCw size={16} /> Actualiser
        </button>
      </motion.header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        <Kpi value={stats.total} label="Références" />
        <Kpi value={stats.ruptures} label="Ruptures" warn />
        <Kpi value={stats.low} label="Stock bas" warn />
        <Kpi value={`${stats.value.toFixed(0)} DT`} label="Valeur estimée" />
      </div>

      {alerts.length > 0 && (
        <section style={{ ...card, marginBottom: 24, borderLeft: '4px solid #ef4444' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} color="#dc2626" /> Alertes rupture / stock bas ({alerts.length})
          </h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {alerts.map((a) => (
              <div
                key={a.productId}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: a.severity === 'critical' ? '#fef2f2' : '#fffbeb',
                  border: `1px solid ${a.severity === 'critical' ? '#fecaca' : '#fde68a'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  fontSize: 14,
                }}
              >
                <span>
                  <strong>{a.name}</strong> — {a.message}
                </span>
                <span style={{ color: '#64748b' }}>
                  Réappro suggéré : {a.reorderSuggested} u. · ~{a.daysOfStock} j restants
                </span>
              </div>
            ))}
          </div>
          <Link to="/admin/products" style={{ display: 'inline-block', marginTop: 12, color: '#2563eb', fontWeight: 700, fontSize: 13 }}>
            Ajuster les stocks catalogue →
          </Link>
        </section>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <input
          type="search"
          placeholder="Rechercher produit ou SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #e2e8f0', minWidth: 220 }}
        />
        {[
          { id: 'all', label: 'Tous' },
          { id: 'low', label: 'Stock bas / rupture' },
          { id: 'ok', label: 'OK' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              background: filter === f.id ? '#2563eb' : '#f1f5f9',
              color: filter === f.id ? 'white' : '#475569',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ ...card, overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              {['Produit', 'SKU', 'Stock', 'Min', 'Max', 'Vélocité/j', 'Emplacement', 'Statut'].map((h) => (
                <th key={h} style={{ padding: 12, color: '#64748b', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const status = p.stock <= 0 ? 'Rupture' : p.stock <= p.minStock ? 'Bas' : 'OK';
              const statusColor = p.stock <= 0 ? '#dc2626' : p.stock <= p.minStock ? '#d97706' : '#059669';
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: 12, fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: 12, color: '#64748b' }}>{p.sku}</td>
                  <td style={{ padding: 12, fontWeight: 800, color: statusColor }}>{p.stock}</td>
                  <td style={{ padding: 12 }}>{p.minStock}</td>
                  <td style={{ padding: 12 }}>{p.maxStock}</td>
                  <td style={{ padding: 12 }}>{p.velocityPerDay}</td>
                  <td style={{ padding: 12 }}>{p.location}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: `${statusColor}22`, color: statusColor }}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section style={card}>
        <h2 style={{ margin: '0 0 14px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingDown size={18} /> Mouvements récents
        </h2>
        {movements.map((m) => (
          <div key={m.id} style={{ padding: '10px 0', borderBottom: '1px solid #f8fafc', fontSize: 14 }}>
            <strong>{m.productName}</strong>
            <span style={{ marginLeft: 8, color: m.qty < 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
              {m.qty > 0 ? '+' : ''}{m.qty}
            </span>
            <span style={{ marginLeft: 8, color: '#64748b' }}>
              {m.reason} · {new Date(m.date).toLocaleString('fr-FR')} · {m.user}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
};

const Kpi = ({ value, label, warn }) => (
  <div style={{ background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: warn ? '4px solid #ef4444' : '4px solid #2563eb' }}>
    <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: warn ? '#dc2626' : '#1e293b' }}>{value}</p>
    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{label}</p>
  </div>
);

const card = { background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' };

export default AdminStockPage;
