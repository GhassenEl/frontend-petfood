import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ClientOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      setError('Erreur chargement commandes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Chargement...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={heroStyle}>
        <h1 style={{ fontSize: '34px', marginTop: 0 }}>Mes Commandes</h1>
        <p style={{ color: '#6b7280', marginBottom: 0 }}>
          Suivez vos commandes, ouvrez le detail et reglez la facture depuis l espace client.
        </p>
      </div>

      {orders.length === 0 ? (
        <div style={emptyStyle}>Aucune commande pour le moment. Ajoutez d abord des produits au panier.</div>
      ) : (
        <div style={{ display: 'grid', gap: '18px' }}>
          {orders.map((order) => (
            <article key={order._id} style={orderCardStyle}>
              <div style={orderHeaderStyle}>
                <div>
                  <small style={{ color: '#6b7280' }}>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</small>
                  <h3 style={{ margin: '6px 0' }}>Commande #{order._id.slice(-6)}</h3>
                </div>
                <span style={{ ...badgeStyle, background: getStatusColor(order.status).bg, color: getStatusColor(order.status).color }}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div style={{ display: 'grid', gap: '10px' }}>
                {order.items.map((item, index) => (
                  <div key={`${order._id}-${index}`} style={itemStyle}>
                    <span>{item.productId?.name || 'Produit'} x {item.quantity}</span>
                    <strong>{(item.price * item.quantity).toFixed(2)} DT</strong>
                  </div>
                ))}
              </div>
              <div style={footerStyle}>
                <strong style={{ fontSize: '22px' }}>{order.total} DT</strong>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button onClick={() => setSelectedOrder(order)} style={secondaryButtonStyle}>Voir details</button>
                  <button onClick={() => navigate('/client-invoices')} style={primaryButtonStyle}>Payer facture</button>
                  {order.status === 'pending' && (
                    <button onClick={async () => {
                      if (window.confirm('Annuler cette commande ?')) {
                        try {
                          await api.delete(`/orders/${order._id}`);
                          fetchOrders();
                          window.alert('Commande annulee');
                        } catch (error) {
                          window.alert('Erreur annulation');
                        }
                      }
                    }} style={{ padding: '12px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Annuler
                    </button>
                  )}
                  {order.status === 'delivered' && order.items[0]?.productId?._id && (
                    <button 
                      onClick={() => navigate(`/client-reviews?productId=${order.items[0].productId._id}`)} 
                      style={{
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      ⭐ Laisser un avis
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0 }}>Commande #{selectedOrder._id.slice(-6)}</h3>
              <button onClick={() => setSelectedOrder(null)} style={secondaryButtonStyle}>Fermer</button>
            </div>
            <div style={infoBoxStyle}>
              <div><strong>Statut:</strong> {getStatusLabel(selectedOrder.status)}</div>
              <div><strong>Methode:</strong> {selectedOrder.paymentMethod || 'A definir'}</div>
              <div><strong>Total:</strong> {selectedOrder.total} DT</div>
            </div>
            {(selectedOrder.items || []).map((item, index) => (
              <div key={index} style={itemStyle}>
                <span>{item.productId?.name || 'Produit'} x {item.quantity}</span>
                <strong>{(item.price * item.quantity).toFixed(2)} DT</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const getStatusLabel = (status) => ({ pending: 'En attente', paid: 'Payee', shipped: 'Expediee', delivered: 'Livree', cancelled: 'Annulee' }[status] || status);
const getStatusColor = (status) => ({ pending: { bg: '#fef3c7', color: '#92400e' }, paid: { bg: '#dcfce7', color: '#166534' }, shipped: { bg: '#dbeafe', color: '#1d4ed8' }, delivered: { bg: '#dcfce7', color: '#166534' }, cancelled: { bg: '#fee2e2', color: '#991b1b' } }[status] || { bg: '#e5e7eb', color: '#374151' });

const heroStyle = { background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', borderRadius: '18px', padding: '24px', marginBottom: '24px', boxShadow: '0 10px 28px rgba(0,0,0,0.06)' };
const emptyStyle = { background: 'white', padding: '24px', borderRadius: '18px', color: '#6b7280' };
const orderCardStyle = { background: 'white', borderRadius: '18px', padding: '22px', boxShadow: '0 10px 28px rgba(0,0,0,0.06)' };
const orderHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' };
const badgeStyle = { padding: '8px 12px', borderRadius: '999px', fontWeight: 'bold', fontSize: '12px' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f3f4f6' };
const footerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '18px', flexWrap: 'wrap' };
const primaryButtonStyle = { padding: '12px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const secondaryButtonStyle = { padding: '12px 16px', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const modalOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000 };
const modalContentStyle = { background: 'white', borderRadius: '18px', padding: '24px', width: '560px', maxWidth: '100%', maxHeight: '85vh', overflow: 'auto' };
const modalHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' };
const infoBoxStyle = { display: 'grid', gap: '8px', background: '#f9fafb', padding: '14px', borderRadius: '12px', marginBottom: '16px' };

export default ClientOrdersPage;
