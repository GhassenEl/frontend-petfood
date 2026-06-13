import React, { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import { buildDemoHistory } from '../utils/clientDemoData';

const ClientHistoryPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [ordersRes, invoicesRes, reviewsRes, complaintsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/invoices'),
          api.get('/reviews'),
          api.get('/complaints'),
        ]);

        const combined = [
          ...ordersRes.data.map((order) => ({
            id: `order-${order._id}`,
            date: order.createdAt,
            title: `Commande ${order._id.slice(-6)}`,
            description: `${order.items.length} article(s) - ${order.total} DT - statut ${order.status}`,
          })),
          ...invoicesRes.data.map((invoice) => ({
            id: `invoice-${invoice._id}`,
            date: invoice.issuedAt,
            title: `Facture ${invoice._id.slice(-6)}`,
            description: `${invoice.amount} DT - paiement ${invoice.paymentMethod || 'non precise'} - ${invoice.status}`,
          })),
          ...reviewsRes.data.map((review) => ({
            id: `review-${review._id}`,
            date: review.createdAt,
            title: `Avis sur ${review.productId?.name || 'produit'}`,
            description: `${review.rating}/5 - ${review.comment}`,
          })),
          ...complaintsRes.data.map((complaint) => ({
            id: `complaint-${complaint._id}`,
            date: complaint.createdAt,
            title: `Reclamation ${complaint.subject}`,
            description: `${complaint.message} - statut ${complaint.status}`,
          })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        setEntries(combined.length ? combined : buildDemoHistory());
      } catch (error) {
        setEntries(buildDemoHistory());
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formattedEntries = useMemo(
    () =>
      entries.map((entry) => ({
        ...entry,
        formattedDate: new Date(entry.date).toLocaleString('fr-FR'),
      })),
    [entries]
  );

  if (loading) return <div style={{ padding: '30px', textAlign: 'center' }}>Chargement...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '980px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '34px', marginBottom: '24px' }}>Historique client</h1>
      {formattedEntries.length === 0 ? (
        <div style={emptyStyle}>Aucun historique disponible pour le moment.</div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {formattedEntries.map((entry) => (
            <article key={entry.id} style={historyCardStyle}>
              <small style={{ color: '#6b7280' }}>{entry.formattedDate}</small>
              <h3 style={{ margin: '8px 0' }}>{entry.title}</h3>
              <p style={{ marginBottom: 0, color: '#4b5563' }}>{entry.description}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

const historyCardStyle = {
  background: 'white',
  borderRadius: '16px',
  padding: '18px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
  borderLeft: '4px solid #ea580c',
};

const emptyStyle = {
  background: 'white',
  padding: '24px',
  borderRadius: '16px',
  color: '#6b7280',
};

export default ClientHistoryPage;
