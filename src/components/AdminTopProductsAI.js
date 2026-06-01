import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { formatDT } from '../utils/formatCurrency';

const AdminTopProductsAI = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/ai/admin/top-products?limit=8&days=90')
      .then((res) => setData(res.data))
      .catch((err) => {
        setData(null);
        setError(err.response?.data?.error || 'Impossible de charger les top ventes.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={cardStyle}>
        <p style={{ color: '#6b7280', margin: 0 }}>Chargement agent top ventes…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={cardStyle}>
        <p style={{ color: '#b91c1c', margin: 0 }}>⚠ {error}</p>
      </div>
    );
  }

  if (!data?.topProducts?.length) {
    return (
      <div style={cardStyle}>
        <p style={{ color: '#6b7280', margin: 0 }}>Aucune vente enregistrée sur la période.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <Flame size={22} color="#e67e22" />
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Agent IA — Top produits vendus</h3>
        {data.aiPowered && (
          <span style={badgeStyle}>
            <Sparkles size={12} /> Groq
          </span>
        )}
      </div>
      <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.55, margin: '0 0 16px' }}>
        {data.summary}
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Produit</th>
              <th style={thStyle}>Unités</th>
              <th style={thStyle}>CA (DT)</th>
              <th style={thStyle}>Catégorie</th>
            </tr>
          </thead>
          <tbody>
            {data.topProducts.map((p, i) => (
              <tr key={p.productId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={tdStyle}>{i + 1}</td>
                <td style={tdStyle}><strong>{p.name}</strong></td>
                <td style={tdStyle}>{p.unitsSold || 0}</td>
                <td style={{ ...tdStyle, fontWeight: 700, color: '#059669' }}>{formatDT(p.revenue)}</td>
                <td style={tdStyle}>{p.category || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const cardStyle = {
  background: 'white',
  borderRadius: '18px',
  padding: '24px',
  marginBottom: '24px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  border: '1px solid #f0f0f0',
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  fontWeight: 700,
  color: '#7c3aed',
  background: '#f3e8ff',
  padding: '4px 8px',
  borderRadius: '999px',
};

const thStyle = { padding: '8px 10px', color: '#6b7280' };
const tdStyle = { padding: '10px' };

export default AdminTopProductsAI;
