import React, { useCallback, useEffect, useState } from 'react';
import { ShoppingCart, Truck, History, Check, X, Package } from 'lucide-react';
import { formatDT } from '../utils/formatCurrency';
import {
  fetchVendorOrders,
  updateVendorOrderStatus,
  fetchVendorSalesHistory,
} from '../services/vendorService';
import './VendorPages.css';

const STATUS_LABEL = {
  pending: 'En attente',
  accepted: 'Acceptée',
  preparing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  rejected: 'Refusée',
};

const statusClass = (s) => `vnd-badge vnd-badge--${s}`;

const VendorOrdersPage = () => {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [ordRes, histRes] = await Promise.all([
      fetchVendorOrders(),
      fetchVendorSalesHistory(),
    ]);
    setOrders(ordRes.data.orders || []);
    setHistory(histRes.data.history || []);
    setDemo(ordRes.demo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (id, status, extra) => {
    await updateVendorOrderStatus(id, status, extra);
    load();
  };

  const activeOrders = orders.filter((o) => !['delivered', 'rejected'].includes(o.status));
  const deliveryOrders = orders.filter((o) => ['shipped', 'delivered'].includes(o.status));

  const OrderActions = ({ o }) => (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {o.status === 'pending' && (
        <>
          <button type="button" className="vnd-btn vnd-btn--primary vnd-btn--sm" onClick={() => act(o.id, 'accepted')}><Check size={14} /> Accepter</button>
          <button type="button" className="vnd-btn vnd-btn--danger vnd-btn--sm" onClick={() => act(o.id, 'rejected', { rejectReason: 'Indisponible' })}><X size={14} /> Refuser</button>
        </>
      )}
      {o.status === 'accepted' && (
        <button type="button" className="vnd-btn vnd-btn--primary vnd-btn--sm" onClick={() => act(o.id, 'preparing')}><Package size={14} /> Préparer</button>
      )}
      {o.status === 'preparing' && (
        <button type="button" className="vnd-btn vnd-btn--primary vnd-btn--sm" onClick={() => act(o.id, 'shipped')}><Truck size={14} /> Expédier</button>
      )}
      {o.status === 'shipped' && (
        <button type="button" className="vnd-btn vnd-btn--ghost vnd-btn--sm" onClick={() => act(o.id, 'delivered')}>Marquer livrée</button>
      )}
    </div>
  );

  const OrderTable = ({ rows, showActions = true, showTracking = false }) => (
    <div style={{ overflowX: 'auto' }}>
      <table className="vnd-table">
        <thead>
          <tr>
            <th>Commande</th><th>Client</th><th>Articles</th><th>Total</th><th>Statut</th>
            {showTracking && <th>Suivi</th>}
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id}>
              <td><strong>{o.orderId}</strong><br /><small>{new Date(o.createdAt).toLocaleDateString('fr-FR')}</small></td>
              <td>{o.clientName}</td>
              <td>{(o.items || []).map((i) => `${i.name} ×${i.qty}`).join(', ')}</td>
              <td>{formatDT(o.total)}</td>
              <td><span className={statusClass(o.status)}>{STATUS_LABEL[o.status] || o.status}</span></td>
              {showTracking && <td>{o.trackingCode || '—'}</td>}
              {showActions && <td><OrderActions o={o} /></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="vnd-page">
      <header className="vnd-hero">
        <h1><ShoppingCart size={24} /> Gestion des commandes {demo && <span className="vnd-demo-pill">Mode démo</span>}</h1>
        <p>Consulter, accepter, préparer, suivre les livraisons et l&apos;historique des ventes.</p>
      </header>

      <div className="vnd-tabs">
        {[
          { id: 'orders', label: '📦 Commandes actives' },
          { id: 'delivery', label: '🚚 Livraisons' },
          { id: 'history', label: '📜 Historique ventes' },
        ].map((t) => (
          <button key={t.id} type="button" className={`vnd-tab ${tab === t.id ? 'vnd-tab--active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <p className="vnd-empty">Chargement…</p> : (
        <>
          {tab === 'orders' && (
            <div className="vnd-card">
              <h2>Consulter les commandes ({activeOrders.length})</h2>
              {activeOrders.length === 0 ? <p className="vnd-empty">Aucune commande active.</p> : <OrderTable rows={activeOrders} />}
            </div>
          )}
          {tab === 'delivery' && (
            <div className="vnd-card">
              <h2><Truck size={18} /> Suivre l&apos;état des livraisons</h2>
              {deliveryOrders.length === 0 ? <p className="vnd-empty">Aucune livraison en cours.</p> : (
                <OrderTable rows={deliveryOrders} showActions={false} showTracking />
              )}
            </div>
          )}
          {tab === 'history' && (
            <div className="vnd-card">
              <h2><History size={18} /> Historique des ventes</h2>
              <div className="vnd-kpi-row">
                <div className="vnd-kpi"><small>Total ventes</small><strong>{history.length}</strong></div>
                <div className="vnd-kpi"><small>CA historique</small><strong>{formatDT(history.reduce((s, h) => s + h.total, 0), { decimals: 0 })}</strong></div>
              </div>
              <table className="vnd-table">
                <thead><tr><th>Commande</th><th>Date</th><th>Articles</th><th>Total</th><th>Statut</th></tr></thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td>{h.orderId}</td>
                      <td>{new Date(h.date).toLocaleDateString('fr-FR')}</td>
                      <td>{h.items}</td>
                      <td>{formatDT(h.total)}</td>
                      <td><span className={statusClass(h.status)}>{STATUS_LABEL[h.status]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VendorOrdersPage;
