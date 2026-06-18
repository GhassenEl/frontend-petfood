import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingBag, Percent, Calendar } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatDT } from '../utils/formatCurrency';
import { fetchVendorSalesHistory } from '../services/vendorService';
import { getDemoVendorDashboard } from '../utils/vendorDemoData';
import './VendorPages.css';

const STATUS_LABELS = {
  delivered: 'Livrée',
  paid: 'Payée',
  pending: 'En attente',
  shipped: 'Expédiée',
  cancelled: 'Annulée',
  rejected: 'Refusée',
};

const statusBadge = (status) => {
  const label = STATUS_LABELS[status] || status;
  const cls = ['delivered', 'paid'].includes(status) ? 'approved'
    : ['pending', 'shipped'].includes(status) ? 'pending' : 'rejected';
  return <span className={`vnd-badge vnd-badge--${cls}`}>{label}</span>;
};

const VendorSalesPage = () => {
  const [history, setHistory] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchVendorSalesHistory();
    const rows = data.history?.length ? data.history : getDemoVendorDashboard().salesHistory || [];
    setHistory(rows);
    setDemo(isDemo || !data.history?.length);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const total = history.reduce((s, h) => s + (h.total || 0), 0);
    const commission = history.reduce((s, h) => s + (h.commission || h.total * 0.12 || 0), 0);
    const items = history.reduce((s, h) => s + (h.items || 0), 0);
    const avg = history.length ? total / history.length : 0;
    return { total, commission, items, avg, count: history.length };
  }, [history]);

  const chartData = useMemo(() => {
    const byMonth = {};
    history.forEach((h) => {
      const key = new Date(h.date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      if (!byMonth[key]) byMonth[key] = { name: key, revenue: 0, orders: 0 };
      byMonth[key].revenue += h.total || 0;
      byMonth[key].orders += 1;
    });
    return Object.values(byMonth);
  }, [history]);

  return (
    <div className="vnd-page">
      <header className="vnd-hero">
        <h1><TrendingUp size={24} /> Historique des ventes {demo && <span className="vnd-demo-pill">Mode démo</span>}</h1>
        <p>Chiffre d&apos;affaires, commissions et détail des commandes livrées sur la marketplace.</p>
      </header>

      <div className="vnd-kpi-grid">
        <div className="vnd-kpi-card">
          <span><ShoppingBag size={16} /> CA total</span>
          <strong>{formatDT(stats.total)}</strong>
          <small>{stats.count} commande(s)</small>
        </div>
        <div className="vnd-kpi-card">
          <span><Percent size={16} /> Commissions</span>
          <strong>{formatDT(stats.commission)}</strong>
          <small>Estimation plateforme</small>
        </div>
        <div className="vnd-kpi-card">
          <span><Calendar size={16} /> Panier moyen</span>
          <strong>{formatDT(stats.avg)}</strong>
          <small>{stats.items} article(s) vendus</small>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="vnd-card">
          <h2>Évolution du CA</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, name) => [name === 'revenue' ? `${v} DT` : v, name === 'revenue' ? 'CA' : 'Commandes']} />
              <Bar dataKey="revenue" name="CA" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="vnd-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ margin: 0 }}>Détail des ventes</h2>
          <Link to="/vendor/orders" className="vnd-btn vnd-btn--ghost vnd-btn--sm">Voir commandes actives →</Link>
        </div>
        {loading ? <p className="vnd-empty">Chargement…</p> : history.length === 0 ? (
          <p className="vnd-empty">Aucune vente enregistrée pour le moment.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="vnd-table">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Articles</th>
                  <th>Total</th>
                  <th>Commission</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td><strong>{h.orderId}</strong></td>
                    <td>{new Date(h.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>{h.clientName || '—'}</td>
                    <td>{h.items ?? '—'}</td>
                    <td>{formatDT(h.total)}</td>
                    <td>{formatDT(h.commission ?? (h.total || 0) * 0.12)}</td>
                    <td>{statusBadge(h.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorSalesPage;
