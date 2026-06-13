import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp, Phone, MapPin, Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { livreurCancelOrder } from '../services/orderService';
import { DEMO_LIVREUR_ORDERS, withDemoFallback } from '../utils/livreurDemoData';
import { getPaymentLabel } from '../constants/paymentMethods';
import DeliveryProofModal from '../components/DeliveryProofModal';
import useLivreurGps from '../hooks/useLivreurGps';

const oid = (o) => o?.id || o?._id;

const statusConfig = {
  pending: { label: 'En attente', color: '#f39c12', bg: 'rgba(243,156,18,0.1)', icon: Package },
  shipped: { label: 'En livraison', color: '#3498db', bg: 'rgba(52,152,219,0.1)', icon: Truck },
  delivered: { label: 'Livrée', color: '#27ae60', bg: 'rgba(39,174,96,0.1)', icon: CheckCircle },
  cancelled: { label: 'Annulée', color: '#e74c3c', bg: 'rgba(231,76,60,0.1)', icon: XCircle },
  paid: { label: 'Payée', color: '#9b59b6', bg: 'rgba(155,89,182,0.1)', icon: CreditCard },
};

const LivreurOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [sortBy, setSortBy] = useState('date-desc');
  const [proofOrder, setProofOrder] = useState(null);
  const [claiming, setClaiming] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const hasActive = orders.some((o) => o.status === 'shipped');
  useLivreurGps(hasActive);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(o => {
        const id = oid(o);
        return (
          (id && id.toLowerCase().includes(term)) ||
          (o.address && o.address.toLowerCase().includes(term)) ||
          (o.phone && o.phone.toLowerCase().includes(term))
        );
      });
    }

    if (sortBy === 'date-desc') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'date-asc') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'total-desc') {
      result.sort((a, b) => (b.total || 0) - (a.total || 0));
    } else if (sortBy === 'total-asc') {
      result.sort((a, b) => (a.total || 0) - (b.total || 0));
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, sortBy]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      const data = withDemoFallback(res.data || [], DEMO_LIVREUR_ORDERS);
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Orders error:', error);
      setOrders(DEMO_LIVREUR_ORDERS);
      setFilteredOrders(DEMO_LIVREUR_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  const claimOrder = async (orderId) => {
    setClaiming(orderId);
    try {
      await api.post(`/livreur/orders/${orderId}/claim`);
      fetchOrders();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Impossible de prendre cette course');
    } finally {
      setClaiming(null);
    }
  };

  const completeDelivery = async (payload) => {
    const id = oid(proofOrder);
    await api.post(`/livreur/orders/${id}/complete`, payload);
    setProofOrder(null);
    fetchOrders();
  };

  const reportIssue = async (orderId) => {
    const message = window.prompt('Décrivez le problème (client absent, adresse incorrecte…)');
    if (!message?.trim()) return;
    try {
      await api.post(`/livreur/orders/${orderId}/issue`, { message: message.trim() });
      window.alert('Signalement envoyé à l\'équipe');
    } catch (error) {
      window.alert(error.response?.data?.error || 'Échec du signalement');
    }
  };

  const cancelDelivery = async (orderId) => {
    const reason = window.prompt(
      'Motif d\'annulation (optionnel) — la commande repassera en file d\'attente pour un autre livreur.',
    );
    if (reason === null) return;
    setCancelling(orderId);
    try {
      await livreurCancelOrder(orderId, { reason: reason?.trim() || undefined });
      fetchOrders();
      window.alert('Course annulée — commande remise en attente.');
    } catch (error) {
      window.alert(error.response?.data?.error || 'Impossible d\'annuler cette course');
    } finally {
      setCancelling(null);
    }
  };

  const getNextAction = (status) => {
    if (status === 'pending')
      return { label: 'Prendre', action: 'claim', color: '#f39c12' };
    if (status === 'shipped')
      return { label: 'Clôturer', action: 'deliver', color: '#27ae60' };
    return null;
  };

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }}>📦</div>
        <p style={{ color: '#888' }}>Chargement des commandes...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '24px' }}
      >
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>📦 Mes Commandes</h1>
        <p style={{ color: '#888', marginTop: '8px' }}>
          Gérez vos commandes et suivez leur statut
        </p>
      </motion.div>

      {/* Stats pills */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {[
          { key: 'all', label: 'Toutes', count: statusCounts.all || 0, color: '#333' },
          { key: 'pending', label: 'En attente', count: statusCounts.pending || 0, color: '#f39c12' },
          { key: 'shipped', label: 'En livraison', count: statusCounts.shipped || 0, color: '#3498db' },
          { key: 'delivered', label: 'Livrées', count: statusCounts.delivered || 0, color: '#27ae60' },
          { key: 'cancelled', label: 'Annulées', count: statusCounts.cancelled || 0, color: '#e74c3c' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: statusFilter === s.key ? s.color : 'rgba(0,0,0,0.04)',
              color: statusFilter === s.key ? 'white' : '#555',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            {s.label}
            <span style={{
              background: statusFilter === s.key ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.06)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '0.75rem',
            }}>
              {s.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and sort */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
          <input
            type="text"
            placeholder="Rechercher par ID, adresse ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            fontSize: '0.9rem',
            outline: 'none',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          <option value="date-desc">Plus récent</option>
          <option value="date-asc">Plus ancien</option>
          <option value="total-desc">Montant ↓</option>
          <option value="total-asc">Montant ↑</option>
        </select>
      </div>

      {/* Orders list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AnimatePresence>
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
              <p>Aucune commande trouvée</p>
            </motion.div>
          ) : (
            filteredOrders.map((order, i) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              const action = getNextAction(order.status);
              const orderId = oid(order);
              const isExpanded = expandedOrder === orderId;

              return (
                <motion.div
                  key={orderId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.03 }}
                  className="card-animal"
                  style={{ padding: '0', overflow: 'hidden' }}
                >
                  <div
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedOrder(isExpanded ? null : orderId)}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: config.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <StatusIcon size={20} color={config.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <p style={{ margin: 0, fontWeight: 700 }}>Commande #{String(orderId).slice(-6)}</p>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '8px',
                          background: config.bg,
                          color: config.color,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}>
                          {config.label}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#888' }}>
                        {order.region && (
                          <span style={{ marginRight: 8, padding: '2px 8px', borderRadius: 8, background: '#ecfdf5', color: '#047857', fontSize: '0.75rem', fontWeight: 700 }}>
                            {order.region}
                          </span>
                        )}
                        {order.address || 'Adresse non spécifiée'} — {order.total} DT
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {action && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (action.action === 'deliver') setProofOrder(order);
                            else if (action.action === 'claim') claimOrder(orderId);
                          }}
                          disabled={action.action === 'claim' && claiming === orderId}
                          style={{
                            padding: '8px 16px',
                            background: action.color,
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: claiming === orderId ? 'wait' : 'pointer',
                            opacity: claiming === orderId ? 0.7 : 1,
                          }}
                        >
                          {claiming === orderId ? '…' : action.label}
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelDelivery(orderId);
                          }}
                          disabled={cancelling === orderId}
                          style={{
                            padding: '8px 14px',
                            background: '#fef2f2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            borderRadius: '10px',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: cancelling === orderId ? 'wait' : 'pointer',
                          }}
                        >
                          {cancelling === orderId ? '…' : 'Annuler'}
                        </button>
                      )}
                      {isExpanded ? <ChevronUp size={18} color="#888" /> : <ChevronDown size={18} color="#888" />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', paddingTop: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <MapPin size={16} color="#888" />
                              <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Adresse</p>
                                <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: 600 }}>{order.address || 'Non spécifiée'}</p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <Phone size={16} color="#888" />
                              <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Téléphone</p>
                                <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: 600 }}>{order.phone || 'Non spécifié'}</p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <Calendar size={16} color="#888" />
                              <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Date</p>
                                <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: 600 }}>
                                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <CreditCard size={16} color="#888" />
                              <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Paiement</p>
                                <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: 600 }}>{getPaymentLabel(order.paymentMethod)}</p>
                              </div>
                            </div>
                          </div>

                          {order.items && order.items.length > 0 && (
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                              <p style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: 700, color: '#555' }}>Articles</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {order.items.map((item, idx) => (
                                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#555' }}>{item.productId?.name || 'Produit'} x{item.quantity}</span>
                                    <span style={{ fontWeight: 600 }}>{(item.price * item.quantity).toFixed(2)} DT</span>
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)', fontWeight: 700, fontSize: '1rem' }}>
                                <span>Total</span>
                                <span style={{ color: '#27ae60' }}>{order.total} DT</span>
                              </div>
                            </div>
                          )}

                          {order.deliveryNote && (
                            <div style={{ marginTop: 16, padding: 12, background: '#ecfdf5', borderRadius: 10, fontSize: 14 }}>
                              <strong>Note livraison :</strong> {order.deliveryNote}
                            </div>
                          )}

                          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {order.deliveryLocation && (
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLocation.lat},${order.deliveryLocation.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                                  background: '#27ae60', color: 'white', borderRadius: 10, textDecoration: 'none',
                                  fontWeight: 600, fontSize: '0.9rem',
                                }}
                              >
                                <MapPin size={16} />
                                Google Maps
                              </a>
                            )}
                            {order.status === 'shipped' && (
                              <button
                                type="button"
                                onClick={() => cancelDelivery(orderId)}
                                disabled={cancelling === orderId}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                                  background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca',
                                  borderRadius: 10, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                                }}
                              >
                                <XCircle size={16} />
                                {cancelling === orderId ? 'Annulation…' : 'Annuler la course'}
                              </button>
                            )}
                            {['pending', 'shipped'].includes(order.status) && (
                              <button
                                type="button"
                                onClick={() => reportIssue(orderId)}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                                  background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca',
                                  borderRadius: 10, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                                }}
                              >
                                <AlertTriangle size={16} />
                                Signaler un problème
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {proofOrder && (
        <DeliveryProofModal
          orderId={oid(proofOrder)}
          onClose={() => setProofOrder(null)}
          onComplete={completeDelivery}
        />
      )}
    </div>
  );
};

export default LivreurOrdersPage;

