import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, FileText, Star, AlertCircle, Calendar } from 'lucide-react';
import api from '../utils/api';
import { buildDemoHistoryEntries, DEMO_ADMIN_ORDERS, DEMO_ADMIN_INVOICES, DEMO_ADMIN_REVIEWS, DEMO_ADMIN_COMPLAINTS, withDemoFallback } from '../utils/adminDemoData';

const typeConfig = {
  order: { icon: <Package size={16} />, color: '#e67e22', bg: 'rgba(230,126,34,0.1)', label: 'Commande' },
  invoice: { icon: <FileText size={16} />, color: '#27ae60', bg: 'rgba(39,174,96,0.1)', label: 'Facture' },
  review: { icon: <Star size={16} />, color: '#f39c12', bg: 'rgba(243,156,18,0.1)', label: 'Avis' },
  complaint: { icon: <AlertCircle size={16} />, color: '#e74c3c', bg: 'rgba(231,76,60,0.1)', label: 'Réclamation' },
};

const AdminHistory = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [ordersRes, invoicesRes, reviewsRes, complaintsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/invoices/all'),
          api.get('/reviews'),
          api.get('/complaints/all'),
        ]);

        const orders = withDemoFallback(ordersRes.data || [], DEMO_ADMIN_ORDERS);
        const invoices = withDemoFallback(invoicesRes.data || [], DEMO_ADMIN_INVOICES);
        const reviews = withDemoFallback(reviewsRes.data || [], DEMO_ADMIN_REVIEWS);
        const complaints = withDemoFallback(complaintsRes.data || [], DEMO_ADMIN_COMPLAINTS);

        const combined = [
          ...orders.map((order) => ({
            id: `order-${order._id || order.id}`,
            date: order.createdAt,
            title: `Commande #${String(order._id || order.id).slice(-6)}`,
            description: `${order.user?.email || order.userId?.email || 'client'} — ${order.total} DT — ${order.status}`,
            type: 'order',
          })),
          ...invoices.map((invoice) => ({
            id: `invoice-${invoice._id || invoice.id}`,
            date: invoice.issuedAt,
            title: `Facture #${String(invoice._id || invoice.id).slice(-6)}`,
            description: `${invoice.userId?.email || 'client'} — ${invoice.amount} DT — ${invoice.status}`,
            type: 'invoice',
          })),
          ...reviews.map((review) => ({
            id: `review-${review._id || review.id}`,
            date: review.createdAt,
            title: `Avis sur ${review.productId?.name || 'produit'}`,
            description: `${review.user?.email || review.userId?.email || 'client'} — note ${review.rating}/5`,
            type: 'review',
          })),
          ...complaints.map((complaint) => ({
            id: `complaint-${complaint._id || complaint.id}`,
            date: complaint.createdAt,
            title: `Réclamation: ${complaint.subject}`,
            description: `${complaint.user?.email || complaint.userId?.email || 'client'} — ${complaint.status}`,
            type: 'complaint',
          })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        setEntries(combined.length ? combined : buildDemoHistoryEntries());
      } catch (error) {
        setEntries(buildDemoHistoryEntries());
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredEntries = filter === 'all' ? entries : entries.filter(e => e.type === filter);

  const filters = [
    { key: 'all', label: 'Tout', count: entries.length },
    { key: 'order', label: 'Commandes', count: entries.filter(e => e.type === 'order').length },
    { key: 'invoice', label: 'Factures', count: entries.filter(e => e.type === 'invoice').length },
    { key: 'review', label: 'Avis', count: entries.filter(e => e.type === 'review').length },
    { key: 'complaint', label: 'Réclamations', count: entries.filter(e => e.type === 'complaint').length },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: '3rem', animation: 'float 2s ease-in-out infinite' }}>🐾</div>
        <p style={{ color: '#888' }}>Chargement de l'historique...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(230,126,34,0.08) 0%, rgba(39,174,96,0.06) 100%)',
          borderRadius: '24px',
          padding: '28px',
          marginBottom: '28px',
          border: '1px solid rgba(230,126,34,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Calendar size={28} color="#e67e22" />
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#333' }}>Historique administrateur</h1>
        </div>
        <p style={{ margin: 0, color: '#777', fontSize: '0.95rem' }}>
          {entries.length} événements enregistrés
        </p>
      </motion.div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filter === f.key ? '#e67e22' : 'white',
              color: filter === f.key ? 'white' : '#555',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.2s',
            }}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: '24px',
          top: 0,
          bottom: 0,
          width: '2px',
          background: 'linear-gradient(to bottom, #e67e22, #27ae60)',
          borderRadius: '2px',
        }} />

        {filteredEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Aucun historique disponible 🐾
          </div>
        ) : (
          filteredEntries.map((entry, i) => {
            const config = typeConfig[entry.type];
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  marginBottom: '16px',
                  position: 'relative',
                  paddingLeft: '56px',
                }}
              >
                {/* Dot */}
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '12px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: config.color,
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}>
                  {config.icon}
                </div>

                {/* Card */}
                <div style={{
                  flex: 1,
                  background: 'white',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  borderLeft: `4px solid ${config.color}`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: config.color,
                      background: config.bg,
                      padding: '2px 10px',
                      borderRadius: '20px',
                    }}>
                      {config.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                      {entry.date ? new Date(entry.date).toLocaleString('fr-FR') : ''}
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#333' }}>
                    {entry.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                    {entry.description}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminHistory;

